import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet, abbreviateAddress } from "@/hooks/useWallet";

export function WalletButton() {
  const { address, isConnecting, isConnected, error, connect, disconnect } = useWallet();
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    if (isConnected) {
      setShowTooltip((v) => !v);
    } else {
      connect();
    }
  };

  const errorLabel =
    error === "NO_WALLET"
      ? "NO WALLET DETECTED"
      : error === "REJECTED"
      ? "CONNECTION REJECTED"
      : error === "FAILED"
      ? "CONNECTION FAILED"
      : null;

  return (
    <div className="relative flex flex-col items-end gap-1">
      <motion.button
        onClick={handleClick}
        disabled={isConnecting}
        whileTap={{ scale: 0.96 }}
        className={[
          "flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono font-bold text-xs tracking-wider uppercase transition-all duration-200",
          isConnected
            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 shadow-[0_0_12px_rgba(52,211,153,0.2)]"
            : "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/70 shadow-[0_0_12px_rgba(0,255,255,0.15)] hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]",
          isConnecting ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
      >
        <div
          className={[
            "w-2 h-2 rounded-full flex-shrink-0",
            isConnected
              ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse"
              : isConnecting
              ? "bg-primary/60 animate-pulse"
              : "bg-primary/40",
          ].join(" ")}
        />

        {isConnecting ? (
          <span className="tracking-widest">CONNECTING...</span>
        ) : isConnected && address ? (
          <span className="font-mono">{abbreviateAddress(address)}</span>
        ) : (
          <span className="tracking-widest">CONNECT WALLET</span>
        )}
      </motion.button>

      <AnimatePresence>
        {isConnected && showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 z-50 min-w-[180px] bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl shadow-black/60"
          >
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
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

        {error && !isConnected && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[10px] font-mono text-rose-400/70 uppercase tracking-wider pr-1"
          >
            {errorLabel}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
