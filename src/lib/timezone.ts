import { supabase } from '@/lib/supabase';

// Fuseau IANA de l'appareil (ex. "Europe/Paris"), ou null si indisponible.
export function getDeviceTimeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

// Le serveur envoie la notification quand il est l'heure choisie *chez l'utilisateur* : il lui faut son fuseau.
// Mis à jour à chaque lancement pour suivre les déplacements. Sans importance si ça échoue.
export async function syncTimeZone(userId: string): Promise<void> {
  const timezone = getDeviceTimeZone();
  if (!timezone) return;
  try {
    await supabase.from('profiles').update({ timezone }).eq('id', userId);
  } catch {
    // ignoré : le serveur retombe sur l'UTC sans fuseau
  }
}
