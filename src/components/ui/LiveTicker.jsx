import React from 'react';
import { REGIONS } from '../../data/mockRegions';
import { useForecastStore } from '../../store/useForecastStore';

export const LiveTicker = () => {
  const { selectedRegionId, setSelectedRegion } = useForecastStore();

  return (
    <div className="w-full bg-[#0a0f1d] border-y border-slate-800/80 py-2 overflow-hidden flex items-center shadow-inner">
      <div className="px-4 py-0.5 bg-cyan-950/80 border-r border-cyan-500/30 text-[10px] uppercase font-mono font-bold text-cyan-400 tracking-wider flex items-center gap-1.5 shrink-0 z-10">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        REGIONAL ENSEMBLE CONFIDENCE:
      </div>

      <div className="flex space-x-6 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap pl-4 py-0.5">
        {REGIONS.map((reg) => {
          const isSelected = selectedRegionId === reg.id;
          const conf = reg.baseConfidence;
          const confColor =
            conf >= 90
              ? 'text-emerald-400'
              : conf >= 85
              ? 'text-cyan-400'
              : 'text-amber-400';

          return (
            <button
              key={reg.id}
              onClick={() => setSelectedRegion(reg.id)}
              className={`flex items-center space-x-2 text-xs transition-all duration-200 px-2.5 py-1 rounded border ${
                isSelected
                  ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span className="font-semibold">{reg.name}</span>
              <span className="text-[10px] text-slate-500">[{reg.leadModel.split('-')[0]}]</span>
              <span className={`font-mono font-bold ${confColor}`}>{conf}%</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
