import React from 'react';
import { CloudRain, Flame, Wind } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { SeverityBadge } from '../ui/SeverityBadge';

export const SignalPanels = ({ signals }) => {
  const { rainfall, heatwave, wind } = signals;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Heavy Rainfall Card */}
      <GlassCard 
        variant={rainfall.severity === 'EXTREME' || rainfall.severity === 'HIGH' ? 'danger' : 'default'}
        title="Heavy Rainfall Risk"
        badge={<SeverityBadge severity={rainfall.severity} />}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-2xl font-bold font-orbitron text-cyan-400">
              {rainfall.val}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
              Threshold: {rainfall.threshold}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-cyan-400">
            <CloudRain className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {rainfall.desc}
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] font-mono bg-slate-100/70 dark:bg-black/30 border border-slate-200/80 dark:border-transparent px-2.5 py-1.5 rounded-xl">
          <span className="text-slate-500 dark:text-slate-400">Exceedance Probability:</span>
          <span className="font-bold text-cyan-700 dark:text-cyan-300">{rainfall.prob}</span>
        </div>
      </GlassCard>

      {/* Heatwave Card */}
      <GlassCard 
        variant={heatwave.severity === 'EXTREME' || heatwave.severity === 'HIGH' ? 'danger' : heatwave.severity === 'MODERATE' ? 'warning' : 'default'}
        title="Heatwave Risk"
        badge={<SeverityBadge severity={heatwave.severity} />}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-2xl font-bold font-orbitron text-amber-600 dark:text-amber-400">
              {heatwave.val}
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
              Threshold: {heatwave.threshold}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-500/30 text-amber-600 dark:text-amber-400">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {heatwave.desc}
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] font-mono bg-slate-100/70 dark:bg-black/30 border border-slate-200/80 dark:border-transparent px-2.5 py-1.5 rounded-xl">
          <span className="text-slate-500 dark:text-slate-400">Heat Stress Probability:</span>
          <span className="font-bold text-amber-700 dark:text-amber-300">{heatwave.prob}</span>
        </div>
      </GlassCard>

      {/* High-Wind Card */}
      <GlassCard 
        variant={wind.severity === 'EXTREME' || wind.severity === 'HIGH' ? 'warning' : 'default'}
        title="High-Wind Risk"
        badge={<SeverityBadge severity={wind.severity} />}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-2xl font-bold font-orbitron text-sky-600 dark:text-sky-400">
              {wind.val}
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
              Threshold: {wind.threshold}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-950/50 border border-sky-300 dark:border-sky-500/30 text-sky-600 dark:text-sky-400">
            <Wind className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {wind.desc}
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] font-mono bg-slate-100/70 dark:bg-black/30 border border-slate-200/80 dark:border-transparent px-2.5 py-1.5 rounded-xl">
          <span className="text-slate-500 dark:text-slate-400">Gust Exceedance:</span>
          <span className="font-bold text-sky-700 dark:text-sky-300">{wind.prob}</span>
        </div>
      </GlassCard>
    </div>
  );
};
