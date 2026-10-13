import { useCallback, useEffect, useState } from 'react';

import { askIA } from '@/api/ai';
import { getDailyCache, setDailyCache } from '@/lib/dailyCache';
import { pickAffirmationThemes } from '@/lib/variety';
import { Profile } from '@/types';

export function useAffirmations(profile: Profile) {
  const [list, setList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const generate = useCallback(
    async (force: boolean) => {
      if (!force) {
        const cached = await getDailyCache<string[]>('affirmations');
        if (cached?.length) {
          setList(cached);
          setLoading(false);
          return;
        }
      }
      setLoading(true);
      setError(false);
      const themes = pickAffirmationThemes(10).join(' ; ');
      const prompt = `Rédige 10 affirmations positives courtes, dans l'esprit de la loi de l'attraction, personnalisées pour ${profile.prenom} (signe : ${profile.signe}). Chaque affirmation est une phrase à la première personne ("je..."), au présent, sur un des thèmes suivants, dans l'ordre, un thème par affirmation : ${themes}. Varie la longueur et la construction des phrases : ne commence pas toutes par "Je suis". Réponds uniquement par la liste, une affirmation par ligne, sans numérotation, sans tirets, sans introduction ni conclusion.`;
      try {
        const text = await askIA(prompt, 'affirmations', { withMemory: false });
        const nextList = text
          .split('\n')
          .map((l) => l.trim().replace(/^[-•\d.)\s]+/, ''))
          .filter((l) => l.length > 0);
        setList(nextList);
        await setDailyCache('affirmations', nextList);
      } catch {
        setError(true);
      }
      setLoading(false);
    },
    [profile]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, setState only after the await inside generate()
    generate(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { list, loading, error, regenerate: () => generate(true) };
}
