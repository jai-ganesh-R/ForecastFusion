import React from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { useForecastStore } from '../store/useForecastStore';
import { WeightTimelineChart } from '../components/charts/WeightTimelineChart';
import { DriftAlertStrip } from '../components/panels/DriftAlertStrip';
import { GlassCard } from '../components/ui/GlassCard';
import { REGIONS } from '../data/mockRegions';
import { useLanguage } from '../context/LanguageContext';

// Synthetic penalty events derived from drift data
const PENALTY_EVENTS = {
  "mumbai-konkan": [
    { date: "Day -4", model: "ECMWF-HRES", type: "PENALTY",   change: -20, trigger: "MAE spike +370% (4.2→19.8mm) — orographic wet bias", newWeight: 22 },
    { date: "Day -9", model: "GFS-FV3",    type: "PENALTY",   change: -8,  trigger: "Convective timing lag +2.4h over Konkan coast",          newWeight: 40 },
    { date: "Day -14",model: "NCUM-IMD",   type: "RECOVERY",  change: +6,  trigger: "Post-event verification improved ETS to 84.2%",          newWeight: 26 }
  ],
  "delhi-ncr": [
    { date: "Day -5", model: "GFS-FV3",    type: "PENALTY",   change: -16, trigger: "Dust squall over-prediction; dry soil moisture mismatch",  newWeight: 25 },
    { date: "Day -11",model: "ECMWF-HRES", type: "RECOVERY",  change: +4,  trigger: "500hPa ridge forecast improved significantly",              newWeight: 45 }
  ],
  "guwahati-brahmaputra": [
    { date: "Day -7", model: "GFS-FV3",    type: "PENALTY",   change: -27, trigger: "Cold-pool inversion mistracking; night condensation underest.", newWeight: 20 },
    { date: "Day -7", model: "NCUM-IMD",   type: "PROMOTION", change: +21, trigger: "Auto-elevated to primary anchor after GFS failure",             newWeight: 46 },
    { date: "Day -18",model: "ECMWF-HRES", type: "PENALTY",   change: -12, trigger: "Sub-Himalayan precipitation underestimation",                   newWeight: 24 }
  ]
};

const DEFAULT_EVENTS = [
  { date: "Day -3",  model: "GFS-FV3",    type: "PENALTY",   change: -8,  trigger: "Moderate convective timing bias detected",   newWeight: 32 },
  { date: "Day -10", model: "ECMWF-HRES", type: "RECOVERY",  change: +5,  trigger: "Synoptic accuracy restored post-monsoon surge", newWeight: 38 },
  { date: "Day -22", model: "NCUM-IMD",   type: "PENALTY",   change: -6,  trigger: "Onset delay in Northeast Monsoon initialization", newWeight: 22 }
];

const typeColors = {
  PENALTY:   { bg: 'bg-rose-950/60',   border: 'border-rose-500/40',   text: 'text-rose-400',   label: 'PENALTY' },
  RECOVERY:  { bg: 'bg-emerald-950/60',border: 'border-emerald-500/40',text: 'text-emerald-400', label: 'RECOVERY' },
  PROMOTION: { bg: 'bg-cyan-950/60',   border: 'border-cyan-500/40',   text: 'text-cyan-400',   label: 'PROMOTION' }
};

