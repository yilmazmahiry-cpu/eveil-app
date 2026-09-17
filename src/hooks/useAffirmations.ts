import { useCallback, useEffect, useState } from 'react';

import { askIA } from '@/api/ai';
import { SYSTEM_PROMPT_AFFIRMATIONS } from '@/data/prompts';
import { getDailyCache, setDailyCache } from '@/lib/dailyCache';
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
      const prompt = `Rédige 10 affirmations positives courtes et variées, dans l'esprit de la loi de l'attraction, personnalisées pour ${profile.prenom} (signe : ${profile.signe}). Chaque affirmation est une phrase à la première personne ("je..."), au présent, sur des thèmes différents (confiance en soi, abondance, amour, sérénité, réussite...). Réponds uniquement par la liste, une affirmation par ligne, sans numérotation, sans tirets, sans introduction ni conclusion.`;
      try {
        const text = await askIA(prompt, SYSTEM_PROMPT_AFFIRMATIONS);
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
