import 'dotenv/config';

import { createClient } from '@supabase/supabase-js';

import { ORACLE_CARDS } from './oracleCards.js';

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function cardForProfile(prenom) {
  const idx = simpleHash(todayISO() + prenom) % ORACLE_CARDS.length;
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
  const currentHour = new Date().getUTCHours();

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('prenom, push_token')
    .eq('notif_enabled', true)
    .eq('notif_hour', currentHour)
    .not('push_token', 'is', null);

  if (error) {
    console.error('Erreur lecture profiles:', error);
    process.exit(1);
  }

  if (!profiles || profiles.length === 0) {
    console.log(`Aucun profil à notifier pour ${currentHour}h UTC.`);
    return;
  }

  const messages = profiles.map((p) => {
    const card = cardForProfile(p.prenom);
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

  console.log(`${messages.length} notification(s) envoyée(s) pour ${currentHour}h UTC.`);
}

main().catch((err) => {
  console.error('Erreur envoi notifications:', err);
  process.exit(1);
});
