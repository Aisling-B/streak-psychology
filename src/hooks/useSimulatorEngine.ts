import { useState, useCallback } from "react";

export type SnapQuality = "blank" | "photo" | "personal" | "rest";
export type NotificationChoice = "ignore" | "attend";
export type NotificationType = "homework" | "family" | "friend-irl" | "sleep-warning" | "anxiety";

export interface GameNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  emoji: string;
  tokenCost: number;
}

export interface DayResult {
  day: number;
  snapQuality: SnapQuality;
  tokensSpent: { streak: number; sleep: number; social: number };
  tokensRemaining: number;
  relationshipDelta: number;
  notification?: GameNotification;
  notificationChoice?: NotificationChoice;
}

export interface SimulatorState {
  phase: "intro" | "playing" | "choosing" | "notification" | "summary" | "dayStart";
  currentDay: number;
  totalDays: number;
  streak: number;
  tokens: number;
  maxTokens: number;
  simulatedTime: string;
  sleepDebt: number;
  socialHealth: number;
  relationshipMeter: number;
  history: DayResult[];
  currentNotification: GameNotification | null;
  streakBroken: boolean;
  pendingSnapChoice: SnapQuality | null;
}

const TOTAL_DAYS = 7;
const TOKENS_PER_DAY = 6;

const SNAP_COSTS: Record<SnapQuality, number> = {
  blank: 1, photo: 2, personal: 3, rest: 0,
};

const SNAP_RELATIONSHIP: Record<SnapQuality, number> = {
  blank: -5, photo: 5, personal: 15, rest: 0,
};

const NOTIFICATIONS: GameNotification[] = [
  { id: "hw1", type: "homework", title: "📚 Math Assignment", body: "Math homework is due tomorrow.", emoji: "📚", tokenCost: 2 },
  { id: "sleep1", type: "sleep-warning", title: "😴 Past Midnight", body: "15-24% of teen activity happens now.", emoji: "😴", tokenCost: 0 },
  { id: "anx1", type: "anxiety", title: "😰 Streak Anxiety", body: "Did they reply? It's been 47 mins.", emoji: "😰", tokenCost: 1 }
];

export function useSimulatorEngine() {
  const [state, setState] = useState<SimulatorState>({
    phase: "intro",
    currentDay: 1,
    totalDays: TOTAL_DAYS,
    streak: 120,
    tokens: TOKENS_PER_DAY,
    maxTokens: TOKENS_PER_DAY,
    simulatedTime: "8:30 PM",
    sleepDebt: 0,
    socialHealth: 70,
    relationshipMeter: 50,
    history: [],
    currentNotification: null,
    streakBroken: false,
    pendingSnapChoice: null,
  });

  const calculateTime = (tokensLeft: number) => {
    if (tokensLeft >= 5) return "8:45 PM";
    if (tokensLeft >= 3) return "10:15 PM";
    if (tokensLeft >= 1) return "11:30 PM";
    return "12:45 AM";
  };

  const startGame = useCallback(() => {
    setState(s => ({ ...s, phase: "choosing" }));
  }, []);

  const skipStreak = useCallback(() => {
    setState((s) => {
      const isOver = s.currentDay + 1 > s.totalDays;
      return {
        ...s,
        phase: isOver ? "summary" : "dayStart",
        currentDay: isOver ? s.currentDay : s.currentDay + 1,
        streak: 0,
        streakBroken: true,
        tokens: TOKENS_PER_DAY,
        simulatedTime: "8:30 PM",
        history: [...s.history, { 
          day: s.currentDay, 
          snapQuality: "rest", 
          tokensSpent: { streak: 0, sleep: 0, social: 0 }, 
          tokensRemaining: s.tokens, 
          relationshipDelta: -10 
        }],
      };
    });
  }, []);

  const chooseSnap = useCallback((quality: SnapQuality) => {
    if (quality === "rest") {
      skipStreak();
      return;
    }

    const cost = SNAP_COSTS[quality];
    setState((s) => {
      if (s.tokens < cost) return s;
      const relDelta = SNAP_RELATIONSHIP[quality];
      const tokensLeft = s.tokens - cost;

      return {
        ...s,
        tokens: tokensLeft,
        simulatedTime: calculateTime(tokensLeft),
        streak: s.streak + 1,
        relationshipMeter: Math.max(0, Math.min(100, s.relationshipMeter + relDelta)),
        history: [...s.history, {
          day: s.currentDay,
          snapQuality: quality,
          tokensSpent: { streak: cost, sleep: 0, social: 0 },
          tokensRemaining: tokensLeft,
          relationshipDelta: relDelta,
        }],
        streakBroken: false,
      };
    });
  }, [skipStreak]);

  const handleNotification = useCallback((choice: NotificationChoice) => {
    setState(s => ({ 
      ...s, 
      phase: "choosing", 
      currentNotification: null, 
      pendingSnapChoice: null 
    }));
  }, []);

  const resetGame = useCallback(() => {
    window.location.reload();
  }, []);

  return { state, startGame, chooseSnap, handleNotification, skipStreak, resetGame };
}
