# Éveil — Spécifications du projet

Application mobile de spiritualité avec IA intégrée. Ce document résume tout ce qui a été conçu et validé via un prototype HTML interactif, pour servir de cahier des charges au développement réel (React Native + backend).

Le fichier `clair-prototype.html` fourni à côté de ce document est la référence exacte de l'expérience utilisateur et du design — à ouvrir dans un navigateur pour voir le comportement réel de chaque écran.

---

## 1. Concept

Une application qui personnalise du contenu spirituel (heures miroir, rêves, signes, numérologie, astrologie, lune, arbre de vie kabbalistique) à partir du profil de la personne, avec une IA qui génère des interprétations. L'ensemble est infusé de l'esprit de la loi de l'attraction : l'idée que les pensées et émotions de la personne influencent ce qu'elle attire, et qu'elle a un pouvoir de création sur sa réalité.

## 2. Identité de marque

- **Nom** : Éveil
- **Logo** : un cercle (anneau fin) avec un petit point plein excentré en haut à droite — représente la conscience et l'étincelle d'éveil qui en émerge. SVG simple, stroke fin.
- **Ton** : chaleureux, poétique, jamais alarmiste. Tutoiement systématique.

### Palette de couleurs
| Rôle | Hex |
|---|---|
| Fond principal | `#12142B` (indigo profond) |
| Accent doré | `#CBA35C` |
| Accent doré léger (fonds) | `rgba(203,163,92,0.10)` |
| Texte principal | `#F5F1E6` (ivoire) |
| Texte atténué | `#9295B5` |
| Bordures | `rgba(203,163,92,0.22)` |
| Alerte/erreur douce | `#E0A48C` |

### Typographie
- Titres/serif : **Fraunces** (Google Fonts) — chaleureux, personnalité
- Texte/sans-serif : **Karla** (Google Fonts) — humaniste, pas de défaut générique

### Principes de design
- Éviter le cliché "violet dégradé + étoiles" des apps de spiritualité
- Icônes en ligne fine (stroke), cohérentes, dessinées sur mesure — pas de bibliothèque d'icônes générique
- Cartes à bordure fine (hairline), pas d'ombres portées lourdes et répétitives
- Un seul accent coloré (doré) utilisé avec parcimonie

## 3. Architecture de l'information

### Navigation principale (bottom nav, 3 onglets)
Accueil / Journal / Profil

### Écran d'accueil
- Salutation + série de jours consécutifs (streak)
- **Panneau à onglets "Rituels du jour"** (un seul bloc, 3 onglets internes) :
  - **Carte** : carte du jour générée par IA (affirmation façon manifestation, cachée par jour, régénérable), avec bouton "Partager" (affiche une version stylée à capturer en screenshot)
  - **Intention** : dernière intention de manifestation posée, avec bouton "Marquer comme réalisée"
  - **Gratitude** : 3 champs texte "3 choses pour lesquelles tu es reconnaissant(e) aujourd'hui", sauvegardés par jour
- **Grille "Explorer"** organisée en 3 groupes :
  - *Au quotidien* : Heures miroir, Un signe, Un rêve, Lune & Oracle
  - *Te connaître* : Numérologie, Thème astral, Arbre de vie
  - *Créer & relier* : Manifestation, Compatibilité

### Écran Journal
- Résumé du mois ("X lectures explorées, ton type favori est...")
- Onglets Tout / Favoris
- Liste des lectures passées, avec étoile favori et (pour les manifestations) statut "réalisée"

### Écran Profil
- Affichage lecture seule de toutes les infos du profil
- Bouton Modifier → formulaire pré-rempli, mêmes composants que l'onboarding
- Bouton Supprimer → confirmation inline (pas de `confirm()` natif) → efface tout et retourne à l'onboarding

## 4. Modules fonctionnels (détail)

