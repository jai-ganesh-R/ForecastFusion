import React from 'react';
import { AlertTriangle, TrendingDown, ShieldAlert } from 'lucide-react';

export const DriftAlertStrip = ({ driftAlert }) => {
  if (!driftAlert) {
    return (
      <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 text-xs flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
          <span className="font-semibold">NWP Model Calibration Nominal:</span>
          <span className="text-slate-600 dark:text-slate-300">No regional skill degradation flags triggered over the last 168 hours.</span>
        </div>
        <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400/80 uppercase">Kalman Weights Optimal</span>
      </div>
    );
  }

  const isCritical = driftAlert.severity === 'critical';

  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      isCritical
        ? 'border-rose-300 dark:border-rose-500/50 bg-rose-50/90 dark:bg-rose-950/30 shadow-[0_0_20px_rgba(255,59,92,0.15)]'
        : 'border-amber-300 dark:border-amber-500/50 bg-amber-50/90 dark:bg-amber-950/30 shadow-[0_0_20px_rgba(255,176,32,0.15)]'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-xl ${
            isCritical
              ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
              : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
          } shrink-0 mt-0.5`}>
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-bold font-mono uppercase px-2 py-0.5 rounded-md ${
                isCritical
                  ? 'bg-rose-200 dark:bg-rose-500/30 text-rose-800 dark:text-rose-300'
                  : 'bg-amber-200 dark:bg-amber-500/30 text-amber-800 dark:text-amber-300'
              }`}>
                {driftAlert.severity} MODEL DRIFT DETECTED
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                {driftAlert.model}
              </span>
              <span className="text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> -{driftAlert.dropPct}% ({driftAlert.period})
              </span>
            </div>
            {/* Plain-language explanation for non-experts */}
            {driftAlert.simpleReason && (
              <p className="text-sm text-slate-800 dark:text-white font-sans mt-1.5 leading-relaxed font-medium">
                💡 {driftAlert.simpleReason}
              </p>
            )}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed italic">
              Technical: {driftAlert.reason}
            </p>
          </div>
        </div>

        <div className="md:border-l border-slate-200 dark:border-slate-800 md:pl-4 shrink-0 flex flex-col justify-center">
          <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400">Autonomous Rebalancing:</div>
          <div className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 mt-0.5 max-w-xs">
            {driftAlert.actionTaken}
          </div>
        </div>
      </div>
    </div>
  );
};
