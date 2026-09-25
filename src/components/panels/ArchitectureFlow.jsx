import React from 'react';

// SVG-based pipeline data flow architecture diagram
export const ArchitectureFlow = () => {
  const nodeStyle = "fill:#0d1424 stroke:#00e5ff stroke-width:1 rx:8";
  const nodeTextStyle = { fill: '#e2e8f0', fontSize: 11, fontFamily: 'monospace', fontWeight: 600 };
  const subTextStyle = { fill: '#94a3b8', fontSize: 9, fontFamily: 'monospace' };
  const arrowStyle = { stroke: '#00e5ff', strokeWidth: 1.5, fill: 'none', strokeDasharray: '4 2' };
  const solidArrow = { stroke: '#00e676', strokeWidth: 2, fill: 'none' };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[700px]">
        <svg viewBox="0 0 900 380" className="w-full h-auto" aria-label="ForecastFusion Pipeline Architecture">
          <defs>
            <marker id="arrowCyan" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#00e5ff" />
            </marker>
            <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#00e676" />
            </marker>
            <marker id="arrowAmber" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#ffb020" />
            </marker>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id="nodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d1424" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>
          </defs>

          {/* ── LAYER 1: NWP SOURCES (left column) ── */}
          {[
            { y: 30,  label: 'ECMWF-HRES 9km', sub: 'MARS API · 00Z/12Z', color: '#00e676' },
            { y: 105, label: 'NOAA GFS-FV3',   sub: 'NOMADS GRIB2 · 4x/day', color: '#ff3b5c' },
            { y: 180, label: 'NCUM-IMD 12km',  sub: 'NCMRWF Stream · 6h', color: '#ffb020' },
            { y: 255, label: 'Open-Meteo API', sub: 'Multi-model · 1h',   color: '#00e5ff' },
          ].map((s, i) => (
            <g key={i}>
              <rect x="10" y={s.y} width="155" height="56" rx="8" fill="#0d1424"
                stroke={s.color} strokeWidth="1.2"
                style={{ filter: `drop-shadow(0 0 6px ${s.color}50)` }} />
              <text x="88" y={s.y + 22} textAnchor="middle" style={{ ...nodeTextStyle, fill: s.color }}>{s.label}</text>
              <text x="88" y={s.y + 37} textAnchor="middle" style={subTextStyle}>{s.sub}</text>
              <circle cx="18" cy={s.y + 8} r="4" fill={s.color} style={{ filter: `drop-shadow(0 0 4px ${s.color})` }}>
                <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          ))}

          {/* ── LAYER 1 → LAYER 2 Arrows ── */}
          {[58, 133, 208, 283].map((y, i) => (
            <line key={i} x1="165" y1={y} x2="218" y2={y}
              {...arrowStyle} markerEnd="url(#arrowCyan)" />
          ))}

          {/* ── LAYER 2: INGESTION & BIAS CORRECTION ── */}
          <rect x="218" y="20" width="150" height="310" rx="8" fill="#070b13"
            stroke="#1e3a5f" strokeWidth="1.2" />
          <text x="293" y="42" textAnchor="middle" style={{ ...nodeTextStyle, fill: '#64748b', fontSize: 9 }}>INGESTION & BIAS</text>

          {[
            { y: 50, label: 'GRIB2 Parser', sub: 'Regrid → 0.1° WGS84' },
            { y: 110, label: 'Bias Correction β_m', sub: 'Orographic tensor (10yr)' },
            { y: 170, label: 'Quality Control', sub: 'AWS checksum verify' },
            { y: 230, label: 'Anomaly Detector', sub: '2.5σ drift flagging' },
          ].map((n, i) => (
            <g key={i}>
              <rect x="226" y={n.y} width="134" height="48" rx="6" fill="#0a1628"
                stroke="#1e3a5f" strokeWidth="1" />
              <text x="293" y={n.y + 18} textAnchor="middle" style={{ ...nodeTextStyle, fontSize: 10, fill: '#cbd5e1' }}>{n.label}</text>
              <text x="293" y={n.y + 32} textAnchor="middle" style={subTextStyle}>{n.sub}</text>
            </g>
          ))}

          {/* ── LAYER 2 → LAYER 3 Arrow ── */}
          <line x1="360" y1="175" x2="413" y2="175"
            {...solidArrow} markerEnd="url(#arrowGreen)" />

          {/* ── LAYER 3: BLENDING CORE ── */}
          <rect x="413" y="60" width="170" height="230" rx="10" fill="#050d1a"
            stroke="#00e5ff" strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 0 12px rgba(0,229,255,0.2))' }} />
          <text x="498" y="82" textAnchor="middle" style={{ ...nodeTextStyle, fill: '#00e5ff', fontSize: 10 }}>BLENDING CORE</text>

          {[
            { y: 92,  label: 'Kalman Filter RKF', sub: 'Online loss L_m(t)' },
            { y: 148, label: 'Softmax Weighting', sub: 'Σ w_m = 100%' },
            { y: 204, label: 'BMA Ensemble Y_blend', sub: 'Spatiotemporal matrix' },
          ].map((n, i) => (
            <g key={i}>
              <rect x="423" y={n.y} width="150" height="44" rx="6" fill="#0d1e35"
                stroke="#00e5ff" strokeWidth="0.8" />
              <text x="498" y={n.y + 16} textAnchor="middle" style={{ ...nodeTextStyle, fontSize: 10, fill: '#7dd3fc' }}>{n.label}</text>
              <text x="498" y={n.y + 30} textAnchor="middle" style={subTextStyle}>{n.sub}</text>
            </g>
          ))}

          {/* ── LAYER 3 → LAYER 4 Arrows ── */}
          <line x1="583" y1="120" x2="636" y2="80"
            {...solidArrow} markerEnd="url(#arrowGreen)" />
          <line x1="583" y1="175" x2="636" y2="175"
            {...solidArrow} markerEnd="url(#arrowGreen)" />
          <line x1="583" y1="226" x2="636" y2="270"
            {...solidArrow} markerEnd="url(#arrowGreen)" />

          {/* ── LAYER 4: OUTPUTS ── */}
          {[
            { y: 55,  label: 'SHAP Attribution', sub: 'Explainability vectors', color: '#a78bfa' },
            { y: 148, label: 'Blended Forecast', sub: '7-day / 10-region grid', color: '#00e676' },
            { y: 245, label: 'Extreme Hazard Classifier', sub: 'Rain / Heat / Wind signals', color: '#ff3b5c' },
          ].map((n, i) => (
            <g key={i}>
              <rect x="636" y={n.y} width="155" height="52" rx="8" fill="#0d1424"
                stroke={n.color} strokeWidth="1.2"
                style={{ filter: `drop-shadow(0 0 6px ${n.color}40)` }} />
              <text x="713" y={n.y + 20} textAnchor="middle" style={{ ...nodeTextStyle, fill: n.color, fontSize: 10 }}>{n.label}</text>
              <text x="713" y={n.y + 34} textAnchor="middle" style={subTextStyle}>{n.sub}</text>
            </g>
          ))}

          {/* ── LAYER 4 → LLM ADVISORY Arrow ── */}
          <line x1="791" y1="174" x2="836" y2="174"
            stroke="#ffb020" strokeWidth="1.5" strokeDasharray="3 2" fill="none"
            markerEnd="url(#arrowAmber)" />

          {/* ── LAYER 5: LLM DISPATCH ── */}
          <rect x="836" y="145" width="55" height="60" rx="8" fill="#1a1000"
            stroke="#ffb020" strokeWidth="1.2"
            style={{ filter: 'drop-shadow(0 0 8px rgba(255,176,32,0.3))' }} />
          <text x="863" y="170" textAnchor="middle" style={{ ...nodeTextStyle, fill: '#ffb020', fontSize: 9 }}>LLM</text>
          <text x="863" y="183" textAnchor="middle" style={{ fill: '#94a3b8', fontSize: 8, fontFamily: 'monospace' }}>Advisory</text>
          <text x="863" y="196" textAnchor="middle" style={{ fill: '#94a3b8', fontSize: 8, fontFamily: 'monospace' }}>Dispatch</text>

          {/* ── FEEDBACK LOOP (bottom) ── */}
          <path d="M 713 297 Q 713 340 498 340 Q 293 340 293 318"
            stroke="#334155" strokeWidth="1.2" strokeDasharray="5 3" fill="none"
            markerEnd="url(#arrowCyan)" />
          <text x="500" y="355" textAnchor="middle" style={{ fill: '#475569', fontSize: 9, fontFamily: 'monospace' }}>
            Ground-truth feedback loop (IMD AWS / DWR Observations → Weight Re-calibration)
          </text>

          {/* ── LAYER LABELS (top) ── */}
          {[
            { x: 88,  label: 'NWP Sources' },
            { x: 293, label: 'Ingestion' },
            { x: 498, label: 'Blend Engine' },
            { x: 713, label: 'Outputs' },
            { x: 863, label: 'Dispatch' },
          ].map((l, i) => (
            <text key={i} x={l.x} y="14" textAnchor="middle"
              style={{ fill: '#475569', fontSize: 8, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 1 }}>
              {l.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
};
