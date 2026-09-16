export type Sephira = {
  key: string;
  name: string;
  trad: string;
  x: number;
  y: number;
  theme: string;
};

export const SEPHIROT: Sephira[] = [
  { key: 'keter', name: 'Keter', trad: 'La Couronne', x: 150, y: 20, theme: "L'unité originelle, la volonté pure, la source de tout ce qui existe." },
  { key: 'chokmah', name: 'Chokmah', trad: 'La Sagesse', x: 200, y: 65, theme: "L'intuition brute, l'étincelle créatrice, l'élan avant la forme." },
  { key: 'binah', name: 'Binah', trad: 'La Compréhension', x: 100, y: 65, theme: 'La structure, le discernement, la capacité à donner forme aux idées.' },
  { key: 'chesed', name: 'Chesed', trad: 'La Bonté', x: 200, y: 135, theme: "L'amour inconditionnel, la générosité, l'expansion sans limite." },
  { key: 'gevurah', name: 'Gevurah', trad: 'La Rigueur', x: 100, y: 135, theme: 'La discipline, les limites nécessaires, la force de dire non.' },
  { key: 'tiferet', name: 'Tiferet', trad: 'La Beauté', x: 150, y: 170, theme: "L'équilibre, l'harmonie du cœur, le point de rencontre entre toutes les forces." },
  { key: 'netzach', name: 'Netzach', trad: "L'Éternité", x: 200, y: 205, theme: "Le désir, l'endurance, l'élan émotionnel qui pousse à avancer." },
  { key: 'hod', name: 'Hod', trad: 'La Splendeur', x: 100, y: 205, theme: "L'intellect, la communication, l'humilité face au savoir." },
  { key: 'yesod', name: 'Yesod', trad: 'Le Fondement', x: 150, y: 245, theme: "L'inconscient, le pont entre l'idée et sa réalisation concrète." },
  { key: 'malkuth', name: 'Malkuth', trad: 'Le Royaume', x: 150, y: 295, theme: 'Le monde matériel, le corps, la manifestation tangible de tout le reste.' },
];

export const SEPHIROT_PATHS: [string, string][] = [
  ['keter', 'chokmah'], ['keter', 'binah'], ['keter', 'tiferet'],
  ['chokmah', 'binah'], ['chokmah', 'tiferet'], ['chokmah', 'chesed'],
  ['binah', 'tiferet'], ['binah', 'gevurah'],
  ['chesed', 'gevurah'], ['chesed', 'tiferet'], ['chesed', 'netzach'],
  ['gevurah', 'tiferet'], ['gevurah', 'hod'],
  ['tiferet', 'netzach'], ['tiferet', 'hod'], ['tiferet', 'yesod'],
  ['netzach', 'hod'], ['netzach', 'yesod'], ['netzach', 'malkuth'],
  ['hod', 'yesod'], ['hod', 'malkuth'],
  ['yesod', 'malkuth'],
];
