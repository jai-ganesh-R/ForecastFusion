import React, { useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { REGIONS } from '../../data/mockRegions';
import { useForecastStore } from '../../store/useForecastStore';
import { useLanguage } from '../../context/LanguageContext';

// ── Google Maps dark style ────────────────────────────────────────────────────
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0d1424' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1424' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b7280' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0d1424' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1e3a5f' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#0d1424' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#334155' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#0d1424' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0f1e1a' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#00e5ff22' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#00e5ff50' }] },
];

// ── Color by confidence ───────────────────────────────────────────────────────
const getMarkerColor = (reg) => {
  const conf = reg.baseConfidence;
  if (conf >= 92) return '#00e676'; // high → green
  if (conf >= 88) return '#00e5ff'; // nominal → cyan
  if (conf >= 85) return '#ffb020'; // dynamic → amber
  return '#ff3b5c';                  // low → red
};

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export const IndiaMap = ({ onSelectRegion }) => {
  const { selectedRegionId, activeLayer, setActiveLayer } = useForecastStore();
  const { t } = useLanguage();
  const [infoOpen, setInfoOpen] = React.useState(null); // regionId of open infowindow

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    id: 'forecastfusion-map',
  });

  const onLoad = useCallback(() => {}, []);
  const onUnmount = useCallback(() => {}, []);

  // ── Fallback if no API key ─────────────────────────────────────────────────
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <FallbackMap
        selectedRegionId={selectedRegionId}
        activeLayer={activeLayer}
        setActiveLayer={setActiveLayer}
        onSelectRegion={onSelectRegion}
        t={t}
      />
    );
  }

  if (loadError) {
    return (
      <div className="w-full h-[440px] flex items-center justify-center bg-slate-900/60 rounded-xl border border-red-500/30 text-red-400 text-sm font-mono">
        ⚠️ Google Maps failed to load. Check your API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[440px] flex items-center justify-center bg-[#0d1424] rounded-xl border border-cyan-500/20">
        <div className="flex flex-col items-center gap-3 text-cyan-400">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono">Loading Google Maps…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[440px] rounded-xl overflow-hidden border border-cyan-500/20 shadow-[0_0_20px_rgba(0,0,0,0.6)]">
      {/* Layer Controls */}
      <div className="absolute top-3 right-3 z-10 flex bg-slate-900/90 border border-slate-700 rounded-lg p-1 text-xs backdrop-blur-md">
        <button
          onClick={() => setActiveLayer('confidence')}
          className={`px-3 py-1 rounded transition font-medium ${
            activeLayer === 'confidence' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-300 hover:text-white'
          }`}
        >
          {t('confidence')}
        </button>
        <button
          onClick={() => setActiveLayer('weights')}
          className={`px-3 py-1 rounded transition font-medium ${
            activeLayer === 'weights' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-300 hover:text-white'
          }`}
        >
          Lead Model
        </button>
      </div>

      {/* Help text */}
      <div className="absolute bottom-3 left-3 z-10 bg-slate-950/85 border border-slate-800 rounded-lg px-3 py-2 text-[11px] font-mono text-slate-400 backdrop-blur-md">
        📍 {t('click_region')}
      </div>

      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={{ lat: 21.5, lng: 79.5 }}
        zoom={5}
        options={{
          styles: DARK_MAP_STYLE,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          restriction: {
            latLngBounds: { north: 37, south: 6, east: 98, west: 65 },
            strictBounds: false,
          },
        }}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {REGIONS.map((reg) => {
          const isSelected = selectedRegionId === reg.id;
          const color = getMarkerColor(reg);
          return (
            <React.Fragment key={reg.id}>
              <Marker
                position={{ lat: reg.lat, lng: reg.lng }}
                onClick={() => {
                  onSelectRegion(reg.id);
                  setInfoOpen(reg.id);
                }}
                icon={{
                  path: 'M 0,0 m -12,-12 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0',
                  fillColor: color,
                  fillOpacity: isSelected ? 1 : 0.75,
                  strokeColor: isSelected ? '#ffffff' : color,
                  strokeWeight: isSelected ? 3 : 1.5,
                  scale: isSelected ? 1.2 : 1,
                }}
                title={reg.name}
              />
              {infoOpen === reg.id && (
                <InfoWindow
                  position={{ lat: reg.lat, lng: reg.lng }}
                  onCloseClick={() => setInfoOpen(null)}
                >
                  <div style={{ background: '#0d1424', color: '#e2e8f0', padding: '8px', minWidth: '160px', fontFamily: 'monospace', fontSize: '12px' }}>
                    <div style={{ color: '#00e5ff', fontWeight: 'bold', marginBottom: '4px' }}>{reg.name}</div>
                    <div style={{ color: '#94a3b8', fontSize: '11px' }}>{reg.terrain}</div>
                    <div style={{ marginTop: '6px', borderTop: '1px solid #334155', paddingTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Confidence:</span>
                      <span style={{ color: '#00e676', fontWeight: 'bold' }}>{reg.baseConfidence}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Lead Model:</span>
                      <span style={{ color: '#00e5ff' }}>{reg.leadModel}</span>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </React.Fragment>
          );
        })}
      </GoogleMap>
    </div>
  );
};

// ── Fallback map (no API key) — enhanced interactive radar & dot grid ───────────────
const FallbackMap = ({ selectedRegionId, activeLayer, onSelectRegion, t }) => {
  const { setActiveLayer: storeSetActiveLayer } = useForecastStore();
  const [hoveredRegion, setHoveredRegion] = React.useState(null);

  const selectedRegion = REGIONS.find(r => r.id === selectedRegionId) || REGIONS[0];
  const activeDetail = hoveredRegion || selectedRegion;

  return (
    <div className="relative w-full h-[440px] rounded-xl overflow-hidden border border-cyan-500/20 shadow-[0_0_20px_rgba(0,0,0,0.6)] bg-[#090f1d] flex flex-col justify-between">
      {/* Layer Controls */}
      <div className="absolute top-3 right-3 z-10 flex bg-slate-900/90 border border-slate-700 rounded-lg p-1 text-xs backdrop-blur-md">
        <button
          onClick={() => storeSetActiveLayer('confidence')}
          className={`px-3 py-1 rounded transition font-medium ${activeLayer === 'confidence' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-300 hover:text-white'}`}
        >
          {t('confidence')}
        </button>
        <button
          onClick={() => storeSetActiveLayer('weights')}
          className={`px-3 py-1 rounded transition font-medium ${activeLayer === 'weights' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-300 hover:text-white'}`}
        >
          Lead Model
        </button>
      </div>

      {/* Floating Active Info Card */}
      <div className="absolute top-3 left-3 z-10 bg-slate-950/90 border border-cyan-500/30 rounded-xl p-2.5 max-w-[210px] text-xs font-mono backdrop-blur-md shadow-lg pointer-events-none">
        <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
          {activeDetail.name}
        </div>
        <div className="text-slate-400 text-[11px] truncate mt-0.5">{activeDetail.state}</div>
        <div className="mt-1.5 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Confidence:</span>
          <span className="text-emerald-400 font-bold">{activeDetail.baseConfidence}%</span>
        </div>
        <div className="flex items-center justify-between text-[11px] mt-0.5">
          <span className="text-slate-400">Lead Model:</span>
          <span className="text-cyan-300">{activeDetail.leadModel.split('-')[0]}</span>
        </div>
      </div>

      {/* Interactive SVG Radar & Coordinate Grid */}
      <svg viewBox="0 0 400 400" className="w-full h-full flex-1">
        <defs>
          <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.08" />
            <stop offset="60%" stopColor="#00e5ff" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Radar Concentric Rings */}
        <circle cx="200" cy="200" r="170" fill="url(#radarSweep)" stroke="#1e293b" strokeWidth="0.8" />
        <circle cx="200" cy="200" r="120" fill="none" stroke="#1e293b" strokeWidth="0.8" />
        <circle cx="200" cy="200" r="70" fill="none" stroke="#1e293b" strokeWidth="0.8" />

        {/* Crosshairs */}
        <line x1="200" y1="20" x2="200" y2="380" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
        <line x1="20" y1="200" x2="380" y2="200" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />

        {/* Regional Nodes */}
        {REGIONS.map((reg) => {
          const x = ((reg.lng - 66) / (96 - 66)) * 320 + 40;
          const y = 370 - ((reg.lat - 7) / (35 - 7)) * 330;
          const isSelected = selectedRegionId === reg.id;
          const color = getMarkerColor(reg);

          return (
            <g
              key={reg.id}
              onClick={() => onSelectRegion(reg.id)}
              onMouseEnter={() => setHoveredRegion(reg)}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer transition-all duration-300"
            >
              {/* Outer pulsing ring for selected region */}
              {isSelected && (
                <>
                  <circle cx={x} cy={y} r="22" fill={`${color}15`} stroke={color} strokeWidth="1" strokeDasharray="2 2" className="animate-spin" style={{ transformOrigin: `${x}px ${y}px`, animationDuration: '8s' }} />
                  <circle cx={x} cy={y} r="14" fill={`${color}25`} stroke={color} strokeWidth="1.5" />
                </>
              )}

              {/* Main Node Point */}
              <circle
                cx={x} cy={y} r={isSelected ? 8 : 5.5}
                fill={color}
                stroke="#090f1d"
                strokeWidth={2}
                style={{ filter: `drop-shadow(0 0 6px ${color})` }}
              />

              {/* Node Label */}
              <text
                x={x + 10} y={y + 3}
                fill={isSelected ? '#ffffff' : '#94a3b8'}
                fontSize={isSelected ? "10" : "8.5"}
                fontWeight={isSelected ? "bold" : "normal"}
                fontFamily="monospace"
              >
                {reg.name.split(' ')[0]}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Bottom Region Quick Bar */}
      <div className="bg-black/50 border-t border-slate-800/80 p-2 overflow-x-auto flex items-center gap-1.5 text-[10px] font-mono z-10">
        <span className="text-slate-500 uppercase px-1 shrink-0">Zones:</span>
        {REGIONS.map(r => (
          <button
            key={r.id}
            onClick={() => onSelectRegion(r.id)}
            className={`px-2 py-0.5 rounded-full shrink-0 transition ${
              selectedRegionId === r.id
                ? 'bg-cyan-500 text-black font-bold'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {r.name.split(' ')[0]}
          </button>
        ))}
      </div>
    </div>
  );
};
