import { motion } from "framer-motion";

interface RelationshipMeterProps {
  value: number;
  sleepDebt: number;
  socialHealth: number;
}

function getMeterColor(value: number): string {
  if (value >= 70) return "bg-accent";
  if (value >= 40) return "bg-warning";
  return "bg-destructive";
}

function getMeterLabel(value: number): string {
  if (value >= 80) return "Real Friends";
  if (value >= 60) return "Getting There";
  if (value >= 40) return "Surface Level";
  if (value >= 20) return "Awkward";
  return "Strangers with a Number";
}

function getSleepLabel(debt: number): string {
  if (debt <= 2) return "Well Rested";
  if (debt <= 4) return "Tired";
  if (debt <= 6) return "Exhausted";
  return "Running on Empty";
}

export function RelationshipMeter({ value, sleepDebt, socialHealth }: RelationshipMeterProps) {
  const sleepPercent = Math.max(0, 100 - sleepDebt * 10);

  return (
    <div className="space-y-3 rounded-xl border border-border/50 bg-secondary/30 p-3">
      {/* Relationship */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            💛 Relationship Quality
          </span>
          <span className="text-[10px] font-mono text-foreground">{getMeterLabel(value)}</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${getMeterColor(value)}`}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Sleep */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            😴 Sleep Health
          </span>
          <span className="text-[10px] font-mono text-foreground">{getSleepLabel(sleepDebt)}</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${sleepPercent > 50 ? "bg-accent" : sleepPercent > 25 ? "bg-warning" : "bg-destructive"}`}
            animate={{ width: `${sleepPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Social */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            🏀 Real Social Life
          </span>
          <span className="text-[10px] font-mono text-foreground">{socialHealth}%</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${socialHealth > 50 ? "bg-accent" : socialHealth > 25 ? "bg-warning" : "bg-destructive"}`}
            animate={{ width: `${socialHealth}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}
