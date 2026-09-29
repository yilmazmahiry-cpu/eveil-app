import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { PurchasesPackage } from 'react-native-purchases';

import { PrimaryButton, TextButton } from '@/components/Buttons';
import { Screen } from '@/components/Screen';
import { useProfile } from '@/context/ProfileContext';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

const FEATURES = [
  'Lectures IA illimitées : Heures miroir, Rêve, Signe, Thème astral, Compatibilité, Manifestation, Arbre de vie',
  'Tarot : 5 lectures personnalisées par jour',
  'Notifications avec le vrai contenu de ta carte du jour',
];

export default function PaywallScreen() {
  const router = useRouter();
  const { offering, purchasePackage, restorePurchases } = useProfile();
  const [selected, setSelected] = useState<'annual' | 'monthly'>('annual');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const monthly = offering?.monthly ?? null;
  const annual = offering?.annual ?? null;
  const activePackage: PurchasesPackage | null = selected === 'annual' ? annual : monthly;

  const handleSubscribe = async () => {
    if (!activePackage) return;
    setError('');
    setSubmitting(true);
    try {
      await purchasePackage(activePackage);
      router.back();
    } catch (e: any) {
      if (!e?.userCancelled) setError('L’achat n’a pas abouti. Réessaie dans un instant.');
    }
    setSubmitting(false);
  };

  const handleRestore = async () => {
    setError('');
    setSubmitting(true);
    try {
      await restorePurchases();
      router.back();
    } catch {
      setError('Aucun achat à restaurer sur ce compte.');
    }
    setSubmitting(false);
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.close}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>

      <Text style={styles.title}>Éveil Premium</Text>
      <Text style={styles.subtitle}>7 jours d’essai gratuit, puis débloque toutes les lectures.</Text>

      <View style={styles.features}>
        {FEATURES.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Text style={styles.featureDot}>✦</Text>
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      {monthly && annual ? (
        <View style={styles.plans}>
          <Pressable
            onPress={() => setSelected('annual')}
            style={[styles.plan, selected === 'annual' && styles.planActive]}
          >
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>Meilleure offre</Text>
            </View>
            <Text style={styles.planLabel}>Annuel</Text>
            <Text style={styles.planPrice}>{annual.product.priceString}</Text>
            <Text style={styles.planSub}>≈ {(annual.product.pricePerMonthString ?? '').trim()} / mois</Text>
          </Pressable>
          <Pressable
            onPress={() => setSelected('monthly')}
            style={[styles.plan, selected === 'monthly' && styles.planActive]}
          >
            <Text style={styles.planLabel}>Mensuel</Text>
            <Text style={styles.planPrice}>{monthly.product.priceString}</Text>
            <Text style={styles.planSub}>par mois</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.loadingOfferings}>Chargement des offres…</Text>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton
        title="Commencer l’essai gratuit"
        onPress={handleSubscribe}
        loading={submitting}
        disabled={!activePackage}
        style={{ marginTop: 20 }}
      />
      <TextButton title="Restaurer mes achats" onPress={handleRestore} style={{ alignSelf: 'center', marginTop: 4 }} />

      <View style={styles.legalRow}>
        <Text style={styles.legalLink} onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}>
          Conditions d’utilisation
        </Text>
        <Text style={styles.legalSep}>·</Text>
        <Text style={styles.legalLink} onPress={() => router.push('/privacy')}>
          Confidentialité
        </Text>
      </View>
      <Text style={styles.disclaimer}>
        Le paiement est débité à la fin de l’essai gratuit sauf annulation au moins 24h avant. Résiliable à tout
        moment dans les réglages de ton compte {`{App Store / Google Play}`}.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingTop: 60, paddingBottom: 48 },
  close: { position: 'absolute', top: 18, right: 18, padding: 8, zIndex: 1 },
  closeText: { color: colors.inkMuted, fontSize: 16 },
  title: { fontFamily: fonts.serifSemiBold, fontSize: 28, color: colors.ink, marginBottom: 6, textAlign: 'center' },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: 'center',
    marginBottom: 26,
    lineHeight: 21,
  },
  features: { gap: 12, marginBottom: 28 },
  featureRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  featureDot: { color: colors.gold, fontSize: 13, marginTop: 2 },
  featureText: { flex: 1, fontFamily: fonts.sans, fontSize: 13.5, color: colors.ink, lineHeight: 20 },
  plans: { flexDirection: 'row', gap: 12 },
  plan: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  planActive: { borderColor: colors.gold, backgroundColor: colors.goldSoft },
  planBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: colors.gold,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  planBadgeText: { fontFamily: fonts.sansBold, fontSize: 10, color: colors.bg },
  planLabel: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.ink, marginTop: 6 },
  planPrice: { fontFamily: fonts.serifSemiBold, fontSize: 20, color: colors.gold, marginTop: 6 },
  planSub: { fontFamily: fonts.sans, fontSize: 11, color: colors.inkMuted, marginTop: 2 },
  loadingOfferings: { fontFamily: fonts.sans, fontSize: 13, color: colors.inkMuted, textAlign: 'center' },
  error: { color: colors.alert, fontFamily: fonts.sans, fontSize: 13, textAlign: 'center', marginTop: 12 },
  legalRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 22 },
  legalLink: { fontFamily: fonts.sans, fontSize: 11.5, color: colors.inkMuted, textDecorationLine: 'underline' },
  legalSep: { color: colors.inkMuted, fontSize: 11.5 },
  disclaimer: {
    fontFamily: fonts.sans,
    fontSize: 10.5,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 15,
    opacity: 0.8,
  },
});
