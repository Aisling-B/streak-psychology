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
    description:
      "Your brain released dopamine because it ANTICIPATED a reward. This is the same mechanism slot machines use.",
    emoji: "🧪",
    color: "primary",
  },
  4: {
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

  const isBurnout = state.tokens === 0;

  // Psychology Trigger: Milestone Cards
  useEffect(() => {
    const card = MILESTONE_CARDS[state.streak];
    if (card && !activeCards.find((c) => c.id === card.id)) {
      setActiveCards((prev) => [...prev, card]);
    }
  }, [state.streak]);

  // Burnout Logic: Visualizing mental fatigue
  useEffect(() => {
    if (isBurnout && !activeCards.find(c => c.id === "burnout-logic")) {
      setActiveCards(prev => [...prev, {
        id: "burnout-logic",
        title: "😫 The Burnout Loop",
        description: "You're out of energy. This mirrors the 'brain rot' feeling where 15-24% of activity happens after 9pm just to keep numbers alive[cite: 1008, 1041].",
        emoji: "😫",
        color: "destructive",
      }]);
    }
  }, [isBurnout]);

  const dismissCard = (id: string) => {
    setActiveCards((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FFFC00]"> {/* Snapchat Yellow */}
      <div className="w-full max-w-[460px]">
        <div className={`phone-frame relative transition-all duration-700 ${isBurnout ? "grayscale opacity-80 scale-[0.97]" : ""}`}>
          
          {/* Status Bar */}
          <div className="flex items-center justify-between px-6 pt-4 pb-2">
            <span className="text-[10px] font-mono text-muted-foreground">9:41 PM</span>
            {isBurnout && <span className="text-[8px] text-destructive font-bold animate-pulse mr-2">LOW ENERGY MODE</span>}
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
              <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pb-5 space-y-4">
                <div className="flex items-center gap-3 py-3 border-b border-border/50">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">👤</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">BestFriend_2024</p>
                    <p className="text-[10px] text-muted-foreground font-bold">
                      {state.streakBroken ? "💔 STREAK DEAD" : `🔥 ${state.streak} DAY STREAK`}
                    </p>
                  </div>
                </div>

                <TokenBar tokens={state.tokens} maxTokens={state.maxTokens} day={state.currentDay} totalDays={state.totalDays} streak={state.streak} />
                <RelationshipMeter value={state.relationshipMeter} sleepDebt={state.sleepDebt} socialHealth={state.socialHealth} />

                {/* THE FIX: Ternary handles only one interface at a time */}
                <div className="relative">
                  {!isBurnout ? (
                    <SnapChooser tokens={state.tokens} onChoose={chooseSnap} onSkip={skipStreak} streak={state.streak} />
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-background/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 rounded-2xl border-2 border-destructive/20 shadow-xl z-20">
                      <span className="text-3xl mb-2">🔋</span>
                      <h3 className="font-bold text-destructive uppercase tracking-tighter">Energy Depleted</h3>
                      <p className="text-[10px] text-muted-foreground mb-4 leading-tight">
                        "I’m less fun to be around... I can also feel angrier for like no reason".
                      </p>
                      <button onClick={() => skipStreak()} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                        Finish Day & Rest
                      </button>
                    </motion.div>
                  )}
                </div>

                <AnimatePresence>
                  {activeCards.map((card) => (
                    <PsychologyCard key={card.id} {...card} onDismiss={() => dismissCard(card.id)} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {state.phase === "notification" && state.currentNotification && (
              <NotificationOverlay
                notification={state.currentNotification}
                tokensLeft={state.tokens}
                onChoice={(choice) => handleNotification(choice as any)}
              />
            )}
          </AnimatePresence>
          <div className="flex justify-center pb-3"><div className="w-32 h-1 rounded-full bg-muted-foreground/30" /></div>
        </div>
      </div>
    </div>
  );
}
