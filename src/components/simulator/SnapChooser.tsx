import { motion } from "framer-motion";
import type { SnapQuality } from "@/hooks/useSimulatorEngine";

interface SnapChooserProps {
  tokens: number;
  onChoose: (quality: SnapQuality) => void;
  onSkip: () => void;
  streak: number;
}

const options: { quality: SnapQuality; label: string; emoji: string; cost: number; desc: string }[] = [
  {
    quality: "blank",
    label: "Blank Snap",
    emoji: "⬛",
    cost: 1,
    desc: "Black screen. Keeps the number alive, but your friend knows you don't care.",
  },
  {
    quality: "photo",
    label: "Quick Photo",
    emoji: "📸",
    cost: 2,
    desc: "A ceiling pic with 'streaks' written on it. Low effort, but at least it's something.",
  },
  {
    quality: "personal",
    label: "Personal Message",
    emoji: "💬",
    cost: 3,
    desc: "An actual conversation. Takes time, but builds a real connection.",
  },
];

export function SnapChooser({ tokens, onChoose, onSkip, streak }: SnapChooserProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground text-center">
        How do you want to keep the streak?
      </p>

      <div className="space-y-2">
        {options.map((opt, i) => {
          const canAfford = tokens >= opt.cost;
          return (
            <motion.button
              key={opt.quality}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              disabled={!canAfford}
              onClick={() => onChoose(opt.quality)}
              className={`w-full text-left rounded-xl border p-3 transition-all ${
                canAfford
                  ? "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                  : "border-border/30 opacity-40 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{opt.emoji}</span>
                  <span className="text-sm font-semibold text-foreground">{opt.label}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                  {opt.cost} {opt.cost === 1 ? "token" : "tokens"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed pl-8">
                {opt.desc}
              </p>
            </motion.button>
          );
        })}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={onSkip}
        className="w-full py-2.5 rounded-xl border border-destructive/30 text-destructive text-xs font-medium hover:bg-destructive/10 transition-colors"
      >
        Skip Today — Break the Streak 💔
      </motion.button>

      {streak >= 3 && (
        <p className="text-[10px] text-center text-reveal italic">
          "Can you really just let {streak} days go to waste?"
          <br />
          <span className="text-muted-foreground not-italic">— That's loss aversion talking.</span>
        </p>
      )}
    </div>
  );
}
