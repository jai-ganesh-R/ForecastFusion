import React, { useState } from 'react';
import { Copy, Check, Users, Clock, AlertTriangle, Info } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { useLanguage } from '../../context/LanguageContext';

const LANG_OPTIONS = [
  { code: 'en',  label: 'English',   key: 'summaryEn' },
  { code: 'hi',  label: 'हिन्दी',    key: 'summaryHi' },
  { code: 'ta',  label: 'தமிழ்',    key: 'summaryTa' },
  { code: 'te',  label: 'తెలుగు',   key: 'summaryTe' },
  { code: 'kn',  label: 'ಕನ್ನಡ',   key: 'summaryKn' },
  { code: 'bn',  label: 'বাংলা',    key: 'summaryBn' },
  { code: 'mr',  label: 'मराठी',    key: 'summaryMr' },
];

const RISK_STYLES = {
  red:    { bg: 'bg-rose-950/50', border: 'border-rose-500/60', text: 'text-rose-300', badge: 'bg-rose-900 text-rose-200 border-rose-500/50' },
  orange: { bg: 'bg-orange-950/50', border: 'border-orange-500/60', text: 'text-orange-300', badge: 'bg-orange-900 text-orange-200 border-orange-500/50' },
  yellow: { bg: 'bg-amber-950/40', border: 'border-amber-500/50', text: 'text-amber-300', badge: 'bg-amber-900 text-amber-200 border-amber-500/50' },
  green:  { bg: 'bg-emerald-950/30', border: 'border-emerald-500/40', text: 'text-emerald-300', badge: 'bg-emerald-900 text-emerald-200 border-emerald-500/50' },
};

export const AdvisoryPanel = ({ advisory, regionName }) => {
  const { t } = useLanguage();
  const [lang, setLang] = useState('en');
  const [copied, setCopied] = useState(false);

  const riskStyle = RISK_STYLES[advisory.riskColor] || RISK_STYLES.green;
  const summaryKey = LANG_OPTIONS.find(l => l.code === lang)?.key || 'summaryEn';
  const summaryText = advisory[summaryKey] || advisory.summaryEn;

  const handleCopy = () => {
    const text = `FORECASTFUSION WEATHER BULLETIN\nBulletin ID: ${advisory.bulletinId}\nZone: ${regionName}\nAlert Level: ${advisory.riskLevel}\nValid: ${advisory.timeValidity}\n\n${advisory.summaryEn}\n\nACTIONS:\n${advisory.suggestedActions.map((a, i) => `${i+1}. ${a.action}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* BIG ALERT BANNER */}
      <div className={`p-5 rounded-2xl border-2 ${riskStyle.bg} ${riskStyle.border} text-center`}>
        <div className="text-5xl mb-2">{advisory.riskEmoji}</div>
        <div className={`text-2xl font-orbitron font-extrabold ${riskStyle.text} mb-1`}>
          {advisory.riskLevel}
        </div>
        <div className="text-slate-300 text-sm font-sans">
          {regionName} &nbsp;|&nbsp;
          <Clock className="w-3.5 h-3.5 inline mr-1" />
          {t('valid_until')}: {advisory.timeValidity}
        </div>
      </div>

      {/* Language selector tabs */}
      <GlassCard title={t('adv_title')} badge={
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
          {LANG_OPTIONS.length} LANGUAGES
        </span>
      }>
        {/* Language pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {LANG_OPTIONS.map(l => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition border ${
                lang === l.code
                  ? 'bg-cyan-500 text-black border-cyan-400 font-bold'
                  : 'border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Summary text */}
        <div className={`p-4 rounded-xl border ${riskStyle.bg} ${riskStyle.border} mb-4`}>
          <p className="text-slate-100 text-sm leading-relaxed font-sans">{summaryText}</p>
        </div>

        {/* Who is affected */}
        {advisory.affectedGroups?.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 uppercase mb-2">
              <Users className="w-3.5 h-3.5" /> Most Affected Groups:
            </div>
            <div className="flex flex-wrap gap-2">
              {advisory.affectedGroups.map((g, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  {g}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* What to do */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-sm font-bold text-white mb-3">
            <AlertTriangle className="w-4 h-4 text-cyan-400" />
            {t('what_to_do')}
          </div>
          <div className="space-y-2">
            {advisory.suggestedActions.map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-slate-900/70 border border-slate-800 rounded-xl text-sm text-slate-200"
              >
                <span className="text-xl shrink-0 leading-none">{a.icon}</span>
                <span className="font-sans leading-snug">{a.action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bulletin ID + copy */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="text-[10px] font-mono text-slate-500">
            <Info className="w-3 h-3 inline mr-1" />
            Bulletin: {advisory.bulletinId}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs rounded-lg transition-all active:scale-95"
          >
            {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> {t('copy_bulletin')}</>}
          </button>
        </div>
      </GlassCard>

      {/* IMD Color Code Guide */}
      <GlassCard title="🎨 IMD Warning Color Guide">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { emoji: '✅', color: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300', label: t('alert_green'), short: 'No Action Needed' },
            { emoji: '🟡', color: 'border-amber-500/40 bg-amber-950/30 text-amber-300', label: t('alert_yellow'), short: 'Watch for updates' },
            { emoji: '🟠', color: 'border-orange-500/40 bg-orange-950/30 text-orange-300', label: t('alert_orange'), short: 'Get ready to act' },
            { emoji: '🔴', color: 'border-rose-500/40 bg-rose-950/30 text-rose-300', label: t('alert_red'), short: 'Act immediately' },
          ].map((item, i) => (
            <div key={i} className={`p-3 rounded-xl border ${item.color} text-center`}>
              <div className="text-2xl mb-1">{item.emoji}</div>
              <div className="text-[10px] font-bold font-mono">{item.short}</div>
              <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">{item.label}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
