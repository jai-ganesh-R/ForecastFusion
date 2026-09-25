import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MODEL_COLORS = {
  ecmwf:     { color: '#00e676', name: 'ECMWF-HRES' },
  gfs:       { color: '#ff3b5c', name: 'GFS-FV3' },
  ncum:      { color: '#ffb020', name: 'NCUM-IMD' },
  openmeteo: { color: '#00e5ff', name: 'Open-Meteo' }
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0];
    return (
      <div className="bg-[#0d1424] border border-slate-700 rounded-lg p-2.5 text-xs font-mono shadow-lg">
        <div className="font-bold text-white mb-1">{d.name}</div>
        <div className="text-cyan-400 font-bold">{d.value}% weight</div>
      </div>
    );
  }
  return null;
};

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.07) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold" fontFamily="monospace">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const ModelWeightPie = ({ weights }) => {
  const data = Object.entries(weights).map(([key, val]) => ({
    name: MODEL_COLORS[key]?.name || key,
    value: val,
    color: MODEL_COLORS[key]?.color || '#888'
  }));

  return (
    <div className="w-full h-52 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            {data.map((d, i) => (
              <filter key={i} id={`glow-${i}`}>
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={<CustomLabel />}
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                style={{ filter: `drop-shadow(0 0 6px ${entry.color}80)` }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'monospace' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center mt-[-22px]">
          <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">Blend</div>
          <div className="text-[9px] font-mono text-cyan-400">Weights</div>
        </div>
      </div>
    </div>
  );
};
