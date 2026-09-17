export type TarotSuit = 'batons' | 'coupes' | 'epees' | 'deniers';

export type TarotCard = {
  name: string;
  arcana: 'major' | 'minor';
  suit?: TarotSuit;
  upright: string;
  reversed: string;
};

export const SUIT_LABELS: Record<TarotSuit, string> = {
  batons: 'Bâtons',
  coupes: 'Coupes',
  epees: 'Épées',
  deniers: 'Deniers',
};

const MAJOR_ARCANA: TarotCard[] = [
  { name: 'Le Mat', arcana: 'major', upright: "Un nouveau départ insouciant, la confiance dans l'inconnu.", reversed: 'Imprudence, dispersion, la peur de se lancer.' },
  { name: 'Le Bateleur', arcana: 'major', upright: 'Un potentiel créatif : tu as déjà les outils pour commencer.', reversed: 'Dispersion des talents, manque de concentration.' },
  { name: 'La Papesse', arcana: 'major', upright: 'Une intuition silencieuse, une sagesse intérieure à écouter.', reversed: 'Des secrets non dits, une coupure avec ton intuition.' },
  { name: "L'Impératrice", arcana: 'major', upright: 'Abondance et créativité fertile, une douceur nourricière.', reversed: 'Un blocage créatif, une dépendance affective.' },
  { name: "L'Empereur", arcana: 'major', upright: 'Structure et autorité stable, le sens de l\'ordre.', reversed: 'Rigidité, un contrôle excessif.' },
  { name: 'Le Pape', arcana: 'major', upright: 'Transmission, tradition, un conseil éclairé.', reversed: "Dogmatisme, un besoin de t'affranchir des règles." },
  { name: "L'Amoureux", arcana: 'major', upright: "Le choix du cœur, l'alignement de tes valeurs.", reversed: 'Hésitation, un désaccord intérieur.' },
  { name: 'Le Chariot', arcana: 'major', upright: 'Une avancée déterminée, la victoire par la volonté.', reversed: 'Une perte de direction, des forces contraires.' },
  { name: 'La Justice', arcana: 'major', upright: 'Équilibre, une vérité qui se rétablit.', reversed: 'Une injustice ressentie, une décision biaisée.' },
  { name: "L'Hermite", arcana: 'major', upright: 'Un retrait salutaire, une sagesse solitaire.', reversed: "Un isolement excessif, un refus d'aide." },
  { name: 'La Roue de Fortune', arcana: 'major', upright: 'Un cycle qui tourne, la chance en mouvement.', reversed: 'Un revers temporaire, une résistance au changement.' },
  { name: 'La Force', arcana: 'major', upright: 'Une douceur qui dompte, un courage tranquille.', reversed: 'Un doute de toi-même, une force mal canalisée.' },
  { name: 'Le Pendu', arcana: 'major', upright: 'Une pause volontaire, un autre point de vue.', reversed: 'Un sacrifice inutile, un immobilisme.' },
  { name: 'Arcane sans nom', arcana: 'major', upright: 'Une fin nécessaire, une transformation profonde.', reversed: 'Une résistance au changement, une fin qui traîne.' },
  { name: 'Tempérance', arcana: 'major', upright: 'Une harmonie retrouvée, une patience alchimique.', reversed: 'Un déséquilibre, un excès.' },
  { name: 'Le Diable', arcana: 'major', upright: 'Un attachement, une tentation à regarder en face.', reversed: "Une prise de conscience, la libération d'un attachement." },
  { name: 'La Maison Dieu', arcana: 'major', upright: 'Une rupture soudaine, une vérité qui éclate.', reversed: 'Une crise évitée de justesse, un changement différé.' },
  { name: "L'Étoile", arcana: 'major', upright: 'Un espoir retrouvé, une guérison douce.', reversed: 'Un découragement passager, une confiance à retrouver.' },
  { name: 'La Lune', arcana: 'major', upright: 'Une zone d\'ombre, une intuition à décoder.', reversed: 'Une confusion qui se dissipe, des peurs illusoires.' },
  { name: 'Le Soleil', arcana: 'major', upright: 'Une joie simple, une réussite lumineuse.', reversed: 'Un succès partiel, un optimisme à retrouver.' },
  { name: 'Le Jugement', arcana: 'major', upright: 'Un appel intérieur, une renaissance.', reversed: 'Un doute sur ton chemin, un jugement trop dur envers toi-même.' },
  { name: 'Le Monde', arcana: 'major', upright: 'Un accomplissement, un cycle bouclé avec succès.', reversed: 'Une fin qui tarde, un dernier pas à franchir.' },
];

