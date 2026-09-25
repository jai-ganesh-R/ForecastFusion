import React from 'react';
import { AlertTriangle, TrendingDown, ArrowRight, ShieldAlert } from 'lucide-react';

export const DriftAlertStrip = ({ driftAlert }) => {
  if (!driftAlert) {
    return (
      <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-2 text-emerald-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold">NWP Model Calibration Nominal:</span>
          <span className="text-slate-300">No regional skill degradation flags triggered over the last 168 hours.</span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400/80 uppercase">Kalman Weights Optimal</span>
      </div>
    );
  }

  const isCritical = driftAlert.severity === 'critical';

  return (
    <div className={`p-4 rounded-xl border ${isCritical ? 'border-rose-500/50 bg-rose-950/30 shadow-[0_0_20px_rgba(255,59,92,0.25)]' : 'border-amber-500/50 bg-amber-950/30 shadow-[0_0_20px_rgba(255,176,32,0.2)]'} transition-all`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${isCritical ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'} shrink-0 mt-0.5`}>
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-bold font-mono uppercase px-2 py-0.5 rounded ${isCritical ? 'bg-rose-500/30 text-rose-300' : 'bg-amber-500/30 text-amber-300'}`}>
                {driftAlert.severity} MODEL DRIFT DETECTED
              </span>
              <span className="text-xs font-bold text-white font-mono">
                {driftAlert.model}
              </span>
              <span className="text-xs text-rose-400 font-bold flex items-center">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> -{driftAlert.dropPct}% ({driftAlert.period})
              </span>
            </div>
            {/* Plain-language explanation for non-experts */}
            {driftAlert.simpleReason && (
              <p className="text-sm text-white font-sans mt-1.5 leading-relaxed">
                💡 {driftAlert.simpleReason}
              </p>
            )}
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed italic">
              Technical: {driftAlert.reason}
            </p>
          </div>
        </div>

        <div className="md:border-l md:border-slate-800 md:pl-4 shrink-0 flex flex-col justify-center">
          <div className="text-[10px] font-mono uppercase text-slate-400">Autonomous Rebalancing:</div>
          <div className="text-xs font-medium text-cyan-300 mt-0.5 max-w-xs">
            {driftAlert.actionTaken}
          </div>
        </div>
      </div>
    </div>
  );
};
