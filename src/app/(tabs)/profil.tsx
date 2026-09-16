import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, TextButton } from '@/components/Buttons';
import {
  DateWheelPicker,
  DateValue,
  dateValueToISO,
  isoToDateValue,
  TimeValue,
  TimeWheelPicker,
} from '@/components/DateWheels';
import { LabeledField, StyledTextInput } from '@/components/Fields';
import { Logo } from '@/components/Logo';
import { useProfile } from '@/context/ProfileContext';
import { getSigne } from '@/lib/astrology';
import { formatDateLongFR } from '@/lib/format';
import { getCheminVie, getNombreAme, getNombreExpression, getNombrePersonnalite } from '@/lib/numerology';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

export default function ProfilScreen() {
  const { profile, saveProfile, deleteProfile } = useProfile();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (!profile) return null;

  if (editing) {
    return (
      <ProfilEditForm
        initial={profile}
        onCancel={() => setEditing(false)}
        onSave={async (next) => {
          await saveProfile(next);
          setEditing(false);
        }}
      />
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.logoRow}>
        <Logo />
        <Text style={styles.logoWord}>Éveil</Text>
      </View>
      <Text style={styles.title}>Ton profil</Text>

      <Row label="Prénom" value={profile.prenom} />
      <Row label="Nom" value={profile.nom || '—'} />
      <Row label="Date de naissance" value={formatDateLongFR(profile.naissance)} />
      <Row label="Heure de naissance" value={profile.heureNaissance || 'Non renseignée'} />
      <Row label="Lieu de naissance" value={profile.lieuNaissance || 'Non renseigné'} />
      <Row label="Signe" value={profile.signe} />
      <Row label="Chemin de vie" value={String(profile.cheminVie)} />

      <PrimaryButton title="Modifier mes informations" onPress={() => setEditing(true)} style={{ marginTop: 22 }} />
      <TextButton
        title="Supprimer mon profil"
        color={colors.alert}
        onPress={() => setConfirmingDelete(true)}
        style={{ marginTop: 14 }}
      />

      {confirmingDelete && (
        <View style={styles.confirmBox}>
          <View style={styles.confirmPanel}>
            <Text style={styles.confirmText}>
              Cette action supprimera définitivement ton profil et ton journal, sans possibilité de retour en
              arrière.
            </Text>
          </View>
          <View style={styles.confirmActions}>
            <PrimaryButton
              title="Oui, supprimer"
              onPress={async () => {
                await deleteProfile();
                router.replace('/welcome');
              }}
              style={{ backgroundColor: colors.alert, flex: 1, marginTop: 0 }}
            />
            <TextButton title="Annuler" onPress={() => setConfirmingDelete(false)} style={{ marginTop: 0 }} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function ProfilEditForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: import('@/types').Profile;
  onCancel: () => void;
  onSave: (p: import('@/types').Profile) => void;
}) {
  const [prenom, setPrenom] = useState(initial.prenom);
  const [nom, setNom] = useState(initial.nom);
  const [lieu, setLieu] = useState(initial.lieuNaissance || '');
  const [date, setDate] = useState<DateValue>(isoToDateValue(initial.naissance));
  const [time, setTime] = useState<TimeValue>(
    initial.heureNaissance
      ? { hour: initial.heureNaissance.split(':')[0], minute: initial.heureNaissance.split(':')[1] }
      : { hour: '', minute: '' }
  );

  const handleSave = () => {
    if (!prenom.trim()) return;
    const naissance = dateValueToISO(date);
    const fullName = `${prenom.trim()} ${nom.trim()}`.trim();
    onSave({
      prenom: prenom.trim(),
      nom: nom.trim(),
      naissance,
      heureNaissance: time.hour && time.minute ? `${time.hour}:${time.minute}` : null,
      lieuNaissance: lieu.trim() || null,
      signe: getSigne(date.month, date.day),
      cheminVie: getCheminVie(naissance),
      nombreExpression: getNombreExpression(fullName),
      nombreAme: getNombreAme(fullName),
      nombrePersonnalite: getNombrePersonnalite(fullName),
    });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { gap: 14 }]} keyboardShouldPersistTaps="handled">
      <View style={styles.logoRow}>
        <Logo />
        <Text style={styles.logoWord}>Éveil</Text>
      </View>
      <Text style={styles.title}>Modifier ton profil</Text>

      <LabeledField label="Ton prénom">
        <StyledTextInput value={prenom} onChangeText={setPrenom} />
      </LabeledField>
      <LabeledField label="Ton nom de famille">
        <StyledTextInput value={nom} onChangeText={setNom} />
      </LabeledField>
      <LabeledField label="Ta date de naissance">
        <DateWheelPicker value={date} onChange={setDate} />
      </LabeledField>
      <LabeledField label="Heure de naissance" optional>
        <TimeWheelPicker value={time} onChange={setTime} />
      </LabeledField>
      <LabeledField label="Lieu de naissance" optional>
        <StyledTextInput value={lieu} onChangeText={setLieu} />
      </LabeledField>

      <View style={styles.editActions}>
        <PrimaryButton title="Enregistrer" onPress={handleSave} style={{ flex: 1, marginTop: 0 }} />
        <TextButton title="Annuler" onPress={onCancel} style={{ marginTop: 0 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, paddingTop: 30, paddingBottom: 60 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 20 },
  logoWord: { fontFamily: fonts.serif, fontSize: 14.5, color: colors.inkMuted },
  title: { fontFamily: fonts.serifSemiBold, fontSize: 23, color: colors.ink, marginBottom: 18 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    paddingVertical: 12,
    gap: 12,
  },
  rowLabel: { fontFamily: fonts.sans, fontSize: 13, color: colors.inkMuted, flexShrink: 0 },
  rowValue: { fontFamily: fonts.serif, fontSize: 14.5, color: colors.ink, textAlign: 'right', flexShrink: 1 },
  confirmBox: { marginTop: 16 },
  confirmPanel: { backgroundColor: colors.alertBg, borderWidth: 1, borderColor: colors.alertBorder, borderRadius: 16, padding: 18 },
  confirmText: { fontFamily: fonts.sans, fontSize: 13.5, color: colors.ink },
  confirmActions: { flexDirection: 'row', gap: 10, marginTop: 12, alignItems: 'center' },
  editActions: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 18 },
});
