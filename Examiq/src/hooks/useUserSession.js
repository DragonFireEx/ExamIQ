// hooks/useUserSession.js
// Zarządzanie sesją użytkownika: ciasteczka (sesja) + localStorage (dane długoterminowe)
//
// CIASTECZKA (session cookie, wygasa po 30 dniach):
//   examiq_session  →  { name, lastActive, streak, streakLastDate }
//
// LOCALSTORAGE:
//   examiq_history      →  [ { date, score, total, duration, category } ]
//   examiq_category_progress  →  { [categoryName]: { attempts, correct, total } }

import { useState, useEffect, useCallback } from 'react';

// ─── cookie helpers ───────────────────────────────────────────────────────────

const COOKIE_NAME = 'examiq_session';
const COOKIE_DAYS = 30;

function setCookie(name, value, days) {
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

function getCookie(name) {
  const match = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split('=').slice(1).join('=')));
  } catch {
    return null;
  }
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

const LS_HISTORY = 'examiq_history';
const LS_CATEGORY = 'examiq_category_progress';

function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
}

// ─── streak logic ─────────────────────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function calcStreak(currentStreak, streakLastDate) {
  const today = todayISO();
  if (!streakLastDate) return { streak: 1, streakLastDate: today };

  const last = new Date(streakLastDate);
  const now = new Date(today);
  const diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { streak: currentStreak, streakLastDate };        // ten sam dzień
  if (diffDays === 1) return { streak: currentStreak + 1, streakLastDate: today }; // następny dzień
  return { streak: 1, streakLastDate: today };                                   // przerwa → reset
}

// ─── default session ──────────────────────────────────────────────────────────

function defaultSession() {
  return {
    name: '',           // pusty — użytkownik jeszcze nie ustawił nicku
    isNew: true,        // flaga: pokaż ekran powitalny
    lastActive: todayISO(),
    streak: 0,
    streakLastDate: null,
  };
}

// ─── hook ─────────────────────────────────────────────────────────────────────

export function useUserSession() {
  const [session, setSessionState] = useState(() => getCookie(COOKIE_NAME) || defaultSession());
  const [history, setHistory] = useState(() => lsGet(LS_HISTORY, []));
  const [categoryProgress, setCategoryProgress] = useState(() => lsGet(LS_CATEGORY, {}));

  // Przy montowaniu: refresh streak jeśli minął dzień
  useEffect(() => {
    const existing = getCookie(COOKIE_NAME);
    if (existing) {
      const { streak, streakLastDate } = calcStreak(existing.streak, existing.streakLastDate);
      const updated = { ...existing, lastActive: todayISO(), streak, streakLastDate };
      setCookie(COOKIE_NAME, updated, COOKIE_DAYS);
      setSessionState(updated);
    } else {
      const fresh = defaultSession();
      setCookie(COOKIE_NAME, fresh, COOKIE_DAYS);
      setSessionState(fresh);
    }
  }, []);

  // Zapis sesji do ciasteczka przy każdej zmianie
  const updateSession = useCallback((patch) => {
    setSessionState(prev => {
      const updated = { ...prev, ...patch };
      setCookie(COOKIE_NAME, updated, COOKIE_DAYS);
      return updated;
    });
  }, []);

  // Zmiana nazwy użytkownika (pierwsze ustawienie czyści flagę isNew i startuje streak)
  const setName = useCallback((name) => {
    const trimmed = name.trim() || 'Użytkownik';
    const isFirstTime = session.isNew;
    updateSession({
      name: trimmed,
      isNew: false,
      ...(isFirstTime ? { streak: 1, streakLastDate: todayISO() } : {}),
    });
  }, [session, updateSession]);

  // Zapisz wynik egzaminu + zaktualizuj streak + postęp per kategoria
  const saveExamResult = useCallback(({ score, total, duration, category = 'all', questions = [] }) => {
    // 1. Historia
    const newEntry = {
      date: todayISO(),
      score,
      total,
      duration,
      category,
    };
    const updatedHistory = [...lsGet(LS_HISTORY, []), newEntry];
    lsSet(LS_HISTORY, updatedHistory);
    setHistory(updatedHistory);

    // 2. Postęp per kategoria (z puli pytań)
    const catMap = lsGet(LS_CATEGORY, {});
    questions.forEach(({ categoryName, wasCorrect }) => {
      if (!catMap[categoryName]) catMap[categoryName] = { attempts: 0, correct: 0 };
      catMap[categoryName].attempts += 1;
      if (wasCorrect) catMap[categoryName].correct += 1;
    });
    // fallback: jeśli nie przekazano questions, zapisz tylko total/score dla kategorii
    if (questions.length === 0 && category !== 'all') {
      if (!catMap[category]) catMap[category] = { attempts: 0, correct: 0 };
      catMap[category].attempts += total;
      catMap[category].correct += score;
    }
    lsSet(LS_CATEGORY, catMap);
    setCategoryProgress({ ...catMap });

    // 3. Streak (jeden raz dziennie)
    const { streak, streakLastDate } = calcStreak(session.streak, session.streakLastDate);
    updateSession({ streak, streakLastDate, lastActive: todayISO() });
  }, [session, updateSession]);

  // Reset wszystkich danych
  const resetAll = useCallback(() => {
    deleteCookie(COOKIE_NAME);
    localStorage.removeItem(LS_HISTORY);
    localStorage.removeItem(LS_CATEGORY);
    const fresh = defaultSession();
    setCookie(COOKIE_NAME, fresh, COOKIE_DAYS);
    setSessionState(fresh);
    setHistory([]);
    setCategoryProgress({});
  }, []);

  // Computed stats
  const stats = (() => {
    if (!history.length) return { total: 0, best: 0, avg: 0, passRate: 0 };
    const total = history.length;
    const scores = history.map(s => Math.round((s.score / s.total) * 100));
    const best = Math.max(...scores);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const passed = history.filter(s => (s.score / s.total) >= 0.75).length;
    const passRate = Math.round((passed / total) * 100);
    return { total, best, avg, passRate };
  })();

  return {
    session,       // { name, lastActive, streak, streakLastDate }
    history,       // [ { date, score, total, duration, category } ]
    categoryProgress, // { [cat]: { attempts, correct } }
    stats,         // { total, best, avg, passRate }
    setName,
    saveExamResult,
    resetAll,
  };
}