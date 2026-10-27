import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { STAGES } from '../data/content';
import { getSavedSession, loadUserProgress, saveUserProgress } from '../services/firebase';

export const levelFromXp = (xp) => Math.floor(xp / 100) + 1;
export const xpForNext = (xp) => levelFromXp(xp) * 100;

export const BADGES = [
  { id: 'streak3', title: 'Beruntun 3x', desc: 'Jawaban beruntun 3 kali', icon: 'star', color: '#FDE0A5', check: (s) => s.streak3 },
  { id: 'stage1', title: 'Stage 1 Tuntas', desc: 'Menyelesaikan Stage 1', icon: 'ribbon', color: '#FCDDF0', check: (s) => !!s.completed[1] },
  { id: 'perfect', title: 'Tanpa Salah', desc: 'Menyelesaikan stage tanpa salah', icon: 'shield-checkmark', color: '#E4DCFC', check: (s) => Object.values(s.completed).some((c) => c.perfect) },
  { id: 'level5', title: 'Level 5', desc: 'Mencapai Level 5', icon: 'rocket', color: '#DCEEFF', check: (s) => levelFromXp(s.xp) >= 5 },
  { id: 'tipe', title: 'Master Tipe Data', desc: 'Skor 80+ di Stage 2', icon: 'cube', color: '#DFF7EA', check: (s) => (s.completed[2] ? s.completed[2].score : 0) >= 80 },
  { id: 'ifelse', title: 'Master If-Else', desc: 'Skor 80+ di Stage 3', icon: 'git-branch', color: '#FFE3E6', check: (s) => (s.completed[3] ? s.completed[3].score : 0) >= 80 },
];

export const getBadges = (state) => BADGES.map((b) => ({ ...b, unlocked: !!b.check(state) }));

export const isUnlocked = (state, stageId) => stageId === 1 || !!state.completed[stageId - 1];

export const getResume = (state) => {
  const stage = STAGES.find((s) => s.id === state.position.stageId) || STAGES[0];
  return { stage, step: state.position.step };
};

export const initialState = {
  user: null,
  hydrated: false,
  hearts: 3,
  xp: 0,
  completed: {}, // { [stageId]: { score, perfect } }
  weak: [], // konsep yang perlu diulang
  history: [],
  streak3: false,
  position: { stageId: 1, step: 'materi' },
};

export function gameReducer(state, a) {
  switch (a.type) {
    case 'HYDRATE':
      return {
        ...initialState,
        ...a.payload,
        user: a.user || null,
        hydrated: true,
      };
    case 'LOGIN':
      return {
        ...initialState,
        ...(a.progress || {}),
        user: a.user,
        hydrated: true,
      };
    case 'LOGOUT':
      return { ...initialState, hydrated: true };
    case 'SET_HEARTS':
      return { ...state, hearts: a.hearts };
    case 'SET_POSITION':
      return { ...state, position: { stageId: a.stageId, step: a.step } };
    case 'GAME_OVER':
      return {
        ...state,
        hearts: 0,
        history: [{ id: String(Date.now()), title: a.title, score: null, xp: 0, over: true, at: Date.now() }, ...state.history],
      };
    case 'COMPLETE': {
      const { stageId, practice, score, xp, hearts, perfect, streak3, wrong, cleared, title } = a;
      const prev = stageId ? state.completed[stageId] : null;
      const completed = stageId
        ? {
            ...state.completed,
            [stageId]: {
              score: Math.max(prev ? prev.score : 0, score),
              perfect: !!((prev && prev.perfect) || perfect),
            },
          }
        : state.completed;
      const weak = Array.from(new Set([...state.weak, ...wrong])).filter((c) => !cleared.includes(c));
      return {
        ...state,
        hearts,
        xp: state.xp + xp,
        completed,
        weak,
        streak3: state.streak3 || streak3,
        position: practice
          ? state.position
          : { stageId: Math.min(stageId + 1, STAGES.length), step: 'materi' },
        history: [{ id: String(Date.now()), title, score, xp, over: false, at: Date.now() }, ...state.history],
      };
    }
    default:
      return state;
  }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Saat aplikasi pertama kali dibuka, pulihkan sesi user & progres dari AsyncStorage/Firestore
  useEffect(() => {
    let mounted = true;
    (async () => {
      const savedUser = await getSavedSession();
      if (savedUser) {
        const savedProgress = await loadUserProgress(savedUser);
        if (mounted) {
          dispatch({ type: 'HYDRATE', user: savedUser, payload: savedProgress || {} });
        }
      } else if (mounted) {
        dispatch({ type: 'HYDRATE', user: null, payload: {} });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Setiap kali progres berubah dan user sedang login, simpan otomatis ke AsyncStorage & Firestore
  useEffect(() => {
    if (!state.hydrated || !state.user) return;
    saveUserProgress(state.user, state);
  }, [
    state.hydrated,
    state.user,
    state.hearts,
    state.xp,
    state.completed,
    state.weak,
    state.history,
    state.streak3,
    state.position,
  ]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export const useGame = () => useContext(GameContext);
