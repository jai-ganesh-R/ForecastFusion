import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

const COLORS = {
  Blended:       '#00e5ff',
  'ECMWF-HRES':  '#00e676',
  'GFS-FV3':     '#ff3b5c',
  'NCUM-IMD':    '#ffb020'
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d1424] border border-slate-700 rounded-lg p-3 text-xs font-mono shadow-lg min-w-[180px]">
        <div className="font-bold text-slate-200 mb-2 border-b border-slate-800 pb-1.5">{label}</div>
        {payload.map((p) => (
          <div key={p.dataKey} className="flex justify-between items-center gap-4 py-0.5">
            <span style={{ color: COLORS[p.dataKey] || '#fff' }}>{p.dataKey}</span>
            <span className="font-bold" style={{ color: COLORS[p.dataKey] || '#fff' }}>
              {p.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => (
  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pb-2 text-[11px] font-mono">
    {payload.map((entry) => (
      <span key={entry.dataKey} className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: entry.color }} />
        <span style={{ color: '#94a3b8' }}>{entry.value}</span>
      </span>
    ))}
  </div>
);

export const SkillMetricChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  // Split into two sub-charts: error metrics (lower is better) and ETS (higher is better)
  const errorMetrics = data.filter(d => d.unit.includes('lower'));
  const skillMetrics = data.filter(d => d.unit.includes('higher'));

  const renderChart = (chartData, title, isLowerBetter) => (
    <div className="space-y-1">
      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${isLowerBetter ? 'bg-rose-400' : 'bg-emerald-400'}`} />
        {title}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{ top: 8, right: 20, bottom: 4, left: -10 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" opacity={0.6} vertical={false} />
          <XAxis
            dataKey="metric"
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Legend content={<CustomLegend />} />
          <Bar dataKey="Blended"      name="Blended"      fill={COLORS['Blended']}      radius={[3,3,0,0]} barSize={14}
            style={{ filter: 'drop-shadow(0 0 5px rgba(0,229,255,0.5))' }}
          />
          <Bar dataKey="ECMWF-HRES"  name="ECMWF-HRES"  fill={COLORS['ECMWF-HRES']}  radius={[3,3,0,0]} barSize={14} />
          <Bar dataKey="GFS-FV3"     name="GFS-FV3"     fill={COLORS['GFS-FV3']}     radius={[3,3,0,0]} barSize={14} />
          <Bar dataKey="NCUM-IMD"    name="NCUM-IMD"    fill={COLORS['NCUM-IMD']}    radius={[3,3,0,0]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {renderChart(errorMetrics, "Error Metrics — Blended consistently lowest (better)", true)}
      {renderChart(skillMetrics, "Skill Score — Blended consistently highest (better)", false)}
    </div>
  );
};
