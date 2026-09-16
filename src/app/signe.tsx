import { FeatureScreen } from '@/components/FeatureScreen';
import { useProfile } from '@/context/ProfileContext';

export default function SigneScreen() {
  const { profile } = useProfile();
  if (!profile) return null;
  return (
    <FeatureScreen
      type="signe"
      title="Un signe"
      intro="Qu'as-tu remarqué ?"
      placeholder="Un papillon orange est passé devant moi à 15h33…"
      multiline
      buildPrompt={(v) =>
        `${profile.prenom} (signe : ${profile.signe}) a remarqué ceci dans son quotidien : "${v}". Donne une interprétation spirituelle de ce signe ou de cette synchronicité.`
      }
    />
  );
}