### Onboarding
Champs : prénom (obligatoire), nom (facultatif), date de naissance (sélecteur "roue" jour/mois/année), heure de naissance (facultatif, roue heure:minute avec option "—" non renseigné), lieu de naissance (facultatif, texte libre).

**Sélecteur de date en roue** : composant custom (scroll-snap, 3 colonnes défilantes avec surbrillance centrale), pas un `<input type="date">` natif — plus fiable et plus soigné visuellement.

Calculs effectués côté client à la soumission :
- Signe astrologique (12 signes, dates standards)
- Chemin de vie (somme des chiffres de la date de naissance, réduite, en gardant les nombres maîtres 11/22/33)
- Nombre d'expression, nombre de l'âme, nombre de personnalité (numérologie pythagoricienne classique, à partir du nom complet)

### Heures miroir / Un rêve / Un signe
Champ texte libre → appel IA avec le profil en contexte → interprétation personnalisée → sauvegarde au journal.

### Numérologie
Affiche les 4 nombres calculés + texte de base statique par chemin de vie (1-9, 11, 22, 33) + bouton "Lecture complète" (IA, relie les 4 nombres).

### Lune & Oracle
- Phase lunaire calculée par algorithme (cycle synodique 29.53058867 jours, référence 6 janvier 2000), affichée avec indicateur 8 points
- Rituel textuel statique associé à chaque phase (pas besoin d'IA)
- Carte oracle du jour tirée parmi 20 cartes (tirage déterministe par hash(date + prénom), donc stable toute la journée)
- Bouton "Lecture du jour" (IA, relie phase + carte)

### Thème astral
Basé sur le signe solaire + heure/lieu si renseignés. **Important** : pas de calcul astronomique réel de l'ascendant dans le prototype — le prompt IA précise explicitement qu'il s'agit d'une interprétation générale, pas d'un calcul de carte du ciel précis. Pour une vraie précision, il faudra une librairie d'éphémérides (Swiss Ephemeris ou équivalent).

### Compatibilité
Formulaire (prénom + date de naissance de l'autre personne, même roue de date) → IA compare les deux signes.

### Manifestation
Texte libre décrivant un désir → IA reformule en intention positive au présent + piste d'action. Chaque manifestation posée devient "l'intention actuelle" affichée sur l'accueil (= la plus récente entrée du journal de type manifestation).

### Bibliothèque d'affirmations
Accessible depuis l'écran Manifestation. L'IA génère 10 affirmations personnalisées (prénom + signe), mises en cache par jour, régénérables via bouton.

### Arbre de vie (kabbalistique)
Diagramme SVG des 10 séphiroth (Keter, Chokmah, Binah, Chesed, Gevurah, Tiferet, Netzach, Hod, Yesod, Malkuth) reliées par les 22 chemins traditionnels, avec noms affichés à côté de chaque nœud. Une séphira du jour est présélectionnée (hash date + prénom). Bouton "Lecture personnalisée" (IA).

## 5. Prompts système IA (à conserver tels quels)

**Prompt général** (heures miroir, rêve, signe, numérologie, lune, thème, compatibilité, arbre de vie) :
> Tu es la voix de "Éveil", une application de spiritualité bienveillante. Tu t'inspires de la philosophie de la loi de l'attraction (dans l'esprit d'ouvrages sur le pouvoir créateur de l'esprit, comme celui de Rhonda Byrne) : l'idée que les pensées et les émotions de la personne influencent ce qu'elle attire dans sa vie, que l'univers répond à son énergie intérieure, et qu'elle porte en elle un pouvoir de création sur sa réalité. Tu donnes des interprétations symboliques et poétiques (heures miroir, rêves, signes, numérologie, astrologie, manifestation) qui relient le message reçu à cette idée : ce que la personne vit est aussi le reflet de ce qu'elle porte intérieurement, et elle a le pouvoir d'orienter la suite en alignant ses pensées, ses émotions et sa gratitude. Présente cela comme des pistes de réflexion et non des vérités absolues. Réponds toujours en français, en tutoyant la personne, dans un style chaleureux, imagé et concis (100 à 150 mots). Ne donne jamais de diagnostic médical, de conseil financier ou juridique, ni de prédiction alarmante (maladie, mort, catastrophe). Termine si pertinent par une courte invitation à l'action intérieure : une intention à poser, un ressenti de gratitude, ou une image à visualiser.

**Prompt carte du jour** :
> Tu es la voix de "Éveil", une application de spiritualité bienveillante. Tu rédiges une courte carte du jour dans l'esprit de la loi de l'attraction : une affirmation positive formulée au présent, comme si ce qui est désiré était déjà en train de se réaliser, liée à la confiance en soi, à l'attractivité personnelle et au pouvoir de la personne de créer sa réalité par ses pensées et ses émotions. Inspire-toi de l'esprit d'ouvrages comme celui de Rhonda Byrne sans jamais citer ou reproduire de texte existant. Réponds en français, en tutoyant la personne par son prénom, dans un style chaleureux et poétique, en 2 à 4 phrases maximum, sans guillemets autour du texte.

**Prompt bibliothèque d'affirmations** :
> Tu es la voix de "Éveil", une application de spiritualité bienveillante inspirée de la loi de l'attraction. Tu rédiges des affirmations positives courtes, formulées à la première personne et au présent, comme si ce qui est désiré était déjà acquis. Réponds uniquement par la liste demandée, une affirmation par ligne, sans numéros, sans tirets, sans guillemets, sans introduction ni conclusion, toujours en français.

⚠️ Point de sécurité important : dans le prototype, l'appel à l'IA se fait directement depuis le "client" (navigateur) sans clé visible, grâce à un accès spécial propre à l'environnement Claude.ai. **Dans la vraie app, ces prompts doivent tourner côté serveur uniquement**, jamais avec la clé API exposée dans le code de l'application mobile.

## 6. Modèle de données (ce qui doit être stocké)

**Profil utilisateur** : prénom, nom, date de naissance, heure de naissance (optionnelle), lieu de naissance (optionnel), signe, chemin de vie, nombre d'expression, nombre de l'âme, nombre de personnalité.

**Entrée de journal** (une par lecture) : id, type (heures/reve/signe/numero/lune/theme/compat/manifestation/sephira), texte saisi par l'utilisateur, texte de réponse IA, date, favori (bool), feedback (up/down/null), réalisée (bool, pour les manifestations uniquement).

**Gratitude** : liste d'entrées {date, items: [3 chaînes]}, une par jour.

**Streak** : {count, lastDate} — incrémenté si connexion le jour suivant la dernière, remis à 1 sinon.

**Cache journalier** : carte du jour, affirmations du jour (évite de régénérer plusieurs fois par jour).

## 7. Recommandation technique pour la suite

- **Mobile** : React Native + Expo (permet de tester rapidement sur un vrai téléphone via l'app Expo Go, sans configuration native complexe au départ)
- **Backend** : petit serveur Node.js/Express qui reçoit les requêtes de l'app, appelle l'API Anthropic avec la clé stockée côté serveur (variable d'environnement), et renvoie la réponse
- **Base de données utilisateurs** : à définir (Postgres via Supabase est un bon point de départ simple pour un MVP avec auth intégrée)
- **Éphémérides astronomiques** (si le thème astral doit devenir précis) : librairie Swiss Ephemeris ou équivalent, à intégrer côté serveur

## 8. Ce qui reste à trancher / prochaines étapes

- Créer le compte développeur Anthropic + clé API (en cours)
- Décider de l'hébergement du backend
- Construire le squelette React Native + Expo
- Porter les écrans un par un, en réutilisant les couleurs/typographie/logique de ce document
- Politique de confidentialité + CGU (RGPD, données de naissance = données personnelles)
- Comptes développeur Apple / Google Play (à faire plus tard, proche du lancement)
