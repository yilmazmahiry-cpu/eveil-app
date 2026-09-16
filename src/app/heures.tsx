import { FeatureScreen } from '@/components/FeatureScreen';
import { useProfile } from '@/context/ProfileContext';

export default function HeuresScreen() {
  const { profile } = useProfile();
  if (!profile) return null;
  return (
    <FeatureScreen
      type="heures"
      title="Heures miroir"
      intro="Quelle heure as-tu remarquée ?"
      placeholder="Ex : 11:11"
      buildPrompt={(v) =>
        `${profile.prenom} (signe : ${profile.signe}) vient de remarquer l'heure miroir ${v}. Donne une interprétation symbolique et personnalisée de cette heure miroir.`
      }
    />
  );
}
