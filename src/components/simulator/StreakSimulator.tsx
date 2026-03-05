import { AnimatePresence, motion } from "framer-motion";
import { useSimulatorEngine } from "@/hooks/useSimulatorEngine";
import { IntroScreen } from "./IntroScreen";
import { TokenBar } from "./TokenBar";
import { SnapChooser } from "./SnapChooser";
import { RelationshipMeter } from "./RelationshipMeter";
import { NotificationOverlay } from "./NotificationOverlay";
import { PostGameSummary } from "./PostGameSummary";
import { PsychologyCard } from "../PsychologyCard";
import { useState, useEffect } from "react";

// Types for our educational logic
interface RevealCard {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: "primary" | "accent" | "reveal" | "destructive";
}

const MILESTONE_CARDS: Record<number, RevealCard> = {
  121: {
    id: "dopamine",
    title: "🧪 The Dopamine Loop",
    description: "Your brain just released dopamine. You aren't reacting to a friend; you're reacting to the anticipation of seeing that number go up.",
    emoji: "🧪",
    color: "primary",
  },
  124: {
    id: "sunk-cost",
    title: "🪤 Sunk Cost Fallacy",
    description: "You've invested days of energy into this number. Now, you're clicking buttons just to avoid 'wasting' that past effort.",
    emoji: "🪤",
    color: "accent",
  }
};

export function StreakSimulator() {
  // state comes from your engine, but we will wrap actions in logic
  const { state, startGame, chooseSnap, handleNotification, skipStreak, resetGame } = useSimulatorEngine();
  const [activeCards, setActiveCards] = useState<RevealCard[]>([]);

  // Loss Aversion: Trigger when the 120-day streak is threatened or broken
  useEffect(() => {
    if (state.streakBroken && !activeCards.find(c => c.id === "loss-aversion")) {
      setActiveCards(prev => [...prev, {
        id: "loss-aversion",
        title: "🧠 Loss Aversion",
        description: "The pain of losing that 120-day streak feels twice as strong as the joy of reaching it. This is why you feel 'forced' to snap.",
        emoji: "💔",
        color: "destructive",
      }]);
    }
  }, [state.streakBroken]);

  // Milestone triggers
  useEffect(() => {
    const card = MILESTONE_CARDS[state.streak];
    if (card && !activeCards.find((c) => c.id === card.id)) {
      setActiveCards((prev) => [...prev, card]);
    }
  }, [state.streak]);

  const dismissCard = (id: string) => {
    setActiveCards((prev) => prev.filter((c) => c.id !== id));
  };

  // Helper to calculate costs visually before committing
  const snapCostForPending = state.pendingSnapChoice
    ? { blank: 1, photo: 3, personal: 5 }[state.pendingSnapChoice] // Cost reflects research-backed 'Behavioral Chores'
    : 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-[460px]">
        {/* Dynamic visual feedback: Blur screen if tokens are gone but day isn't over */}
        <div className={`phone-frame relative transition-all duration-500 ${state.tokens === 0 ? "scale-[0.98] grayscale-[0.3]" : ""}`}>
          
          {/* Status Bar */}
          <div className="flex items-center justify-between px-6 pt-4 pb-2">
            <span className="text-[10px] font-mono text-muted-foreground">9:41</span>
            <div className="flex items-center gap-1 text-[10px] font-mono text-destructive">
              {state.tokens === 0 && <span className="animate-pulse">⚠️ LOW ENERGY</span>}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {state.phase === "intro" && (
              <motion.div key="intro" exit={{ opacity: 0 }}>
                <IntroScreen onStart={startGame} />
              </motion.div>
            )}

            {state.phase === "summary" && (
              <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <PostGameSummary state={state} onRestart={() => { setActiveCards([]); resetGame(); }} />
              </motion.div>
            )}

            {(state.phase === "choosing" || state.phase === "notification") && (
              <motion.div
                key="game"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-5 pb-5 space-y-4"
              >
                {/* Header with High-Value Streak to trigger Sunk Cost logic */}
                <div className="flex items-center gap-3 py-3 border-b border-border/50">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
                    👤
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Alex</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-tighter font-bold">
                      {state.streakBroken ? "💔 Connection Broken" : `🔥 ${state.streak} DAY STREAK`}
                    </p>
                  </div>
                </div>

                {/* Token Logic: Tokens represent 'Finite Time & Energy' */}
                <TokenBar
                  tokens={state.tokens}
                  maxTokens={state.maxTokens}
                  day={state.currentDay}
                  totalDays={state.totalDays}
                  streak={state.streak}
                />

                <RelationshipMeter
                  value={state.relationshipMeter}
                  sleepDebt={state.sleepDebt}
                  socialHealth={state.socialHealth}
                />

                {/* Choice logic: Blank Snaps (Low Cost) vs Personal (High Cost) */}
                <SnapChooser
                  tokens={state.tokens}
                  onChoose={(choice) => {
                     // Internal check: prevent actions if energy is zero
                     if (state.tokens > 0) chooseSnap(choice);
                  }}
                  onSkip={skipStreak}
                  streak={state.streak}
                />

                {/* Psychology Cards: Injected directly into the phone UI */}
                <AnimatePresence>
                  {activeCards.map((card) => (
                    <PsychologyCard
                      key={card.id}
                      {...card}
                      onDismiss={() => dismissCard(card.id)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nighttime Interaction: Notifications simulate pressure */}
          <AnimatePresence>
            {state.phase === "notification" && state.currentNotification && (
              <NotificationOverlay
                notification={state.currentNotification}
                tokensLeft={state.tokens}
                onChoice={handleNotification}
              />
            )}
          </AnimatePresence>

          <div className="flex justify-center pb-3">
            <div className="w-32 h-1 rounded-full bg-muted-foreground/30" />
          </div>
        </div>

        <p className="text-center text-[10px] text-muted-foreground px-8 leading-relaxed mt-4">
          13-14 year olds spend an average of <strong>2 hours 13 minutes daily</strong> [cite: 3761] maintaining these loops. This tool explores the behavioral engineering behind that time.
        </p>
      </div>
    </div>
  );
}
