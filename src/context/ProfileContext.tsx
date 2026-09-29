import { Session } from '@supabase/supabase-js';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

import { todayISO } from '@/lib/hash';
import { profileToRow, rowToProfile } from '@/lib/profileMapper';
import {
  configurePurchases,
  getCurrentOffering,
  isPremiumFromInfo,
  loginPurchases,
  logoutPurchases,
  onCustomerInfoUpdate,
  purchasePackage as purchasePackageSdk,
  restorePurchases as restorePurchasesSdk,
} from '@/lib/purchases';
import { supabase } from '@/lib/supabase';
import { GratitudeEntry, JournalEntry, JournalType, Profile, Streak } from '@/types';

type ProfileContextValue = {
  loading: boolean;
  session: Session | null;
  profile: Profile | null;
  journal: JournalEntry[];
  streak: Streak;
  saveProfile: (profile: Profile) => Promise<void>;
  savePushToken: (token: string) => Promise<void>;
  deleteProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  addJournalEntry: (type: JournalType, input: string, result: string) => Promise<JournalEntry>;
  toggleFavorite: (id: string) => Promise<void>;
  toggleRealized: (id: string) => Promise<void>;
  setFeedback: (id: string, feedback: 'up' | 'down') => Promise<void>;
  getCurrentIntention: () => JournalEntry | null;
  isPremium: boolean;
  offering: PurchasesOffering | null;
  purchasePackage: (pkg: PurchasesPackage) => Promise<void>;
  restorePurchases: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

function rowToEntry(row: any): JournalEntry {
  return {
    id: row.id,
    type: row.type,
    input: row.input,
    result: row.result,
    date: row.date,
    fav: row.fav,
    feedback: row.feedback,
    realized: row.realized,
  };
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [streak, setStreak] = useState<Streak>({ count: 0, lastDate: null });
  const [isPremium, setIsPremium] = useState(false);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);

  // RevenueCat: configure once, then listen for entitlement changes.
  useEffect(() => {
    configurePurchases();
    getCurrentOffering().then(setOffering);
    return onCustomerInfoUpdate((info) => setIsPremium(isPremiumFromInfo(info)));
  }, []);

  // Session bootstrap + subscription.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) {
        setProfile(null);
        setJournal([]);
        setStreak({ count: 0, lastDate: null });
        setLoading(false);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Tie RevenueCat's user identity to the Supabase session so purchases follow the account.
  useEffect(() => {
    if (session) {
      loginPurchases(session.user.id).then((info) => {
        if (info) setIsPremium(isPremiumFromInfo(info));
      });
    } else {
      logoutPurchases();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no session means logged out, nothing to await before resetting
      setIsPremium(false);
    }
  }, [session]);

  // Profile + journal load whenever the authenticated user changes.
  useEffect(() => {
    if (!session) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- switching users must show a loading state immediately, not after the fetch resolves
    setLoading(true);
    (async () => {
      const uid = session.user.id;
      const [{ data: profileRow }, { data: journalRows }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', uid).maybeSingle(),
        supabase.from('journal_entries').select('*').eq('user_id', uid).order('date', { ascending: false }).limit(20),
      ]);
      setProfile(profileRow ? rowToProfile(profileRow) : null);
      setJournal((journalRows ?? []).map(rowToEntry));
      setLoading(false);
    })();
  }, [session]);

  // Streak bump, once a profile exists for the session.
  useEffect(() => {
    if (!session || !profile) return;
    (async () => {
      const uid = session.user.id;
      const today = todayISO();
      const { data: streakRow } = await supabase.from('streaks').select('*').eq('user_id', uid).maybeSingle();
      let current: Streak = streakRow ? { count: streakRow.count, lastDate: streakRow.last_date } : { count: 0, lastDate: null };
      if (current.lastDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        current = { count: current.lastDate === yesterday ? (current.count || 0) + 1 : 1, lastDate: today };
        await supabase.from('streaks').upsert({ user_id: uid, count: current.count, last_date: current.lastDate });
      }
      setStreak(current);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- profile?.prenom on purpose: triggers once the profile loads, not on every field edit/save
  }, [session, profile?.prenom]);

  const saveProfile = useCallback(
    async (next: Profile) => {
      if (!session) return;
      const uid = session.user.id;
      await supabase.from('profiles').upsert({ id: uid, ...profileToRow(next) });
      setProfile(next);
    },
    [session]
  );

  const savePushToken = useCallback(
    async (token: string) => {
      if (!session) return;
      await supabase.from('profiles').update({ push_token: token }).eq('id', session.user.id);
    },
    [session]
  );

  const deleteProfile = useCallback(async () => {
    if (!session) return;
    const { error } = await supabase.functions.invoke('delete-account');
    if (error) throw error;
    setProfile(null);
    setJournal([]);
    setStreak({ count: 0, lastDate: null });
    await supabase.auth.signOut();
  }, [session]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const addJournalEntry = useCallback(
    async (type: JournalType, input: string, result: string) => {
      if (!session) throw new Error('No session');
      const uid = session.user.id;
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({ user_id: uid, type, input, result })
        .select('*')
        .single();
      if (error || !data) throw error ?? new Error('Insert failed');
      const entry = rowToEntry(data);
      setJournal((prev) => [entry, ...prev].slice(0, 20));
      return entry;
    },
    [session]
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const entry = journal.find((e) => e.id === id);
      if (!entry) return;
      const fav = !entry.fav;
      setJournal((prev) => prev.map((e) => (e.id === id ? { ...e, fav } : e)));
      await supabase.from('journal_entries').update({ fav }).eq('id', id);
    },
    [journal]
  );

  const toggleRealized = useCallback(
    async (id: string) => {
      const entry = journal.find((e) => e.id === id);
      if (!entry) return;
      const realized = !entry.realized;
      setJournal((prev) => prev.map((e) => (e.id === id ? { ...e, realized } : e)));
      await supabase.from('journal_entries').update({ realized }).eq('id', id);
    },
    [journal]
  );

  const setFeedback = useCallback(async (id: string, feedback: 'up' | 'down') => {
    setJournal((prev) => prev.map((e) => (e.id === id ? { ...e, feedback } : e)));
    await supabase.from('journal_entries').update({ feedback }).eq('id', id);
  }, []);

  const getCurrentIntention = useCallback(
    () => journal.find((e) => e.type === 'manifestation') || null,
    [journal]
  );

  const purchasePackage = useCallback(async (pkg: PurchasesPackage) => {
    const info = await purchasePackageSdk(pkg);
    setIsPremium(isPremiumFromInfo(info));
  }, []);

  const restorePurchases = useCallback(async () => {
    const info = await restorePurchasesSdk();
    setIsPremium(isPremiumFromInfo(info));
  }, []);

  const value = useMemo(
    () => ({
      loading,
      session,
      profile,
      journal,
      streak,
      saveProfile,
      savePushToken,
      deleteProfile,
      signOut,
      addJournalEntry,
      toggleFavorite,
      toggleRealized,
      setFeedback,
      getCurrentIntention,
      isPremium,
      offering,
      purchasePackage,
      restorePurchases,
    }),
    [
      loading,
      session,
      profile,
      journal,
      streak,
      saveProfile,
      savePushToken,
      deleteProfile,
      signOut,
      addJournalEntry,
      toggleFavorite,
      toggleRealized,
      setFeedback,
      getCurrentIntention,
      isPremium,
      offering,
      purchasePackage,
      restorePurchases,
    ]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider');
  return ctx;
}

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

function rowToGratitude(row: any): GratitudeEntry {
  return { date: row.date, items: [row.item1, row.item2, row.item3] };
}

export async function loadGratitudeForDate(date: string): Promise<GratitudeEntry | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const { data } = await supabase.from('gratitude_entries').select('*').eq('user_id', uid).eq('date', date).maybeSingle();
  return data ? rowToGratitude(data) : null;
}

export async function loadGratitudeHistory(excludeDate: string): Promise<GratitudeEntry[]> {
  const uid = await currentUserId();
  if (!uid) return [];
  const { data } = await supabase
    .from('gratitude_entries')
    .select('*')
    .eq('user_id', uid)
    .neq('date', excludeDate)
    .order('date', { ascending: false })
    .limit(30);
  return (data ?? []).map(rowToGratitude);
}

export async function saveGratitudeForToday(items: [string, string, string]): Promise<void> {
  const uid = await currentUserId();
  if (!uid) return;
  const today = todayISO();
  await supabase
    .from('gratitude_entries')
    .upsert({ user_id: uid, date: today, item1: items[0], item2: items[1], item3: items[2] }, { onConflict: 'user_id,date' });
}
