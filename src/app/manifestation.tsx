import { useRouter } from 'expo-router';

import { TextButton } from '@/components/Buttons';
import { FeatureScreen } from '@/components/FeatureScreen';
import { useProfile } from '@/context/ProfileContext';

export default function ManifestationScreen() {
  const { profile } = useProfile();
  const router = useRouter();
  if (!profile) return null;
  return (
    <FeatureScreen
      type="manifestation"
      title="Manifestation"
      intro="Qu'est-ce que tu veux attirer ou créer dans ta vie ?"
      placeholder="Plus de confiance en moi, une opportunité professionnelle, une relation épanouissante…"
      multiline
      submitLabel="Créer mon intention"
      buildPrompt={(v) =>
        `${profile.prenom} (signe : ${profile.signe}) souhaite attirer ou créer ceci dans sa vie : "${v}". En t'inspirant de la loi de l'attraction, reformule ce désir en une intention positive au présent, comme si c'était déjà en train de se réaliser, et donne une piste concrète pour aligner ses pensées et ses émotions avec cette intention aujourd'hui.`
      }
      footer={
        <TextButton
          title="Parcourir la bibliothèque d'affirmations"
          onPress={() => router.push('/affirmations')}
          style={{ marginTop: 20 }}
        />
      }
    />
  );
}
