import { useState, useCallback } from "react";

export type SnapQuality = "blank" | "photo" | "personal" | "rest"; // Added 'rest'
export type NotificationChoice = "ignore" | "attend";

// ... keep existing interfaces (DayResult, GameNotification, etc) ...

export interface SimulatorState {
  // ... keep existing fields ...
  simulatedTime: string; // NEW: Track time of day
}

const TOTAL_DAYS = 7; // Shorter for better engagement
const TOKENS_PER_DAY = 6;

const SNAP_COSTS: Record<SnapQuality, number> = {
  blank: 1,
  photo: 2,
  personal: 3,
  rest: 0, // Costs 0 tokens but ends the day
};

// ... keep SNAP_RELATIONSHIP and NOTIFICATIONS ...

export function useSimulatorEngine() {
  const [state, setState] = useState<SimulatorState>({
    phase: "intro",
    currentDay: 1,
    totalDays: TOTAL_DAYS,
    streak: 120, // Start high to trigger Loss Aversion [cite: 4382]
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

  // Helper to advance time based on tokens spent
  const calculateTime = (tokensLeft: number) => {
    if (tokensLeft >= 5) return "8:45 PM";
    if (tokensLeft >= 3) return "10:15 PM";
    if (tokensLeft >= 1) return "11:30 PM";
    return "12:45 AM"; // 15-24% of activity happens late 
  };

  const chooseSnap = useCallback((quality: SnapQuality) => {
    if (quality === "rest") {
      skipStreak(); // Trigger the 'Put phone away' logic
      return;
    }

    const cost = SNAP_COSTS[quality];
    setState((s) => {
      if (s.tokens < cost) return s;

      const usedIds = new Set(s.history.map((h) => h.notification?.id).filter(Boolean) as string[]);
      const notification = getNotificationForDay(s.currentDay, usedIds);

      if (notification) {
        return { ...s, pendingSnapChoice: quality, currentNotification: notification, phase: "notification" };
      }

      const nextState = applySnapChoice(s, quality, null, undefined);
      return {
        ...nextState,
        tokens: s.tokens - cost,
        simulatedTime: calculateTime(s.tokens - cost),
      };
    });
  }, []);

  const handleNotification = (choice: NotificationChoice) => {
    setState(s => {
      const cost = s.pendingSnapChoice ? SNAP_COSTS[s.pendingSnapChoice] : 0;
      const nextState = applySnapChoice(s, s.pendingSnapChoice!, s.currentNotification, choice);
      const finalTokens = s.tokens - cost;
      return {
        ...nextState,
        tokens: finalTokens,
        simulatedTime: calculateTime(finalTokens),
        currentNotification: null,
        pendingSnapChoice: null,
        phase: "choosing"
      };
    });
  };

  // ... keep resetGame and skipStreak ...
}