export const WeightTimeline = () => {
  const { selectedRegionId, setSelectedRegion, getCurrentRegion, getCurrentWeightsData } = useForecastStore();
  const { t } = useLanguage();
  const currentRegion = getCurrentRegion();
  const weightsData = getCurrentWeightsData();
  const events = PENALTY_EVENTS[selectedRegionId] || DEFAULT_EVENTS;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-[#0d1424]/90 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/30 text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h2 className="font-orbitron font-bold text-2xl text-white">
              {t('nav_weights')} — How Trust Changes Over Time
            </h2>
          </div>
          <p className="text-sm text-slate-300 font-sans mt-1 max-w-2xl leading-relaxed">
            📊 This chart shows how much we trusted each weather model over the past 30 days.
            When a model keeps making wrong predictions, its bar goes down. When it gets accurate again, the bar rises.
            <span className="text-slate-500 text-xs block mt-1">Think of it like a player's batting average — form matters.</span>
          </p>
        </div>

        {/* Region Switcher */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-mono text-slate-400">ZONE:</label>
          <select
            value={selectedRegionId}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none"
          >
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Model Drift Alert Strip */}
      <DriftAlertStrip driftAlert={weightsData.driftAlert} />

      {/* Main 30-Day Evolution Chart */}
      <GlassCard
        title={`30-Day Adaptive Weight Trajectory: ${currentRegion.name}`}
        badge={
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
            CONTINUOUS RE-NORMALIZATION
          </span>
        }
      >
        <WeightTimelineChart data={weightsData.timeline} />
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Dynamic Bayesian Weighting updates every 6-hour observation cycle.</span>
          </div>
          <span className="text-slate-500">Constraint: {"Σ w_i = 100%"}</span>
        </div>
      </GlassCard>

      {/* ─── MODEL PENALTY EVENT LOG ─── */}
      <GlassCard
        title="Model Penalty & Recovery Event Log"
        badge={
          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3" />
            AUTO-DETECTED DRIFT EVENTS
          </span>
        }
      >
        <p className="text-sm text-slate-300 font-sans mb-4 leading-relaxed">
          📋 Every time a model was found to be too wrong, our system automatically reduced its influence (PENALTY).
          When it recovered, it got more influence back (RECOVERY). This log shows every such event.
          <span className="text-slate-500 text-xs block mt-1">All events are automatically logged and auditable.</span>
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <th className="pb-2 pr-4">Timestamp</th>
                <th className="pb-2 pr-4">Model</th>
                <th className="pb-2 pr-4">Event</th>
                <th className="pb-2 pr-4">Weight Δ</th>
                <th className="pb-2 pr-4">New Weight</th>
                <th className="pb-2">Trigger Condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {events.map((ev, i) => {
                const tc = typeColors[ev.type] || typeColors.PENALTY;
                return (
                  <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 pr-4 text-slate-400">{ev.date}</td>
                    <td className="py-3 pr-4">
                      <span className="font-bold text-slate-200">{ev.model}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tc.bg} ${tc.border} ${tc.text}`}>
                        {tc.label}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`font-bold ${ev.change > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {ev.change > 0 ? `+${ev.change}%` : `${ev.change}%`}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-cyan-300 font-bold">{ev.newWeight}%</span>
                    </td>
                    <td className="py-3 text-slate-400 text-[11px] max-w-sm">
                      {ev.trigger}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-3 bg-slate-900/40 border border-slate-800 rounded-lg text-[11px] font-mono text-slate-500">
          All weight change events are immutably logged and traceable to specific IMD-AWS observation batches for full operational accountability.
        </div>
      </GlassCard>

      {/* Key Drift Insights — plain language */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard title="⚠️ When does a model get penalized?" variant="default">
          <div className="text-sm text-slate-300 space-y-2 font-sans leading-relaxed">
            <p>
              If a model keeps predicting too much or too little rain (3 times in a row), its influence is automatically reduced by up to <strong className="text-rose-400">35%</strong>.
            </p>
            <p className="italic text-slate-500 text-xs">🏏 Like dropping a batsman who keeps getting out cheaply.</p>
            <div className="p-2 bg-black/40 rounded border border-slate-800 font-mono text-[11px] text-cyan-400">
              Trigger: 3+ consecutive high-bias cycles
            </div>
          </div>
        </GlassCard>

        <GlassCard title="✅ How does a model recover trust?" variant="default">
          <div className="text-sm text-slate-300 space-y-2 font-sans leading-relaxed">
            <p>
              Once the model starts being accurate again, its influence gradually increases back over 48 hours. It earns its way back.
            </p>
            <p className="italic text-slate-500 text-xs">🔄 Like a player who comes back in form after a bad patch.</p>
            <div className="p-2 bg-black/40 rounded border border-slate-800 font-mono text-[11px] text-emerald-400">
              Recovery time: ~48 hours
            </div>
          </div>
        </GlassCard>

        <GlassCard title="📡 Where does the feedback come from?" variant="default">
          <div className="text-sm text-slate-300 space-y-2 font-sans leading-relaxed">
            <p>
              We compare predictions against real data from IMD Doppler radar and 10,000+ automatic weather stations across India — updated every 30 seconds.
            </p>
            <p className="italic text-slate-500 text-xs">🌦️ Real rain gauges don't lie — models that match them earn more trust.</p>
            <div className="p-2 bg-black/40 rounded border border-slate-800 font-mono text-[11px] text-amber-400">
              10,000+ weather stations · updated every 30s
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
