import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SnapQuality } from "@/hooks/useSimulatorEngine";

interface SnapChooserProps {
  tokens: number;
  onChoose: (quality: SnapQuality) => void;
  onSkip: () => void;
  streak: number;
}

export function SnapChooser({ tokens, onChoose, onSkip, streak }: SnapChooserProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {/* Choice 1: Maintenance (Behavioral Chore) */}
        <Button
          variant="outline"
          className="h-auto py-4 px-4 flex flex-col items-start gap-1 group relative overflow-hidden border-2 hover:border-primary/50 transition-all"
          onClick={() => onChoose("blank")}
          disabled={tokens < 1}
        >
          <div className="flex justify-between items-center w-full">
            <span className="font-bold text-sm flex items-center gap-2">
              🟦 Send "Blank" Snap 
            </span>
            <span className="text-[9px] bg-secondary px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
              Chore (1⚡)
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground text-left leading-tight">
            Low effort. Keeps the 🔥 {streak} number alive, but doesn't build real friendship.
          </p>
        </Button>

        {/* Choice 2: Standard Sharing  */}
        <Button
          variant="outline"
          className="h-auto py-4 px-4 flex flex-col items-start gap-1 group border-2 hover:border-primary/50 transition-all"
          onClick={() => onChoose("photo")}
          disabled={tokens < 2}
        >
          <div className="flex justify-between items-center w-full">
            <span className="font-bold text-sm flex items-center gap-2">
              📸 Send Photo/Video
            </span>
            <span className="text-[9px] bg-secondary px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
              Standard (2⚡)
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground text-left leading-tight">
            34% of teens post videos daily. More engaging, but costs more energy.
          </p>
        </Button>

        {/* Choice 3: Meaningful Connection */}
        <Button
          variant="outline"
          className="h-auto py-4 px-4 flex flex-col items-start gap-1 group border-2 hover:border-primary/50 transition-all"
          onClick={() => onChoose("personal")}
          disabled={tokens < 3}
        >
          <div className="flex justify-between items-center w-full">
            <span className="font-bold text-sm flex items-center gap-2">
              💬 Personal Message
            </span>
            <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
              Connection (3⚡)
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground text-left leading-tight">
            Meaningful conversation. Best for friendship, but high energy drain.
          </p>
        </Button>
      </div>

      {/* Choice 4: Priority Shift (Break the Loop) */}
      <Button
        variant="ghost"
        className="w-full h-auto py-3 px-4 flex flex-col items-center gap-1 border-2 border-dashed border-muted-foreground/20 hover:bg-destructive/5 hover:border-destructive/30 transition-all group"
        onClick={onSkip}
      >
        <span className="font-bold text-xs flex items-center gap-2 group-hover:text-destructive transition-colors">
          🛌 Put Phone Away
        </span>
        <p className="text-[9px] text-muted-foreground italic">
          Prioritize rest. This will break your streak but clear "Brain Rot" fatigue. [cite: 1041, 3867]
        </p>
      </Button>
    </div>
  );
}
