import 'dotenv/config';

import Anthropic from '@anthropic-ai/sdk';

import { createApp } from './app.js';
import { createTokenVerifier } from './auth.js';
import { createPremiumChecker } from './premium.js';

const PORT = process.env.PORT || 3000;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';
const STRICT = process.env.AI_STRICT === 'true';

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY manquant : copie server/.env.example vers server/.env et renseigne ta clé.');
  process.exit(1);
}

// Vérification des comptes : demande seulement SUPABASE_URL (publique). Sans elle, le serveur garde son
// comportement historique (aucun compte exigé) et le dit au démarrage.
const verifyToken = process.env.SUPABASE_URL
  ? createTokenVerifier({ supabaseUrl: process.env.SUPABASE_URL, anonKey: process.env.SUPABASE_ANON_KEY })
  : null;

// Contrôle de l'abonnement côté serveur : demande REVENUECAT_SECRET_KEY (clé secrète, à saisir dans Render).
const isPremium = process.env.REVENUECAT_SECRET_KEY
  ? createPremiumChecker({ secretKey: process.env.REVENUECAT_SECRET_KEY })
  : null;

if (STRICT && !verifyToken) {
  console.error('AI_STRICT=true nécessite SUPABASE_URL : sans lui, plus personne ne pourrait se connecter à l’IA.');
  process.exit(1);
}

console.log(
  `Sécurité IA : comptes ${verifyToken ? 'vérifiés' : 'NON vérifiés (SUPABASE_URL absent)'}, ` +
    `abonnement ${isPremium ? 'contrôlé' : 'NON contrôlé (REVENUECAT_SECRET_KEY absent)'}, ` +
    `mode ${STRICT ? 'strict' : 'compatible (anciennes versions de l’app acceptées)'}.`
);

const app = createApp({
  anthropic: new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
  model: MODEL,
  verifyToken,
  isPremium,
  strict: STRICT,
});

app.listen(PORT, () => {
  console.log(`Éveil backend en écoute sur http://localhost:${PORT}`);
});
