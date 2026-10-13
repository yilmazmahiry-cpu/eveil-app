# Éveil — backend IA

Petit serveur Express qui reçoit les prompts depuis l'app, appelle l'API Anthropic avec
la clé stockée côté serveur, et renvoie le texte généré. La clé API n'est **jamais**
exposée à l'app mobile (voir cahier des charges §5).

## Démarrer en local

1. Récupère une clé API sur [console.anthropic.com](https://console.anthropic.com/settings/keys).

2. Crée le fichier `.env` :

   ```bash
   cp .env.example .env
   ```

   puis renseigne `ANTHROPIC_API_KEY=sk-ant-...` dans `server/.env`.

3. Installe et lance :

   ```bash
   npm install
   npm run dev
   ```

   Le serveur écoute sur `http://localhost:3000` (configurable via `PORT`).

4. Vérifie qu'il répond :

   ```bash
   curl http://localhost:3000/health
   ```

5. Dans le dossier racine de l'app (`eveil-app/.env`, à créer depuis `.env.example`),
   mets :

   ```
   EXPO_PUBLIC_API_URL=http://localhost:3000
   ```

   Redémarre `npx expo start` après avoir créé/modifié ce fichier (les variables
   `EXPO_PUBLIC_*` sont lues au build du bundle, pas à chaud).

   **Sur un téléphone physique via Expo Go**, `localhost` ne fonctionne pas depuis le
   téléphone : remplace par l'IP locale de ton ordinateur sur le réseau Wi-Fi (ex.
   `http://192.168.1.42:3000`), ou utilise un tunnel (`npx expo start --tunnel`) avec un
   service comme [ngrok](https://ngrok.com) pointé sur le port 3000.

## Routes

```
POST /api/ai
Header: Authorization: Bearer <jeton d'accès Supabase du compte connecté>
Body:   { "promptType": "general" | "carte" | "affirmations", "extras"?: string, "userPrompt": string }
200:    { "text": string }
400:    { "error": string }   — type inconnu, extras (3000 car. max) ou userPrompt (4000 car. max) invalides
401:    { "error": string }   — jeton absent (mode strict) ou invalide / expiré
403:    { "error": "premium_required" }   — les lectures ("general") exigent un abonnement
429:    { "error": string }   — trop de requêtes (60 par heure et par compte)
502:    { "error": string }   — l'API Anthropic a échoué
```

Les prompts système vivent dans `src/prompts.js` : l'app n'envoie que le type de prompt et des
consignes complémentaires (`extras` : style, contexte du journal). Personne ne peut donc utiliser le
serveur comme une IA généraliste en fournissant son propre prompt système.

**Ancien format** (`{ "systemPrompt", "userPrompt" }`, sans jeton) : accepté tant que `AI_STRICT` n'est pas
activé, pour que les versions déjà publiées ou en cours de validation continuent de fonctionner.

```
POST /api/natal-chart
Body:  { "date": "YYYY-MM-DD", "time": "HH:MM" (heure locale au lieu de naissance), "place": string }
200:   { "sunSign": string, "moonSign": string, "ascendantSign": string, "latitude": number, "longitude": number }
400:   { "error": string }   — champs manquants ou mal formés
404:   { "error": string }   — lieu introuvable (géocodage)
502:   { "error": string }   — calcul échoué
```

Calcule le vrai ascendant (via [circular-natal-horoscope-js](https://www.npmjs.com/package/circular-natal-horoscope-js),
qui dérive automatiquement le fuseau horaire historique à partir des coordonnées) et
géocode le lieu via [Nominatim](https://nominatim.openstreetmap.org/) (gratuit mais
limité à 1 req/s — à remplacer par un fournisseur payant si le volume grandit).

## Déploiement

Ce serveur est sans état (pas de base de données) : n'importe quel hébergeur Node
convient (Render, Railway, Fly.io...). Il suffit de définir la variable d'environnement
`ANTHROPIC_API_KEY` (et éventuellement `ALLOWED_ORIGIN` pour restreindre qui peut
l'appeler) sur la plateforme choisie, puis de pointer `EXPO_PUBLIC_API_URL` de l'app vers
l'URL publique obtenue.

### Protection de l'IA (comptes, abonnement, limites)

| Variable | Rôle | Secrète ? |
|---|---|---|
| `SUPABASE_URL` | Active la vérification des comptes (signature du jeton contrôlée avec la clé publique du projet). | Non |
| `SUPABASE_ANON_KEY` | Secours uniquement (non nécessaire avec les clés de signature actuelles du projet). | Non (publique) |
| `REVENUECAT_SECRET_KEY` | Active le contrôle de l'abonnement côté serveur pour les lectures. Clé **secrète** v1 de RevenueCat (Project settings > API keys). | **Oui** |
| `AI_STRICT` | `true` : jeton obligatoire et ancien format refusé. | Non |

Sans `SUPABASE_URL`, le serveur garde son comportement historique (aucun compte exigé). Sans
`REVENUECAT_SECRET_KEY`, l'abonnement n'est pas contrôlé côté serveur (seulement dans l'app). Au démarrage,
le serveur indique dans ses logs ce qui est actif.

**Ordre de mise en service recommandé** (pour ne jamais casser une version de l'app déjà installée ou en
cours de validation chez Apple) :

1. Déployer ce serveur avec `SUPABASE_URL` (+ `REVENUECAT_SECRET_KEY`), **sans** `AI_STRICT` : les anciennes
   versions de l'app continuent de fonctionner, les nouvelles s'authentifient.
2. Publier la nouvelle version de l'app et attendre qu'elle soit approuvée et adoptée.
3. Ajouter `AI_STRICT=true` : le serveur n'accepte plus que les comptes connectés. Les anciennes versions
   afficheront une erreur (la mise à jour de l'app devient nécessaire).

Tests : `npm test` (vérification des jetons avec une vraie paire de clés locale, abonnement, limites, modes).
