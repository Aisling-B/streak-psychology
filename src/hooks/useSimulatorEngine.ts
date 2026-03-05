import { useState, useCallback } from "react";

export type SnapQuality = "blank" | "photo" | "personal";
export type NotificationType = "homework" | "family" | "friend-irl" | "sleep-warning" | "anxiety";

export interface DayResult {
  day: number;
  snapQuality: SnapQuality;
  tokensSpent: { streak: number; sleep: number; social: number };
  tokensRemaining: number;
  relationshipDelta: number;
  notification?: GameNotification;
  notificationChoice?: "ignore" | "attend";
}

export interface GameNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  emoji: string;
  tokenCost: number; // cost to attend to it
}

export interface SimulatorState {
  phase: "intro" | "playing" | "choosing" | "notification" | "summary";
  currentDay: number;
  totalDays: number;
  streak: number;
  tokens: number;
  maxTokens: number;
  sleepDebt: number;
  socialHealth: number;
  relationshipMeter: number;
  history: DayResult[];
  currentNotification: GameNotification | null;
  streakBroken: boolean;
  pendingSnapChoice: SnapQuality | null;
}

const TOTAL_DAYS = 10;
const TOKENS_PER_DAY = 6;

const SNAP_COSTS: Record<SnapQuality, number> = {
  blank: 1,
  photo: 2,
  personal: 3,
};

const SNAP_RELATIONSHIP: Record<SnapQuality, number> = {
  blank: -5,
  photo: 5,
  personal: 15,
};

const NOTIFICATIONS: GameNotification[] = [
  {
    id: "hw1",
    type: "homework",
    title: "📚 Math Assignment Due",
    body: "Your math homework is due tomorrow. You haven't started yet.",
    emoji: "📚",
    tokenCost: 2,
  },
  {
    id: "fam1",
    type: "family",
    title: "🍽️ Family Dinner",
    body: "Mom's calling you down for dinner. Everyone's waiting.",
    emoji: "🍽️",
    tokenCost: 2,
  },
  {
    id: "irl1",
    type: "friend-irl",
    title: "🏀 Friends at the Park",
    body: "Your friends are playing basketball. They asked if you're coming.",
    emoji: "🏀",
    tokenCost: 3,
  },
  {
    id: "sleep1",
    type: "sleep-warning",
    title: "😴 It's Past Midnight",
    body: "You have school in 6 hours. Your eyes feel heavy.",
    emoji: "😴",
    tokenCost: 0,
  },
  {
    id: "anx1",
    type: "anxiety",
    title: "😰 Streak Anxiety",
    body: "You keep checking if your friend replied. It's been 47 minutes.",
    emoji: "😰",
    tokenCost: 1,
  },
  {
    id: "hw2",
    type: "homework",
    title: "📖 Book Report",
    body: "You're 3 chapters behind on your reading assignment.",
    emoji: "📖",
    tokenCost: 2,
  },
  {
    id: "fam2",
    type: "family",
    title: "👨‍👩‍👧 Sister's Recital",
    body: "Your sister's school performance is tonight. She really wants you there.",
    emoji: "🎭",
    tokenCost: 3,
  },
  {
    id: "irl2",
    type: "friend-irl",
    title: "🎮 Gaming Night",
    body: "Your best friend is hosting a game night IRL. 'You coming or nah?'",
    emoji: "🎮",
    tokenCost: 2,
  },
];

