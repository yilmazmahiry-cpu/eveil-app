export type VarietyKind = 'reading' | 'card';

// L'esprit reste le même (gratitude + loi de l'attraction, toujours présents) mais chaque demande reçoit une
// combinaison différente d'angles et de formes : les textes ne peuvent pas tous sonner pareil.

const READING_OPENINGS = [
  'Ouvre sur une image sensorielle et concrète liée à la situation (une lumière, une matière, un geste), sans interpeller la personne.',
  'Ouvre par une question simple posée à la personne.',
  'Ouvre directement par le cœur du message, sans formule d’introduction.',
  'Ouvre en reprenant quelques mots exacts de la personne, puis déroule.',
  'Ouvre par son prénom suivi d’une observation calme, sans point d’exclamation.',
  'Ouvre par une courte métaphore en une phrase.',
];

const READING_FORMS = [
  'Un seul paragraphe fluide.',
  'Deux paragraphes courts.',
  'Trois courts paragraphes.',
  'Deux paragraphes, le second plus court et plus intime.',
];

const READING_ENDINGS = [
  'Termine sur une question ouverte que la personne pourra écrire dans son journal.',
  'Termine sur un geste très concret à faire aujourd’hui.',
  'Termine sur une image à garder en tête.',
  'Termine sur une courte affirmation au présent, à la première personne, que la personne pourrait se dire.',
  'Termine sans conclusion explicite, sur la dernière idée du texte.',
];

const READING_LINKS = [
  'relie le message aux propres mots de la personne (sans citer signe ni chemin de vie)',
  'relie le message à son chemin de vie (sans citer le signe)',
  'relie le message à son signe solaire, seulement si cela apporte du neuf (sans citer le chemin de vie)',
  'relie le message à une de ses intentions ou gratitudes récentes si elles existent (sans citer signe ni chemin de vie)',
  'ne cite ni signe ni chemin de vie cette fois',
];

const CARD_OPENINGS = [
  'Commence par une image concrète.',
  'Commence par son prénom, avec naturel.',
  'Commence directement par l’affirmation.',
  'Commence par une sensation (chaleur, souffle, lumière).',
  'Commence par une courte question.',
];

const CARD_LINKS = [
  'appuie-toi uniquement sur son prénom (sans citer signe ni chemin de vie)',
  'appuie-toi uniquement sur son chemin de vie (sans citer le signe)',
  'appuie-toi uniquement sur son signe solaire (sans citer le chemin de vie)',
  'appuie-toi sur son contexte personnel récent s’il existe (sans citer signe ni chemin de vie)',
  'n’utilise aucun élément de son profil cette fois',
];

const TONES = [
  'tendre',
  'lumineux et posé',
  'complice et légèrement joueur',
  'profond et calme',
  'simple et direct',
  'poétique',
];

const ATTRACTION_ANGLES = [
  'agir comme si ce qui est désiré était déjà là, en ressentant l’état recherché',
  'l’attention nourrit ce qu’elle regarde : porter son regard sur ce qui est déjà présent',
  'l’accord entre pensées, émotions et gestes',
  'la confiance et le lâcher-prise qui laissent les choses venir',
  'la résonance : on attire ce avec quoi on vibre',
  'les petits signes déjà reçus comme preuves que ça avance',
];

const GRATITUDE_FORMS = [
  'un merci adressé à quelque chose de précis et de présent dans la situation',
  'une gratitude anticipée, comme si ce qui est espéré était déjà reçu',
  'un remerciement à la personne qu’elle est en train de devenir',
  'la gratitude pour un détail minuscule du quotidien',
  'nommer trois petites choses à remercier, dans une phrase (sans liste à puces)',
  'un merci que la personne adresse au message reçu et à ce qu’il lui révèle (c’est elle qui remercie, pas toi)',
];

