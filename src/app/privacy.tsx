import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScreenHeader } from '@/components/Common';
import { Screen } from '@/components/Screen';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

const SECTIONS: { title: string; body: string }[] = [
  {
    title: '1. Données que nous collectons',
    body:
      'Compte : ton adresse email et ton mot de passe (chiffré, nous n’y avons jamais accès en clair).\n\n' +
      'Profil : prénom, nom (facultatif), date de naissance, heure et lieu de naissance (facultatifs) — utilisés uniquement pour calculer ton signe, ton ascendant, ta lune, ton chemin de vie et tes nombres de numérologie.\n\n' +
      'Contenu que tu crées : entrées de journal, gratitudes, série de jours consécutifs.\n\n' +
      'Notifications : un identifiant technique de ton appareil (jeton push) si tu actives les rappels.\n\n' +
      'Abonnement : Apple gère directement le paiement, nous ne voyons jamais tes informations bancaires.\n\n' +
      'Nous ne collectons aucune localisation précise, aucun contact, et n’utilisons aucun traceur publicitaire.',
  },
  {
    title: '2. Pourquoi nous utilisons ces données',
    body:
      'Créer et sécuriser ton compte, calculer tes informations astrologiques et générer tes lectures personnalisées, sauvegarder ton journal et ta progression sur tous tes appareils, t’envoyer les notifications que tu as activées, gérer ton abonnement Premium.\n\n' +
      'Nous ne vendons ni ne partageons tes données à des fins publicitaires.',
  },
  {
    title: '3. Avec qui nous partageons des données',
    body:
      'Supabase (base de données et authentification, UE), Anthropic (génère tes lectures à partir de ton prénom, signe et saisies — jamais ton email ni ton mot de passe), Render (héberge notre serveur), Expo (envoi des notifications), RevenueCat (gestion de l’abonnement), Apple (App Store, paiement), OpenStreetMap / Nominatim (convertit ta ville de naissance en coordonnées, si renseignée).\n\n' +
      'Aucun de ces prestataires n’est autorisé à utiliser tes données à ses propres fins.',
  },
  {
    title: '4. Combien de temps nous gardons tes données',
    body:
      'Tant que ton compte existe. Si tu le supprimes depuis l’app (Profil → Supprimer mon compte), toutes tes données et ton compte de connexion sont supprimés immédiatement et définitivement.',
  },
  {
    title: '5. Tes droits',
    body:
      'Conformément au RGPD : accéder à tes données (visibles directement dans l’app), les corriger depuis "Modifier mes informations", supprimer ton compte depuis l’écran Profil, te désabonner des notifications à tout moment.\n\n' +
      'Pour toute question : yilmazmahir.y@gmail.com',
  },
  {
    title: '6. Âge minimum',
    body: 'Éveil ne s’adresse pas aux enfants de moins de 16 ans.',
  },
  {
    title: '7. Sécurité',
    body:
      'Tes données sont chiffrées en transit (HTTPS) et protégées par des règles d’accès strictes (chaque utilisateur ne voit que ses propres données).',
  },
  {
    title: '8. Modifications',
    body: 'Cette politique peut évoluer avec l’application. Toute modification importante te sera signalée dans l’app.',
  },
];

export default function PrivacyScreen() {
  return (
    <Screen contentContainerStyle={styles.container}>
      <ScreenHeader title="Confidentialité" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.updated}>Dernière mise à jour : 29 septembre 2026</Text>
        {SECTIONS.map((s) => (
          <View key={s.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.paragraph}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 40 },
  updated: { fontFamily: fonts.sans, fontSize: 12, color: colors.inkMuted, marginBottom: 20 },
  section: { marginBottom: 22 },
  sectionTitle: { fontFamily: fonts.sansBold, fontSize: 14, color: colors.gold, marginBottom: 8 },
  paragraph: { fontFamily: fonts.sans, fontSize: 13.5, color: colors.inkMuted, lineHeight: 21 },
});
