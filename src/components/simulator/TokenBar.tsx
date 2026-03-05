import { motion } from "framer-motion";

interface TokenBarProps {
  tokens: number;
  maxTokens: number;
  day: number;
  totalDays: number;
  streak: number;
}

export function TokenBar({ tokens, maxTokens, day, totalDays, streak }: TokenBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          Day {day} of {totalDays}
        </span>
        <div className="flex items-center gap-1.5">
          {streak > 0 && (
            <span className="text-xs font-mono text-primary">
              🔥 {streak}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {Array.from({ length: maxTokens }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{
                scale: 1,
                opacity: i < tokens ? 1 : 0.2,
              }}
              transition={{ delay: i * 0.05 }}
              className={`h-3 flex-1 rounded-full transition-colors ${
                i < tokens ? "bg-accent" : "bg-secondary"
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-mono text-accent font-semibold w-8 text-right">
          {tokens}/{maxTokens}
        </span>
      </div>

      <p className="text-[10px] text-muted-foreground">
        Tokens = your time & energy today
      </p>
    </div>
  );
}
