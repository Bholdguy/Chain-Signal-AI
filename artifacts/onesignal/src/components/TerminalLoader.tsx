import { motion } from "framer-motion";

const SCAN_LINES = [
  "> FETCHING BLOCK DATA...",
  "> ANALYZING TX VOLUME...",
  "> QUERYING GROQ LLM..."
];

export function TerminalLoader() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full glass-panel bg-black/80 rounded-2xl p-8 overflow-hidden relative border border-white/5"
    >
      <div className="flex flex-col space-y-6 text-left">
        <div className="space-y-4">
          <h3 className="text-xl font-mono text-primary flex items-center">
            SCANNING ONECHAIN MAINNET...<span className="cursor-blink ml-1"></span>
          </h3>
          <div className="flex flex-col space-y-2">
            {SCAN_LINES.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.3 + 0.3, duration: 0.1 }}
                className="text-sm font-mono text-[#00ff88]"
              >
                {line}<span className="cursor-blink ml-1"></span>
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
