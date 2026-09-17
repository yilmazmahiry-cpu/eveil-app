# Éveil

Application mobile de spiritualité avec IA intégrée (React Native + Expo). Voir le cahier
des charges ([`docs/eveil-app-spec.md`](docs/eveil-app-spec.md)) et le prototype HTML de
référence ([`docs/clair-prototype.html`](docs/clair-prototype.html)) pour le détail complet
du produit.

## Démarrer

```bash
npm install
npm run web      # aperçu rapide dans le navigateur
npm run ios      # simulateur iOS (macOS uniquement)
npm run android  # émulateur Android
```

Ou scanner le QR code affiché par `npx expo start` avec l'app **Expo Go** sur un vrai
téléphone.

## Backend IA (obligatoire pour les écrans IA)

Tous les écrans qui génèrent du texte (heures miroir, rêve, signe, numérologie complète,
lune, thème astral, compatibilité, manifestation, affirmations, arbre de vie) appellent
`src/api/ai.ts`, qui attend un backend à l'URL `EXPO_PUBLIC_API_URL` (voir `.env.example`).

**La clé API Anthropic ne doit jamais être intégrée dans l'app mobile.** Le backend à
construire (Node/Express suggéré, cf. §7 du cahier des charges) doit exposer :

```
POST /api/ai
Body:  { "systemPrompt": string, "userPrompt": string }
Response: { "text": string }
```

Il reçoit la requête, appelle l'API Anthropic avec la clé stockée en variable
d'environnement serveur, et renvoie le texte généré. Les prompts système à utiliser tels
quels sont dans `src/data/prompts.ts`.

Sans backend configuré, ces écrans affichent simplement un message d'erreur doux — le
reste de l'app (profil, calculs, journal, lune, arbre de vie, navigation) fonctionne
entièrement hors-ligne.

Le serveur est fourni dans [`server/`](server/README.md) — voir ce fichier pour le
démarrer en local et connecter l'app dessus.

## Structure

```
src/
  app/                 écrans (expo-router, file-based routing)
    (tabs)/            Accueil / Journal / Profil
    welcome.tsx, onboarding.tsx, heures.tsx, ...
  components/          composants réutilisables (boutons, roues de date, cartes, icônes)
  context/             ProfileContext — profil, journal, streak, gratitude (AsyncStorage)
  lib/                 calculs purs : numérologie, astrologie, lune, hash, storage
  data/                données statiques : prompts IA, cartes oracle, séphiroth
  hooks/               carte du jour et affirmations du jour (cache quotidien + IA)
  api/ai.ts            client HTTP vers le backend
  theme/               couleurs et typographies (Fraunces / Karla)
```

## Ce qui reste à faire

- [x] Backend `/api/ai` (voir [`server/`](server/README.md)) — reste à déployer en ligne
- [x] Thème natal précis (soleil/lune/ascendant) via `/api/natal-chart`
- [x] Icônes et splash screen personnalisés aux couleurs de la marque
- [x] Tarot (78 cartes)
- [ ] Comptes utilisateurs + base de données serveur (nécessaire pour les
      abonnements payants, la notification avec contenu du jour, et la
      compatibilité sociale persistante — actuellement tout est local à
      l'appareil, sans compte)
- [ ] Politique de confidentialité / CGU (données de naissance = données personnelles)
- [ ] Comptes développeur Apple / Google Play avant publication
- [ ] Géocodage Nominatim à remplacer par un fournisseur payant si le volume
      d'utilisateurs grandit (politique d'usage stricte, 1 req/s)
