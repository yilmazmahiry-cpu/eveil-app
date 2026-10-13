import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';

import { computeNatalChart } from './astrology.js';
import { PREMIUM_PROMPT_TYPES, PROMPTS } from './prompts.js';

const MAX_PROMPT_LENGTH = 4000; // userPrompt, et systemPrompt des anciennes versions de l'app
const MAX_EXTRAS_LENGTH = 3000; // consignes de style / contexte envoyées par l'app en complément du prompt de base

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

const FIFTEEN_MINUTES = 15 * 60 * 1000;

function limiter({ windowMs, limit, message, keyGenerator }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: message },
    ...(keyGenerator ? { keyGenerator } : {}),
  });
}

/**
 * @param {object} deps
 * @param {object} deps.anthropic            client Anthropic (messages.create)
 * @param {string} deps.model
 * @param {Function|null} deps.verifyToken   jeton -> identifiant du compte | null ; null = vérification désactivée
 * @param {Function|null} deps.isPremium     identifiant -> true | false | null ; null = contrôle premium désactivé
 * @param {boolean} deps.strict              true : jeton obligatoire et anciennes versions de l'app refusées
 * @param {number} [deps.userLimitPerHour]
 */
export function createApp({ anthropic, model, verifyToken, isPremium, strict = false, userLimitPerHour = 60, log = console }) {
  const app = express();
  app.use(express.json({ limit: '20kb' }));
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(',') : true,
    })
  );

  // Garde-fou général contre les inondations (large, avant toute vérification de jeton).
  const floodGuard = limiter({
    windowMs: FIFTEEN_MINUTES,
    limit: 1200,
    message: 'Trop de requêtes, réessaie dans un moment.',
  });
  // Requêtes sans compte (anciennes versions de l'app, tant que le mode strict n'est pas activé) : budget par IP.
  const anonymousLimit = limiter({
    windowMs: FIFTEEN_MINUTES,
    limit: 60,
    message: 'Trop de requêtes, réessaie dans un moment.',
  });
  // Requêtes d'un compte connecté : budget par compte, indépendant de l'IP (réseaux mobiles partagés).
  const perUserLimit = limiter({
    windowMs: 60 * 60 * 1000,
    limit: userLimitPerHour,
    message: 'Tu as atteint la limite de lectures pour cette heure, réessaie un peu plus tard.',
    keyGenerator: (req) => req.userId,
  });
  const natalChartLimit = limiter({
    windowMs: FIFTEEN_MINUTES,
    limit: 60,
    message: 'Trop de requêtes, réessaie dans un moment.',
  });

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  async function authenticate(req, res, next) {
    const match = /^Bearer\s+(\S+)$/i.exec(req.get('authorization') ?? '');
    if (!match) {
      if (strict) return res.status(401).json({ error: 'Connexion requise.' });
      req.userId = null;
      return next();
    }
    if (!verifyToken) {
      // Serveur pas encore configuré pour vérifier les comptes (SUPABASE_URL absent) : comportement historique.
      req.userId = null;
      return next();
    }
    try {
      const userId = await verifyToken(match[1]);
      if (!userId) return res.status(401).json({ error: 'Session invalide ou expirée.' });
      req.userId = userId;
      return next();
    } catch (err) {
      log.error('Vérification du jeton impossible :', err?.message ?? err);
      return res.status(503).json({ error: 'Vérification momentanément indisponible.' });
    }
  }

  const applyBudget = (req, res, next) => (req.userId ? perUserLimit(req, res, next) : anonymousLimit(req, res, next));

  app.post('/api/ai', floodGuard, authenticate, applyBudget, async (req, res) => {
    const { promptType, extras, userPrompt, systemPrompt } = req.body ?? {};

    if (typeof userPrompt !== 'string' || !userPrompt.trim() || userPrompt.length > MAX_PROMPT_LENGTH) {
      return res.status(400).json({ error: 'userPrompt est requis (4000 caractères maximum).' });
    }

    let system;
    if (promptType !== undefined) {
      if (typeof promptType !== 'string' || !Object.hasOwn(PROMPTS, promptType)) {
        return res.status(400).json({ error: 'promptType inconnu.' });
      }
      if (extras !== undefined && (typeof extras !== 'string' || extras.length > MAX_EXTRAS_LENGTH)) {
        return res.status(400).json({ error: 'extras invalide (3000 caractères maximum).' });
      }
      if (req.userId && isPremium && PREMIUM_PROMPT_TYPES.has(promptType)) {
        const premium = await isPremium(req.userId);
        if (premium === false) return res.status(403).json({ error: 'premium_required' });
      }
      const complement = typeof extras === 'string' ? extras.trim() : '';
      system = complement ? `${PROMPTS[promptType]}\n\n${complement}` : PROMPTS[promptType];
    } else {
      // Ancien format de l'app : le prompt système est fourni par l'app. Refusé en mode strict.
      if (strict) return res.status(400).json({ error: 'update_required' });
      if (typeof systemPrompt !== 'string' || !systemPrompt.trim() || systemPrompt.length > MAX_PROMPT_LENGTH) {
        return res.status(400).json({ error: 'systemPrompt et userPrompt sont requis.' });
      }
      system = systemPrompt;
    }

    try {
      const response = await anthropic.messages.create({
        model,
        max_tokens: 1000,
        system,
        messages: [{ role: 'user', content: userPrompt }],
      });
      const text = response.content
        .map((block) => (block.type === 'text' ? block.text : ''))
        .join('\n')
        .trim();
      res.json({ text });
    } catch (err) {
      log.error('Erreur Anthropic:', err);
      res.status(502).json({ error: 'Le service IA est momentanément indisponible.' });
    }
  });

  app.post('/api/natal-chart', natalChartLimit, async (req, res) => {
    const { date, time, place } = req.body ?? {};

    if (
      typeof date !== 'string' ||
      typeof time !== 'string' ||
      typeof place !== 'string' ||
      !DATE_RE.test(date) ||
      !TIME_RE.test(time) ||
      !place.trim() ||
      place.length > 200
    ) {
      return res.status(400).json({ error: 'date (YYYY-MM-DD), time (HH:MM) et place sont requis.' });
    }

    try {
      const chart = await computeNatalChart({ date, time, place: place.trim() });
      if (!chart) {
        return res.status(404).json({ error: "Lieu de naissance introuvable." });
      }
      res.json(chart);
    } catch (err) {
      log.error('Erreur calcul thème natal:', err);
      res.status(502).json({ error: 'Le calcul du thème natal a échoué.' });
    }
  });

  return app;
}