// Les images que l'IA reprend d'elle-même (graine, porte, tasse de thé) reviennent trop : on impose un univers différent.
const IMAGERY = [
  'la mer et les marées',
  'la lumière du matin',
  'la musique et les instruments',
  'le feu et la braise',
  'la ville la nuit',
  'les saisons qui tournent',
  'le voyage et les routes',
  'l’artisanat et le geste des mains',
  'le ciel étoilé',
  'la cuisine et les saveurs',
  'la forêt et les sentiers',
  'les montagnes et l’altitude',
  'l’eau d’une rivière',
  'la peinture et les couleurs',
  'le vent et les nuages',
  'la danse et le mouvement',
];

const EMOJI_RULES = [
  'Aucun emoji.',
  'Au plus un emoji, seulement s’il est naturel, placé après la ponctuation finale.',
  'Aucun emoji.',
];

const AFFIRMATION_THEMES = [
  'confiance en soi',
  'abondance',
  'amour de soi',
  'relations et liens sincères',
  'sérénité intérieure',
  'réussite et accomplissement',
  'gratitude pour le présent',
  'gratitude anticipée (comme si c’était déjà reçu)',
  'créativité',
  'santé et énergie vitale',
  'lâcher-prise',
  'courage',
  'joie simple',
  'clarté et intuition',
  'sécurité et stabilité',
  'ouverture aux belles surprises',
  'valeur personnelle',
  'pardon et légèreté',
  'persévérance',
  'beauté du quotidien',
  'liberté',
  'alignement avec ses rêves',
  'chance et synchronicités',
  'paix avec le passé',
];

// Thèmes tirés au hasard pour la liste d'affirmations : au moins un thème de gratitude à chaque fois.
export function pickAffirmationThemes(count = 10, rng: () => number = Math.random): string[] {
  const gratitude = AFFIRMATION_THEMES.filter((t) => t.startsWith('gratitude'));
  const others = AFFIRMATION_THEMES.filter((t) => !t.startsWith('gratitude'));
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  const firstGratitude = gratitude[Math.floor(rng() * gratitude.length)];
  return [firstGratitude, ...others.slice(0, count - 1)];
}

const lastPick: Record<string, number> = {};

// Évite de tirer deux fois de suite la même option dans une catégorie.
function pick<T>(key: string, list: readonly T[], rng: () => number): T {
  let index = Math.floor(rng() * list.length);
  if (list.length > 1 && lastPick[key] === index) {
    index = (index + 1 + Math.floor(rng() * (list.length - 1))) % list.length;
  }
  lastPick[key] = index;
  return list[index];
}

export function buildVarietyDirective(kind: VarietyKind, rng: () => number = Math.random): string {
  const common = [
    `- Ton : ${pick('tone', TONES, rng)}.`,
    `- Loi de l’attraction (toujours présente) : ${pick('attraction', ATTRACTION_ANGLES, rng)}.`,
    `- Gratitude (toujours présente) : ${pick('gratitude', GRATITUDE_FORMS, rng)}.`,
    `- Images : puise-les du côté de ${pick('imagery', IMAGERY, rng)}.`,
    '- Genre : aucun adjectif ni participe qui s’accorde en genre (« certaine », « présente », « ouverte »…).',
  ];

  const lines =
    kind === 'card'
      ? [
          `- Ouverture : ${pick('cardOpening', CARD_OPENINGS, rng)}`,
          `- Lien avec la personne : ${pick('cardLink', CARD_LINKS, rng)}.`,
          ...common,
        ]
      : [
          `- Ouverture : ${pick('opening', READING_OPENINGS, rng)}`,
          `- Forme : ${pick('form', READING_FORMS, rng)}`,
          `- Lien avec la personne : ${pick('link', READING_LINKS, rng)}.`,
          ...common,
          `- Fin : ${pick('ending', READING_ENDINGS, rng)}`,
          `- Emoji : ${pick('emoji', EMOJI_RULES, rng)}`,
        ];

  return [
    'Consignes de style pour CETTE réponse (obligatoires, différentes à chaque demande) :',
    ...lines,
  ].join('\n');
}
