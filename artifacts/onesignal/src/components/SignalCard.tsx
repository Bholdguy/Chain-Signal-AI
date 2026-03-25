import { motion } from "framer-motion";
import { format } from "date-fns";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ShieldAlert, 
  ShieldCheck, 
  Shield, 
  Activity,
  Cpu,
  Clock
} from "lucide-react";
import { Badge } from "./ui/badge";
import { SignalResult } from "@workspace/api-client-react/src/generated/api.schemas";

export function SignalCard({ data }: { data: SignalResult }) {
  const getMomentumColor = (val: string) => {
    switch (val) {
      case "Bullish": return "success";
      case "Bearish": return "destructive";
      default: return "warning";
    }
  };

  const getMomentumIcon = (val: string) => {
    switch (val) {
      case "Bullish": return <TrendingUp className="w-4 h-4 mr-1" />;
      case "Bearish": return <TrendingDown className="w-4 h-4 mr-1" />;
      default: return <Minus className="w-4 h-4 mr-1" />;
    }
  };

  const getRiskColor = (val: string) => {
    switch (val) {
      case "Low": return "success";
      case "High": return "destructive";
      default: return "warning";
    }
  };

  const getRiskIcon = (val: string) => {
    switch (val) {
      case "Low": return <ShieldCheck className="w-4 h-4 mr-1" />;
      case "High": return <ShieldAlert className="w-4 h-4 mr-1" />;
      default: return <Shield className="w-4 h-4 mr-1" />;
    }
  };

  const getWhaleColor = (val: string) => {
    switch (val) {
      case "High": return "default";
      case "Medium": return "warning";
      default: return "outline";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full glass-panel rounded-2xl overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
            <Cpu className="w-5 h-5 text-primary text-glow" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground truncate max-w-[200px] sm:max-w-xs">
              {data.tokenQuery}
            </h2>
            <p className="text-xs font-mono text-muted-foreground flex items-center mt-0.5">
              <Clock className="w-3 h-3 mr-1" />
              {format(new Date(data.analyzedAt), "HH:mm:ss 'UTC' • MMM d")}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="border-primary/20 text-primary/80">
             LLaMA 3 70B
           </Badge>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 divide-x divide-white/5 border-b border-white/5">
        <div className="p-6 flex flex-col items-center justify-center text-center group hover:bg-white/[0.01] transition-colors">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Momentum</span>
          <Badge variant={getMomentumColor(data.momentum)} className="px-3 py-1 text-sm">
            {getMomentumIcon(data.momentum)}
            {data.momentum}
          </Badge>
        </div>
        
        <div className="p-6 flex flex-col items-center justify-center text-center group hover:bg-white/[0.01] transition-colors">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Whale Activity</span>
          <Badge variant={getWhaleColor(data.whaleActivity)} className="px-3 py-1 text-sm">
            <Activity className="w-4 h-4 mr-1" />
            {data.whaleActivity}
          </Badge>
        </div>

        <div className="p-6 flex flex-col items-center justify-center text-center group hover:bg-white/[0.01] transition-colors">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Risk Level</span>
          <Badge variant={getRiskColor(data.riskLevel)} className="px-3 py-1 text-sm">
            {getRiskIcon(data.riskLevel)}
            {data.riskLevel}
          </Badge>
        </div>
      </div>

      {/* Narrative */}
      <div className="p-6 md:p-8">
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/50 to-transparent rounded-full" />
          <div className="pl-6">
            <h3 className="text-sm font-mono text-primary mb-3 uppercase tracking-widest flex items-center">
              <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse" />
              AI Market Narrative
            </h3>
            <p className="text-lg text-foreground/90 leading-relaxed font-light">
              {data.narrative}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
