import React from 'react';
import { FileText, MapPin } from 'lucide-react';
import { useForecastStore } from '../store/useForecastStore';
import { AdvisoryPanel } from '../components/panels/AdvisoryPanel';
import { REGIONS } from '../data/mockRegions';
import { useLanguage } from '../context/LanguageContext';

export const Advisory = () => {
  const { selectedRegionId, setSelectedRegion, getCurrentRegion, getCurrentAdvisory } = useForecastStore();
  const { t } = useLanguage();
  const currentRegion = getCurrentRegion();
  const advisory = getCurrentAdvisory();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white/70 dark:bg-[#0d1424]/90 border border-slate-200/80 dark:border-slate-800 backdrop-blur-xl shadow-sm dark:shadow-none">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-950 border border-cyan-300 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400">
              <FileText className="w-5 h-5" />
            </span>
            <h2 className="font-orbitron font-bold text-2xl text-slate-900 dark:text-white">{t('adv_title')}</h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl font-sans leading-relaxed">{t('adv_subtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <select
            value={selectedRegionId}
            onChange={e => setSelectedRegion(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300 text-xs rounded-xl px-3 py-2 font-mono focus:outline-none shadow-sm cursor-pointer"
          >
            {REGIONS.map(r => (
              <option key={r.id} value={r.id} className="bg-slate-900 text-white">{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Advisory Panel */}
      <AdvisoryPanel advisory={advisory} regionName={currentRegion.name} />
    </div>
  );
};
