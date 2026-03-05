import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SimulatorState, SnapQuality } from "@/hooks/useSimulatorEngine";

interface PostGameSummaryProps {
  state: SimulatorState;
  onRestart: () => void;
}

interface StorySlide {
  emoji: string;
  title: string;
  body: string;
  stat?: string;
  color: string;
}

function buildStory(state: SimulatorState): StorySlide[] {
  const blankCount = state.history.filter((h) => h.snapQuality === "blank").length;
  const personalCount = state.history.filter((h) => h.snapQuality === "personal").length;
  const ignoredCount = state.history.filter((h) => h.notificationChoice === "ignore").length;
  const attendedCount = state.history.filter((h) => h.notificationChoice === "attend").length;
  const totalNotifs = state.history.filter((h) => h.notification).length;

  const slides: StorySlide[] = [];

  // Slide 1: The streak
  slides.push({
    emoji: "🔥",
    title: "Your Streak",
    body: state.streak > 0
      ? `You maintained a ${state.streak}-day streak. But at what cost?`
      : "You broke the streak. That took courage — or maybe you just ran out of tokens.",
    stat: `${state.streak} days`,
    color: "text-primary",
  });

  // Slide 2: Quality
  slides.push({
    emoji: "📊",
    title: "Snap Quality Report",
    body: blankCount > personalCount
      ? `${blankCount} of your snaps were blank screens. You kept a number alive, but the friendship got weaker. This is what Snapchat's design encourages — quantity over quality.`
      : `You sent ${personalCount} personal messages. That's rare. Most teens default to blank snaps because the system rewards frequency, not depth.`,
    stat: `${blankCount} blank · ${personalCount} personal`,
    color: "text-accent",
  });

  // Slide 3: Real life
  if (totalNotifs > 0) {
    slides.push({
      emoji: "🔔",
      title: "Real Life vs. The App",
      body: ignoredCount > attendedCount
        ? `You ignored ${ignoredCount} real-life moments to protect a digital number. This is how apps train you to deprioritize what actually matters.`
        : `You attended to ${attendedCount} real-life moments. That's harder than it sounds when a streak is on the line.`,
      stat: `${attendedCount} attended · ${ignoredCount} ignored`,
      color: "text-warning",
    });
  }

  // Slide 4: Sleep
  slides.push({
    emoji: "😴",
    title: "Sleep Debt",
    body: state.sleepDebt > 5
      ? "You sacrificed significant sleep to maintain your streak. 15-24% of teen Snap activity happens between 9pm-5am. Apps don't care about your circadian rhythm."
      : "Your sleep held up okay. But in real life, streaks don't pause when you need rest.",
    stat: `Sleep debt: ${state.sleepDebt}/10`,
    color: state.sleepDebt > 5 ? "text-destructive" : "text-accent",
  });

  // Slide 5: The reveal
  slides.push({
    emoji: "🧠",
    title: "The Psychology Behind It",
    body: "Streaks use Loss Aversion (you fear losing more than you enjoy gaining), Variable Rewards (unpredictable social feedback), and Social Currency (numbers as proof of friendship). These aren't bugs — they're features designed to maximize your engagement time.",
    color: "text-reveal",
  });

  // Slide 6: The question
  slides.push({
    emoji: "💡",
    title: "The Real Question",
    body: "Now that you see the mechanics, you have a choice. Not about streaks — about how you spend your attention. Because every app is competing for the same 6 tokens you have each day.",
    color: "text-foreground",
  });

  return slides;
}

export function PostGameSummary({ state, onRestart }: PostGameSummaryProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const slides = buildStory(state);

  useEffect(() => {
    if (!autoPlay) return;
    if (currentSlide >= slides.length - 1) {
      setAutoPlay(false);
      return;
    }
    const timer = setTimeout(() => setCurrentSlide((s) => s + 1), 4000);
    return () => clearTimeout(timer);
  }, [currentSlide, autoPlay, slides.length]);

  const slide = slides[currentSlide];

  return (
    <div className="flex flex-col min-h-[520px]">
      {/* Progress dots */}
      <div className="flex gap-1 px-4 pt-4 pb-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrentSlide(i); setAutoPlay(false); }}
            className="flex-1 h-1 rounded-full overflow-hidden bg-secondary"
          >
            <motion.div
              className="h-full bg-foreground/70 rounded-full"
              initial={{ width: "0%" }}
              animate={{
                width: i < currentSlide ? "100%" : i === currentSlide ? "100%" : "0%",
              }}
              transition={{
                duration: i === currentSlide && autoPlay ? 4 : 0.3,
                ease: "linear",
              }}
            />
          </button>
        ))}
      </div>

      {/* Slide content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="text-center space-y-4 max-w-[300px]"
          >
            <motion.span
              className="text-6xl block"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {slide.emoji}
            </motion.span>

            <h2 className={`text-xl font-bold font-display ${slide.color}`}>
              {slide.title}
            </h2>

            {slide.stat && (
              <p className="text-sm font-mono text-primary font-semibold">
                {slide.stat}
              </p>
            )}

            <p className="text-sm text-muted-foreground leading-relaxed">
              {slide.body}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="px-5 pb-5 space-y-2">
        <div className="flex gap-2">
          {currentSlide > 0 && (
            <button
              onClick={() => { setCurrentSlide((s) => s - 1); setAutoPlay(false); }}
              className="px-4 py-2.5 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back
            </button>
          )}
          {currentSlide < slides.length - 1 ? (
            <button
              onClick={() => { setCurrentSlide((s) => s + 1); setAutoPlay(false); }}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={onRestart}
              className="flex-1 py-2.5 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:brightness-110 transition-all"
            >
              Play Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
