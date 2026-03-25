import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Search, AlertCircle, Signal, Clock, ChevronRight, History } from "lucide-react";
import { useAnalyzeToken } from "@workspace/api-client-react";
import { SignalResult } from "@workspace/api-client-react/src/generated/api.schemas";
import { TerminalLoader } from "@/components/TerminalLoader";
import { SignalCard } from "@/components/SignalCard";
import { format } from "date-fns";

const MOMENTUM_COLOR: Record<string, string> = {
  Bullish: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  Bearish: "text-rose-400 border-rose-400/30 bg-rose-400/10",
  Neutral: "text-amber-400 border-amber-400/30 bg-amber-400/10",
};

const LEFT_BAR_COLOR: Record<string, string> = {
  Bullish: "left-bar-bullish",
  Bearish: "left-bar-bearish",
  Neutral: "left-bar-neutral",
};

const RISK_COLOR: Record<string, string> = {
  Low: "text-emerald-400",
  Medium: "text-amber-400",
  High: "text-rose-400",
};

function RecentSignalItem({ signal, index }: { signal: SignalResult; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      className={`glass-panel rounded-xl px-5 py-4 flex items-center justify-between gap-4 group hover:border-white/10 transition-colors ${LEFT_BAR_COLOR[signal.momentum] || ''}`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <Signal className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate">{signal.tokenQuery}</p>
          <p className="text-xs font-mono text-muted-foreground flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" />
            {format(new Date(signal.analyzedAt), "HH:mm:ss · MMM d")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${MOMENTUM_COLOR[signal.momentum] ?? "text-muted-foreground border-border"}`}>
          {signal.momentum}
        </span>
        <span className={`text-xs font-mono hidden sm:inline ${RISK_COLOR[signal.riskLevel] ?? "text-muted-foreground"}`}>
          {signal.riskLevel} risk
        </span>
        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [recentSignals, setRecentSignals] = useState<SignalResult[]>([]);
  const analyzeMutation = useAnalyzeToken();
  const oneControls = useAnimation();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const pulse = async () => {
      await oneControls.start({
        x: [0, -3, 3, -2, 2, 0],
        y: [0, -2, 1, -1, 2, 0],
        transition: { duration: 1.2, ease: "easeInOut" },
      });
      oneControls.set({ x: 0, y: 0 });
    };

    intervalRef.current = setInterval(pulse, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [oneControls]);

  useEffect(() => {
    if (analyzeMutation.isSuccess && analyzeMutation.data) {
      setRecentSignals((prev) => {
        const filtered = prev.filter(
          (s) => s.tokenQuery !== analyzeMutation.data!.tokenQuery
        );
        return [analyzeMutation.data!, ...filtered].slice(0, 3);
      });
    }
  }, [analyzeMutation.isSuccess, analyzeMutation.data]);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    analyzeMutation.mutate({ data: { query: query.trim() } });
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col">
      {/* Live Indicator */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-md shadow-lg shadow-black/50">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-mono font-bold tracking-wider text-emerald-400/90">
          LIVE · ONECHAIN
        </span>
      </div>

      {/* Animated background orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-background">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-overlay" />
        <div className="scanlines" />
      </div>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 md:py-24 relative z-10 flex flex-col">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 border border-primary/20 mb-6 shadow-lg shadow-primary/10">
            <Signal className="w-8 h-8 text-primary text-glow" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 tracking-[-0.05em] uppercase font-sans">
            <motion.span animate={oneControls} className="inline-block text-white">
              ONE
            </motion.span>
            <span className="text-primary text-glow">SIGNAL</span>
          </h1>
          <p className="text-primary/70 text-sm md:text-base font-mono max-w-2xl mx-auto uppercase tracking-widest">
            // AI TRADING INTELLIGENCE · ONECHAIN NETWORK
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full mb-12"
        >
          <form onSubmit={handleAnalyze} className="relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl transition-all duration-500 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100" />
            <div className="relative flex items-center bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-colors focus-within:border-primary focus-within:glow-cyan shadow-2xl shadow-black/50">
              <div className="pl-6 pr-2">
                <Search className="w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter token name or contract address..."
                className="flex-1 bg-transparent border-none py-5 px-2 text-lg font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
                disabled={analyzeMutation.isPending}
              />
              <div className="pr-3">
                <button
                  type="submit"
                  disabled={!query.trim() || analyzeMutation.isPending}
                  className="px-6 py-3 bg-primary/20 border border-primary/50 text-primary font-mono font-bold uppercase tracking-wider rounded-xl hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.6)]"
                >
                  ANALYZE &gt;
                </button>
              </div>
            </div>
          </form>
          <p className="mt-4 pl-1 text-xs font-mono text-muted-foreground/40 tracking-widest uppercase">
            // Name: 2–30 characters · Or paste a contract address
          </p>
        </motion.div>

        {/* Results */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {analyzeMutation.isPending && (
              <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                <TerminalLoader />
              </motion.div>
            )}

            {analyzeMutation.isError && !analyzeMutation.isPending && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full glass-panel rounded-2xl p-8 border-destructive/20 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Analysis Failed</h3>
                <p className="text-muted-foreground max-w-md font-mono text-sm">
                  {(analyzeMutation.error as { error?: string; message?: string })?.error ||
                    (analyzeMutation.error as { message?: string })?.message ||
                    "Unable to retrieve intelligence from OneChain RPC. Please verify the contract address and try again."}
                </p>
                <button
                  onClick={() => analyzeMutation.reset()}
                  className="mt-6 px-4 py-2 border border-border rounded-lg text-sm hover:bg-white/5 transition-colors font-mono"
                >
                  Dismiss
                </button>
              </motion.div>
            )}

            {analyzeMutation.isSuccess && analyzeMutation.data && !analyzeMutation.isPending && (
              <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
                <SignalCard data={analyzeMutation.data} />
              </motion.div>
            )}

            {analyzeMutation.isIdle && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full text-center py-12"
              >
                <p className="text-muted-foreground/50 font-mono text-sm uppercase tracking-widest">
                  Awaiting Input
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Recent Signals */}
        <AnimatePresence>
          {recentSignals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="w-full mt-12"
            >
              <div className="flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">
                  Recent Signals
                </h2>
                <div className="flex-1 h-px bg-border ml-2" />
              </div>
              <div className="flex flex-col gap-3">
                {recentSignals.map((signal, i) => (
                  <RecentSignalItem key={`${signal.tokenQuery}-${signal.analyzedAt}`} signal={signal} index={i} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 mt-8 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* OneChain branding */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="15" stroke="hsl(180,100%,50%)" strokeWidth="2" />
                <path d="M10 16 L16 10 L22 16 L16 22 Z" fill="hsl(180,100%,50%)" fillOpacity="0.8" />
                <circle cx="16" cy="16" r="3" fill="hsl(180,100%,50%)" />
              </svg>
              <span className="text-xs font-mono font-semibold text-primary">OneChain</span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">Mainnet</span>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground/60 font-mono">
              Powered by{" "}
              <span className="text-primary/70">OneChain RPC</span>
              {" · "}
              <span className="text-primary/70">Groq LLaMA 3</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-muted-foreground">Live</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
