import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface PsychologyCardProps {
  title: string;
  description: string;
  emoji: string;
  color: "primary" | "accent" | "reveal" | "destructive";
  onDismiss: () => void;
}

const colorMap = {
  primary: "border-primary/40 bg-primary/10",
  accent: "border-accent/40 bg-accent/10",
  reveal: "border-reveal/40 bg-reveal/10",
  destructive: "border-destructive/40 bg-destructive/10",
};

const titleColorMap = {
  primary: "text-primary",
  accent: "text-accent",
  reveal: "text-reveal",
  destructive: "text-destructive",
};

export function PsychologyCard({ title, description, emoji, color, onDismiss }: PsychologyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`relative rounded-xl border p-4 ${colorMap[color]}`}
    >
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">{emoji}</span>
        <div className="flex-1 pr-4">
          <h3 className={`font-semibold text-sm mb-1 ${titleColorMap[color]}`}>
            {title}
          </h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-reveal" />
        <span className="text-[10px] font-mono text-reveal uppercase tracking-wider">
          Psychology Reveal
        </span>
      </div>
    </motion.div>
  );
}
