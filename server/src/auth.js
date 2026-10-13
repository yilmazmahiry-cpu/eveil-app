import { createClient } from '@supabase/supabase-js';

// Vérifie un jeton d'accès Supabase et renvoie l'identifiant du compte, ou null si le jeton est invalide.
//
// Les jetons de ce projet sont signés avec une clé asymétrique (ES256) : supabase-js vérifie la signature
// localement avec la clé publique (JWKS, mise en cache), contrôle l'expiration, et ne contacte pas Supabase à
// chaque requête. Seul SUPABASE_URL est nécessaire (SUPABASE_ANON_KEY, publique, sert de secours si le projet
// repassait à une clé de signature symétrique).
//
// Lève une erreur (-> réponse 503) si la clé publique n'a pas pu être récupérée : ce n'est pas la faute du jeton.
export function createTokenVerifier({ supabaseUrl, anonKey }) {
  const client = createClient(supabaseUrl, anonKey || 'verification-par-cle-publique', {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  return async function verifyToken(token) {
    let result;
    try {
      result = await client.auth.getClaims(token);
    } catch {
      // Jeton illisible (pas un JWT, JSON invalide…) : la bibliothèque lève alors une erreur ordinaire.
      return null;
    }
    const { data, error } = result;
    if (error) {
      if (error.name === 'AuthRetryableFetchError') throw error;
      return null;
    }
    const claims = data?.claims;
    // On refuse les jetons "anon" (la clé publique de l'app) : seul un utilisateur connecté a le droit d'appeler l'IA.
    if (!claims || claims.role !== 'authenticated' || typeof claims.sub !== 'string' || !claims.sub) return null;
    return claims.sub;
  };
}
