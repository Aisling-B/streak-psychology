import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

interface SleepImpactProps {
  nightMode: boolean;
  onToggle: () => void;
  nightSnaps: number;
}

export function SleepImpact({ nightMode, onToggle, nightSnaps }: SleepImpactProps) {
  const impactPercent = Math.min(nightSnaps * 8, 100);

  return (
    <div className="space-y-3">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 w-full justify-between rounded-lg border border-border p-3 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {nightMode ? (
            <Moon className="w-4 h-4 text-accent" />
          ) : (
            <Sun className="w-4 h-4 text-warning" />
          )}
          <span className="text-xs font-medium">
            {nightMode ? "Night Mode ON" : "Night Mode OFF"}
          </span>
        </div>
        <div
          className={`w-10 h-5 rounded-full relative transition-colors ${
            nightMode ? "bg-accent/30" : "bg-secondary"
          }`}
        >
          <motion.div
            className="w-4 h-4 rounded-full bg-foreground absolute top-0.5"
            animate={{ left: nightMode ? 22 : 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </div>
      </button>

      {nightMode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-lg border border-accent/20 bg-accent/5 p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-accent">Sleep Impact Meter</span>
            <span className="text-[11px] font-mono text-muted-foreground">{nightSnaps} night snaps</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${impactPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            15–24% of teen Snap activity happens between 9pm and 5am. Late-night usage is linked to increased anxiety, disrupted sleep cycles, and lower academic performance.
          </p>
        </motion.div>
      )}
    </div>
  );
}
