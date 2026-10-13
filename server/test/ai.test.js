import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';
import http from 'node:http';
import { after, before, describe, it } from 'node:test';

import { createApp } from '../src/app.js';
import { createTokenVerifier } from '../src/auth.js';
import { hasActivePremium } from '../src/premium.js';
import { PROMPTS } from '../src/prompts.js';

const silent = { error() {}, log() {} };

// --- Faux Supabase : publie une clé publique ES256 et signe des jetons avec la clé privée -------------------
const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });
const KID = 'test-key';
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: KID, alg: 'ES256', use: 'sig' };

const b64 = (value) => Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)).toString('base64url');

function signToken(payload, { key = privateKey, kid = KID } = {}) {
  const data = `${b64({ alg: 'ES256', typ: 'JWT', kid })}.${b64(payload)}`;
  const signature = crypto.sign('sha256', Buffer.from(data), { key, dsaEncoding: 'ieee-p1363' });
  return `${data}.${signature.toString('base64url')}`;
}

const inOneHour = () => Math.floor(Date.now() / 1000) + 3600;
const userToken = (sub = 'user-1', extra = {}) => signToken({ sub, role: 'authenticated', exp: inOneHour(), ...extra });

let jwksServer;
let supabaseUrl;
before(async () => {
  jwksServer = http.createServer((req, res) => {
    if (req.url === '/auth/v1/.well-known/jwks.json') {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ keys: [jwk] }));
    } else {
      res.statusCode = 404;
      res.end('{}');
    }
  });
  await new Promise((resolve) => jwksServer.listen(0, '127.0.0.1', resolve));
  supabaseUrl = `http://127.0.0.1:${jwksServer.address().port}`;
});
after(() => jwksServer.close());

// --- Vérification des jetons -----------------------------------------------------------------------------
describe('createTokenVerifier', () => {
  it('accepte un jeton valide et renvoie l’identifiant du compte', async () => {
    const verify = createTokenVerifier({ supabaseUrl, anonKey: 'anon' });
    assert.equal(await verify(userToken('abc-123')), 'abc-123');
  });

  it('refuse un jeton signé avec une autre clé', async () => {
    const other = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' }).privateKey;
    const verify = createTokenVerifier({ supabaseUrl, anonKey: 'anon' });
    assert.equal(await verify(signToken({ sub: 'x', role: 'authenticated', exp: inOneHour() }, { key: other })), null);
  });

  it('refuse un jeton expiré', async () => {
    const verify = createTokenVerifier({ supabaseUrl, anonKey: 'anon' });
    const expired = signToken({ sub: 'x', role: 'authenticated', exp: Math.floor(Date.now() / 1000) - 60 });
    assert.equal(await verify(expired), null);
  });

  it('refuse le jeton "anon" (clé publique de l’app) et les chaînes quelconques', async () => {
    const verify = createTokenVerifier({ supabaseUrl, anonKey: 'anon' });
    assert.equal(await verify(signToken({ role: 'anon', exp: inOneHour() })), null);
    assert.equal(await verify('pas-un-jeton'), null);
    assert.equal(await verify('abc.def.ghi'), null);
    assert.equal(await verify(`${b64({ alg: 'ES256', kid: KID })}.${b64('pas du json')}.${b64('sig')}`), null);
  });

  it('signale une panne (et non un refus) quand la clé publique est introuvable', async () => {
    // Hôte différent des autres tests : supabase-js met les clés publiques en cache par nom d'hôte.
    const verify = createTokenVerifier({ supabaseUrl: 'http://localhost:1', anonKey: 'anon' });
    await assert.rejects(() => verify(userToken()));
  });
});

// --- Abonnement RevenueCat -------------------------------------------------------------------------------
describe('hasActivePremium', () => {
  const now = Date.parse('2026-10-13T12:00:00Z');
  const body = (entitlement) => ({ subscriber: { entitlements: entitlement ? { premium: entitlement } : {} } });

  it('reconnaît un abonnement actif, à vie, ou en période de grâce', () => {
    assert.equal(hasActivePremium(body({ expires_date: '2026-11-01T00:00:00Z' }), now), true);
    assert.equal(hasActivePremium(body({ expires_date: null }), now), true);
    assert.equal(
      hasActivePremium(body({ expires_date: '2026-10-01T00:00:00Z', grace_period_expires_date: '2026-10-20T00:00:00Z' }), now),
      true
    );
  });

  it('refuse un abonnement expiré ou absent', () => {
    assert.equal(hasActivePremium(body({ expires_date: '2026-10-01T00:00:00Z' }), now), false);
    assert.equal(hasActivePremium(body(null), now), false);
    assert.equal(hasActivePremium({}, now), false);
  });
});

