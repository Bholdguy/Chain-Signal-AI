import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet, abbreviateAddress } from "@/hooks/useWallet";

export function WalletButton() {
  const { address, isConnecting, isConnected, error, errorMessage, connect, disconnect } = useWallet();
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    if (isConnecting) return;
    if (isConnected) {
      setShowTooltip((v) => !v);
    } else {
      connect();
    }
  };

  const isError = !!error && !isConnected && !isConnecting;

  return (
    <div className="relative flex flex-col items-end gap-1.5">
      <motion.button
        onClick={handleClick}
        disabled={isConnecting}
        whileTap={isConnecting ? {} : { scale: 0.96 }}
        className={[
          "flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono font-bold text-xs tracking-wider uppercase transition-all duration-200",
          isConnected
            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 shadow-[0_0_12px_rgba(52,211,153,0.2)]"
            : isError
            ? "border-rose-400/50 bg-rose-400/10 text-rose-400 hover:bg-rose-400/15 hover:border-rose-400/70 cursor-pointer"
            : "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/70 shadow-[0_0_12px_rgba(0,255,255,0.15)] hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]",
          isConnecting ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
      >
        <div
          className={[
            "w-2 h-2 rounded-full flex-shrink-0 transition-colors",
            isConnected
              ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse"
              : isConnecting
              ? "bg-primary/60 animate-pulse"
              : isError
              ? "bg-rose-400/80"
              : "bg-primary/40",
          ].join(" ")}
        />

        {isConnecting ? (
          <span className="tracking-widest">CONNECTING...</span>
        ) : isConnected && address ? (
          <span className="font-mono">{abbreviateAddress(address)}</span>
        ) : isError ? (
          <span className="tracking-widest">RETRY</span>
        ) : (
          <span className="tracking-widest">CONNECT WALLET</span>
        )}
      </motion.button>

      <AnimatePresence mode="wait">
        {/* Error message */}
        {isError && errorMessage && (
          <motion.p
            key="error-msg"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="text-[10px] font-mono text-rose-400/80 leading-snug text-right max-w-[200px] pr-0.5"
          >
            {errorMessage}
          </motion.p>
        )}

        {/* Connected tooltip */}
        {isConnected && showTooltip && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 z-50 min-w-[200px] bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl shadow-black/60"
          >
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">
              // Connected
            </p>
            <p className="text-xs font-mono text-foreground break-all mb-3 leading-relaxed">
              {address}
            </p>
            <button
              onClick={() => { disconnect(); setShowTooltip(false); }}
              className="w-full text-xs font-mono uppercase tracking-wider text-rose-400/80 hover:text-rose-400 border border-rose-400/20 hover:border-rose-400/40 rounded-lg py-1.5 transition-colors"
            >
              Disconnect
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
