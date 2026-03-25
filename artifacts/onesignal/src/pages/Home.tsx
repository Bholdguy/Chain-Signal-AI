import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, AlertCircle, Signal } from "lucide-react";
import { useAnalyzeToken } from "@workspace/api-client-react";
import { TerminalLoader } from "@/components/TerminalLoader";
import { SignalCard } from "@/components/SignalCard";

export default function Home() {
  const [query, setQuery] = useState("");
  const analyzeMutation = useAnalyzeToken();

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    analyzeMutation.mutate({ 
      data: { query: query.trim() } 
    });
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col">
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-cover bg-center bg-no-repeat mix-blend-screen"
        style={{ backgroundImage: `url('${import.meta.env.BASE_URL}images/hero-bg.png')` }}
      />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 md:py-24 relative z-10 flex flex-col">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
            <Signal className="w-8 h-8 text-primary text-glow" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 tracking-tighter">
            One<span className="text-primary text-glow">Signal</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-mono max-w-2xl mx-auto">
            AI-powered trading intelligence for the OneChain network.
          </p>
        </motion.div>

        {/* Search Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full mb-12"
        >
          <form onSubmit={handleAnalyze} className="relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl transition-all duration-500 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100" />
            <div className="relative flex items-center bg-card border-2 border-border rounded-2xl overflow-hidden transition-colors focus-within:border-primary focus-within:glow-cyan">
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
                  className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center shadow-lg shadow-primary/25"
                >
                  Analyze
                </button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Results / State Section */}
        <div className="w-full flex-1">
          <AnimatePresence mode="wait">
            {analyzeMutation.isPending && (
              <motion.div key="loader" className="w-full">
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
                  {analyzeMutation.error?.error || analyzeMutation.error?.message || "Unable to retrieve intelligence from OneChain RPC. Please verify the contract address and try again."}
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
              <motion.div key="result" className="w-full">
                <SignalCard data={analyzeMutation.data} />
              </motion.div>
            )}
            
            {/* Empty State placeholder if nothing has happened yet */}
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
      </main>
      
      {/* Footer */}
      <footer className="py-6 text-center z-10">
        <p className="text-xs text-muted-foreground font-mono">
          Data sourced directly from OneChain Mainnet RPC
        </p>
      </footer>
    </div>
  );
}
