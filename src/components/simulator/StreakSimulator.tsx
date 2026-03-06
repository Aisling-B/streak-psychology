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
  const { state, startGame, chooseSnap, handleNotification, skipStreak } = useSimulatorEngine();
  const [activeCards, setActiveCards] = useState<any[]>([]);
  const isBurnout = state.tokens === 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FFFC00]">
      <div className="w-full max-w-[460px]">
        <div className={`phone-frame relative transition-all duration-700 ${isBurnout ? "grayscale opacity-80" : ""}`}>
          <div className="flex items-center justify-between px-6 pt-4 pb-2 bg-card/50">
            <span className="text-[10px] font-mono font-bold">{state.simulatedTime}</span>
            {isBurnout && <span className="text-[8px] text-destructive font-bold animate-pulse">LATE NIGHT MODE</span>}
          </div>

          <AnimatePresence mode="wait">
            {state.phase === "intro" && <motion.div key="intro" exit={{ opacity: 0 }}><IntroScreen onStart={startGame} /></motion.div>}

            {/* DAY START POP-UP: Explains the Point */}
            {state.phase === "dayStart" && (
              <motion.div key="dayStart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-background/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-8 text-center">
                <span className="text-primary font-mono text-[10px] tracking-widest uppercase font-bold">New Cycle</span>
                <h2 className="text-5xl font-black italic text-foreground mb-4">DAY {state.currentDay}</h2>
                <div className="bg-secondary/30 p-4 rounded-2xl border mb-6">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    The loop resets. Your 🔥 {state.streak} day streak is active.
                    <br/><span className="text-foreground font-semibold italic">13-14 year olds open this app an average of 841 times a month.</span>
                  </p>
                </div>
                <button onClick={startGame} className="w-full bg-[#FFFC00] text-black py-4 rounded-xl font-black text-sm uppercase shadow-lg active:scale-95 transition-all">Continue the Loop</button>
              </motion.div>
            )}

            {state.phase === "summary" && <motion.div key="summary"><PostGameSummary state={state} onRestart={() => window.location.reload()} /></motion.div>}

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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