// --- Route /api/ai ---------------------------------------------------------------------------------------
async function startApp(options = {}) {
  const calls = [];
  const anthropic = {
    messages: {
      create: async (args) => {
        calls.push(args);
        return { content: [{ type: 'text', text: 'réponse' }] };
      },
    },
  };
  const verifyToken = options.verifyToken === null ? null : createTokenVerifier({ supabaseUrl, anonKey: 'anon' });
  const app = createApp({ anthropic, model: 'test-model', verifyToken, isPremium: null, log: silent, ...options.deps });
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (body, token) =>
    fetch(`${base}/api/ai`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    });
  return { calls, post, close: () => server.close() };
}

describe('POST /api/ai', () => {
  it('nouveau format : prompt de base du serveur + consignes de l’app', async () => {
    const s = await startApp();
    const res = await s.post({ promptType: 'general', extras: 'Consignes de style : tendre', userPrompt: 'Heure 11:11' }, userToken());
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { text: 'réponse' });
    assert.equal(s.calls[0].system, `${PROMPTS.general}\n\nConsignes de style : tendre`);
    assert.equal(s.calls[0].messages[0].content, 'Heure 11:11');
    s.close();
  });

  it('mode compatible : l’ancien format sans compte fonctionne encore (app en cours de validation Apple)', async () => {
    const s = await startApp();
    const res = await s.post({ systemPrompt: 'ancien prompt', userPrompt: 'bonjour' });
    assert.equal(res.status, 200);
    assert.equal(s.calls[0].system, 'ancien prompt');
    s.close();
  });

  it('un jeton invalide est refusé (401) même en mode compatible', async () => {
    const s = await startApp();
    const res = await s.post({ promptType: 'carte', userPrompt: 'x' }, 'jeton.invalide.ici');
    assert.equal(res.status, 401);
    assert.equal(s.calls.length, 0);
    s.close();
  });

  it('mode strict : sans compte (401) et ancien format (400) sont refusés', async () => {
    const s = await startApp({ deps: { strict: true } });
    assert.equal((await s.post({ promptType: 'carte', userPrompt: 'x' })).status, 401);
    assert.equal((await s.post({ systemPrompt: 'a', userPrompt: 'x' }, userToken())).status, 400);
    assert.equal((await s.post({ promptType: 'carte', userPrompt: 'x' }, userToken())).status, 200);
    assert.equal(s.calls.length, 1);
    s.close();
  });

  it('type de prompt inconnu, extras trop longs ou mal typés : 400', async () => {
    const s = await startApp();
    const token = userToken();
    assert.equal((await s.post({ promptType: 'constructor', userPrompt: 'x' }, token)).status, 400);
    assert.equal((await s.post({ promptType: 'inconnu', userPrompt: 'x' }, token)).status, 400);
    assert.equal((await s.post({ promptType: 'general', extras: 'a'.repeat(3001), userPrompt: 'x' }, token)).status, 400);
    assert.equal((await s.post({ promptType: 'general', extras: { a: 1 }, userPrompt: 'x' }, token)).status, 400);
    assert.equal((await s.post({ promptType: 'general', userPrompt: '   ' }, token)).status, 400);
    assert.equal(s.calls.length, 0);
    s.close();
  });

  it('les lectures exigent un abonnement, pas la carte du jour ni les affirmations', async () => {
    const s = await startApp({ deps: { isPremium: async () => false } });
    const token = userToken();
    assert.equal((await s.post({ promptType: 'general', userPrompt: 'x' }, token)).status, 403);
    assert.equal((await s.post({ promptType: 'carte', userPrompt: 'x' }, token)).status, 200);
    assert.equal((await s.post({ promptType: 'affirmations', userPrompt: 'x' }, token)).status, 200);
    s.close();
  });

  it('abonné reconnu, ou RevenueCat injoignable (null) : la lecture est servie', async () => {
    const premium = await startApp({ deps: { isPremium: async () => true } });
    assert.equal((await premium.post({ promptType: 'general', userPrompt: 'x' }, userToken())).status, 200);
    premium.close();

    const unknown = await startApp({ deps: { isPremium: async () => null } });
    assert.equal((await unknown.post({ promptType: 'general', userPrompt: 'x' }, userToken())).status, 200);
    unknown.close();
  });

  it('limite par compte : le 3e appel de la même personne est refusé, pas celui d’une autre', async () => {
    const s = await startApp({ deps: { userLimitPerHour: 2 } });
    const a = userToken('compte-a');
    assert.equal((await s.post({ promptType: 'carte', userPrompt: 'x' }, a)).status, 200);
    assert.equal((await s.post({ promptType: 'carte', userPrompt: 'x' }, a)).status, 200);
    assert.equal((await s.post({ promptType: 'carte', userPrompt: 'x' }, a)).status, 429);
    assert.equal((await s.post({ promptType: 'carte', userPrompt: 'x' }, userToken('compte-b'))).status, 200);
    s.close();
  });

  it('serveur sans SUPABASE_URL : un jeton est ignoré et l’appel passe comme avant', async () => {
    const s = await startApp({ verifyToken: null });
    const res = await s.post({ promptType: 'carte', userPrompt: 'x' }, 'nimporte-quoi');
    assert.equal(res.status, 200);
    s.close();
  });
});
