import { useState, useCallback } from "react";

export type SnapQuality = "blank" | "photo" | "personal" | "rest";
export type NotificationChoice = "ignore" | "attend";

export interface SimulatorState {
  phase: "intro" | "playing" | "choosing" | "notification" | "summary" | "dayStart";
  currentDay: number;
  totalDays: number;
  streak: number;
  tokens: number;
  maxTokens: number;
  simulatedTime: string;
  relationshipMeter: number;
  sleepDebt: number;
  socialHealth: number;
  streakBroken: boolean;
  history: any[];
}

const TOKENS_PER_DAY = 6;
const TOTAL_DAYS = 7;

export function useSimulatorEngine() {
  const [state, setState] = useState<SimulatorState>({
    phase: "intro",
    currentDay: 1,
    totalDays: TOTAL_DAYS,
    streak: 121,
    tokens: TOKENS_PER_DAY,
    maxTokens: TOKENS_PER_DAY,
    simulatedTime: "8:30 PM",
    relationshipMeter: 50,
    sleepDebt: 0,
    socialHealth: 70,
    streakBroken: false,
    history: []
  });

  const calculateTime = (tokensLeft: number) => {
    if (tokensLeft >= 5) return "9:15 PM";
    if (tokensLeft >= 3) return "10:45 PM";
    if (tokensLeft >= 1) return "11:55 PM";
    return "12:30 AM";
  };

  const startGame = useCallback(() => {
    setState(s => ({ ...s, phase: "choosing" }));
  }, []);

  const skipStreak = useCallback(() => {
    setState((s) => {
      const isOver = s.currentDay >= s.totalDays;
      return {
        ...s,
        phase: isOver ? "summary" : "dayStart",
        currentDay: isOver ? s.currentDay : s.currentDay + 1,
        streak: 0,
        streakBroken: true,
        tokens: TOKENS_PER_DAY,
        simulatedTime: "8:30 PM",
        history: [...s.history, { day: s.currentDay, type: 'rest' }]
      };
    });
  }, []);

  const chooseSnap = useCallback((quality: SnapQuality) => {
    if (quality === "rest") { skipStreak(); return; }
    const cost = { blank: 1, photo: 2, personal: 3, rest: 0 }[quality];
    
    setState((s) => {
      if (s.tokens < cost) return s;
      const tokensLeft = s.tokens - cost;
      return {
        ...s,
        tokens: tokensLeft,
        simulatedTime: calculateTime(tokensLeft),
        streak: s.streak + 1,
        relationshipMeter: Math.min(100, s.relationshipMeter + (quality === 'personal' ? 10 : 2)),
        history: [...s.history, { day: s.currentDay, quality }]
      };
    });
  }, [skipStreak]);

  return { state, startGame, chooseSnap, skipStreak, resetGame: () => window.location.reload() };
}
