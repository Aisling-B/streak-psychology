import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PsychologyCard } from "./PsychologyCard";
import { StatsPanel } from "./StatsPanel";
import { SleepImpact } from "./SleepImpact";
import { Send, RotateCcw } from "lucide-react";

interface RevealCard {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: "primary" | "accent" | "reveal" | "destructive";
}

const DAILY_TIMER = 10; // seconds (simulated "day")
const BREAK_AT = 15; // simulate 400-day break at this count for demo

export function StreakMachine() {
  const [streak, setStreak] = useState(0);
  const [timer, setTimer] = useState(DAILY_TIMER);
  const [hasSentToday, setHasSentToday] = useState(false);
  const [blankSnaps, setBlankSnaps] = useState(0);
  const [nightMode, setNightMode] = useState(false);
  const [nightSnaps, setNightSnaps] = useState(0);
  const [isBroken, setIsBroken] = useState(false);
  const [activeCards, setActiveCards] = useState<RevealCard[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [displayStreak, setDisplayStreak] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  // Simulated streak display (maps real clicks to "days" for milestone display)
  const simulatedDay = streak <= 3 ? streak : streak <= 6 ? streak * 10 : streak <= 10 ? streak * 40 : streak * 50;

  // Timer countdown
  useEffect(() => {
    if (!isStarted || isBroken) return;
    if (hasSentToday) return;
    
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          // Streak broken by timeout
          handleStreakBreak("timeout");
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isStarted, hasSentToday, isBroken]);

  // Reset day after sending
  useEffect(() => {
    if (!hasSentToday || isBroken) return;
    const timeout = setTimeout(() => {
      setHasSentToday(false);
      setTimer(DAILY_TIMER);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [hasSentToday, isBroken]);

  // Animate display streak
  useEffect(() => {
    if (displayStreak === simulatedDay) return;
    const step = simulatedDay > displayStreak ? 1 : -1;
    const interval = setInterval(() => {
      setDisplayStreak((d) => {
        if (d === simulatedDay) return d;
        const next = d + step * Math.max(1, Math.floor(Math.abs(simulatedDay - d) / 5));
        if ((step > 0 && next >= simulatedDay) || (step < 0 && next <= simulatedDay)) return simulatedDay;
        return next;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [simulatedDay, displayStreak]);

  const handleStreakBreak = useCallback((reason: string) => {
    setIsBroken(true);
    triggerCard({
      id: "loss-aversion",
      title: "🧠 Loss Aversion",
      description:
        "That feeling right now? Research shows humans feel the pain of losing something about TWICE as intensely as the joy of gaining it. Snapchat knows this. The streak mechanic is designed to make you fear loss — so you keep coming back, even when the interactions are meaningless.",
      emoji: "💔",
      color: "destructive",
    });
  }, []);

  const triggerCard = (card: RevealCard) => {
    setActiveCards((prev) => {
      if (prev.find((c) => c.id === card.id)) return prev;
      return [...prev, card];
    });
  };

  const dismissCard = (id: string) => {
    setActiveCards((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSendSnap = () => {
    if (isBroken || hasSentToday) return;

    if (!isStarted) setIsStarted(true);

    const newStreak = streak + 1;
    setStreak(newStreak);
    setBlankSnaps((b) => b + 1);
    setHasSentToday(true);

    if (nightMode) {
      setNightSnaps((n) => n + 1);
    }

    // Trigger psychology cards at milestones
    if (newStreak === 1) {
      triggerCard({
        id: "dopamine",
        title: "🧪 The Dopamine Loop",
        description:
          "Your brain just released dopamine — not because something great happened, but because it ANTICIPATED a social reward. This is the same mechanism slot machines use. The streak counter is designed to create a habit loop: cue → routine → reward.",
        emoji: "🧪",
        color: "primary",
      });
    }

    if (newStreak === 5) {
      triggerCard({
        id: "variable-reward",
        title: "🎰 Variable Reward Schedule",
        description:
          "Notice how you're checking back to keep the streak alive? This is a 'variable ratio reinforcement schedule' — the same psychology behind gambling. The unpredictable social feedback keeps your brain hooked.",
        emoji: "🎰",
        color: "accent",
      });
    }

    if (newStreak === 8) {
      triggerCard({
        id: "social-currency",
        title: "📊 Social Currency",
        description:
          "By now, that number next to the 🔥 feels important. High streak counts become 'proof' of friendship in the digital world. But ask yourself: does clicking a button daily actually make a friendship stronger, or just a number bigger?",
        emoji: "📊",
        color: "reveal",
      });
    }

    // Auto-break at milestone
    if (newStreak >= BREAK_AT) {
      setTimeout(() => handleStreakBreak("auto"), 1500);
    }
  };

  const handleReset = () => {
    setStreak(0);
    setTimer(DAILY_TIMER);
    setHasSentToday(false);
    setBlankSnaps(0);
    setNightSnaps(0);
    setIsBroken(false);
    setActiveCards([]);
    setDisplayStreak(0);
    setIsStarted(false);
  };

  // Fire size based on simulated day
  const fireSize = displayStreak < 30 ? "text-4xl" : displayStreak < 100 ? "text-5xl" : displayStreak < 365 ? "text-6xl" : "text-7xl";
  const fireGlow = displayStreak < 30 ? "glow-fire" : "glow-fire-intense";
  const isUrgent = timer <= 3 && !hasSentToday && isStarted && !isBroken;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-[460px] space-y-4">
        {/* Phone Frame */}
        <div className="phone-frame">
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

          {/* Main Content */}
          <div className="px-5 pb-6 space-y-5">
            {/* Friend Header */}
            <div className="flex items-center gap-3 py-3 border-b border-border/50">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
                👤
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">BestFriend_2024</p>
                <p className="text-[10px] text-muted-foreground">
                  {isBroken ? "Streak lost..." : isStarted ? "Streak active" : "Start a streak!"}
                </p>
              </div>
              <button
                onClick={() => setShowStats(!showStats)}
                className="text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
              >
                {showStats ? "Hide" : "Stats"}
              </button>
            </div>

            {/* Fire + Counter */}
            <div className="flex flex-col items-center py-6 space-y-2">
              <AnimatePresence mode="wait">
                {!isBroken ? (
                  <motion.div
                    key="fire"
                    className={`${fireSize} ${fireGlow} select-none`}
                    animate={{
                      scale: hasSentToday ? [1, 1.2, 1] : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {isStarted ? "🔥" : "🔥"}
                  </motion.div>
                ) : (
                  <motion.div
                    key="broken"
                    className="text-5xl animate-streak-break"
                  >
                    💔
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-foreground">
                  {displayStreak}
                </span>
                <span className="text-xs text-muted-foreground">
                  {displayStreak === 1 ? "day" : "days"}
                </span>
              </div>

              {/* Milestone badges */}
              <div className="flex gap-1.5">
                {displayStreak >= 30 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                    🏆 30 days
                  </span>
                )}
                {displayStreak >= 100 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
                    ⭐ 100 days
                  </span>
                )}
                {displayStreak >= 365 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-reveal/20 text-reveal font-medium">
                    👑 365 days
                  </span>
                )}
              </div>
            </div>

            {/* Timer */}
            {isStarted && !isBroken && (
              <div className="flex items-center justify-center gap-2">
                {isUrgent && (
                  <span className="text-xl glow-warning">⌛</span>
                )}
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-32 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${isUrgent ? "bg-destructive" : "bg-primary"}`}
                      animate={{ width: `${(timer / DAILY_TIMER) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className={`text-xs font-mono ${isUrgent ? "text-destructive" : "text-muted-foreground"}`}>
                    {timer}s
                  </span>
                </div>
                {isUrgent && (
                  <span className="text-xl glow-warning">⌛</span>
                )}
              </div>
            )}

            {/* Send Button */}
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSendSnap}
                disabled={isBroken || hasSentToday}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                  isBroken
                    ? "bg-secondary text-muted-foreground cursor-not-allowed"
                    : hasSentToday
                    ? "bg-primary/20 text-primary cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:brightness-110 active:brightness-90"
                }`}
              >
                <Send className="w-4 h-4" />
                {isBroken ? "Streak Broken" : hasSentToday ? "Sent! ✓" : "Send Snap"}
              </motion.button>

              {isBroken && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-secondary text-foreground font-medium text-sm hover:bg-secondary/80 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restart
                </motion.button>
              )}
            </div>

            {/* Nonsense Counter */}
            {blankSnaps > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50 border border-border/50"
              >
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  Superficial Interactions
                </span>
                <span className="text-sm font-mono font-bold text-warning">{blankSnaps}</span>
              </motion.div>
            )}

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

            {/* Sleep Impact */}
            <SleepImpact
              nightMode={nightMode}
              onToggle={() => setNightMode(!nightMode)}
              nightSnaps={nightSnaps}
            />

            {/* Stats Panel */}
            <AnimatePresence>
              {showStats && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <StatsPanel />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom bar */}
          <div className="flex justify-center pb-3">
            <div className="w-32 h-1 rounded-full bg-muted-foreground/30" />
          </div>
        </div>

        {/* Subtext */}
        <p className="text-center text-[10px] text-muted-foreground px-8 leading-relaxed">
          This is an educational simulation. No real data is sent. Built to help you understand how social media uses behavioral psychology to keep you engaged.
        </p>
      </div>
    </div>
  );
}
