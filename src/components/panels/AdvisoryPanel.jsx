import React, { useState, useEffect } from 'react';
import { Copy, Check, Users, Clock, AlertTriangle, Info, Volume2, Square, Download, Radio } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedAction, getLocalizedGroup } from '../../data/mockAdvisories';

const LANG_OPTIONS = [
  { code: 'en',  label: 'English',   key: 'summaryEn', locale: 'en-IN' },
  { code: 'hi',  label: 'हिन्दी',    key: 'summaryHi', locale: 'hi-IN' },
  { code: 'ta',  label: 'தமிழ்',    key: 'summaryTa', locale: 'ta-IN' },
  { code: 'te',  label: 'తెలుగు',   key: 'summaryTe', locale: 'te-IN' },
  { code: 'kn',  label: 'ಕನ್ನಡ',   key: 'summaryKn', locale: 'kn-IN' },
  { code: 'bn',  label: 'বাংলা',    key: 'summaryBn', locale: 'bn-IN' },
  { code: 'mr',  label: 'मराठी',    key: 'summaryMr', locale: 'mr-IN' },
  { code: 'pa',  label: 'ਪੰਜਾਬੀ',   key: 'summaryPa', locale: 'pa-IN' },
];

const RISK_STYLES = {
  red:    { bg: 'bg-rose-50 dark:bg-rose-950/50', border: 'border-rose-300 dark:border-rose-500/60', text: 'text-rose-800 dark:text-rose-300', badge: 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-500/50' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-950/50', border: 'border-orange-300 dark:border-orange-500/60', text: 'text-orange-800 dark:text-orange-300', badge: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-500/50' },
  yellow: { bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-300 dark:border-amber-500/50', text: 'text-amber-800 dark:text-amber-300', badge: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-500/50' },
  green:  { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-300 dark:border-emerald-500/40', text: 'text-emerald-800 dark:text-emerald-300', badge: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-500/50' },
};

export const AdvisoryPanel = ({ advisory, regionName }) => {
  const { t, lang, setLang } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [downloadingXml, setDownloadingXml] = useState(false);

  const riskStyle = RISK_STYLES[advisory.riskColor] || RISK_STYLES.green;
  const currentLangOpt = LANG_OPTIONS.find(l => l.code === lang) || LANG_OPTIONS[0];
  const summaryKey = currentLangOpt.key;
  const summaryText = advisory[summaryKey] || advisory.summaryEn;

  // Cleanup speech synthesis on unmount or language shift
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [lang]);

  // Voice Text-to-Speech (TTS) announcement
  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert("Text-to-speech audio is not supported in this browser.");
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const actionsText = (advisory.suggestedActions || [])
      .map((a, i) => `${i + 1}. ${getLocalizedAction(a.action, lang)}`)
      .join('. ');

    const fullUtteranceText = `${advisory.riskLevel}. ${regionName}. ${summaryText}. Action recommendations: ${actionsText}`;

    const utterance = new SpeechSynthesisUtterance(fullUtteranceText);
    utterance.lang = currentLangOpt.locale || 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Pick best matching voice
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang === utterance.lang) ||
                  voices.find(v => v.lang.startsWith(lang));
    if (voice) utterance.voice = voice;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Direct OASIS CAP-1.2 XML generation & download
  const handleDownloadXml = async () => {
    setDownloadingXml(true);
    try {
      let xmlContent = '';
      try {
        const res = await fetch(`http://localhost:8000/api/v1/advisories/${advisory.regionId || 'mumbai-konkan'}/cap.xml`);
        if (res.ok) {
          xmlContent = await res.text();
        }
      } catch {
        // backend fetch fallback
      }

      if (!xmlContent) {
        // Fallback: Generate full spec OASIS CAP-1.2 XML dynamically
        const nowIso = new Date().toISOString();
        const severityMap = { red: 'Extreme', orange: 'Severe', yellow: 'Moderate', green: 'Minor' };
        const urgencyMap = { red: 'Immediate', orange: 'Expected', yellow: 'Future', green: 'Past' };
        const actionsJoined = (advisory.suggestedActions || []).map(a => a.action).join('; ');

        xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>ForecastFusion-${advisory.bulletinId || '2026-ALERT'}</identifier>
  <sender>imd-moes@forecastfusion.gov.in</sender>
  <sent>${nowIso}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Met</category>
    <event>${advisory.riskLevel}</event>
    <urgency>${urgencyMap[advisory.riskColor] || 'Expected'}</urgency>
    <severity>${severityMap[advisory.riskColor] || 'Moderate'}</severity>
    <certainty>Observed</certainty>
    <eventCode>
      <valueName>IMD_COLOR_CODE</valueName>
      <value>${advisory.riskColor?.toUpperCase() || 'YELLOW'}</value>
    </eventCode>
    <headline>${advisory.riskLevel} - ${regionName}</headline>
    <description>${advisory.summaryEn}</description>
    <instruction>${actionsJoined}</instruction>
    <area>
      <areaDesc>${regionName}</areaDesc>
    </area>
  </info>
</alert>`;
      }

      const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ForecastFusion_CAP12_${advisory.bulletinId || 'alert'}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CAP XML download error:", err);
    } finally {
      setTimeout(() => setDownloadingXml(false), 1200);
    }
  };

  const handleCopy = () => {
    const localizedActions = (advisory.suggestedActions || []).map((a, i) => {
      const text = getLocalizedAction(a.action, lang);
      return `${i + 1}. ${text}`;
    }).join('\n');

    const text = [
      `FORECASTFUSION WEATHER BULLETIN (${currentLangOpt.label.toUpperCase()})`,
      `Bulletin ID: ${advisory.bulletinId}`,
      `Zone: ${regionName}`,
      `Alert Level: ${advisory.riskLevel}`,
      `Valid: ${advisory.timeValidity}`,
      `----------------------------------------`,
      summaryText,
      `----------------------------------------`,
      `ACTION PLAN:`,
      localizedActions
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* BIG ALERT BANNER */}
      <div className={`p-6 rounded-2xl border-2 ${riskStyle.bg} ${riskStyle.border} text-center shadow-sm relative overflow-hidden`}>
        {speaking && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-400/40 text-[11px] font-mono animate-pulse">
            <Radio className="w-3.5 h-3.5 animate-spin" />
            <span>Broadcasting Audio ({currentLangOpt.label})</span>
          </div>
        )}
        <div className="text-5xl mb-2">{advisory.riskEmoji}</div>
        <div className={`text-2xl font-orbitron font-extrabold ${riskStyle.text} mb-1`}>
          {advisory.riskLevel}
        </div>
        <div className="text-slate-600 dark:text-slate-300 text-sm font-sans">
          {regionName} &nbsp;|&nbsp;
          <Clock className="w-3.5 h-3.5 inline mr-1 text-cyan-600 dark:text-cyan-400" />
          {t('valid_until')}: {advisory.timeValidity}
        </div>
      </div>

      {/* Language selector tabs */}
      <GlassCard title={t('adv_title')} badge={
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30 font-bold">
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
                  ? 'bg-cyan-500 text-black border-cyan-400 font-bold shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                  : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100/70 dark:bg-slate-800'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Summary text in selected language */}
        <div className={`p-4 rounded-xl border ${riskStyle.bg} ${riskStyle.border} mb-4`}>
          <p className="text-slate-800 dark:text-slate-100 text-sm leading-relaxed font-sans">{summaryText}</p>
        </div>

        {/* Who is affected */}
        {advisory.affectedGroups?.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-400 uppercase mb-2">
              <Users className="w-3.5 h-3.5" /> Most Affected Stakeholders:
            </div>
            <div className="flex flex-wrap gap-2">
              {advisory.affectedGroups.map((g, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                  {getLocalizedGroup(g, lang)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* What to do - localized actions */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white mb-3">
            <AlertTriangle className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            {t('what_to_do')}
          </div>
          <div className="space-y-2">
            {advisory.suggestedActions.map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200"
              >
                <span className="text-xl shrink-0 leading-none">{a.icon}</span>
                <span className="font-sans leading-snug">{getLocalizedAction(a.action, lang)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls: Audio TTS, CAP-1.2 Download, Clipboard Copy */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
            <Info className="w-3 h-3 inline mr-1" />
            Bulletin: {advisory.bulletinId}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Audio Voice Broadcast */}
            <button
              onClick={handleSpeak}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition border ${
                speaking
                  ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
              }`}
              title="Read bulletin aloud using Indian regional voice synthesis"
            >
              {speaking ? (
                <>
                  <Square className="w-3.5 h-3.5 text-white" />
                  <span>Stop Voice</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>Listen ({currentLangOpt.label})</span>
                </>
              )}
            </button>

            {/* OASIS CAP 1.2 XML Download */}
            <button
              onClick={handleDownloadXml}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition border border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300"
              title="Download official OASIS CAP-1.2 XML alert payload for NDMA / MoES broadcast"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{downloadingXml ? 'Exporting XML...' : 'CAP-1.2 XML'}</span>
            </button>

            {/* Copy Localized Bulletin */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs rounded-xl transition-all shadow active:scale-95"
              title="Copy localized bulletin to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-black" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-black" />
                  <span>{t('copy_bulletin')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </GlassCard>


      {/* IMD Color Code Guide */}
      <GlassCard title="🎨 IMD Warning Color Guide">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { emoji: '✅', color: 'border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300', label: t('alert_green'), short: 'No Action Needed' },
            { emoji: '🟡', color: 'border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300', label: t('alert_yellow'), short: 'Watch for updates' },
            { emoji: '🟠', color: 'border-orange-300 dark:border-orange-500/40 bg-orange-50 dark:bg-orange-950/30 text-orange-800 dark:text-orange-300', label: t('alert_orange'), short: 'Get ready to act' },
            { emoji: '🔴', color: 'border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300', label: t('alert_red'), short: 'Act immediately' },
          ].map((item, i) => (
            <div key={i} className={`p-3 rounded-xl border ${item.color} text-center`}>
              <div className="text-2xl mb-1">{item.emoji}</div>
              <div className="text-[10px] font-bold font-mono">{item.short}</div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{item.label}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
