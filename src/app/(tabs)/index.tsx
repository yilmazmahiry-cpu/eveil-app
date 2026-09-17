import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Logo } from '@/components/Logo';
import { RitualsPanel } from '@/components/RitualsPanel';
import { Screen } from '@/components/Screen';
import { Tile, TileGrid } from '@/components/Tile';
import {
  ArbreVieIcon,
  CompatIcon,
  HeuresIcon,
  LuneIcon,
  ManifestationIcon,
  ReveIcon,
  SigneIcon,
  ThemeIcon,
} from '@/components/icons';
import { useProfile } from '@/context/ProfileContext';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

export default function HomeScreen() {
  const { profile, streak } = useProfile();
  const router = useRouter();

  if (!profile) return null;

  const hour = new Date().getHours();
  const greeting = `${hour < 18 ? 'Bonjour' : 'Bonsoir'}, ${profile.prenom}`;
  const streakLabel = streak.count > 1 ? `${streak.count} jours de suite` : 'Premier jour de ta série';

  return (
    <Screen edges={['top']} contentContainerStyle={styles.content}>
      <View style={styles.logoRow}>
        <Logo />
        <Text style={styles.logoWord}>Éveil</Text>
      </View>

      <Text style={styles.greeting}>{greeting}</Text>
      <Text style={styles.subtitle}>
        Tu es {profile.signe}, chemin de vie {profile.cheminVie}.
      </Text>
      <Text style={styles.streak}>{streakLabel}</Text>

      <RitualsPanel profile={profile} />

      <Text style={styles.groupTitle}>Au quotidien</Text>
      <TileGrid>
        <Tile
          icon={<HeuresIcon />}
          title="Heures miroir"
          subtitle="11:11, 22:22… ce qu'elles révèlent"
          onPress={() => router.push('/heures')}
        />
        <Tile
          icon={<SigneIcon />}
          title="Un signe"
          subtitle="Un animal, un objet, une coïncidence…"
          onPress={() => router.push('/signe')}
        />
        <Tile
          icon={<ReveIcon />}
          title="Un rêve"
          subtitle="Raconte-le, on en explore le sens"
          onPress={() => router.push('/reve')}
        />
        <Tile
          icon={<LuneIcon />}
          title="Lune & Oracle"
          subtitle="Phase du jour et carte tirée pour toi"
          onPress={() => router.push('/lune')}
        />
      </TileGrid>

      <Text style={styles.groupTitle}>Te connaître</Text>
      <TileGrid>
        <Tile bigValue={profile.cheminVie} title="Numérologie" onPress={() => router.push('/numero')} />
        <Tile
          icon={<ThemeIcon />}
          title="Thème astral"
          subtitle="Une lecture inspirée par ton profil"
          onPress={() => router.push('/theme')}
        />
        <Tile
          icon={<ArbreVieIcon />}
          title="Arbre de vie"
          subtitle="Explore les dix séphiroth kabbalistiques"
          onPress={() => router.push('/arbre-vie')}
        />
      </TileGrid>

      <Text style={styles.groupTitle}>Créer & relier</Text>
      <TileGrid>
        <Tile
          icon={<ManifestationIcon />}
          title="Manifestation"
          subtitle="Pose une intention, active la loi de l'attraction"
          onPress={() => router.push('/manifestation')}
        />
        <Tile
          icon={<CompatIcon />}
          title="Compatibilité"
          subtitle="Toi et une autre personne"
          onPress={() => router.push('/compat')}
        />
      </TileGrid>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingBottom: 40 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logoWord: { fontFamily: fonts.serif, fontSize: 14.5, color: colors.inkMuted, letterSpacing: 0.3 },
  greeting: { fontFamily: fonts.serifSemiBold, fontSize: 25, color: colors.ink, marginTop: 16, marginBottom: 3 },
  subtitle: { fontFamily: fonts.sans, fontSize: 14, color: colors.inkMuted, marginBottom: 2 },
  streak: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.gold, marginBottom: 22 },
  groupTitle: { fontFamily: fonts.serif, fontSize: 16.5, color: colors.ink, marginTop: 30, marginBottom: 14 },
});
