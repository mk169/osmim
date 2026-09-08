import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { AppState, DateISO, DayEntry } from '../types';
import { AREAS, STATE_VERSION, createSeedState } from '../data/seed';
import { purgeDemoData } from './legacy';
import { today } from '../lib/date';

const STORAGE_KEY = 'personal-os-v2';

function emptyDay(date: DateISO): DayEntry {
  return {
    date,
    intention: '',
    mind: '',
    goodMoment: '',
    attention: {
      morningNoFeed: false,
      focusBlock: false,
      movement: false,
      noDoomscroll: false,
      eveningNoFeed: false,
    },
  };
}

/**
 * Sorgt dafür, dass ein gespeicherter Zustand alle Felder besitzt,
 * die eine neuere Version erwartet. Fehlendes wird ergänzt, nichts gelöscht.
 */
export function migrate(raw: unknown): AppState {
  const seed = createSeedState();
  if (!raw || typeof raw !== 'object') return seed;
  const parsed = raw as Partial<AppState>;
  const fromOlderVersion = (parsed.version ?? 0) < STATE_VERSION;

  // Bereiche sind frei anlegbar: gespeicherte Bereiche gelten, fehlende
  // Felder werden aus der Vorlage ergänzt.
  const blank = AREAS[0];
  const areas = Array.isArray(parsed.areas) && parsed.areas.length
    ? parsed.areas.map((a) => ({ ...blank, ...a }))
    : seed.areas;

  const merged: AppState = {
    ...seed,
    ...parsed,
    version: STATE_VERSION,
    areas,
    compass: { ...seed.compass, ...(parsed.compass ?? {}) },
    season: { ...seed.season, ...(parsed.season ?? {}) },
    finances: { ...seed.finances, ...(parsed.finances ?? {}) },
    days: parsed.days ?? seed.days,
    goals: parsed.goals ?? seed.goals,
    projects: parsed.projects ?? seed.projects,
    tasks: parsed.tasks ?? seed.tasks,
    inbox: parsed.inbox ?? seed.inbox,
    habits: parsed.habits ?? seed.habits,
    journal: parsed.journal ?? seed.journal,
    events: parsed.events ?? seed.events,
    contacts: parsed.contacts ?? seed.contacts,
    exams: parsed.exams ?? seed.exams,
    applications: parsed.applications ?? seed.applications,
    weekReviews: parsed.weekReviews ?? [],
    monthReflections: parsed.monthReflections ?? [],
    library: parsed.library ?? seed.library,
    lived: parsed.lived ?? seed.lived,
    weekFocus: parsed.weekFocus ?? {},
    focusList: parsed.focusList ?? [],
  };

  // Beispieldaten der ersten Fassung einmalig entfernen.
  return fromOlderVersion ? purgeDemoData(merged) : merged;
}

function load(): AppState {
  if (typeof window === 'undefined') return createSeedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedState();
    return migrate(JSON.parse(raw));
  } catch {
    return createSeedState();
  }
}

interface StoreValue {
  state: AppState;
  update: (fn: (draft: AppState) => AppState) => void;
  /** Tageseintrag, immer vorhanden. */
  day: (date: DateISO) => DayEntry;
  patchDay: (date: DateISO, patch: Partial<DayEntry>) => void;
  exportJSON: () => void;
  importJSON: (file: File) => Promise<void>;
  reset: () => void;
  toggleTheme: () => void;
  lastSaved: Date | null;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        setLastSaved(new Date());
      } catch {
        /* Speicher voll oder gesperrt — die App bleibt trotzdem benutzbar. */
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  const update = useCallback((fn: (draft: AppState) => AppState) => {
    setState((prev) => fn(prev));
  }, []);

  const day = useCallback(
    (date: DateISO) => state.days[date] ?? emptyDay(date),
    [state.days],
  );

  const patchDay = useCallback((date: DateISO, patch: Partial<DayEntry>) => {
    setState((prev) => {
      const base = prev.days[date] ?? emptyDay(date);
      return {
        ...prev,
        days: { ...prev.days, [date]: { ...base, ...patch } },
      };
    });
  }, []);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personal-os-backup-${today()}.json`;
    // Der Anker muss im Dokument hängen, sonst löst Chromium den Download nicht aus;
    // die URL wird erst danach freigegeben, damit der Download nicht abbricht.
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    window.setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }, [state]);

  const importJSON = useCallback(async (file: File) => {
    const text = await file.text();
    const parsed = JSON.parse(text);
    setState(migrate(parsed));
  }, []);

  const reset = useCallback(() => {
    setState(createSeedState());
  }, []);

  const toggleTheme = useCallback(() => {
    setState((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      state,
      update,
      day,
      patchDay,
      exportJSON,
      importJSON,
      reset,
      toggleTheme,
      lastSaved,
    }),
    [state, update, day, patchDay, exportJSON, importJSON, reset, toggleTheme, lastSaved],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore muss innerhalb von StoreProvider stehen.');
  return ctx;
}
