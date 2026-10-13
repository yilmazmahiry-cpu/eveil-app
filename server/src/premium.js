// Vérifie côté serveur qu'un compte a un abonnement "premium" actif, via l'API REST de RevenueCat.
// L'identifiant RevenueCat d'un utilisateur est son identifiant Supabase (voir src/lib/purchases.ts dans l'app).

const ENTITLEMENT = 'premium';
const PREMIUM_CACHE_MS = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 5000;

export function hasActivePremium(body, nowMs) {
  const entitlement = body?.subscriber?.entitlements?.[ENTITLEMENT];
  if (!entitlement) return false;
  if (!entitlement.expires_date) return true; // achat à vie
  if (Date.parse(entitlement.expires_date) > nowMs) return true;
  const grace = entitlement.grace_period_expires_date ? Date.parse(entitlement.grace_period_expires_date) : null;
  return grace !== null && grace > nowMs;
}

// Renvoie true / false, ou null si RevenueCat n'a pas pu répondre : dans ce cas le serveur laisse passer
// (mieux vaut servir un abonné que le bloquer à cause d'une panne chez RevenueCat).
export function createPremiumChecker({ secretKey, fetchImpl = fetch, now = Date.now, log = console }) {
  const cache = new Map();

  return async function isPremium(userId) {
    const hit = cache.get(userId);
    if (hit && hit.until > now()) return true;

    try {
      const res = await fetchImpl(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
        headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        log.error('RevenueCat a répondu', res.status);
        return null;
      }
      const premium = hasActivePremium(await res.json(), now());
      // Seul "premium" est mis en cache : quelqu'un qui vient de s'abonner ne doit pas attendre pour être reconnu.
      if (premium) {
        if (cache.size >= MAX_CACHE_ENTRIES) cache.clear();
        cache.set(userId, { until: now() + PREMIUM_CACHE_MS });
      } else {
        cache.delete(userId);
      }
      return premium;
    } catch (err) {
      log.error('Vérification RevenueCat impossible :', err?.message ?? err);
      return null;
    }
  };
}
