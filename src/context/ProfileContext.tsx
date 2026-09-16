import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { makeId, todayISO } from '@/lib/hash';
import { getItem, removeItem, setItem } from '@/lib/storage';
import { GratitudeEntry, JournalEntry, JournalType, Profile, Streak } from '@/types';

type ProfileContextValue = {
  loading: boolean;
  profile: Profile | null;
  journal: JournalEntry[];
  streak: Streak;
  saveProfile: (profile: Profile) => Promise<void>;
  deleteProfile: () => Promise<void>;
  addJournalEntry: (type: JournalType, input: string, result: string) => Promise<JournalEntry>;
  toggleFavorite: (id: string) => Promise<void>;
  toggleRealized: (id: string) => Promise<void>;
  setFeedback: (id: string, feedback: 'up' | 'down') => Promise<void>;
  getCurrentIntention: () => JournalEntry | null;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [streak, setStreak] = useState<Streak>({ count: 0, lastDate: null });

  useEffect(() => {
    (async () => {
      const [p, j] = await Promise.all([
        getItem<Profile>('profile'),
        getItem<JournalEntry[]>('journal'),
      ]);
      if (p) setProfile(p);
      if (j) setJournal(j);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const today = todayISO();
      let current = (await getItem<Streak>('streak')) || { count: 0, lastDate: null };
      if (current.lastDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        current = {
          count: current.lastDate === yesterday ? (current.count || 0) + 1 : 1,
          lastDate: today,
        };
        await setItem('streak', current);
      }
      setStreak(current);
    })();
  }, [profile]);

  const saveProfile = useCallback(async (next: Profile) => {
    setProfile(next);
    await setItem('profile', next);
  }, []);

  const deleteProfile = useCallback(async () => {
    await Promise.all([
      removeItem('profile'),
      removeItem('journal'),
      removeItem('carteDuJour'),
      removeItem('streak'),
      removeItem('gratitude'),
      removeItem('affirmationsDuJour'),
    ]);
    setProfile(null);
    setJournal([]);
    setStreak({ count: 0, lastDate: null });
  }, []);

  const addJournalEntry = useCallback(
    async (type: JournalType, input: string, result: string) => {
      const entry: JournalEntry = {
        id: makeId(),
        type,
        input,
        result,
        date: new Date().toISOString(),
        fav: false,
        feedback: null,
        realized: false,
      };
      const next = [entry, ...journal].slice(0, 20);
      setJournal(next);
      await setItem('journal', next);
      return entry;
    },
    [journal]
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const next = journal.map((e) => (e.id === id ? { ...e, fav: !e.fav } : e));
      setJournal(next);
      await setItem('journal', next);
    },
    [journal]
  );

  const toggleRealized = useCallback(
    async (id: string) => {
      const next = journal.map((e) => (e.id === id ? { ...e, realized: !e.realized } : e));
      setJournal(next);
      await setItem('journal', next);
    },
    [journal]
  );

  const setFeedback = useCallback(
    async (id: string, feedback: 'up' | 'down') => {
      const next = journal.map((e) => (e.id === id ? { ...e, feedback } : e));
      setJournal(next);
      await setItem('journal', next);
    },
    [journal]
  );

  const getCurrentIntention = useCallback(
    () => journal.find((e) => e.type === 'manifestation') || null,
    [journal]
  );

  const value = useMemo(
    () => ({
      loading,
      profile,
      journal,
      streak,
      saveProfile,
      deleteProfile,
      addJournalEntry,
      toggleFavorite,
      toggleRealized,
      setFeedback,
      getCurrentIntention,
    }),
    [loading, profile, journal, streak, saveProfile, deleteProfile, addJournalEntry, toggleFavorite, toggleRealized, setFeedback, getCurrentIntention]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider');
  return ctx;
}

export async function loadGratitudeForDate(date: string): Promise<GratitudeEntry | null> {
  const log = (await getItem<GratitudeEntry[]>('gratitude')) || [];
  return log.find((e) => e.date === date) || null;
}

export async function saveGratitudeForToday(items: [string, string, string]): Promise<void> {
  const today = todayISO();
  let log = (await getItem<GratitudeEntry[]>('gratitude')) || [];
  const idx = log.findIndex((e) => e.date === today);
  const entry: GratitudeEntry = { date: today, items };
  if (idx >= 0) log[idx] = entry;
  else log = [entry, ...log];
  log = log.slice(0, 30);
  await setItem('gratitude', log);
}