const SUIT_PREPOSITION: Record<TarotSuit, string> = {
  batons: 'de Bâtons',
  coupes: 'de Coupes',
  epees: "d'Épées",
  deniers: 'de Deniers',
};

function suitCards(suit: TarotSuit, meanings: [string, string][]): TarotCard[] {
  const ranks = ['As', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Valet', 'Cavalier', 'Reine', 'Roi'];
  return ranks.map((rank, i) => ({
    name: `${rank} ${SUIT_PREPOSITION[suit]}`,
    arcana: 'minor' as const,
    suit,
    upright: meanings[i][0],
    reversed: meanings[i][1],
  }));
}

const BATONS: TarotCard[] = suitCards('batons', [
  ['Un élan créatif tout neuf.', 'Une énergie qui peine à démarrer.'],
  ['Un plan qui se dessine, une ambition claire.', 'Une hésitation face au choix.'],
  ['Une expansion, des résultats en approche.', 'Un retard, une vision trop étroite.'],
  ['Une célébration méritée, une stabilité joyeuse.', 'Une harmonie fragile, une fête reportée.'],
  ['Une tension stimulante, une compétition saine.', 'Un conflit stérile, des tensions mal gérées.'],
  ['Une victoire reconnue, une fierté légitime.', 'Un succès non reconnu, un doute sur tes mérites.'],
  ['Une position à défendre avec conviction.', 'Un épuisement à force de résister.'],
  ['Un mouvement rapide, des nouvelles qui arrivent.', 'Une précipitation, un ralentissement frustrant.'],
  ['Une résilience, la dernière ligne avant le repos.', 'Un épuisement, une méfiance excessive.'],
  ['Une charge lourde mais portée jusqu\'au bout.', 'Un fardeau à déléguer enfin.'],
  ["Une curiosité pleine d'enthousiasme.", 'Une précipitation, des promesses en l\'air.'],
  ['Un élan fonceur, une action rapide.', 'Une impulsivité, une énergie mal dirigée.'],
  ['Une confiance rayonnante, une indépendance chaleureuse.', 'Un besoin de reconnaissance, une jalousie.'],
  ['Un leadership inspirant, une vision audacieuse.', 'Une autorité étouffante, une impatience.'],
]);

const COUPES: TarotCard[] = suitCards('coupes', [
  ['Un nouvel élan du cœur, une émotion pure.', 'Un cœur fermé, une émotion refoulée.'],
  ['Une connexion sincère, un échange à deux.', 'Un déséquilibre relationnel, un malentendu.'],
  ['Une joie partagée, une amitié célébrée.', 'Un excès, une situation à trois compliquée.'],
  ['Une introspection, une lassitude passagère.', 'Un retour d\'intérêt, une occasion à ressaisir.'],
  ['Une déception à traverser, le deuil d\'un espoir.', 'Une acceptation, tu regardes enfin devant toi.'],
  ['Une nostalgie douce, un souvenir qui réconforte.', 'Un attachement au passé qui freine.'],
  ['Des choix multiples, une rêverie à clarifier.', 'Une illusion dissipée, un choix enfin net.'],
  ['Un départ pour un sens plus profond.', 'Une fuite, une difficulté à tourner la page.'],
  ['Une satisfaction, un souhait exaucé.', 'Un contentement superficiel, un excès.'],
  ['Un bonheur partagé, une harmonie familiale.', 'Une harmonie fragile, des attentes déçues.'],
  ['Un message sensible, une imagination tendre.', 'Une immaturité émotionnelle, une rêverie stérile.'],
  ['Une invitation romantique, un élan poétique.', 'Des promesses non tenues, une idéalisation.'],
  ['Une empathie profonde, une intuition sûre.', 'Une hypersensibilité, des émotions envahissantes.'],
  ['Une sérénité émotionnelle, la sagesse du cœur.', 'Des émotions rentrées, une humeur imprévisible.'],
]);

const EPEES: TarotCard[] = suitCards('epees', [
  ['Une clarté soudaine, une vérité qui tranche.', 'Une confusion, une vérité déformée.'],
  ['Une décision en suspens, un équilibre précaire.', 'Un blocage, l\'évitement d\'un choix.'],
  ['Une peine nécessaire, une vérité qui blesse pour libérer.', 'Une guérison en cours, une douleur qui s\'apaise.'],
  ['Un repos mental, une pause pour recharger.', 'Une reprise trop rapide, un épuisement latent.'],
  ['Une victoire à quel prix, une tension non résolue.', 'Une réconciliation possible, un ego à lâcher.'],
  ['Une transition plus calme, un cap qui change.', 'Une transition bloquée, une difficulté à partir.'],
  ['Une stratégie discrète, une prudence nécessaire.', 'Une vérité qui refait surface.'],
  ['Un sentiment d\'être coincé, des limites surtout mentales.', 'Une prise de conscience libératrice.'],
  ['Une inquiétude nocturne, une peur amplifiée.', 'Une anxiété qui reflue, un soulagement.'],
  ['Une fin difficile mais définitive.', 'Une fin qui traîne, une renaissance proche.'],
  ['Une curiosité vive, un esprit affûté.', 'Des mots trop tranchants, des ragots.'],
  ['Une action rapide, des idées tranchées.', 'Une précipitation, un conflit inutile.'],
  ['Une clarté sans détour, une indépendance d\'esprit.', 'Une froideur, un jugement trop sévère.'],
  ['Une raison posée, une autorité intellectuelle.', 'Une rigidité mentale, une froideur excessive.'],
]);

const DENIERS: TarotCard[] = suitCards('deniers', [
  ['Une opportunité concrète, une nouvelle graine plantée.', 'Une occasion manquée, une base fragile.'],
  ['Un jonglage entre priorités, une belle adaptabilité.', 'Un déséquilibre, trop de balles en l\'air.'],
  ['Un travail d\'équipe, un savoir-faire reconnu.', 'Un désaccord sur la méthode.'],
  ['Une sécurité, l\'envie de garder ce que tu as bâti.', 'Un attachement excessif au matériel.'],
  ['Une période de manque, un isolement passager.', 'Une aide qui arrive, la fin de la précarité.'],
  ['Un partage équitable, une générosité qui circule.', 'Une dépendance, une générosité intéressée.'],
  ['Une patience avant la récolte.', 'Une impatience, un effort qui semble vain.'],
  ['Un travail assidu, un perfectionnement du savoir-faire.', 'Un travail bâclé, un manque de motivation.'],
  ['Une autonomie méritée, un confort gagné seul(e).', 'Un isolement doré, une dépendance masquée.'],
  ['Un héritage, une stabilité durable sur le long terme.', 'Une instabilité familiale, des valeurs à réajuster.'],
  ['Un apprentissage concret, une curiosité studieuse.', 'Une procrastination, un manque de rigueur.'],
  ['Un progrès méthodique, une fiabilité.', 'Une routine qui pèse, une lenteur excessive.'],
  ['Une abondance chaleureuse, un sens pratique généreux.', 'Un matérialisme, une négligence de toi-même.'],
  ['Une réussite stable, une générosité bien assise.', 'Une rigidité matérialiste, une avarice.'],
]);

export const TAROT_DECK: TarotCard[] = [...MAJOR_ARCANA, ...BATONS, ...COUPES, ...EPEES, ...DENIERS];
