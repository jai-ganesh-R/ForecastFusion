import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Layers,
  ArrowRight,
  Activity,
  BrainCircuit,
  Sparkles,
  TrendingUp,
  Wind,
  Flame,
  CloudRain,
  Globe,
  Cpu,
  Database,
  Zap
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { LiveTicker } from '../components/ui/LiveTicker';
import { REGIONS } from '../data/mockRegions';

// Animated counter hook
function useCounter(target, duration = 1800, start = 0) {
  const [value, setValue] = useState(start);
  const raf = useRef(null);
  useEffect(() => {
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + (target - start) * eased));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  return value;
}

const StatCounter = ({ value, suffix = '', prefix = '', decimals = 0, label, color = 'text-cyan-400' }) => {
  const num = useCounter(value, 2000);
  return (
    <div className="text-center p-4">
      <div className={`font-orbitron font-extrabold text-3xl ${color}`}>
        {prefix}{decimals ? num.toFixed(decimals) : num.toLocaleString()}{suffix}
      </div>
      <div className="text-[11px] font-mono text-slate-400 mt-1 uppercase tracking-widest">{label}</div>
    </div>
  );
};

const MODELS = [
  {
    key: 'ecmwf',
    name: 'ECMWF-HRES 9km',
    org: 'European Centre for Medium-Range Weather Forecasts',
    color: '#00e676',
    bias: 'Superior 5-day synoptic accuracy; slight wet bias in orographic terrain',
    icon: '🇪🇺'
  },
  {
    key: 'gfs',
    name: 'NOAA GFS-FV3 13km',
    org: 'National Oceanic & Atmospheric Administration, USA',
    color: '#ff3b5c',
    bias: 'Rapid convective initialization; over-predicts coastal wind gusts',
    icon: '🇺🇸'
  },
  {
    key: 'ncum',
    name: 'NCUM-IMD 12km',
    org: 'India Meteorological Dept / NCMRWF',
    color: '#ffb020',
    bias: 'Optimal subcontinental boundary layer physics; delayed heavy rainfall onset',
    icon: '🇮🇳'
  },
  {
    key: 'openmeteo',
    name: 'Open-Meteo Ensemble',
    org: 'Open-Meteo Multi-Model Reanalysis',
    color: '#00e5ff',
    bias: 'Ultra-fast high-res interpolation; slight thermal damping in urban microclimates',
    icon: '🌐'
  }
];

