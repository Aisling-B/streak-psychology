import { useState, useCallback } from "react";

export type SnapQuality = "blank" | "photo" | "personal" | "rest";
export type NotificationChoice = "ignore" | "attend";

export interface DayResult {
  day: number;
  snapQuality: SnapQuality;
  tokensSpent: { streak: number; sleep: number; social: number };
  tokensRemaining: number;
  relationshipDelta: number;
  notification?: GameNotification;
  notificationChoice?: NotificationChoice;
}

export interface GameNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  emoji: string;
  tokenCost: number;
}

export type NotificationType = "homework" | "family" | "friend-irl" | "sleep-warning" | "anxiety";

export interface SimulatorState {
  phase: "intro" | "playing" | "choosing" | "notification" | "summary"| "dayStart";
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
  blank: 1,
  photo: 2,
  personal: 3,
  rest: 0,
};

const SNAP_RELATIONSHIP: Record<SnapQuality, number> = {
  blank: -5,
  photo: 5,
  personal: 15,
  rest: 0,
};

const NOTIFICATIONS: GameNotification[] = [
  { id: "hw1", type: "homework", title: "📚 Math Assignment Due", body: "Your math homework is due tomorrow. You haven't started yet.", emoji: "📚", tokenCost: 2 },
  { id: "fam1", type: "family", title: "🍽️ Family Dinner", body: "Mom's calling you down for dinner. Everyone's waiting.", emoji: "🍽️", tokenCost: 2 },
  { id: "irl1", type: "friend-irl", title: "🏀 Friends at the Park", body: "Your friends are playing basketball. They asked if you're coming.", emoji: "🏀", tokenCost: 3 },
  { id: "sleep1", type: "sleep-warning", title: "😴 It's Past Midnight", body: "You have school in 6 hours. Your eyes feel heavy.", emoji: "😴", tokenCost: 0 },
  { id: "anx1", type: "anxiety", title: "😰 Streak Anxiety", body: "You keep checking if your friend replied. It's been 47 minutes.", emoji: "😰", tokenCost: 1 }
];

function getNotificationForDay(day: number, usedIds: Set<string>): GameNotification | null {
  const triggerDays = [2, 4, 5, 7];
  if (!triggerDays.includes(day)) return null;
  const available = NOTIFICATIONS.filter((n) => !usedIds.has(n.id));
  return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : null;
}

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

  const skipStreak = useCallback(() => {
    setState((s) => {
      const isOver = s.currentDay + 1 > s.totalDays;
      return {
        ...s,
        phase: isOver ? "summary" : "choosing",
        currentDay: isOver ? s.currentDay : s.currentDay + 1,
        streak: 0,
        streakBroken: true,
        tokens: TOKENS_PER_DAY,
        simulatedTime: "8:30 PM",
        relationshipMeter: Math.max(0, s.relationshipMeter - 10),
        history: [...s.history, { day: s.currentDay, snapQuality: "rest", tokensSpent: { streak: 0, sleep: 0, social: 0 }, tokensRemaining: s.tokens, relationshipDelta: -10 }],
      };
    });
  }, []);

  const chooseSnap = useCallback((quality: SnapQuality) => {
    if (quality === "rest") { skipStreak(); return; }
    const cost = SNAP_COSTS[quality];
    setState((s) => {
      if (s.tokens < cost) return s;
      const usedIds = new Set(s.history.map((h) => h.notification?.id).filter(Boolean) as string[]);
      const notification = getNotificationForDay(s.currentDay, usedIds);
      if (notification) return { ...s, pendingSnapChoice: quality, currentNotification: notification, phase: "notification" };
      const nextState = applySnapChoice(s, quality, null, undefined);
      const finalTokens = s.tokens - cost;
      return { ...nextState, tokens: finalTokens, simulatedTime: calculateTime(finalTokens) };
    });
  }, [skipStreak]);

  const handleNotification = (choice: NotificationChoice) => {
    setState(s => {
      const cost = s.pendingSnapChoice ? SNAP_COSTS[s.pendingSnapChoice] : 0;
      const nextState = applySnapChoice(s, s.pendingSnapChoice!, s.currentNotification, choice);
      const finalTokens = s.tokens - cost;
      return { ...nextState, tokens: finalTokens, simulatedTime: calculateTime(finalTokens), currentNotification: null, pendingSnapChoice: null, phase: "choosing" };
    });
  };

  const resetGame = () => setState(s => ({ ...s, phase: "intro", currentDay: 1, streak: 120, tokens: TOKENS_PER_DAY, simulatedTime: "8:30 PM", history: [], streakBroken: false }));

  return { state, startGame: () => setState(s => ({ ...s, phase: "choosing" })), chooseSnap, handleNotification, skipStreak, resetGame };
}

function applySnapChoice(s: SimulatorState, quality: SnapQuality, notification: GameNotification | null, notificationChoice?: NotificationChoice): SimulatorState {
  const snapCost = SNAP_COSTS[quality];
  const relDelta = SNAP_RELATIONSHIP[quality];
  let tokensLeft = s.tokens - snapCost;
  let socialDelta = 0;
  let sleepDelta = tokensLeft < 2 ? 2 : 0;

  if (notification && notificationChoice === "attend") { tokensLeft -= notification.tokenCost; socialDelta = 15; sleepDelta += 1; }
  const isOver = s.currentDay + 1 > s.totalDays;
  return {
    ...s,
    phase: isOver ? "summary" : "dayStart",
    currentDay: isOver ? s.currentDay : s.currentDay + 1,
    streak: s.streak + 1,
    tokens: isOver ? Math.max(0, tokensLeft) : TOKENS_PER_DAY,
    simulatedTime: isOver ? s.simulatedTime : "8:30 PM",
    sleepDebt: Math.min(10, s.sleepDebt + sleepDelta),
    socialHealth: Math.max(0, Math.min(100, s.socialHealth + socialDelta)),
    relationshipMeter: Math.max(0, Math.min(100, s.relationshipMeter + relDelta)),
    history: [...s.history, { day: s.currentDay, snapQuality: quality, tokensSpent: { streak: snapCost, sleep: 0, social: 0 }, tokensRemaining: tokensLeft, relationshipDelta: relDelta, notification: notification ?? undefined, notificationChoice }],
    streakBroken: false,
  };
}
