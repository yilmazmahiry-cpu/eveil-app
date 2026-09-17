import { Profile } from '@/types';

// Supabase (snake_case) <-> app (camelCase). Kept in one place so the two
// naming conventions never leak into each other.
export type ProfileRow = {
  id: string;
  prenom: string;
  nom: string;
  naissance: string;
  heure_naissance: string | null;
  lieu_naissance: string | null;
  signe: string;
  chemin_vie: number;
  nombre_expression: number;
  nombre_ame: number;
  nombre_personnalite: number;
  ascendant: string | null;
  signe_lunaire: string | null;
  notif_enabled: boolean;
  notif_hour: number;
  invite_code: string;
};

export function rowToProfile(row: ProfileRow): Profile {
  return {
    prenom: row.prenom,
    nom: row.nom,
    naissance: row.naissance,
    heureNaissance: row.heure_naissance,
    lieuNaissance: row.lieu_naissance,
    signe: row.signe,
    cheminVie: row.chemin_vie,
    nombreExpression: row.nombre_expression,
    nombreAme: row.nombre_ame,
    nombrePersonnalite: row.nombre_personnalite,
    ascendant: row.ascendant,
    signeLunaire: row.signe_lunaire,
    notifEnabled: row.notif_enabled,
    notifHour: row.notif_hour,
    inviteCode: row.invite_code,
  };
}

export function profileToRow(profile: Profile): Omit<ProfileRow, 'id'> {
  return {
    prenom: profile.prenom,
    nom: profile.nom,
    naissance: profile.naissance,
    heure_naissance: profile.heureNaissance,
    lieu_naissance: profile.lieuNaissance,
    signe: profile.signe,
    chemin_vie: profile.cheminVie,
    nombre_expression: profile.nombreExpression,
    nombre_ame: profile.nombreAme,
    nombre_personnalite: profile.nombrePersonnalite,
    ascendant: profile.ascendant,
    signe_lunaire: profile.signeLunaire,
    notif_enabled: profile.notifEnabled,
    notif_hour: profile.notifHour,
    invite_code: profile.inviteCode,
  };
}

export function makeInviteCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans caractères ambigus (0/O, 1/I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}
