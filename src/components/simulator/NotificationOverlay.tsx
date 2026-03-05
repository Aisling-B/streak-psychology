import { motion } from "framer-motion";
import type { GameNotification } from "@/hooks/useSimulatorEngine";

interface NotificationOverlayProps {
  notification: GameNotification;
  tokensLeft: number;
  onChoice: (choice: "ignore" | "attend") => void;
}

export function NotificationOverlay({ notification, tokensLeft, onChoice }: NotificationOverlayProps) {
  const canAttend = tokensLeft >= notification.tokenCost;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm p-5"
    >
      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-[340px] rounded-2xl border border-border bg-card p-5 space-y-4 shadow-2xl"
      >
        {/* Notification header */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-lg">{notification.emoji}</span>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Real Life</p>
            <p className="text-xs font-semibold text-foreground">{notification.title}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {notification.body}
        </p>

        {notification.tokenCost > 0 && (
          <p className="text-[10px] text-accent font-mono">
            Attending costs {notification.tokenCost} tokens • You have {tokensLeft} left
          </p>
        )}

        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onChoice("attend")}
            disabled={!canAttend}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              canAttend
                ? "bg-accent text-accent-foreground hover:brightness-110"
                : "bg-secondary text-muted-foreground cursor-not-allowed"
            }`}
          >
            {canAttend ? "Attend to it" : "Can't afford it"}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onChoice("ignore")}
            className="flex-1 py-2.5 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
          >
            Ignore it
          </motion.button>
        </div>

        <p className="text-[10px] text-reveal italic text-center">
          Every "ignore" has a real cost — you just can't see it yet.
        </p>
      </motion.div>
    </motion.div>
  );
}
