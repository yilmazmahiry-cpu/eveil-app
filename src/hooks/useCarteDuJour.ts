import { useCallback, useEffect, useState } from 'react';

import { askIA } from '@/api/ai';
import { SYSTEM_PROMPT_CARTE } from '@/data/prompts';
import { getItem, setItem } from '@/lib/storage';
import { todayISO } from '@/lib/hash';
import { Profile } from '@/types';

type CarteCache = { date: string; text: string };

export function useCarteDuJour(profile: Profile) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const generate = useCallback(
    async (force: boolean) => {
      const today = todayISO();
      if (!force) {
        const cached = await getItem<CarteCache>('carteDuJour');
        if (cached && cached.date === today) {
          setText(cached.text);
          setLoading(false);
          return;
        }
      }
      setLoading(true);
      setError(false);
      const prompt = `Prénom : ${profile.prenom}. Signe astrologique : ${profile.signe}. Chemin de vie : ${profile.cheminVie}. Rédige la carte du jour de cette personne.`;
      try {
        const result = await askIA(prompt, SYSTEM_PROMPT_CARTE);
        setText(result);
        await setItem('carteDuJour', { date: today, text: result });
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

  return { text, loading, error, regenerate: () => generate(true) };
}
