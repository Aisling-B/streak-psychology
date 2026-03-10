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

export function StreakSimulator() {
  const { state, startGame, chooseSnap, handleNotification, skipStreak, resetGame } = useSimulatorEngine();
  const [activeCards, setActiveCards] = useState<any[]>([]);
  const isBurnout = state.tokens === 0;

  useEffect(() => {
    if (isBurnout && !activeCards.find(c => c.id === "burnout-logic")) {
      setActiveCards(prev => [...prev, { id: "burnout-logic", title: "😫 The Burnout Loop", description: "15-24% of activity happens after 9pm just to keep numbers alive.", emoji: "😫", color: "destructive" }]);
    }
  }, [isBurnout]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FFFC00]">
      <div className="w-full max-w-[420px] relative">
        <div className={`phone-frame relative h-[720px] flex flex-col transition-all duration-500 bg-card overflow-hidden ${isBurnout ? "grayscale-[0.5]" : ""}`}>
          
          <div className="flex items-center justify-between px-8 pt-6 pb-2">
            <span className="text-xs font-black">{state.simulatedTime}</span>
            {isBurnout && <span className="text-[10px] text-destructive font-bold animate-pulse">🌙 LATE NIGHT</span>}
          </div>

          <AnimatePresence mode="wait">
            {state.phase === "intro" && <motion.div key="intro" exit={{ opacity: 0 }} className="flex-1"><IntroScreen onStart={startGame} /></motion.div>}

            {state.phase === "dayStart" && (
              <motion.div key="dayStart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-background z-[100] flex flex-col items-center justify-center p-10 text-center">
                <h2 className="text-6xl font-black italic mb-6">DAY {state.currentDay}</h2>
                <div className="bg-secondary/40 p-5 rounded-3xl border mb-8 text-xs text-muted-foreground leading-relaxed">
                  The loop resets. 🔥 {state.streak} streak active. 
                  <br/><span className="text-foreground font-bold italic mt-2 block">Teens visit this app an average of 841 times a month.</span>
                </div>
                <button onClick={startGame} className="w-full bg-[#FFFC00] text-black py-5 rounded-2xl font-black text-sm uppercase shadow-xl transition-all">Continue Loop</button>
              </motion.div>
            )}

            {state.phase === "summary" && <motion.div key="summary" className="flex-1"><PostGameSummary state={state} onRestart={resetGame} /></motion.div>}

            {(state.phase === "choosing" || state.phase === "notification") && (
              <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 flex-1 flex flex-col gap-4 overflow-y-auto pb-10">
                <div className="flex items-center gap-3 py-4 border-b border-border/50">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl">👤</div>
                  <div className="flex-1 text-left">
                    <p className="font-bold">BestFriend_2024</p>
                    <p className="text-[10px] uppercase font-black text-primary">{state.streakBroken ? "💔 Streak Dead" : `🔥 ${state.streak} DAY STREAK`}</p>
                  </div>
                </div>

                <TokenBar tokens={state.tokens} maxTokens={state.maxTokens} day={state.currentDay} totalDays={state.totalDays} streak={state.streak} />
                <RelationshipMeter value={state.relationshipMeter} sleepDebt={state.sleepDebt} socialHealth={state.socialHealth} />

                <div className="relative flex-1">
                  {!isBurnout ? (
                    <SnapChooser tokens={state.tokens} onChoose={chooseSnap} onSkip={skipStreak} streak={state.streak} />
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center text-center p-6 rounded-3xl border-2 border-destructive/20 z-50">
                      <span className="text-4xl mb-4">🔋</span>
                      <h3 className="font-black text-xl text-destructive uppercase tracking-tighter mb-2">Energy Depleted</h3>
                      <p className="text-[11px] text-muted-foreground mb-8 italic">"The world is spinning."</p>
                      <button onClick={skipStreak} className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-black text-sm uppercase shadow-lg active:scale-95 transition-all">End Day & Rest</button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {state.phase === "notification" && state.currentNotification && (
              <NotificationOverlay
                notification={state.currentNotification}
                tokensLeft={state.tokens}
                onChoice={(choice) => handleNotification(choice as NotificationChoice)}
              />
            )}
          </AnimatePresence>

          <div className="flex justify-center pb-6"><div className="w-32 h-1.5 rounded-full bg-muted-foreground/20" /></div>
        </div>
      </div>
    </div>
  );
}