export const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-12 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Glowing Ambient Background Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />

        {/* Hackathon Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-cyan-500/40 bg-cyan-950/60 text-cyan-300 text-xs font-mono mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(0,229,255,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>SMART INDIA HACKATHON (SIH26081) — MINISTRY OF EARTH SCIENCES</span>
        </div>

        {/* Big Orbitron Headline */}
        <h1 className="font-orbitron font-extrabold text-4xl sm:text-6xl md:text-7xl tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 max-w-5xl leading-tight">
          One Forecast You Can <span className="text-cyan-400 underline decoration-cyan-500/50 decoration-wavy">Trust</span>.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl font-sans leading-relaxed">
          An explainable, self-adapting weather intelligence platform. ForecastFusion blends multiple numerical weather prediction models (ECMWF, GFS, NCUM, Open-Meteo) into a single unified forecast, explains every weighting decision, and catches model failure in real time.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-orbitron font-bold text-sm rounded-xl shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Launch Ops Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/explain-engine"
            className="flex items-center space-x-2 px-6 py-3.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs rounded-xl transition"
          >
            <BrainCircuit className="w-4 h-4 text-cyan-400" />
            <span>Explore Explainability Engine</span>
          </Link>
        </div>

        {/* Animated Stats Row */}
        <div className="mt-14 w-full grid grid-cols-2 md:grid-cols-4 gap-4 border border-slate-800/60 rounded-2xl bg-[#0a1020]/80 backdrop-blur-md divide-y md:divide-y-0 md:divide-x divide-slate-800/60">
          <StatCounter value={10}     suffix=" Zones"   label="Active Forecast Regions" color="text-cyan-400" />
          <StatCounter value={4}      suffix=" Models"  label="NWP Sources Blended"      color="text-emerald-400" />
          <StatCounter value={94}     suffix="%"        label="Avg Blended Confidence"   color="text-amber-400" />
          <StatCounter value={842109} suffix="+"        label="Records Ingested Today"   color="text-violet-400" />
        </div>

        {/* 3 Core Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full text-left">
          <GlassCard variant="glow">
            <div className="p-2.5 w-fit rounded-xl bg-gradient-to-br from-cyan-950 to-cyan-900 border border-cyan-500/40 mb-3">
              <Layers className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="font-orbitron font-bold text-base text-white">Dynamic Ensemble Blending</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Synthesizes ECMWF 9km, NOAA GFS, IMD NCUM, and Open-Meteo into an optimal consensus. Weights adapt to localized terrain and microclimates.
            </p>
            <div className="mt-3 p-2 bg-black/30 rounded font-mono text-[10px] text-cyan-400/70">
              Bayesian Model Averaging · Kalman Filter · Softmax
            </div>
          </GlassCard>

          <GlassCard variant="glow">
            <div className="p-2.5 w-fit rounded-xl bg-gradient-to-br from-violet-950 to-violet-900 border border-violet-500/40 mb-3">
              <BrainCircuit className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="font-orbitron font-bold text-base text-white">SHAP-Style Explainability</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              No black boxes. ForecastFusion details exactly why a model is trusted or demoted: recent rainfall bias, lead-time drift, or orographic tendencies.
            </p>
            <div className="mt-3 p-2 bg-black/30 rounded font-mono text-[10px] text-violet-400/70">
              Shapley Values · Attribution Vectors · What-If Sliders
            </div>
          </GlassCard>

          <GlassCard variant="glow">
            <div className="p-2.5 w-fit rounded-xl bg-gradient-to-br from-amber-950 to-amber-900 border border-amber-500/40 mb-3">
              <TrendingUp className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="font-orbitron font-bold text-base text-white">Automated Drift Detection</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Continuous 6-hour feedback loops catch model degradation early. If GFS over-predicts rainfall along the Western Ghats, weights auto-rebalance instantly.
            </p>
            <div className="mt-3 p-2 bg-black/30 rounded font-mono text-[10px] text-amber-400/70">
              2.5σ Drift Trigger · 48hr Recovery · 10k+ AWS/hr
            </div>
          </GlassCard>
        </div>

        {/* Hazard Signal Cards Row */}
        <div className="mt-8 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: CloudRain, color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-500/30', title: 'Heavy Rainfall Signal', desc: 'IMD thresholds: 64.5mm (Heavy), 115.5mm (Very Heavy). 24hr accumulation forecasting with flood risk scoring.' },
            { icon: Flame,     color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-500/30', title: 'Heatwave Risk Signal', desc: '+4.5°C departure = Heatwave, +6.4°C = Severe Heatwave. Wet bulb temperature stress index included.' },
            { icon: Wind,      color: 'text-sky-400',   bg: 'bg-sky-950/40 border-sky-500/30',   title: 'High-Wind Risk Signal', desc: '50 km/h = Squally, 65 km/h = Gale. DWR Doppler validated gust forecasts for maritime and surface transport.' }
          ].map((h, i) => {
            const Icon = h.icon;
            return (
              <div key={i} className={`p-4 rounded-xl border backdrop-blur-md ${h.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-5 h-5 ${h.color}`} />
                  <span className={`font-orbitron font-bold text-sm ${h.color}`}>{h.title}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{h.desc}</p>
              </div>
            );
          })}
        </div>

        {/* NWP Model Showcase */}
        <div className="mt-12 w-full">
          <h2 className="font-orbitron font-bold text-lg text-white mb-6 text-center">
            Four NWP Sources — One Unified Intelligence
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MODELS.map((m) => (
              <div
                key={m.key}
                className="p-4 rounded-xl border bg-[#0d1424]/80 backdrop-blur-md transition-all hover:scale-[1.02] hover:shadow-lg"
                style={{ borderColor: `${m.color}40`, boxShadow: `0 0 15px ${m.color}10` }}
              >
                <div className="text-2xl mb-2">{m.icon}</div>
                <div className="font-orbitron font-bold text-sm mb-0.5" style={{ color: m.color }}>{m.name}</div>
                <div className="text-[10px] text-slate-400 font-mono mb-2">{m.org}</div>
                <div
                  className="w-full h-0.5 rounded-full mb-2"
                  style={{ background: `linear-gradient(to right, ${m.color}, transparent)` }}
                />
                <p className="text-[11px] text-slate-400 leading-relaxed">{m.bias}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Ticker */}
      <div className="w-full">
        <LiveTicker />
      </div>
    </div>
  );
};
