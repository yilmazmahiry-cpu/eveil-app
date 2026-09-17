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
Body:  { "systemPrompt": string, "userPrompt": string }
200:   { "text": string }
400:   { "error": string }   — prompt manquant ou trop long
502:   { "error": string }   — l'API Anthropic a échoué
```

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
