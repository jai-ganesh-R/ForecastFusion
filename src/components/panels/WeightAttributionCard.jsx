import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

const MODEL_COLORS = {
  ecmwf:     '#00e676',
  gfs:       '#ff3b5c',
  ncum:      '#ffb020',
  openmeteo: '#00e5ff',
};

export const WeightAttributionCard = ({ modelKey, modelName, weight, factors = [], biasTendency }) => {
  const [expanded, setExpanded] = useState(true);
  const color = MODEL_COLORS[modelKey] || '#94a3b8';

  // Separate positive and negative factors
  const positives = factors.filter(f => f.impact >= 0);
  const negatives = factors.filter(f => f.impact < 0);

  return (
    <GlassCard className="h-full flex flex-col">
      {/* Header: model name + trust score */}
      <div
        className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 cursor-pointer select-none"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
            <h4 className="font-orbitron font-bold text-sm" style={{ color }}>{modelName}</h4>
          </div>
          <p className="text-[10px] text-slate-500 font-mono leading-snug">{biasTendency}</p>
        </div>

        {/* Big trust % */}
        <div className="text-right ml-3">
          <div className="text-3xl font-orbitron font-extrabold" style={{ color }}>
            {weight}%
          </div>
          <div className="text-[9px] font-mono text-slate-500 uppercase">Trust Score</div>
        </div>
      </div>

      {/* Visual bar for trust score */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
          <span>Low Trust (0%)</span>
          <span>High Trust (100%)</span>
        </div>
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${weight}%`,
              background: `linear-gradient(to right, ${color}80, ${color})`,
              boxShadow: `0 0 8px ${color}60`,
            }}
          />
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-1">
          {weight >= 40 ? '⭐ Primary anchor model for this region' :
           weight >= 25 ? '✅ Secondary contributor' :
           weight >= 15 ? '⚠️ Supporting role only' :
           '🔻 Low influence — currently penalized'}
        </div>
      </div>

      {/* Simple summary pills */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-300 font-mono">
          ✅ {positives.length} strengths
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 border border-rose-500/30 text-rose-300 font-mono">
          ⚠️ {negatives.length} weaknesses
        </span>
      </div>

      {/* Toggle expand button */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition mb-2"
      >
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {expanded ? 'Hide details' : 'Why this score? Show details →'}
      </button>

      {/* Expanded detail factors */}
      {expanded && (
        <div className="space-y-2 animate-fade-in">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Info className="w-3 h-3 text-cyan-400" /> What went into this score:
          </div>
          {factors.map((f, i) => {
            const isPositive = f.impact >= 0;
            return (
              <div key={i} className={`text-xs p-2.5 rounded-lg border ${
                isPositive ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-rose-950/20 border-rose-500/20'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-200 text-[11px]">{f.factor}</span>
                  <span className={`font-mono font-bold flex items-center gap-0.5 text-xs ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {isPositive ? `+${f.impact}%` : `${f.impact}%`}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full ${isPositive ? 'bg-emerald-400' : 'bg-rose-400'}`}
                    style={{ width: `${Math.min(100, Math.abs(f.impact) * 4)}%` }}
                  />
                </div>
                {/* Plain language description */}
                {f.simpleDesc ? (
                  <p className="text-[11px] text-slate-300 leading-snug font-sans">{f.simpleDesc}</p>
                ) : (
                  <p className="text-[11px] text-slate-400 leading-snug">{f.desc}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>Updates every 30 seconds</span>
        <span className="text-emerald-400">● LIVE</span>
      </div>
    </GlassCard>
  );
};
