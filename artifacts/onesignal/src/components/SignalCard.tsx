import { motion } from "framer-motion";
import { format } from "date-fns";
import { SignalResult } from "@workspace/api-client-react/src/generated/api.schemas";

export function SignalCard({ data }: { data: SignalResult }) {
  const getMomentumGlow = (val: string) => {
    switch (val) {
      case "Bullish": return "badge-glow-green text-success";
      case "Bearish": return "badge-glow-red text-destructive";
      default: return "badge-glow-amber text-warning";
    }
  };

  const getRiskGlow = (val: string) => {
    switch (val) {
      case "Low": return "badge-glow-green text-success";
      case "High": return "badge-glow-red text-destructive";
      default: return "badge-glow-amber text-warning";
    }
  };

  const getWhaleGlow = (val: string) => {
    switch (val) {
      case "High": return "badge-glow-cyan text-primary";
      case "Medium": return "badge-glow-amber text-warning";
      default: return "text-foreground";
    }
  };

  const getTopBorderColor = (val: string) => {
    switch (val) {
      case "Bullish": return "border-t-success";
      case "Bearish": return "border-t-destructive";
      default: return "border-t-warning";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full glass-panel rounded-2xl overflow-hidden relative border-t-2 ${getTopBorderColor(data.momentum)}`}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/40">
        <div className="text-[10px] font-mono tracking-widest opacity-40 uppercase">
          SIGNAL REPORT
        </div>
        <div className="flex flex-col items-end">
          <h2 className="text-lg font-bold font-mono text-foreground truncate max-w-[200px] sm:max-w-xs">
            {data.tokenQuery}
          </h2>
          <p className="text-xs font-mono text-muted-foreground mt-0.5">
            {format(new Date(data.analyzedAt), "HH:mm:ss 'UTC' • MMM d")}
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 divide-x divide-white/5 border-b border-white/5 bg-black/20">
        <div className="p-6 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-mono opacity-40 uppercase tracking-wider mb-3">MOMENTUM</span>
          <span className={`text-xl font-bold font-mono px-3 py-1 rounded-sm border border-transparent ${getMomentumGlow(data.momentum)} bg-background/50`}>
            {data.momentum}
          </span>
        </div>
        
        <div className="p-6 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-mono opacity-40 uppercase tracking-wider mb-3">WHALE ACTIVITY</span>
          <span className={`text-xl font-bold font-mono px-3 py-1 rounded-sm border border-transparent ${getWhaleGlow(data.whaleActivity)} bg-background/50`}>
            {data.whaleActivity}
          </span>
        </div>

        <div className="p-6 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-mono opacity-40 uppercase tracking-wider mb-3">RISK LEVEL</span>
          <span className={`text-xl font-bold font-mono px-3 py-1 rounded-sm border border-transparent ${getRiskGlow(data.riskLevel)} bg-background/50`}>
            {data.riskLevel}
          </span>
        </div>
      </div>

      {/* Narrative */}
      <div className="p-6 md:p-8 bg-black/40">
        <h3 className="text-sm font-mono text-primary mb-4 uppercase tracking-widest">
          [ AI ANALYSIS ]
        </h3>
        <p className="text-lg text-foreground/90 leading-relaxed font-mono font-light">
          {data.narrative}<span className="cursor-blink ml-1"></span>
        </p>
      </div>

      {/* Trade CTA */}
      <div className="px-6 pb-6 bg-black/40">
        <a
          href="https://dex.onelabs.cc"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-primary/40 bg-primary/5 text-primary font-mono font-bold text-sm uppercase tracking-widest transition-all duration-200 hover:bg-primary/15 hover:border-primary/80 hover:shadow-[0_0_20px_rgba(0,255,255,0.25)] active:scale-[0.98]"
        >
          Trade on OneDEX
          <span className="text-primary/70">→</span>
        </a>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-white/5 bg-black/60 text-center">
        <span className="text-[10px] font-mono text-muted-foreground/40 tracking-widest">
          GROQ · LLAMA 3 70B · ONECHAIN MAINNET
        </span>
      </div>
    </motion.div>
  );
}
