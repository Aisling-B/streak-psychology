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
      "Your brain just released dopamine — not because something great happened, but because it ANTICIPATED a social reward. This is the same mechanism slot machines use.",
    emoji: "🧪",
    color: "primary",
  },
  4: {
    id: "sunk-cost",
    title: "🪤 Sunk Cost Fallacy",
    description:
      "You've invested 4 days of tokens. Breaking the streak now means 'wasting' all that effort — even though those tokens are already gone. This is the sunk cost fallacy, and apps exploit it relentlessly.",
    emoji: "🪤",
    color: "accent",
  },
  7: {
    id: "social-currency",
    title: "📊 Social Currency",
    description:
      "That streak number is starting to feel like proof of friendship. But ask yourself: is clicking a button daily the same as actually caring about someone?",
    emoji: "📊",
    color: "reveal",
  },
};

export function StreakSimulator() {
  const { state, startGame, chooseSnap, handleNotification, skipStreak, resetGame } = useSimulatorEngine();
  const [activeCards, setActiveCards] = useState<RevealCard[]>([]);

  // Trigger psychology cards at milestones
  useEffect(() => {
    const card = MILESTONE_CARDS[state.streak];
    if (card && !activeCards.find((c) => c.id === card.id)) {
      setActiveCards((prev) => [...prev, card]);
    }
  }, [state.streak]);

  // Trigger loss aversion on streak break
  useEffect(() => {
    if (state.streakBroken && state.streak === 0) {
      const lossCard: RevealCard = {
        id: "loss-aversion",
        title: "🧠 Loss Aversion",
        description:
          "That feeling right now? Humans feel the pain of losing something about TWICE as intensely as the joy of gaining it. Snapchat designed streaks to weaponize this instinct.",
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

  const snapCostForPending = state.pendingSnapChoice
    ? { blank: 1, photo: 2, personal: 3 }[state.pendingSnapChoice]
    : 0;
  const tokensAfterSnap = state.tokens - snapCostForPending;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-[460px]">
        <div className="phone-frame relative">
          {/* Status Bar */}
          <div className="flex items-center justify-between px-6 pt-4 pb-2">
            <span className="text-[10px] font-mono text-muted-foreground">9:41</span>
            <span className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase">
              The Streak Machine
            </span>
            <div className="flex gap-1">
              <div className="w-4 h-2 rounded-sm border border-muted-foreground/50 relative">
                <div className="absolute inset-0.5 bg-primary rounded-[1px]" />
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
                {/* Friend Header */}
                <div className="flex items-center gap-3 py-3 border-b border-border/50">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
                    👤
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">BestFriend_2024</p>
                    <p className="text-[10px] text-muted-foreground">
                      {state.streakBroken ? "Streak lost..." : state.streak > 0 ? `🔥 ${state.streak} day streak` : "No streak yet"}
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
                  onChoose={chooseSnap}
                  onSkip={skipStreak}
                  streak={state.streak}
                />

                {/* Psychology Cards */}
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

          {/* Notification Overlay */}
          <AnimatePresence>
            {state.phase === "notification" && state.currentNotification && (
              <NotificationOverlay
                notification={state.currentNotification}
                tokensLeft={tokensAfterSnap}
                onChoice={handleNotification}
              />
            )}
          </AnimatePresence>

          {/* Bottom bar */}
          <div className="flex justify-center pb-3">
            <div className="w-32 h-1 rounded-full bg-muted-foreground/30" />
          </div>
        </div>

        <p className="text-center text-[10px] text-muted-foreground px-8 leading-relaxed mt-4">
          An educational simulation. No real data is sent. Built to help you understand how social media uses behavioral psychology.
        </p>
      </div>
    </div>
  );
}
