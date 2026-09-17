export type Profile = {
  prenom: string;
  nom: string;
  naissance: string; // "YYYY-MM-DD"
  heureNaissance: string | null; // "HH:MM"
  lieuNaissance: string | null;
  signe: string;
  cheminVie: number;
  nombreExpression: number;
  nombreAme: number;
  nombrePersonnalite: number;
  // Thème natal précis (calculé côté serveur à partir de heureNaissance +
  // lieuNaissance) ; null si non renseigné, non calculé, ou échec (lieu
  // introuvable, backend indisponible).
  ascendant: string | null;
  signeLunaire: string | null;
  notifEnabled: boolean;
  notifHour: number;
  inviteCode: string;
};

export type JournalType =
  | 'heures'
  | 'reve'
  | 'signe'
  | 'numero'
  | 'lune'
  | 'theme'
  | 'compat'
  | 'manifestation'
  | 'sephira'
  | 'tarot';

export type JournalEntry = {
  id: string;
  type: JournalType;
  input: string;
  result: string;
  date: string; // ISO datetime
  fav: boolean;
  feedback: 'up' | 'down' | null;
  realized: boolean;
};

export type Streak = { count: number; lastDate: string | null };

export type GratitudeEntry = { date: string; items: [string, string, string] };

export const JOURNAL_LABELS: Record<JournalType, string> = {
  heures: 'Heure miroir',
  reve: 'Rêve',
  signe: 'Signe',
  numero: 'Numérologie',
  lune: 'Lune & Oracle',
  theme: 'Thème astral',
  compat: 'Compatibilité',
  manifestation: 'Manifestation',
  sephira: 'Arbre de vie',
  tarot: 'Tarot',
};
