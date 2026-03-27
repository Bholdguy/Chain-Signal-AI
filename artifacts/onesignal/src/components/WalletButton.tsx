import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet, abbreviateAddress } from "@/hooks/useWallet";

const DEMO_ADDRESS = "0x1a2b3c4d5e6f789abcdef1234567890abcdef9y";
const DEMO_SHORT   = "0x1a2b...ef9y";

export function WalletButton() {
  const { address, isConnecting, isConnected, error, connect, disconnect } = useWallet();

  const [demoMode, setDemoMode]     = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef                  = useRef<HTMLDivElement>(null);

  // Auto-enter demo mode on any connection failure
  useEffect(() => {
    if (error && !isConnected && !isConnecting) {
      setDemoMode(true);
    }
  }, [error, isConnected, isConnecting]);

  // Close tooltip on outside click
  useEffect(() => {
    if (!showTooltip) return;
    const handler = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showTooltip]);

  const handleClick = () => {
    if (isConnecting) return;
    setShowTooltip((v) => !v);
  };

  const handleDisconnect = () => {
    disconnect();
    setDemoMode(false);
    setShowTooltip(false);
  };

  const handleTryLive = () => {
    setDemoMode(false);
    setShowTooltip(false);
    connect();
  };

  const effectivelyConnected = isConnected || demoMode;
  const displayAddress       = isConnected ? abbreviateAddress(address!) : DEMO_SHORT;

  return (
    <div className="relative flex flex-col items-end gap-1.5">
      <motion.button
        onClick={handleClick}
        disabled={isConnecting}
        whileTap={isConnecting ? {} : { scale: 0.96 }}
        className={[
          "flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono font-bold text-xs tracking-wider uppercase transition-all duration-200",
          effectivelyConnected && !demoMode
            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 shadow-[0_0_12px_rgba(52,211,153,0.2)]"
            : demoMode
            ? "border-emerald-400/30 bg-emerald-400/8 text-emerald-400/80 hover:bg-emerald-400/15 shadow-[0_0_10px_rgba(52,211,153,0.12)]"
            : "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/70 shadow-[0_0_12px_rgba(0,255,255,0.15)] hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]",
          isConnecting ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
      >
        <div
          className={[
            "w-2 h-2 rounded-full flex-shrink-0 transition-colors",
            effectivelyConnected
              ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse"
              : isConnecting
              ? "bg-primary/60 animate-pulse"
              : "bg-primary/40",
          ].join(" ")}
        />

        {isConnecting ? (
          <span>CONNECTING...</span>
        ) : effectivelyConnected ? (
          <span>{displayAddress}</span>
        ) : (
          <span>CONNECT WALLET</span>
        )}

        {demoMode && !isConnecting && (
          <span className="ml-0.5 text-[9px] font-mono text-emerald-400/60 tracking-widest border border-emerald-400/20 rounded px-1 py-0.5 leading-none">
            DEMO
          </span>
        )}
      </motion.button>

      <AnimatePresence mode="wait">
        {/* Demo / connected tooltip */}
        {showTooltip && effectivelyConnected && (
          <motion.div
            key="tooltip"
            ref={tooltipRef}
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 z-50 w-[220px] bg-black/85 backdrop-blur-xl border border-white/10 rounded-xl p-3.5 shadow-2xl shadow-black/70"
          >
            {demoMode ? (
              <>
                <p className="text-[10px] font-mono text-emerald-400/60 uppercase tracking-wider mb-1">
                  // Demo Mode
                </p>
                <p className="text-xs font-mono text-foreground/80 break-all mb-1 leading-relaxed">
                  {DEMO_ADDRESS}
                </p>
                <p className="text-[10px] font-mono text-muted-foreground/60 mb-3 leading-relaxed">
                  Connect a Web3 wallet for live connection
                </p>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={handleTryLive}
                    className="w-full text-xs font-mono uppercase tracking-wider text-primary/80 hover:text-primary border border-primary/20 hover:border-primary/40 rounded-lg py-1.5 transition-colors"
                  >
                    Try Live Connection
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="w-full text-xs font-mono uppercase tracking-wider text-muted-foreground/50 hover:text-muted-foreground rounded-lg py-1.5 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">
                  // Connected
                </p>
                <p className="text-xs font-mono text-foreground break-all mb-3 leading-relaxed">
                  {address}
                </p>
                <button
                  onClick={handleDisconnect}
                  className="w-full text-xs font-mono uppercase tracking-wider text-rose-400/80 hover:text-rose-400 border border-rose-400/20 hover:border-rose-400/40 rounded-lg py-1.5 transition-colors"
                >
                  Disconnect
                </button>
              </>
            )}
          </motion.div>
        )}

        {/* Disconnected — show CONNECT WALLET, no error text needed since we fall to demo */}
      </AnimatePresence>
    </div>
  );
}
