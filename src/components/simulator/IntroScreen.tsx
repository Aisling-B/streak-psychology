import { motion } from "framer-motion";

interface IntroScreenProps {
  onStart: () => void;
}

export function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[480px] px-6 space-y-6 text-center"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="text-7xl"
      >
        🔥
      </motion.div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold font-display text-foreground">
          The Streak Machine
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px]">
          You have <span className="text-primary font-semibold">10 days</span> and{" "}
          <span className="text-accent font-semibold">6 tokens per day</span>.
        </p>
      </div>

      <div className="space-y-3 w-full max-w-[280px]">
        <div className="flex items-start gap-3 text-left">
          <span className="text-lg mt-0.5">⏰</span>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every token spent on streaks is a token <em>not</em> spent on sleep, homework, or real friends.
          </p>
        </div>
        <div className="flex items-start gap-3 text-left">
          <span className="text-lg mt-0.5">💬</span>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The <em>quality</em> of your snaps matters. Blank snaps keep the number alive but kill the relationship.
          </p>
        </div>
        <div className="flex items-start gap-3 text-left">
          <span className="text-lg mt-0.5">🔔</span>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Real life will interrupt. You'll have to choose what actually matters.
          </p>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="w-full max-w-[280px] py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all"
      >
        Start the Experiment →
      </motion.button>

      <p className="text-[10px] text-muted-foreground max-w-[260px]">
        An educational simulation. No real data is sent.
      </p>
    </motion.div>
  );
}
