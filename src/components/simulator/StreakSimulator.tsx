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

interface RevealCard {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: "primary" | "accent" | "reveal" | "destructive";
}

const MILESTONE_CARDS: Record<number, RevealCard> = {
  1: {
    id: "dopamine",
    title: "🧪 The Dopamine Loop",
    description: "Your brain releases dopamine because it ANTICIPATES the reward of that number going up. You are literally 'hooked' to a small degree[cite: 10607].",
    emoji: "🧪",
    color: "primary",
  },
  4: {
    id: "sunk-cost",
    title: "🪤 Sunk Cost Fallacy",
    description: "You've invested days into this. Breaking it now feels like 'wasting' life energy. This is a behavioral chore, not a conversation[cite: 10756].",
    emoji: "🪤",
    color: "accent",
  },
};

export function StreakSimulator() {
  const { state, startGame, chooseSnap, handleNotification, skipStreak, resetGame } = useSimulatorEngine();
  const [activeCards, setActiveCards] = useState<RevealCard[]>([]);

  useEffect(() => {
    const card = MILESTONE_CARDS[state.streak];
    if (card && !activeCards.find((c) => c.id === card.id)) {
      setActiveCards((prev) => [...prev, card]);
    }
  }, [state.streak]);

  useEffect(() => {
    if (state.streakBroken && state.streak === 0) {
      const lossCard: RevealCard = {
        id: "loss-aversion",
        title: "🧠 Loss Aversion",
        description: "Losing a streak hurts because humans value avoiding loss more than making gains. This instinct keeps you coming back 841 times a month[cite: 13888, 14226].",
        emoji: "💔",
        color: "destructive",
      };
      if (!activeCards.find((c) => c.id === lossCard.id)) {
        setActiveCards((prev) => [...prev, lossCard]);
      }
    }
  }, [state.streakBroken]);

  const isBurnout = state.tokens === 0;

  useEffect(() => {
    if (isBurnout && !activeCards.find(c => c.id === "burnout-logic")) {
      const burnoutCard: RevealCard = {
        id: "burnout-logic",
        title: "😫 The Burnout Loop",
        description: "You're out of energy, but the streak is still active. This mirrors the 'brain rot' feeling where activity continues after 9pm just to keep numbers alive[cite: 13953, 14003].",
        emoji: "😫",
        color: "destructive",
      };
      setActiveCards(prev => [...prev, burnoutCard]);
    }
  }, [isBurnout]);

  const dismissCard = (id: string) => {
    setActiveCards((prev) => prev.filter((c) => c.id !== id));
  };

  const handleRestart = () => {
    setActiveCards([]);
    resetGame();
  };

  // Inside your StreakSimulator.tsx
const [time, setTime] = useState("8:30 PM");

// Update handleAction to also advance time
const handleActionWithTime = (choice: any) => {
  if (state.tokens > 0) {
    chooseSnap(choice);
    // Advance time to show the late-night pressure [cite: 3895]
    setTime(prev => prev === "8:30 PM" ? "10:15 PM" : "11:45 PM");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-[460px]">
        <div className={`phone-frame relative transition-all duration-700 ${isBurnout ? "grayscale opacity-80 scale-[0.97]" : ""}`}>
          
          <div className="flex items-center justify-between px-6 pt-4 pb-2">
            <div className="flex items-center gap-1">
              {isBurnout && <span className="text-[8px] text-destructive font-bold animate-pulse mr-2 text-right leading-tight">ENERGY DEPLETED<br/>11PM-5AM MODE</span>}
            </div>
          </div>

          <div className="flex items-center justify-between px-6 pt-4 pb-2">
  <span className="text-[10px] font-mono font-bold text-primary">{time}</span>
  {/* Trigger visual 'Night Mode' if past 11 PM [cite: 1008] */}
  {time === "11:45 PM" && (
    <span className="text-[8px] text-destructive bg-destructive/10 px-2 py-0.5 rounded animate-pulse">
      STAYING UP FOR STREAKS
    </span>
  )}
</div>

          <AnimatePresence mode="wait">
            {state.phase === "intro" && (
              <motion.div key="intro" exit={{ opacity: 0 }}>
                <IntroScreen onStart={startGame} />
              </motion.div>
            )}

            {state.phase === "summary" && (
              <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <PostGameSummary state={state} onRestart={handleRestart} />
              </motion.div>
            )}

            {(state.phase === "choosing" || state.phase === "notification") && (
              <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pb-5 space-y-4">
                <div className="flex items-center gap-3 py-3 border-b border-border/50">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">👤</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">BestFriend_2024</p>
                    <p className="text-[10px] text-muted-foreground font-bold">{state.streakBroken ? "💔 STREAK DEAD" : `🔥 ${state.streak} DAY STREAK`}</p>
                  </div>
                </div>

                <TokenBar tokens={state.tokens} maxTokens={state.maxTokens} day={state.currentDay} totalDays={state.totalDays} streak={state.streak} />
                <RelationshipMeter value={state.relationshipMeter} sleepDebt={state.sleepDebt} socialHealth={state.socialHealth} />

                {/* THE FIX: Use a ternary to show either the buttons OR the burnout screen */}
                <div className="relative">
                  {!isBurnout ? (
                    <SnapChooser tokens={state.tokens} onChoose={chooseSnap} onSkip={skipStreak} streak={state.streak} />
                  ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 rounded-2xl border-2 border-destructive/20 z-10">
                      <div className="bg-destructive/10 p-3 rounded-full mb-3"><span className="text-3xl">🔋</span></div>
                      <h3 className="font-bold text-lg text-destructive mb-1 font-mono uppercase tracking-tighter">Energy Depleted</h3>
                      <p className="text-[11px] text-muted-foreground mb-6 leading-relaxed max-w-[220px]">
                        "I’m less fun to be around... I can also feel angrier for like no reason"[cite: 13994].
                        <br /><span className="text-destructive/80 font-bold mt-2 block italic">15-24% of teen Snap time happens in this state[cite: 14022].</span>
                      </p>
                      <button onClick={() => skipStreak()} className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all">Finish Day & Rest</button>
                    </motion.div>
                  )}
                </div>

                <AnimatePresence>
                  {activeCards.map((card) => (
                    <PsychologyCard key={card.id} title={card.title} description={card.description} emoji={card.emoji} color={card.color} onDismiss={() => dismissCard(card.id)} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {state.phase === "notification" && state.currentNotification && (
              <NotificationOverlay notification={state.currentNotification} tokensLeft={state.tokens} onChoice={handleNotification} />
            )}
          </AnimatePresence>

          <div className="flex justify-center pb-3"><div className="w-32 h-1 rounded-full bg-muted-foreground/30" /></div>
        </div>

        <p className="text-center text-[10px] text-muted-foreground px-8 leading-relaxed mt-4 italic">
          "When I've been on my screen for five hours, I get up and I'm like oh my gosh, the world is spinning"[cite: 13994].
        </p>
      </div>
    </div>
  );
}
