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
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
          <XAxis 
            dataKey="day" 
            stroke="#64748b" 
            tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} 
          />
          <YAxis 
            stroke="#64748b" 
            tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} 
            unit="%"
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0d1424', 
              borderColor: '#38bdf8', 
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
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
