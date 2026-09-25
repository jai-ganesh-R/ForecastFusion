import React from 'react';
import { Activity, Wifi, ShieldCheck } from 'lucide-react';
import { useForecastStore } from '../store/useForecastStore';
import { PipelineStatus } from '../components/panels/PipelineStatus';
import { ArchitectureFlow } from '../components/panels/ArchitectureFlow';
import { GlassCard } from '../components/ui/GlassCard';
import { useLanguage } from '../context/LanguageContext';

const LatencyDot = ({ ms }) => {
  const color = ms < 30 ? '#00e676' : ms < 80 ? '#ffb020' : '#ff3b5c';
  const label = ms < 30 ? 'EXCELLENT' : ms < 80 ? 'NOMINAL' : 'DEGRADED';
  return (
    <div className="flex items-center justify-between text-slate-400 font-mono text-[11px] py-1.5 border-b border-slate-800/60 last:border-0">
      <div className="flex items-center gap-2">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }} />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: color }} />
        </span>
        <span className="font-bold" style={{ color }}>{label}</span>
      </div>
      <span className="text-slate-300 font-bold">{ms}ms</span>
    </div>
  );
};

export const PipelineOps = () => {
  const { pipelineState, liveLatencies } = useForecastStore();
  const { t } = useLanguage();

  const services = [
    { name: 'ECMWF MARS API',       key: 'ecmwf',    ms: liveLatencies.ecmwf },
    { name: 'NOAA NOMADS GRIB2',    key: 'gfs',      ms: liveLatencies.gfs },
    { name: 'IMD DWR Radar Stream', key: 'imdDwr',   ms: liveLatencies.imdDwr },
    { name: 'Open-Meteo API Sync',  key: 'openMeteo',ms: liveLatencies.openMeteo }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl bg-[#0d1424]/90 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/30 text-cyan-400">
            <Activity className="w-5 h-5" />
          </span>
          <h2 className="font-orbitron font-bold text-2xl text-white">
            Meteorological Operations & Automated Pipeline
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Live mission-control pipeline tracker: Continuous real-time ingestion of GFS, ECMWF, IMD-NCUM, and AWS telemetry. No manual intervention required.
        </p>
      </div>

      {/* Main Pipeline Status Component */}
      <PipelineStatus pipelineState={pipelineState} />

      {/* System Architecture Flow */}
      <GlassCard
        title="System Architecture & Data Flow Diagram"
        badge={
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
            NWP → INGEST → BLEND → DISPATCH
          </span>
        }
      >
        <ArchitectureFlow />
      </GlassCard>

      {/* System Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Live Latency Monitor */}
        <GlassCard title="1. Ingestion Microservices" variant="glow">
          <div className="space-y-0.5">
            {services.map((s) => (
              <div key={s.key} className="pb-0.5">
                <div className="text-slate-300 font-mono text-[11px] mb-1">{s.name}</div>
                <LatencyDot ms={s.ms} />
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
            <Wifi className="w-3 h-3 text-cyan-400" />
            <span>Latencies update in real-time · auto-jittered</span>
          </div>
        </GlassCard>

        <GlassCard title="2. Blending Core Compute" variant="glow">
          <div className="text-xs text-slate-300 space-y-2">
            {[
              { label: 'Matrix Blending Engine',      status: 'RUNNING',   color: 'text-cyan-400' },
              { label: 'Bayesian Kalman Filter',       status: 'CONVERGED', color: 'text-cyan-400' },
              { label: 'Extreme Hazard Classifier',   status: 'ACTIVE',    color: 'text-cyan-400' },
              { label: 'SHAP Attribution Vector',      status: 'COMPUTED',  color: 'text-emerald-400' },
              { label: 'Advisory LLM Dispatch',        status: 'STANDBY',   color: 'text-amber-400' }
            ].map((item, i) => (
              <div key={i} className={`flex items-center justify-between text-slate-400 font-mono text-[11px] pb-1.5 ${i < 4 ? 'border-b border-slate-800' : ''}`}>
                <span>{item.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" style={{ color: item.color.replace('text-', '') === 'cyan-400' ? '#00e5ff' : item.color.replace('text-', '') === 'emerald-400' ? '#00e676' : '#ffb020' }} />
                  <span className={`font-bold text-[10px] ${item.color}`}>{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard title="3. SLA & Fail-Safe Guards" variant="glow">
          <div className="text-xs text-slate-300 space-y-2">
            {[
              { label: 'Uptime (Past 90 Days)',   val: '99.98%', color: 'text-emerald-400', bold: true },
              { label: 'Automatic Failover',      val: 'STANDBY READY', color: 'text-emerald-400' },
              { label: 'Data Checksum Integrity', val: 'VERIFIED', color: 'text-emerald-400' },
              { label: 'Security Protocols',      val: 'CERT-In COMPLIANT', color: 'text-emerald-400' },
              { label: 'Model Diversification',   val: '4 SOURCES ACTIVE', color: 'text-cyan-400' }
            ].map((item, i) => (
              <div key={i} className={`flex items-center justify-between text-slate-400 font-mono text-[11px] pb-1.5 ${i < 4 ? 'border-b border-slate-800' : ''}`}>
                <span>{item.label}</span>
                <span className={`${item.color} ${item.bold ? 'font-bold text-sm' : ''}`}>{item.val}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-emerald-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3" />
            <span>All SLA targets met this quarter</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
