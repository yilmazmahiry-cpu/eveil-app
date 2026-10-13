const MESSAGES: [RegExp, string][] = [
  [/invalid login credentials/i, 'Email ou mot de passe incorrect.'],
  [/email not confirmed/i, 'Ton email n’est pas encore confirmé. Vérifie ta boîte mail et clique sur le lien reçu.'],
  [/already registered|already been registered/i, 'Un compte existe déjà avec cet email. Connecte-toi plutôt.'],
  [/password should be at least|weak password|password is too short/i, 'Le mot de passe doit faire au moins 6 caractères.'],
  [/same password|different from the old/i, 'Choisis un mot de passe différent de l’ancien.'],
  [/invalid format|valid email|unable to validate email/i, 'Cette adresse email n’a pas l’air valide.'],
  [/rate limit|too many requests|after \d+ seconds/i, 'Trop de tentatives. Réessaie dans quelques minutes.'],
  [/network|failed to fetch/i, 'Connexion impossible. Vérifie ta connexion internet.'],
];

// Évite d'afficher à l'utilisateur les messages bruts (en anglais) renvoyés par Supabase.
export function translateAuthError(message: string, fallback: string): string {
  for (const [pattern, french] of MESSAGES) {
    if (pattern.test(message)) return french;
  }
  return fallback;
}
