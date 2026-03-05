import { motion } from "framer-motion";

const facts = [
  { stat: "841", label: "times/month the average teen opens Snapchat" },
  { stat: "30min", label: "daily average time on Snapchat for teens" },
  { stat: "71%", label: "of teens use Snapchat daily" },
  { stat: "15-24%", label: "of teen Snap activity happens 9pm–5am" },
];

export function StatsPanel() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          💡 Did You Know?
        </span>
      </div>
      {facts.map((fact, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
          className="flex items-baseline gap-2 py-1.5 border-b border-border/50 last:border-0"
        >
          <span className="text-lg font-bold font-mono text-primary">{fact.stat}</span>
          <span className="text-[11px] text-muted-foreground leading-tight">{fact.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