function getNotificationForDay(day: number, usedIds: Set<string>): GameNotification | null {
  // Notifications trigger on days 2, 4, 5, 7, 8, 9
  const triggerDays = [2, 4, 5, 7, 8, 9];
  if (!triggerDays.includes(day)) return null;

  const available = NOTIFICATIONS.filter((n) => !usedIds.has(n.id));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

export function useSimulatorEngine() {
  const [state, setState] = useState<SimulatorState>({
    phase: "intro",
    currentDay: 1,
    totalDays: TOTAL_DAYS,
    streak: 0,
    tokens: TOKENS_PER_DAY,
    maxTokens: TOKENS_PER_DAY,
    sleepDebt: 0,
    socialHealth: 70,
    relationshipMeter: 50,
    history: [],
    currentNotification: null,
    streakBroken: false,
    pendingSnapChoice: null,
  });

  const startGame = useCallback(() => {
    setState((s) => ({ ...s, phase: "choosing" }));
  }, []);

const chooseSnap = useCallback((quality: SnapQuality) => {
  const cost = SNAP_COSTS[quality];
  
  setState((s) => {
    // 1. Check if user has enough tokens to even make this choice
    if (s.tokens < cost) return s;

    const usedIds = new Set(s.history.map((h) => h.notification?.id).filter(Boolean) as string[]);
    const notification = getNotificationForDay(s.currentDay, usedIds);

    // 2. If a notification pops up (simulating 9pm-5am pressure), we pause [cite: 3895]
    if (notification) {
      return {
        ...s,
        pendingSnapChoice: quality,
        currentNotification: notification,
        phase: "notification",
        // Do NOT subtract tokens here yet, as the user hasn't "confirmed" through the notification
      };
    }

    // 3. If no notification, subtract tokens and update streak immediately
    return {
      ...applySnapChoice(s, quality, null, undefined),
      tokens: s.tokens - cost, // THIS IS THE CRITICAL LINE
      hasActioned: true
    };
  });
}, []);

const handleNotification = (choice: NotificationChoice) => {
  setState(s => {
    const cost = s.pendingSnapChoice ? SNAP_COSTS[s.pendingSnapChoice] : 0;
    return {
      ...applySnapChoice(s, s.pendingSnapChoice!, s.currentNotification, choice),
      tokens: s.tokens - cost, // Ensure cost is deducted after the notification is resolved
      currentNotification: null,
      pendingSnapChoice: null,
      phase: "choosing"
    };
  });
};

  const skipStreak = useCallback(() => {
    setState((s) => {
      const result: DayResult = {
        day: s.currentDay,
        snapQuality: "blank",
        tokensSpent: { streak: 0, sleep: 0, social: 0 },
        tokensRemaining: s.tokens,
        relationshipDelta: -10,
        notification: undefined,
      };

      const newDay = s.currentDay + 1;
      const isOver = newDay > s.totalDays;

      return {
        ...s,
        phase: isOver ? "summary" : "choosing",
        currentDay: isOver ? s.currentDay : newDay,
        streak: 0,
        streakBroken: true,
        tokens: isOver ? s.tokens : TOKENS_PER_DAY,
        relationshipMeter: Math.max(0, s.relationshipMeter - 10),
        socialHealth: Math.min(100, s.socialHealth + 10),
        sleepDebt: Math.max(0, s.sleepDebt - 1),
        history: [...s.history, result],
        currentNotification: null,
        pendingSnapChoice: null,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState({
      phase: "intro",
      currentDay: 1,
      totalDays: TOTAL_DAYS,
      streak: 0,
      tokens: TOKENS_PER_DAY,
      maxTokens: TOKENS_PER_DAY,
      sleepDebt: 0,
      socialHealth: 70,
      relationshipMeter: 50,
      history: [],
      currentNotification: null,
      streakBroken: false,
      pendingSnapChoice: null,
    });
  }, []);

  return { state, startGame, chooseSnap, handleNotification, skipStreak, resetGame };
}

function applySnapChoice(
  s: SimulatorState,
  quality: SnapQuality,
  notification: GameNotification | null,
  notificationChoice?: "ignore" | "attend"
): SimulatorState {
  const snapCost = SNAP_COSTS[quality];
  const relDelta = SNAP_RELATIONSHIP[quality];
  let tokensLeft = s.tokens - snapCost;
  let socialDelta = 0;
  let sleepDelta = 1; // default: lose sleep

  if (notification && notificationChoice === "attend") {
    tokensLeft -= notification.tokenCost;
    socialDelta = 15;
    sleepDelta = 2; // costs more energy
  } else if (notification && notificationChoice === "ignore") {
    socialDelta = -8;
  }

  // Remaining tokens go to "sleep" implicitly
  if (tokensLeft >= 2) sleepDelta = Math.max(0, sleepDelta - 1);

  const result: DayResult = {
    day: s.currentDay,
    snapQuality: quality,
    tokensSpent: {
      streak: snapCost,
      sleep: Math.max(0, tokensLeft),
      social: notification && notificationChoice === "attend" ? notification.tokenCost : 0,
    },
    tokensRemaining: Math.max(0, tokensLeft),
    relationshipDelta: relDelta,
    notification: notification ?? undefined,
    notificationChoice,
  };

  const newDay = s.currentDay + 1;
  const isOver = newDay > s.totalDays;

  return {
    ...s,
    phase: isOver ? "summary" : "choosing",
    currentDay: isOver ? s.currentDay : newDay,
    streak: s.streak + 1,
    tokens: isOver ? Math.max(0, tokensLeft) : TOKENS_PER_DAY,
    sleepDebt: Math.min(10, s.sleepDebt + sleepDelta),
    socialHealth: Math.max(0, Math.min(100, s.socialHealth + socialDelta)),
    relationshipMeter: Math.max(0, Math.min(100, s.relationshipMeter + relDelta)),
    history: [...s.history, result],
    currentNotification: null,
    pendingSnapChoice: null,
    streakBroken: false,
  };
}
