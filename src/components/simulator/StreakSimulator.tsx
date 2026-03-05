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

// Milestone values adjusted to match a high starting streak (120+)
// This triggers "Loss Aversion" immediately as per research [cite: 486]
const MILESTONE_CARDS: Record<number, RevealCard> = {
  121: {
    id: "dopamine",
    title: "🧪 The Dopamine Loop",
    description:
      "Your brain releases dopamine because it ANTICIPATES the reward of that number going up. You are literally 'hooked' to a small degree[cite: 480].",
    emoji: "🧪",
    color: "primary",
  },
  124: {
    id: "sunk-cost",
    title: "🪤 Sunk Cost Fallacy",
    description:
      "You've invested days into this. Breaking it now feels like 'wasting' life energy. This is a behavioral chore, not a conversation.",
    emoji: "🪤",
    color: "accent",
  },
};

export function StreakSimulator() {
  const { state, startGame, chooseSnap, handleNotification, skipStreak, resetGame } = useSimulatorEngine();
  const [activeCards, setActiveCards] = useState<RevealCard[]>([]);

  // Psychology Trigger: Anticipatory Dopamine & Social Currency
  useEffect(() => {
    const card = MILESTONE_CARDS[state.streak];
    if (card && !activeCards.find((c) => c.id === card.id)) {
      setActiveCards((prev) => [...prev, card]);
    }
  }, [state.streak]);

  // Trigger Loss Aversion: Weaponizing the fear of losing progress [cite: 4100]
  useEffect(() => {
    if (state.streakBroken && state.streak === 0) {
      const lossCard: RevealCard = {
        id: "loss-aversion",
        title: "🧠 Loss Aversion",
        description:
          "Losing a 120-day streak hurts because humans value avoiding loss more than making gains. This instinct keeps you coming back 841 times a month[cite: 3761].",
        emoji: "💔",
        color: "destructive",
      };
      if (!activeCards.find((c) => c.id === lossCard.id)) {
        setActiveCards((prev) => [...prev, lossCard]);
      }
    }
  }, [state.streakBroken]);

  const dismissCard = (id: string) => {
    setActiveCards((prev) => prev.filter((c) => c.id !== id));
  };

  const handleRestart = () => {
    setActiveCards([]);
    resetGame();
  };

  const isBurnout = state.tokens === 0;

// Re-inject the Psychology Cards specifically for the burnout phase
useEffect(() => {
  if (isBurnout && !activeCards.find(c => c.id === "burnout-logic")) {
    const burnoutCard: RevealCard = {
      id: "burnout-logic",
      title: "😫 The Burnout Loop",
      description: "You're out of energy, but the streak is still active. This mirrors the 'brain rot' feeling where 15-24% of activity happens after 9pm just to keep numbers alive[cite: 3895, 1041].",
      emoji: "😫",
      color: "destructive",
    };
    setActiveCards(prev => [...prev, burnoutCard]);
  }
}, [isBurnout]);

  // Logic: Calculate the dynamic cost of choices
  // Personal snaps are "Expensive" (5 tokens) to show they require real energy vs "Blank" snaps
  const snapCostForPending = state.pendingSnapChoice
    ? { blank: 1, photo: 3, personal: 5 }[state.pendingSnapChoice]
    : 0;
  
  const tokensAfterSnap = state.tokens - snapCostForPending;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-[460px]">
        {/* Visual feedback: The frame scales and fades as energy (tokens) deplete [cite: 3867] */}
        <div 
          className={`phone-frame relative transition-all duration-700 ${
            state.tokens === 0 ? "grayscale opacity-80 scale-[0.97]" : ""
          }`}
        >
          {/* Status Bar */}
          <div className="flex items-center justify-between px-6 pt-4 pb-2">
            <span className="text-[10px] font-mono text-muted-foreground">9:41 PM</span>
            <div className="flex items-center gap-1">
               {state.tokens === 0 && (
                 <span className="text-[8px] text-destructive font-bold animate-pulse mr-2">
                   SYSTEM FATIGUE / 11 PM - 5 AM MODE
                 </span>
               )}
               <div className="w-4 h-2 rounded-sm border border-muted-foreground/50 relative">
                 <div 
                   className={`absolute inset-0.5 rounded-[1px] transition-all duration-500 ${
                     state.tokens < 3 ? "bg-destructive" : "bg-primary"
                   }`} 
                   style={{ width: `${(state.tokens / state.maxTokens) * 90}%` }}
                 />
               </div>
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
                <PostGameSummary state={state} onRestart={handleRestart} />
              </motion.div>
            )}

            {(state.phase === "choosing" || state.phase === "notification") && (
              <motion.div
                key="game"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-5 pb-5 space-y-4"
              >
                {/* Simulated Header showing the "Social Currency" of the high streak */}
                <div className="flex items-center gap-3 py-3 border-b border-border/50">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
                    👤
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">BestFriend_2024</p>
                    <p className="text-[10px] text-muted-foreground font-bold">
                      {state.streakBroken ? "💔 STREAK DEAD" : `🔥 ${state.streak} DAY STREAK`}
                    </p>
                  </div>
                </div>

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

                <SnapChooser
                  tokens={state.tokens}
                  onChoose={(choice) => {
                    // Engine check: prevent action if energy is insufficient
                    if (state.tokens > 0) chooseSnap(choice);
                  }}
                  onSkip={skipStreak}
                  streak={state.streak}
                />

                {/* Psychology Cards: Explaining the behavioral engineering [cite: 589] */}
                <AnimatePresence>
                  {activeCards.map((card) => (
                    <PsychologyCard
                      key={card.id}
                      title={card.title}
                      description={card.description}
                      emoji={card.emoji}
                      color={card.color}
                      onDismiss={() => dismissCard(card.id)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Late Night Notifications: 15-24% of activity happens here [cite: 3895] */}
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

        <p className="text-center text-[10px] text-muted-foreground px-8 leading-relaxed mt-4 italic">
          "When I've been on my screen for five hours, I get up and I'm like oh my gosh, the world is spinning." [cite: 3867]
        </p>
      </div>
    </div>
  );
}
