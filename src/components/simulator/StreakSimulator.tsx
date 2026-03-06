import { AnimatePresence, motion } from "framer-motion";
import { useSimulatorEngine, NotificationChoice } from "@/hooks/useSimulatorEngine";
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
  121: { id: "dopamine", title: "🧪 The Dopamine Loop", description: "Your brain releases dopamine because it ANTICIPATES the reward of that number going up.", emoji: "🧪", color: "primary" },
  124: { id: "sunk-cost", title: "🪤 Sunk Cost Fallacy", description: "Breaking the streak now feels like 'wasting' days of energy. This is a behavioral chore, not a conversation.", emoji: "🪤", color: "accent" },
};

export function StreakSimulator() {
  const { state, startGame, chooseSnap, handleNotification, skipStreak, resetGame } = useSimulatorEngine();
  const [activeCards, setActiveCards] = useState<RevealCard[]>([]);

  const isBurnout = state.tokens === 0;

  useEffect(() => {
    const card = MILESTONE_CARDS[state.streak];
    if (card && !activeCards.find((c) => c.id === card.id)) setActiveCards((prev) => [...prev, card]);
  }, [state.streak]);

  useEffect(() => {
    if (state.streakBroken && state.streak === 0) {
      const lossCard: RevealCard = { id: "loss-aversion", title: "🧠 Loss Aversion", description: "The pain of losing a 120-day streak feels twice as strong as the joy of reaching it.", emoji: "💔", color: "destructive" };
      if (!activeCards.find((c) => c.id === lossCard.id)) setActiveCards((prev) => [...prev, lossCard]);
    }
  }, [state.streakBroken]);

  useEffect(() => {
    if (isBurnout && !activeCards.find(c => c.id === "burnout-logic")) {
      setActiveCards(prev => [...prev, { id: "burnout-logic", title: "😫 The Burnout Loop", description: "15-24% of activity happens between 9pm and 5am just to keep numbers alive[cite: 3895].", emoji: "😫", color: "destructive" }]);
    }
  }, [isBurnout]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FFFC00]">
      <div className="w-full max-w-[460px]">
        <div className={`phone-frame relative transition-all duration-700 ${isBurnout ? "grayscale opacity-80 scale-[0.97]" : ""}`}>
          <div className="flex items-center justify-between px-6 pt-4 pb-2">
            <span className="text-[10px] font-mono font-bold text-foreground">{state.simulatedTime}</span>
            {isBurnout && <span className="text-[8px] text-destructive font-bold animate-pulse">LATE NIGHT MODE</span>}
          </div>

          <AnimatePresence mode="wait">
            {state.phase === "intro" && <motion.div key="intro" exit={{ opacity: 0 }}><IntroScreen onStart={startGame} /></motion.div>}
            {state.phase === "summary" && <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><PostGameSummary state={state} onRestart={() => { setActiveCards([]); resetGame(); }} /></motion.div>}
            {state.phase === "dayStart" && (
    <motion.div
      key="dayStart"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-background/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center"
    >
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="space-y-6">
        <div className="space-y-2">
          <span className="text-primary font-mono text-sm tracking-widest uppercase">New Cycle Initiated</span>
          <h2 className="text-5xl font-black italic text-foreground tracking-tighter">DAY {state.currentDay}</h2>
        </div>
        <div className="bg-secondary/30 p-4 rounded-2xl border border-border/50">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            The loop resets. Your 🔥 {state.streak} day streak is active. 
            Remember: 13-14 year olds visit this app an average of <strong>841 times a month</strong>.
          </p>
        </div>
        <button
          onClick={() => startGame()} // Use a function to set phase back to "choosing"
          className="w-full bg-[#FFFC00] text-black py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all"
        >
          Continue the Loop
        </button>
      </motion.div>
    </motion.div>
  )}
            {(state.phase === "choosing" || state.phase === "notification") && (
              <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pb-5 space-y-4">
                <div className="flex items-center gap-3 py-3 border-b border-border/50">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">👤</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">BestFriend_2024</p>
                    <p className="text-[10px] font-bold">{state.streakBroken ? "💔 STREAK DEAD" : `🔥 ${state.streak} DAY STREAK`}</p>
                  </div>
                </div>

                <TokenBar tokens={state.tokens} maxTokens={state.maxTokens} day={state.currentDay} totalDays={state.totalDays} streak={state.streak} />
                <RelationshipMeter value={state.relationshipMeter} sleepDebt={state.sleepDebt} socialHealth={state.socialHealth} />

                <div className="relative">
                  {state.tokens > 0 ? (
                    <SnapChooser tokens={state.tokens} onChoose={chooseSnap} onSkip={skipStreak} streak={state.streak} />
                  ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-background/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 rounded-2xl border-2 border-destructive/20 z-10 shadow-xl">
                      <span className="text-3xl mb-2">🔋</span>
                      <h3 className="font-bold text-destructive uppercase tracking-tighter">Energy Depleted</h3>
                      <p className="text-[10px] text-muted-foreground mb-4">"I get up and I'm like oh my gosh, the world is spinning".</p>
                      <button onClick={skipStreak} className="w-full bg-[#FFFC00] text-black py-4 rounded-xl font-black text-xs uppercase shadow-lg active:scale-95 transition-all">Finish Day & Rest</button>
                    </motion.div>
                  )}
                </div>

                <AnimatePresence>{activeCards.map((card) => (<PsychologyCard key={card.id} {...card} onDismiss={() => setActiveCards(prev => prev.filter(c => c.id !== card.id))} />))}</AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {state.phase === "notification" && state.currentNotification && (
              <NotificationOverlay notification={state.currentNotification} tokensLeft={state.tokens} onChoice={(c) => handleNotification(c as NotificationChoice)} />
            )}
          </AnimatePresence>
          <div className="flex justify-center pb-3"><div className="w-32 h-1 rounded-full bg-muted-foreground/30" /></div>
        </div>
      </div>
    </div>
  );
}
