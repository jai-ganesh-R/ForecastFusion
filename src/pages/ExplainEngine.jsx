import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, RotateCcw, SlidersHorizontal, Info } from 'lucide-react';
import { useForecastStore } from '../store/useForecastStore';
import { WeightAttributionCard } from '../components/panels/WeightAttributionCard';
import { GlassCard } from '../components/ui/GlassCard';
import { ModelWeightPie } from '../components/charts/ModelWeightPie';
import { REGIONS } from '../data/mockRegions';
import { useLanguage } from '../context/LanguageContext';

const MODEL_META = {
  ecmwf:     { name: 'ECMWF (Europe)',  color: '#00e676' },
  gfs:       { name: 'GFS (USA)',       color: '#ff3b5c' },
  ncum:      { name: 'NCUM-IMD (India)',color: '#ffb020' },
  openmeteo: { name: 'Open-Meteo',      color: '#00e5ff' },
};

const MODEL_BIAS = {
  ecmwf:     'Best 5-day accuracy; slight overestimate in hilly terrain',
  gfs:       'Good storm timing; overestimates coastal winds',
  ncum:      'Best for Indian monsoon physics; slightly slow on rapid storms',
  openmeteo: 'High-resolution urban detail; misses cloudburst peaks',
};

export const ExplainEngine = () => {
  const {
    selectedRegionId, setSelectedRegion, getCurrentRegion,
    getCurrentWeightsData, setWhatIfWeights, clearWhatIfWeights
  } = useForecastStore();
  const { t } = useLanguage();

  const currentRegion   = getCurrentRegion();
  const weightsData     = getCurrentWeightsData();
  const realWeights     = weightsData.baselineWeights;

  const [sliders, setSliders]     = useState({ ...realWeights });
  const [whatIfMode, setWhatIfMode] = useState(false);

  // Re-sync sliders when region changes
  useEffect(() => {
    setSliders({ ...realWeights });
    setWhatIfMode(false);
    clearWhatIfWeights();
  }, [selectedRegionId, clearWhatIfWeights, realWeights]);

  // Smooth proportional balance so the dragged slider moves freely to exact value
  // and the remaining sliders smoothly distribute the remainder (sum always = 100%)
  const handleSlider = (key, val) => {
    const newVal = Math.max(0, Math.min(85, Number(val)));
    const otherKeys = Object.keys(sliders).filter(k => k !== key);
    const remaining = 100 - newVal;
    const currentOtherTotal = otherKeys.reduce((s, k) => s + (sliders[k] || 0), 0);

    const updated = { [key]: newVal };
    if (currentOtherTotal > 0) {
      let allocated = 0;
      otherKeys.forEach((k, idx) => {
        if (idx === otherKeys.length - 1) {
          updated[k] = Math.max(0, remaining - allocated);
        } else {
          const share = Math.round(((sliders[k] || 0) / currentOtherTotal) * remaining);
          updated[k] = Math.max(0, share);
          allocated += updated[k];
        }
      });
    } else {
      const even = Math.floor(remaining / otherKeys.length);
      otherKeys.forEach((k, idx) => {
        updated[k] = idx === otherKeys.length - 1 ? remaining - even * (otherKeys.length - 1) : even;
      });
    }

    setSliders(updated);
    if (whatIfMode) setWhatIfWeights(updated);
  };

  const toggleWhatIf = () => {
    if (whatIfMode) {
      clearWhatIfWeights();
      setWhatIfMode(false);
    } else {
      setWhatIfWeights(sliders);
      setWhatIfMode(true);
    }
  };

  const resetSliders = () => {
    setSliders({ ...realWeights });
    clearWhatIfWeights();
    setWhatIfMode(false);
  };

  const normed = sliders;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-[#0d1424]/90 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/30 text-cyan-400">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <h2 className="font-orbitron font-bold text-2xl text-white">{t('explain_title')}</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl font-sans leading-relaxed">{t('explain_subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-slate-400">ZONE:</label>
          <select
            value={selectedRegionId}
            onChange={e => setSelectedRegion(e.target.value)}
            className="bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none"
          >
            {REGIONS.map(r => (
              <option key={r.id} value={r.id}>{r.name} — {r.baseConfidence}% confidence</option>
            ))}
          </select>
        </div>
      </div>

      {/* Region context card */}
      <GlassCard variant="glow" title={`📍 Why does ${currentRegion.name} use these weights?`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-black/40 border border-slate-800 rounded-lg">
            <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Terrain Type</div>
            <div className="font-semibold text-slate-200">{currentRegion.terrain}</div>
            <p className="text-slate-400 text-[11px] mt-1 font-sans">Different terrains suit different models. Hilly regions penalize global models that miss local effects.</p>
          </div>
          <div className="p-3 bg-black/40 border border-slate-800 rounded-lg">
            <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Top Trusted Model Right Now</div>
            <div className="font-semibold text-emerald-400 text-sm">{currentRegion.leadModel}</div>
            <p className="text-slate-400 text-[11px] mt-1 font-sans">Chosen because it had the lowest error in this region over the past 15 days.</p>
          </div>
          <div className="p-3 bg-black/40 border border-slate-800 rounded-lg">
            <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Current Monsoon Phase</div>
            <div className="font-semibold text-cyan-400">{currentRegion.monsoonPhase}</div>
            <p className="text-slate-400 text-[11px] mt-1 font-sans">Weights adapt to the season. Monsoon-optimized models get priority during active monsoon phases.</p>
          </div>
        </div>
      </GlassCard>

      {/* Attribution cards — one per model, region-specific data */}
      <div>
        <h3 className="font-orbitron font-bold text-sm text-white mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          {t('trust_score')} — {t('why_this_score')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.keys(realWeights).map(key => (
            <WeightAttributionCard
              key={`${selectedRegionId}-${key}`}
              modelKey={key}
              modelName={MODEL_META[key]?.name || key}
              weight={realWeights[key]}
              factors={weightsData.attributions[key] || []}
              biasTendency={MODEL_BIAS[key] || ''}
            />
          ))}
        </div>
      </div>

      {/* What-If Sliders */}
      <GlassCard
        variant={whatIfMode ? 'warning' : 'default'}
        title={t('what_if_title')}
        badge={
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1.5 ${
            whatIfMode ? 'bg-amber-950/80 border-amber-500/40 text-amber-300' : 'bg-slate-800/80 border-slate-700 text-slate-400'
          }`}>
            <SlidersHorizontal className="w-3 h-3" />
            {whatIfMode ? '⚡ CUSTOM WEIGHTS ACTIVE' : 'INTERACTIVE SIMULATOR'}
          </span>
        }
        headerAction={
          <div className="flex items-center gap-2">
            <button onClick={resetSliders} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg transition">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              onClick={toggleWhatIf}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                whatIfMode ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_12px_rgba(0,229,255,0.3)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {whatIfMode ? 'Exit What-If' : 'Apply to Dashboard'}
            </button>
          </div>
        }
      >
        <p className="text-xs text-slate-400 mb-5 font-sans leading-relaxed">{t('what_if_desc')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-5">
            {Object.entries(normed).map(([key, val]) => {
              const meta = MODEL_META[key];
              const realVal = realWeights[key];
              const diff = val - realVal;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: meta.color, boxShadow: `0 0 6px ${meta.color}` }} />
                      <span className="text-sm font-semibold font-mono" style={{ color: meta.color }}>{meta.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono">
                      {diff !== 0 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${diff > 0 ? 'text-emerald-400 bg-emerald-950/60' : 'text-rose-400 bg-rose-950/60'}`}>
                          {diff > 0 ? `+${diff}%` : `${diff}%`}
                        </span>
                      )}
                      <span className="text-white font-bold">{val}%</span>
                    </div>
                  </div>
                  <input
                    type="range" min={0} max={80} step={1}
                    value={sliders[key]}
                    onChange={e => handleSlider(key, e.target.value)}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, ${meta.color} 0%, ${meta.color} ${(val/80)*100}%, #1e293b ${(val/80)*100}%, #1e293b 100%)` }}
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span>0%</span>
                    <span className="text-slate-600">Actual: {realVal}%</span>
                    <span>80%</span>
                  </div>
                </div>
              );
            })}
            <div className="p-3 bg-black/30 rounded-lg border border-slate-800 flex items-center justify-between font-mono text-xs">
              <span className="text-slate-400">Total must equal 100%:</span>
              <span className="text-emerald-400 font-bold">100% ✓ (auto-normalized)</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="text-[11px] font-mono text-slate-400 text-center mb-2">
              {whatIfMode ? '⚡ Your Custom Weights (Live on Dashboard)' : '👁️ Preview — how your weights look'}
            </div>
            <div className="w-full max-w-xs">
              <ModelWeightPie weights={normed} />
            </div>
            {whatIfMode && (
              <div className="mt-2 text-[10px] font-mono text-amber-400 text-center animate-pulse">
                ⚡ Custom weights applied to Dashboard & Forecast
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
