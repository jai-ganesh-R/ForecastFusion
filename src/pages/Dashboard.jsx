import React, { useState, useEffect } from 'react';
import { MapPin, SlidersHorizontal, RefreshCw, Globe, Sparkles, AlertTriangle } from 'lucide-react';
import { useForecastStore } from '../store/useForecastStore';
import { CitizenDashboard } from '../components/citizen/CitizenDashboard';
import { IndiaMap } from '../components/map/IndiaMap';
import { BlendCompareChart } from '../components/charts/BlendCompareChart';
import { SkillMetricChart } from '../components/charts/SkillMetricChart';
import { ModelWeightPie } from '../components/charts/ModelWeightPie';
import { SignalPanels } from '../components/panels/SignalPanels';
import { DriftAlertStrip } from '../components/panels/DriftAlertStrip';
import { GlassCard } from '../components/ui/GlassCard';
import { REGIONS } from '../data/mockRegions';
import { useLanguage } from '../context/LanguageContext';

export const Dashboard = () => {
  const {
    selectedRegionId, setSelectedRegion,
    getCurrentRegion, getCurrentForecasts,
    getCurrentWeightsData, getCurrentWeights,
    getCurrentSignals, getCurrentSkillMetrics,
    whatIfWeights, clearWhatIfWeights,
    isLiveMode, toggleLiveMode, fetchLiveForecast,
    isFetchingLive, lastFetchedAt, liveLatencies,
    viewMode, setViewMode,
    isStormStressTestActive, toggleStormStressTest
  } = useForecastStore();
  const { t } = useLanguage();

  const [activeMetric, setActiveMetric] = useState('rain');

  // Trigger live fetch on initial mount
  useEffect(() => {
    if (isLiveMode) {
      fetchLiveForecast(selectedRegionId);
    }
  }, [selectedRegionId, isLiveMode, fetchLiveForecast]);

  // If in Citizen Mode, render the clean, accessible, voice-enabled citizen view!
  if (viewMode === 'citizen') {
    return <CitizenDashboard />;
  }

  const currentRegion  = getCurrentRegion();
  const forecasts      = getCurrentForecasts();
  const weightsData    = getCurrentWeightsData();
  const activeWeights  = getCurrentWeights();
  const signals        = getCurrentSignals();
  const skillMetrics   = getCurrentSkillMetrics();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Return to Citizen Mode Ribbon */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-xs font-mono">
        <div className="flex items-center gap-2 text-cyan-300">
          <span className="p-1 rounded bg-cyan-500/20 text-cyan-400">🔬</span>
          <span><strong>SCIENTIST / PRO MODE ACTIVE:</strong> Showing deep NWP ensemble curves, Kalman filter attributions, and GRIB2 telemetry.</span>
        </div>
        <button
          onClick={() => setViewMode('citizen')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition text-[11px] shadow shrink-0"
        >
          <span>🌱 Switch to Simple Citizen Mode</span>
        </button>
      </div>

      {/* Synthetic Cloudburst Stress-Test Banner */}
      {isStormStressTestActive && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-rose-950/70 border-2 border-rose-500 text-rose-100 text-xs font-mono backdrop-blur-md shadow-[0_0_25px_rgba(244,63,94,0.35)] animate-pulse">
          <div className="flex items-center gap-3">
            <span className="p-1.5 rounded-lg bg-rose-500/30 text-rose-300 font-bold text-lg">🚨</span>
            <div>
              <div className="font-bold text-sm tracking-wide text-rose-200">
                SYNTHETIC CLOUDBURST STRESS-TEST ACTIVE ({currentRegion.name.toUpperCase()})
              </div>
              <div className="text-rose-300/90 text-[11px] mt-0.5">
                Simulating extreme 248.5 mm deluge &gt; 204.4 mm IMD Red Alert threshold with 88 km/h squalls. Multi-model Bayesian spread widening active.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleStormStressTest}
              className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold transition text-xs shadow-md"
            >
              Exit Stress Test
            </button>
          </div>
        </div>
      )}
      {/* What-If Active Banner */}
      {whatIfWeights && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs font-mono backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-500/20 text-amber-400 font-bold">⚡</span>
            <span>
              <strong>CUSTOM WHAT-IF WEIGHTS ACTIVE:</strong> ECMWF: {whatIfWeights.ecmwf}%, GFS: {whatIfWeights.gfs}%, NCUM: {whatIfWeights.ncum}%, Open-Meteo: {whatIfWeights.openmeteo}%. The forecast chart below is dynamically calculating based on this experiment.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={clearWhatIfWeights}
              className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold transition text-[11px] shadow"
            >
              Reset to Live Weights
            </button>
          </div>
        </div>
      )}

      {/* Hero Metric & Regional Forecast Spotlight */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200/80 dark:border-white/10">
          {/* Left: Oversized Hero Temperature & Primary Condition */}
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 sm:gap-8">
            <div className="flex items-baseline">
              <span className="font-orbitron font-medium text-6xl sm:text-7xl tracking-tighter text-slate-900 dark:text-slate-100">
                {forecasts[0]?.blendedTemp || 28.5}°
              </span>
              <span className="text-2xl font-mono text-cyan-600 dark:text-cyan-400 ml-1">C</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="font-orbitron font-bold text-xl text-slate-900 dark:text-slate-100">
                  {currentRegion.name}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 font-mono border border-cyan-500/30">
                  {currentRegion.state}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
                {currentRegion.terrain} · {currentRegion.monsoonPhase} · Lead: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{currentRegion.leadModel}</span>
              </p>
            </div>
          </div>

          {/* Right: Quick Region Selector + Consensus Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300/80 dark:border-white/10 bg-slate-100 dark:bg-white/5">
              <label className="text-[11px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('forecast_zone')}:</label>
              <select
                value={selectedRegionId}
                onChange={e => setSelectedRegion(e.target.value)}
                className="bg-transparent text-cyan-700 dark:text-cyan-400 text-xs font-mono font-bold focus:outline-none cursor-pointer"
              >
                {REGIONS.map(r => (
                  <option key={r.id} value={r.id} className="bg-slate-900 text-slate-100">
                    {r.name} ({r.baseConfidence}% {t('confidence')})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-mono sheen-badge">
              <span>CONSENSUS:</span>
              <span className="font-bold">{forecasts[0]?.consensus || currentRegion.baseConfidence}%</span>
            </div>

            {/* Synthetic Storm / Cloudburst Stress-Test Toggle */}
            <button
              onClick={toggleStormStressTest}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all shadow ${
                isStormStressTestActive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-400 animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.5)]'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
              }`}
              title="Simulate sudden extreme cloudburst event (>204.4mm) to evaluate automated red alerts and Bayesian spread response"
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${isStormStressTestActive ? 'text-white' : 'text-rose-500'}`} />
              <span>{isStormStressTestActive ? '🔴 CLOUDBURST INJECTED' : '⚡ Stress-Test Storm'}</span>
            </button>
          </div>
        </div>

        {/* 7-Day Frosted Forecast Strip */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {forecasts.slice(0, 7).map((day, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border transition-all text-center flex flex-col justify-between ${
                idx === 0
                  ? 'border-cyan-500/50 bg-cyan-50 dark:bg-cyan-500/10 shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                  : 'border-slate-200 dark:border-white/5 bg-slate-100/70 dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 block">{day.time}</span>
              <span className="font-orbitron font-bold text-lg text-slate-900 dark:text-slate-100 my-1 block">
                {day.blendedTemp}°
              </span>
              <div className="text-[10px] font-mono flex items-center justify-center gap-1 text-cyan-700 dark:text-cyan-400 font-semibold">
                <span>🌧️</span>
                <span>{day.blendedRain}mm</span>
              </div>
            </div>
          ))}
        </div>

        {/* Live Stream Telemetry Footer */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2.5">
            <span className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span className="font-bold text-slate-800 dark:text-slate-300">
              {isLiveMode ? 'REAL-TIME 4-MODEL INGESTION' : 'SIMULATED BASELINE'}
            </span>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="hidden sm:inline">ECMWF (0.25°) · GFS · NCUM-IMD · Open-Meteo</span>
            {lastFetchedAt && isLiveMode && (
              <span className="text-[10px] text-slate-500 hidden md:inline">({lastFetchedAt})</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isLiveMode && (
              <button
                onClick={() => fetchLiveForecast(selectedRegionId)}
                disabled={isFetchingLive}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-white/10 hover:border-cyan-500/40 text-cyan-700 dark:text-cyan-400 bg-white dark:bg-white/5 text-[11px] transition shadow-sm"
              >
                <RefreshCw className={`w-3 h-3 ${isFetchingLive ? 'animate-spin' : ''}`} />
                <span>{isFetchingLive ? 'Syncing...' : 'Refresh'}</span>
              </button>
            )}
            <button
              onClick={toggleLiveMode}
              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-white/10 text-[11px] hover:border-cyan-500/40 transition bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 shadow-sm"
            >
              {isLiveMode ? 'Live Mode: ON' : 'Live Mode: OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Drift alert */}
      <DriftAlertStrip driftAlert={weightsData.driftAlert} />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Map + Weight pie */}
        <div className="lg:col-span-5 min-w-0 space-y-4">
          <GlassCard
            title={t('map_title')}
            badge={<span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">10 ZONES</span>}
          >
            <IndiaMap onSelectRegion={id => setSelectedRegion(id)} />
            <div className="mt-2 text-[11px] font-mono text-slate-500 text-center">{t('click_region')}</div>
          </GlassCard>

          <GlassCard
            title="Live Model Trust Distribution"
            badge={<span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">BAYESIAN SOFTMAX</span>}
          >
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans mb-3 leading-relaxed">
              This pie shows how much we trust each weather model right now for <strong className="text-slate-800 dark:text-slate-200">{currentRegion.name}</strong>.
              Bigger slice = more accurate recently = more influence on your forecast.
            </p>
            <ModelWeightPie weights={activeWeights} />
            <div className="mt-3 space-y-2">
              {Object.entries(activeWeights).map(([key, val]) => {
                const colorMap = { ecmwf: '#00e676', gfs: '#ff3b5c', ncum: '#ffb020', openmeteo: '#00e5ff' };
                const nameMap  = { ecmwf: 'ECMWF (Europe)', gfs: 'GFS (USA)', ncum: 'NCUM-IMD (India)', openmeteo: 'Open-Meteo' };
                const color = colorMap[key] || '#888';
                return (
                  <div key={key} className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="w-24 text-slate-600 dark:text-slate-400 truncate">{nameMap[key]}</span>
                    <div className="flex-1 bg-slate-200 dark:bg-slate-800/60 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${val}%`, backgroundColor: color, boxShadow: `0 0 6px ${color}80` }} />
                    </div>
                    <span className="w-10 text-right font-bold" style={{ color }}>{val}%</span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Right: Chart + signals */}
        <div className="lg:col-span-7 min-w-0 space-y-4">
          <GlassCard
            title={t('chart_title')}
            badge={<span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">7-DAY FORECAST</span>}
            headerAction={
              <div className="flex bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl p-0.5 text-xs font-mono">
                {[
                  { key: 'rain', label: t('rain') },
                  { key: 'temp', label: t('temperature') },
                  { key: 'wind', label: t('wind') },
                  { key: 'rh',   label: 'Humidity' },
                ].map(m => (
                  <button
                    key={m.key}
                    onClick={() => setActiveMetric(m.key)}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      activeMetric === m.key
                        ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            }
          >
            <BlendCompareChart data={forecasts} activeMetric={activeMetric} />
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-200 dark:border-white/10 text-xs font-mono">
              <div className="bg-slate-100/70 dark:bg-white/5 p-2.5 rounded-xl border border-slate-200/80 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] block">{t('confidence')}</span>
                <span className="text-cyan-700 dark:text-cyan-400 font-bold text-sm">{currentRegion.baseConfidence}%</span>
              </div>
              <div className="bg-slate-100/70 dark:bg-white/5 p-2.5 rounded-xl border border-slate-200/80 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] block">TOP MODEL</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">{currentRegion.leadModel.split('-')[0]}</span>
              </div>
              <div className="bg-slate-100/70 dark:bg-white/5 p-2.5 rounded-xl border border-slate-200/80 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] block">KALMAN λ</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold text-sm">0.85</span>
              </div>
              <div className="bg-slate-100/70 dark:bg-white/5 p-2.5 rounded-xl border border-slate-200/80 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] block">SENSORS</span>
                <span className="text-cyan-800 dark:text-cyan-300 font-bold text-sm">{currentRegion.activeSensors}</span>
              </div>
            </div>
          </GlassCard>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-orbitron font-bold text-sm tracking-wide text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                {t('hazard_rain')} · {t('hazard_heat')} · {t('hazard_wind')}
              </h3>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">IMD Thresholds</span>
            </div>
            <SignalPanels signals={signals} />
          </div>
        </div>
      </div>

      {/* Skill verification */}
      <GlassCard
        title="Historical Accuracy: Blended vs Individual Models (15-day)"
        badge={<span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">LOWER ERROR = BETTER</span>}
      >
        <p className="text-xs text-slate-600 dark:text-slate-400 font-sans mb-3 leading-relaxed">
          This chart shows how our blended forecast compares to using just one model. Lower bars for Rainfall/Temperature/Wind Error = more accurate. Higher bar for Threat Score = better at catching dangerous events.
        </p>
        <SkillMetricChart data={skillMetrics} />
        <div className="mt-4 p-3 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/20 rounded-lg text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
          <strong className="text-cyan-700 dark:text-cyan-400">Result:</strong> Blending reduces forecast errors by <strong>48–62%</strong> compared to any single model — because no single model is always right.
        </div>
      </GlassCard>
    </div>
  );
};
