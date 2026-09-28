import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

const CustomTimelineTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-[#0d1424]/95 backdrop-blur-xl border border-slate-300 dark:border-white/10 rounded-xl p-3 text-xs font-mono shadow-2xl">
        <div className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">{label}</div>
        <div className="space-y-1">
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{entry.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const WeightTimelineChart = ({ data }) => {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="ecmwfGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00e676" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#00e676" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="gfsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff3b5c" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ff3b5c" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="ncumGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ffb020" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ffb020" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="omGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#00e5ff" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
          <XAxis 
            dataKey="day" 
            stroke="#64748b" 
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} 
          />
          <YAxis 
            stroke="#64748b" 
            tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} 
            unit="%"
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTimelineTooltip />} />
          <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }} />
          <Area 
            type="monotone" 
            dataKey="ecmwf" 
            name="ECMWF-HRES" 
            stackId="1" 
            stroke="#00e676" 
            fill="url(#ecmwfGrad)" 
          />
          <Area 
            type="monotone" 
            dataKey="gfs" 
            name="NOAA GFS-FV3" 
            stackId="1" 
            stroke="#ff3b5c" 
            fill="url(#gfsGrad)" 
          />
          <Area 
            type="monotone" 
            dataKey="ncum" 
            name="NCUM-IMD" 
            stackId="1" 
            stroke="#ffb020" 
            fill="url(#ncumGrad)" 
          />
          <Area 
            type="monotone" 
            dataKey="openmeteo" 
            name="Open-Meteo" 
            stackId="1" 
            stroke="#00e5ff" 
            fill="url(#omGrad)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
