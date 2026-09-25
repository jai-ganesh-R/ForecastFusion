import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import {
  Layers,
  Table as TableIcon,
  LineChart as ChartIcon,
  Eye,
  EyeOff,
  Copy,
  Check,
  Activity,
  ShieldCheck,
  TrendingDown,
  Info
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// Color definitions for all NWP models
const MODEL_CONFIG = {
  blended:   { key: 'blended',   name: '🎯 Blended Best', label: 'Blended Best', color: '#00e5ff', fill: '#00e5ff', strokeWidth: 3 },
  ecmwf:     { key: 'ecmwf',     name: 'ECMWF (Europe)',  label: 'ECMWF-HRES',   color: '#00e676', fill: '#00e676', strokeWidth: 1.8 },
  gfs:       { key: 'gfs',       name: 'GFS (USA)',       label: 'GFS-FV3',      color: '#ff3b5c', fill: '#ff3b5c', strokeWidth: 1.8 },
  ncum:      { key: 'ncum',      name: 'NCUM-IMD (India)',label: 'NCUM-IMD',     color: '#ffb020', fill: '#ffb020', strokeWidth: 1.8 },
  openmeteo: { key: 'openmeteo', name: 'Open-Meteo',      label: 'Open-Meteo',   color: '#38bdf8', fill: '#38bdf8', strokeWidth: 1.8 }
};

// Custom interactive tooltip
const CustomTooltip = ({ active, payload, label, activeMetric, visibleModels }) => {
  if (!active || !payload || !payload.length) return null;

  const unit = activeMetric === 'rain' ? 'mm' : activeMetric === 'temp' ? '°C' : activeMetric === 'wind' ? 'km/h' : '%';
  const rowData = payload[0]?.payload || {};

  const blendedVal = rowData[`blended${capitalize(activeMetric)}`];
  const consensus = rowData.consensus ?? 88;
  const spread = rowData[`spread${capitalize(activeMetric)}`] ?? 0;

  return (
    <div className="bg-[#0a1120]/95 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3.5 text-xs font-mono shadow-[0_8px_32px_rgba(0,0,0,0.8)] min-w-[240px] z-50">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-300">
        <span className="font-bold text-cyan-400">📅 Lead Time: {label}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
          consensus >= 88 ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' :
          consensus >= 78 ? 'bg-amber-950/80 text-amber-400 border border-amber-500/30' :
          'bg-rose-950/80 text-rose-400 border border-rose-500/30'
        }`}>
          {consensus}% Consensus
        </span>
      </div>

      {/* Blended Best Highlight */}
      {visibleModels.blended && (
        <div className="p-2 mb-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
            <span className="font-bold text-cyan-300">Blended Ensemble</span>
          </div>
          <span className="font-bold text-white text-sm">
            {blendedVal} {unit}
          </span>
        </div>
      )}

      {/* Individual Model Values with Deviations (Δ) */}
      <div className="space-y-1.5 pt-0.5">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider flex justify-between">
          <span>Model Prediction</span>
          <span>Diff (Δ from blend)</span>
        </div>

        {['ecmwf', 'gfs', 'ncum', 'openmeteo'].map(key => {
          if (!visibleModels[key]) return null;
          const conf = MODEL_CONFIG[key];
          const valKey = `${key}${key === 'openmeteo' ? 'Meteo' : ''}${capitalize(activeMetric)}`;
          // Support openMeteo capitalization
          const resolvedVal = rowData[valKey] ?? rowData[`${key}${capitalize(activeMetric)}`] ?? 0;
          const delta = Number((resolvedVal - blendedVal).toFixed(1));

          return (
            <div key={key} className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: conf.color }} />
                <span style={{ color: conf.color }}>{conf.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-200 font-bold">{resolvedVal} {unit}</span>
                <span className={`text-[10px] w-12 text-right ${
                  delta === 0 ? 'text-slate-500' : delta > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {delta > 0 ? `+${delta}` : delta === 0 ? '0.0' : `${delta}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Spread footer */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
        <span>Ensemble Spread:</span>
        <span className="text-cyan-300 font-bold">±{spread} {unit}</span>
      </div>
    </div>
  );
};

// Helper: capitalize metric key
const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

export const BlendCompareChart = ({ data, activeMetric = 'rain' }) => {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState('chart'); // 'chart' | 'table'
  const [showSpread, setShowSpread] = useState(true);
  const [copied, setCopied] = useState(false);

  // Model toggles state
  const [visibleModels, setVisibleModels] = useState({
    blended: true,
    ecmwf: true,
    gfs: true,
    ncum: true,
    openmeteo: true
  });

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-72 flex items-center justify-center text-slate-400 text-sm font-mono bg-slate-900/30 rounded-xl border border-slate-800">
        No forecast data available for this region.
      </div>
    );
  }

  const toggleModel = (key) => {
    setVisibleModels(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const showAllModels = () => {
    setVisibleModels({ blended: true, ecmwf: true, gfs: true, ncum: true, openmeteo: true });
  };

  const isolateBlended = () => {
    setVisibleModels({ blended: true, ecmwf: false, gfs: false, ncum: false, openmeteo: false });
  };

  const unitLabel = activeMetric === 'rain' ? 'mm' : activeMetric === 'temp' ? '°C' : activeMetric === 'wind' ? 'km/h' : '%';

  // Compute summary statistics across the 7-day period
  const metricKey = capitalize(activeMetric);
  const blendedKey = `blended${metricKey}`;
  const spreadKey = `spread${metricKey}`;

  const values = data.map(d => Number(d[blendedKey] || 0));
  const avgSpread = (data.reduce((s, d) => s + Number(d[spreadKey] || 0), 0) / data.length).toFixed(1);
  const avgConsensus = Math.round(data.reduce((s, d) => s + Number(d.consensus || 88), 0) / data.length);
  const peakVal = Math.max(...values);
  const sumVal = activeMetric === 'rain' ? values.reduce((a, b) => a + b, 0).toFixed(1) : null;

  // Export summary to clipboard
  const handleCopyForecast = () => {
    const lines = [
      `FORECASTFUSION 7-DAY BLENDED FORECAST MATRIX (${activeMetric.toUpperCase()} - ${unitLabel})`,
      '---------------------------------------------------------------------------------',
      `Time\tBlended\tECMWF\tGFS\tNCUM\tOpenMeteo\tConsensus\tSpread`,
      ...data.map(d => {
        const omKey = `openMeteo${metricKey}`;
        return `${d.time}\t${d[blendedKey]}\t${d[`ecmwf${metricKey}`]}\t${d[`gfs${metricKey}`]}\t${d[`ncum${metricKey}`]}\t${d[omKey]}\t${d.consensus}%\t±${d[spreadKey]} ${unitLabel}`;
      })
    ].join('\n');

    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3 min-w-0">
      {/* ── Top Control Strip: Model Toggles + Views ──────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
        {/* Model Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase mr-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-400" /> Models:
          </span>

          {Object.entries(MODEL_CONFIG).map(([k, cfg]) => {
            const isVis = visibleModels[k];
            return (
              <button
                key={k}
                onClick={() => toggleModel(k)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all border ${
                  isVis
                    ? 'border-opacity-60 bg-slate-800/90 text-white shadow-sm'
                    : 'border-slate-800 bg-slate-950/40 text-slate-500 opacity-60 hover:opacity-100'
                }`}
                style={{
                  borderColor: isVis ? cfg.color : '#1e293b',
                  boxShadow: isVis ? `0 0 8px ${cfg.color}30` : 'none'
                }}
                title={`Toggle ${cfg.name}`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: cfg.color, opacity: isVis ? 1 : 0.4 }}
                />
                <span>{cfg.label}</span>
                {isVis ? <Eye className="w-2.5 h-2.5 opacity-60" /> : <EyeOff className="w-2.5 h-2.5 opacity-40" />}
              </button>
            );
          })}

          <div className="flex items-center gap-1 ml-1 text-[10px] font-mono text-slate-400">
            <button
              onClick={showAllModels}
              className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 transition"
            >
              All
            </button>
            <span>/</span>
            <button
              onClick={isolateBlended}
              className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              Anchor Only
            </button>
          </div>
        </div>

        {/* View Switches & Spread Envelope Toggle */}
        <div className="flex items-center gap-2">
          {/* Spread envelope toggle */}
          {viewMode === 'chart' && (
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-mono text-slate-300 bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800 hover:border-slate-700 transition">
              <input
                type="checkbox"
                checked={showSpread}
                onChange={e => setShowSpread(e.target.checked)}
                className="w-3 h-3 accent-cyan-500 rounded cursor-pointer"
              />
              <span className="text-[10px] text-slate-300">Spread Band</span>
            </label>
          )}

          {/* View mode toggle */}
          <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('chart')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono transition ${
                viewMode === 'chart' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ChartIcon className="w-3 h-3" /> Chart
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono transition ${
                viewMode === 'table' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3 h-3" /> Matrix
            </button>
          </div>

          {/* Copy matrix */}
          <button
            onClick={handleCopyForecast}
            className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 text-[11px] font-mono transition"
            title="Copy forecast comparison to clipboard"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* ── Key Summary Metric Ribbon ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block uppercase">
            {activeMetric === 'rain' ? '7-Day Total Rain' : 'Peak Value'}
          </span>
          <span className="text-cyan-400 font-bold text-sm">
            {activeMetric === 'rain' ? `${sumVal} mm` : `${peakVal} ${unitLabel}`}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block uppercase">Model Consensus</span>
          <span className="text-emerald-400 font-bold text-sm flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 inline" /> {avgConsensus}% High
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block uppercase">Avg Spread (±)</span>
          <span className="text-amber-400 font-bold text-sm">±{avgSpread} {unitLabel}</span>
        </div>

        <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block uppercase">Ensemble Anchor</span>
          <span className="text-sky-300 font-bold text-sm truncate block">
            {data[0]?.leadModelMatch || 'ECMWF'} Leads
          </span>
        </div>
      </div>

      {/* ── Main View: Chart or Matrix ────────────────────────────────── */}
      {viewMode === 'chart' ? (
        <div className="w-full h-80 min-w-0 relative">
          <ResponsiveContainer width="100%" height={320} minWidth={0} minHeight={260}>
            <ComposedChart data={data} margin={{ top: 12, right: 16, bottom: 4, left: -8 }}>
              <defs>
                {/* Blended Rain Bar Gradient */}
                <linearGradient id="blendedRainGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.9} />
                  <stop offset="90%" stopColor="#0284c7" stopOpacity={0.3} />
                </linearGradient>

                {/* Uncertainty Spread Shading */}
                <linearGradient id="spreadAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.16} />
                  <stop offset="95%" stopColor="#00e5ff" stopOpacity={0.03} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />

              <XAxis
                dataKey="time"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                label={{ value: 'Forecast Lead Time →', position: 'insideBottomRight', fill: '#475569', fontSize: 10, dy: 10 }}
              />

              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                unit={` ${unitLabel}`}
                domain={
                  activeMetric === 'rain'
                    ? [0, dataMax => Math.max(8, Math.ceil(dataMax * 1.15))]
                    : activeMetric === 'temp'
                    ? ['dataMin - 2', 'dataMax + 2']
                    : [0, 'auto']
                }
              />

              <Tooltip
                content={<CustomTooltip activeMetric={activeMetric} visibleModels={visibleModels} />}
              />

              <Legend
                verticalAlign="top"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontFamily: 'monospace' }}
              />

              {/* 1. Optional Uncertainty Spread Area Band */}
              {showSpread && (
                <Area
                  type="monotone"
                  dataKey={`max${metricKey}`}
                  name="Ensemble Uncertainty Band"
                  stroke="none"
                  fill="url(#spreadAreaGrad)"
                  legendType="none"
                />
              )}

              {/* 2. RAINFALL METRIC */}
              {activeMetric === 'rain' && (
                <>
                  {visibleModels.blended && (
                    <Bar
                      dataKey="blendedRain"
                      name="🎯 Blended Best (mm)"
                      fill="url(#blendedRainGrad)"
                      radius={[4, 4, 0, 0]}
                      barSize={24}
                    />
                  )}
                  {visibleModels.ecmwf && (
                    <Line type="monotone" dataKey="ecmwfRain" name="ECMWF (Europe)" stroke="#00e676" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3" />
                  )}
                  {visibleModels.gfs && (
                    <Line type="monotone" dataKey="gfsRain" name="GFS-FV3 (USA)" stroke="#ff3b5c" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3" />
                  )}
                  {visibleModels.ncum && (
                    <Line type="monotone" dataKey="ncumRain" name="NCUM-IMD (India)" stroke="#ffb020" strokeWidth={1.8} dot={{ r: 2.5 }} strokeDasharray="4 4" />
                  )}
                  {visibleModels.openmeteo && (
                    <Line type="monotone" dataKey="openMeteoRain" name="Open-Meteo" stroke="#38bdf8" strokeWidth={1.8} dot={{ r: 2.5 }} strokeDasharray="3 3" />
                  )}
                </>
              )}

              {/* 3. TEMPERATURE METRIC */}
              {activeMetric === 'temp' && (
                <>
                  {visibleModels.blended && (
                    <Line type="monotone" dataKey="blendedTemp" name="🎯 Blended Best (°C)" stroke="#00e5ff" strokeWidth={3.5} dot={{ r: 4, fill: '#00e5ff' }} />
                  )}
                  {visibleModels.ecmwf && (
                    <Line type="monotone" dataKey="ecmwfTemp" name="ECMWF (Europe)" stroke="#00e676" strokeWidth={1.8} dot={{ r: 2.5 }} strokeDasharray="5 3" />
                  )}
                  {visibleModels.gfs && (
                    <Line type="monotone" dataKey="gfsTemp" name="GFS-FV3 (USA)" stroke="#ff3b5c" strokeWidth={1.8} dot={{ r: 2.5 }} strokeDasharray="5 3" />
                  )}
                  {visibleModels.ncum && (
                    <Line type="monotone" dataKey="ncumTemp" name="NCUM-IMD (India)" stroke="#ffb020" strokeWidth={1.8} dot={{ r: 2.5 }} strokeDasharray="4 4" />
                  )}
                  {visibleModels.openmeteo && (
                    <Line type="monotone" dataKey="openMeteoTemp" name="Open-Meteo" stroke="#38bdf8" strokeWidth={1.8} dot={{ r: 2.5 }} strokeDasharray="3 3" />
                  )}
                </>
              )}

              {/* 4. WIND SPEED METRIC */}
              {activeMetric === 'wind' && (
                <>
                  {visibleModels.blended && (
                    <Line type="monotone" dataKey="blendedWind" name="🎯 Blended Best (km/h)" stroke="#a78bfa" strokeWidth={3.5} dot={{ r: 4, fill: '#a78bfa' }} />
                  )}
                  {visibleModels.ecmwf && (
                    <Line type="monotone" dataKey="ecmwfWind" name="ECMWF (Europe)" stroke="#00e676" strokeWidth={1.8} dot={{ r: 2.5 }} strokeDasharray="5 3" />
                  )}
                  {visibleModels.gfs && (
                    <Line type="monotone" dataKey="gfsWind" name="GFS-FV3 (USA)" stroke="#ff3b5c" strokeWidth={1.8} dot={{ r: 2.5 }} strokeDasharray="5 3" />
                  )}
                  {visibleModels.ncum && (
                    <Line type="monotone" dataKey="ncumWind" name="NCUM-IMD (India)" stroke="#ffb020" strokeWidth={1.8} dot={{ r: 2.5 }} strokeDasharray="4 4" />
                  )}
                  {visibleModels.openmeteo && (
                    <Line type="monotone" dataKey="openMeteoWind" name="Open-Meteo" stroke="#38bdf8" strokeWidth={1.8} dot={{ r: 2.5 }} strokeDasharray="3 3" />
                  )}
                </>
              )}

              {/* 5. RELATIVE HUMIDITY METRIC */}
              {activeMetric === 'rh' && (
                <>
                  {visibleModels.blended && (
                    <Line type="monotone" dataKey="blendedRh" name="🎯 Blended Best (%RH)" stroke="#38bdf8" strokeWidth={3.5} dot={{ r: 4, fill: '#38bdf8' }} />
                  )}
                  {visibleModels.ecmwf && (
                    <Line type="monotone" dataKey="ecmwfRh" name="ECMWF (Europe)" stroke="#00e676" strokeWidth={1.8} dot={{ r: 2.5 }} strokeDasharray="5 3" />
                  )}
                  {visibleModels.gfs && (
                    <Line type="monotone" dataKey="gfsRh" name="GFS-FV3 (USA)" stroke="#ff3b5c" strokeWidth={1.8} dot={{ r: 2.5 }} strokeDasharray="5 3" />
                  )}
                  {visibleModels.ncum && (
                    <Line type="monotone" dataKey="ncumRh" name="NCUM-IMD (India)" stroke="#ffb020" strokeWidth={1.8} dot={{ r: 2.5 }} strokeDasharray="4 4" />
                  )}
                  {visibleModels.openmeteo && (
                    <Line type="monotone" dataKey="openMeteoRh" name="Open-Meteo" stroke="#a78bfa" strokeWidth={1.8} dot={{ r: 2.5 }} strokeDasharray="3 3" />
                  )}
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        /* ── Comparison Matrix Table View ────────────────────────────── */
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#080d19]/80 backdrop-blur-md">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase bg-black/40">
                <th className="py-2.5 px-3">Lead Time</th>
                <th className="py-2.5 px-3 text-cyan-400 font-bold">🎯 Blended Best</th>
                <th className="py-2.5 px-3 text-emerald-400">ECMWF (EU)</th>
                <th className="py-2.5 px-3 text-rose-400">GFS (US)</th>
                <th className="py-2.5 px-3 text-amber-400">NCUM (IMD)</th>
                <th className="py-2.5 px-3 text-sky-400">Open-Meteo</th>
                <th className="py-2.5 px-3 text-slate-300">Spread (±)</th>
                <th className="py-2.5 px-3 text-slate-300">Consensus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.map((row, idx) => {
                const omValKey = `openMeteo${metricKey}`;
                const spreadVal = row[`spread${metricKey}`];
                const consensus = row.consensus;

                return (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-300">{row.time}</td>
                    <td className="py-2.5 px-3 font-bold text-cyan-300 bg-cyan-950/20">
                      {row[blendedKey]} {unitLabel}
                    </td>
                    <td className="py-2.5 px-3 text-slate-200">
                      {row[`ecmwf${metricKey}`]} {unitLabel}
                    </td>
                    <td className="py-2.5 px-3 text-slate-200">
                      {row[`gfs${metricKey}`]} {unitLabel}
                    </td>
                    <td className="py-2.5 px-3 text-slate-200">
                      {row[`ncum${metricKey}`]} {unitLabel}
                    </td>
                    <td className="py-2.5 px-3 text-slate-200">
                      {row[omValKey]} {unitLabel}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-amber-400">
                      ±{spreadVal} {unitLabel}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        consensus >= 88
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                          : consensus >= 78
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                      }`}>
                        {consensus}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Bottom Legend & Explainer ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-[0_0_6px_#00e5ff]" />
            <strong className="text-cyan-300">Blended Ensemble</strong> (Weighted synthesis)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 border-t-2 border-[#00e676] border-dashed" />
            <span className="text-[#00e676]">ECMWF</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 border-t-2 border-[#ff3b5c] border-dashed" />
            <span className="text-[#ff3b5c]">GFS-FV3</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 border-t-2 border-[#ffb020] border-dashed" />
            <span className="text-[#ffb020]">NCUM-IMD</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 border-t-2 border-[#38bdf8] border-dashed" />
            <span className="text-[#38bdf8]">Open-Meteo</span>
          </span>
        </div>

        <div className="text-[10px] text-slate-500 flex items-center gap-1">
          <Info className="w-3 h-3 text-cyan-400" />
          <span>Click any model chip above to isolate or compare predictions</span>
        </div>
      </div>
    </div>
  );
};
