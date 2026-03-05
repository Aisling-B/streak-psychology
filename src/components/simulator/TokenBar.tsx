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
            <span className="text-xs font-mono text-primary font-bold">
              🔥 {streak}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {/* Create an array based on maxTokens (e.g., 6) and map through it */}
          {Array.from({ length: maxTokens }).map((_, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{
                // Box is bright if index is less than current tokens
                opacity: i < tokens ? 1 : 0.2,
                scale: i < tokens ? 1 : 0.95,
              }}
              className={`h-3 flex-1 rounded-sm transition-colors duration-300 ${
                i < tokens 
                  ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" 
                  : "bg-secondary"
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
          {tokens}/{maxTokens}
        </span>
      </div>

      <p className="text-[9px] text-muted-foreground italic leading-tight">
        {tokens === 0 
          ? "Energy depleted. Continuing now mirrors the 9pm-5am pressure." 
          : "Tokens represent your finite daily focus and time."} 
      </p>
    </div>
  );
}
