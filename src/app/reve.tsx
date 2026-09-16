import { FeatureScreen } from '@/components/FeatureScreen';
import { useProfile } from '@/context/ProfileContext';

export default function ReveScreen() {
  const { profile } = useProfile();
  if (!profile) return null;
  return (
    <FeatureScreen
      type="reve"
      title="Interpréter un rêve"
      intro="Décris ton rêve, avec ce dont tu te souviens."
      placeholder="J'étais dans une maison que je ne connaissais pas…"
      multiline
      buildPrompt={(v) =>
        `${profile.prenom} (signe : ${profile.signe}) a fait le rêve suivant : "${v}". Propose une interprétation symbolique de ce rêve.`
      }
    />
  );
}
