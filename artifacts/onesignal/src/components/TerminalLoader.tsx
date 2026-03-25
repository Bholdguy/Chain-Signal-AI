import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Terminal } from "lucide-react";

const SCAN_LINES = [
  "Initializing LLaMA 3 70B...",
  "Connecting to OneChain RPC...",
  "Fetching recent block transactions...",
  "Analyzing smart contract volume...",
  "Scanning dex liquidity pools...",
  "Calculating whale momentum...",
  "Parsing sentiment...",
  "Synthesizing market narrative...",
];

export function TerminalLoader() {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLineIndex((prev) => (prev + 1) % SCAN_LINES.length);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full glass-panel rounded-2xl p-8 overflow-hidden relative"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      
      <div className="flex flex-col items-center justify-center space-y-6 text-center">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent border-r-transparent opacity-50"
          />
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Terminal className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-mono text-foreground">Processing Signal</h3>
          <div className="h-6 overflow-hidden">
            <motion.p
              key={lineIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-mono text-primary"
            >
              &gt; {SCAN_LINES[lineIndex]}
            </motion.p>
          </div>
        </div>

        <div className="w-full max-w-xs h-1.5 bg-background rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 4.8, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
