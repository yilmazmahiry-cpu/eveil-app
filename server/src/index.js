import 'dotenv/config';

import Anthropic from '@anthropic-ai/sdk';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';

import { computeNatalChart } from './astrology.js';

const PORT = process.env.PORT || 3000;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';
const MAX_PROMPT_LENGTH = 4000;

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY manquant : copie server/.env.example vers server/.env et renseigne ta clé.');
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const app = express();
app.use(express.json({ limit: '20kb' }));
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(',') : true,
  })
);

// Protège la clé API : un budget de requêtes raisonnable par IP.
app.use(
  '/api/',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/ai', async (req, res) => {
  const { systemPrompt, userPrompt } = req.body ?? {};

  if (typeof systemPrompt !== 'string' || typeof userPrompt !== 'string' || !systemPrompt.trim() || !userPrompt.trim()) {
    return res.status(400).json({ error: 'systemPrompt et userPrompt sont requis.' });
  }
  if (systemPrompt.length > MAX_PROMPT_LENGTH || userPrompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({ error: 'Prompt trop long.' });
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });
    const text = response.content
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('\n')
      .trim();
    res.json({ text });
  } catch (err) {
    console.error('Erreur Anthropic:', err);
    res.status(502).json({ error: 'Le service IA est momentanément indisponible.' });
  }
});

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

app.post('/api/natal-chart', async (req, res) => {
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
    console.error('Erreur calcul thème natal:', err);
    res.status(502).json({ error: 'Le calcul du thème natal a échoué.' });
  }
});

app.listen(PORT, () => {
  console.log(`Éveil backend en écoute sur http://localhost:${PORT}`);
});
