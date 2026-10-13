import 'dotenv/config';

import { createClient } from '@supabase/supabase-js';

import { localDateAndHour } from './localTime.js';
import { ORACLE_CARDS } from './oracleCards.js';

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

// Même formule que l'app (date locale de l'utilisateur + prénom) pour annoncer la carte qu'il verra.
function cardForProfile(prenom, localDate) {
  const idx = simpleHash(localDate + prenom) % ORACLE_CARDS.length;
  return ORACLE_CARDS[idx];
}

async function sendExpoPush(messages) {
  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(messages),
  });
  if (!res.ok) {
    console.error('Expo push send failed:', res.status, await res.text());
  }
}

async function main() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants.');
    process.exit(1);
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date();

  // L'heure choisie par l'utilisateur est son heure locale : on filtre ici, profil par profil.
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('prenom, push_token, notif_hour, timezone')
    .eq('notif_enabled', true)
    .not('push_token', 'is', null);

  if (error) {
    console.error('Erreur lecture profiles:', error);
    process.exit(1);
  }

  const due = (profiles ?? []).filter((p) => localDateAndHour(now, p.timezone).hour === p.notif_hour);

  if (due.length === 0) {
    console.log(`Aucun profil à notifier (${(profiles ?? []).length} actif(s)) à ${now.toISOString()}.`);
    return;
  }

  const messages = due.map((p) => {
    const card = cardForProfile(p.prenom, localDateAndHour(now, p.timezone).date);
    return {
      to: p.push_token,
      title: 'Éveil',
      body: `${p.prenom}, ta carte du jour : ${card.name} ✨`,
      sound: 'default',
    };
  });

  // L'API Expo accepte jusqu'à 100 messages par requête.
  for (let i = 0; i < messages.length; i += 100) {
    await sendExpoPush(messages.slice(i, i + 100));
  }

  console.log(`${messages.length} notification(s) envoyée(s) à ${now.toISOString()}.`);
}

main().catch((err) => {
  console.error('Erreur envoi notifications:', err);
  process.exit(1);
});
