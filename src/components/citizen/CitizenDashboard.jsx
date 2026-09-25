import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Volume2,
  VolumeX,
  Umbrella,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Fish,
  Wheat,
  Car,
  Compass,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { useForecastStore } from '../../store/useForecastStore';
import { useLanguage } from '../../context/LanguageContext';
import { REGIONS } from '../../data/mockRegions';

export const CitizenDashboard = () => {
  const {
    selectedRegionId,
    setSelectedRegion,
    getCurrentRegion,
    getCurrentForecasts,
    getCurrentAdvisory,
    setViewMode,
    isLiveMode
  } = useForecastStore();

  const { t, lang } = useLanguage();
  const currentRegion = getCurrentRegion();
  const forecasts = getCurrentForecasts();
  const advisory = getCurrentAdvisory();

  const today = forecasts?.[0] || {
    time: 'Today',
    blendedTemp: 29,
    blendedRain: 12,
    blendedWind: 14,
    blendedRh: 78,
    consensusPct: 92
  };

  // ── Text-to-Speech Audio Helper ──────────────────────────────────────────
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakForecast = () => {
    if (!('speechSynthesis' in window)) {
      alert("Audio speech is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Determine safety message based on rain
    let safetyNotice = "Weather is pleasant and safe for daily outdoor work.";
    if (today.blendedRain > 40) {
      safetyNotice = "Heavy rain alert. Please stay indoors if possible and avoid waterlogged roads.";
    } else if (today.blendedRain > 10) {
      safetyNotice = "Moderate rain expected today. Please carry an umbrella or raincoat.";
    }

    // Craft friendly spoken summary
    let spokenText = `Weather forecast for ${currentRegion.name}. Today's expected temperature is ${today.blendedTemp} degrees Celsius with ${today.blendedRain} millimeters of rainfall. ${safetyNotice} Forecast trust is ${today.consensusPct || 90} percent, calculated by combining four global weather models. Have a safe day!`;

    if (lang === 'hi') {
      spokenText = `${currentRegion.name} का मौसम पूर्वानुमान। आज का तापमान ${today.blendedTemp} डिग्री सेल्सियस और बारिश ${today.blendedRain} मिलीमीटर रहने का अनुमान है। ${today.blendedRain > 10 ? 'आज बारिश हो सकती है, इसलिए छाता साथ रखें।' : 'आज मौसम सामान्य रहेगा।'} चार मौसम मॉडलों के आधार पर यह पूर्वानुमान तैयार किया गया है।`;
    }

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const langCodes = {
      en: 'en-IN',
      hi: 'hi-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      kn: 'kn-IN',
      bn: 'bn-IN',
      mr: 'mr-IN',
      pa: 'pa-IN'
    };
    utterance.lang = langCodes[lang] || 'en-IN';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Stop speech if region or component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedRegionId]);

  // Weather Condition Classification
  const rainAmount = today.blendedRain ?? 0;
  const isHeavyRain = rainAmount >= 40;
  const isModerateRain = rainAmount >= 10 && rainAmount < 40;
  const isLightRain = rainAmount > 1 && rainAmount < 10;
  const isSunny = rainAmount <= 1;

  const weatherTitle = isHeavyRain
    ? 'Heavy Rainfall Alert ⛈️'
    : isModerateRain
    ? 'Rainy Day Expected 🌧️'
    : isLightRain
    ? 'Passing Showers Likely 🌦️'
    : 'Mostly Clear & Pleasant ☀️';

  const weatherSubtitle = isHeavyRain
    ? 'Significant rain is expected today. Waterlogging possible in low-lying areas.'
    : isModerateRain
    ? 'Keep an umbrella handy. Showers will occur intermittently through the day.'
    : isLightRain
    ? 'Light passing rain in some areas. Will not disrupt normal daily activities.'
    : 'Good sunshine throughout the day. Perfect for outdoor activities and travel.';

  // Traffic Light Safety Level
  const safetyLevel = isHeavyRain
    ? { color: 'bg-rose-500', border: 'border-rose-500/50', bgGlow: 'bg-rose-950/40', text: 'text-rose-300', title: '⚠️ CAUTION ADVISED', desc: 'Heavy downpour expected. Avoid staying near water bodies or unstable trees.' }
    : isModerateRain
    ? { color: 'bg-amber-400', border: 'border-amber-500/50', bgGlow: 'bg-amber-950/40', text: 'text-amber-300', title: '🟡 BE PREPARED', desc: 'Carry an umbrella or raincoat. Commuters should expect minor road delays.' }
    : { color: 'bg-emerald-400', border: 'border-emerald-500/50', bgGlow: 'bg-emerald-950/40', text: 'text-emerald-300', title: '🟢 ALL CLEAR & SAFE', desc: 'No adverse weather threats. Safe for all farm work, travel, and school.' };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* ── Mode Switcher & Location Bar ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0c1424] border border-cyan-500/30 shadow-[0_0_25px_rgba(0,229,255,0.08)]">
        {/* City Selector */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1 sm:flex-initial">
            <span className="text-[11px] font-mono text-cyan-300 uppercase tracking-widest block font-bold">
              Your Location
            </span>
            <select
              value={selectedRegionId}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-slate-900 border border-cyan-500/40 text-white font-bold text-sm sm:text-base rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer mt-0.5"
            >
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.state})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Controls: Audio + Expert Toggle */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* Audio Speech Button */}
          <button
            onClick={speakForecast}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md ${
              isSpeaking
                ? 'bg-amber-500 text-black animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            }`}
            title="Listen to today's weather aloud"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isSpeaking ? 'Stop Audio' : '🔊 Listen to Forecast'}</span>
          </button>

          {/* Toggle to Expert Mode */}
          <button
            onClick={() => setViewMode('expert')}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition"
            title="Switch to scientific curves and radar"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Scientist Mode</span>
          </button>
        </div>
      </div>

      {/* ── Big Friendly Hero Weather Card ─────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1830] via-[#091224] to-[#060c18] border border-cyan-500/40 p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>COMBINED FROM 4 TOP SATELLITE COMPUTERS</span>
            </div>

            <h1 className="font-orbitron font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              {weatherTitle}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
              {weatherSubtitle}
            </p>
          </div>

          {/* Big Temperature & Icon */}
          <div className="flex items-center gap-5 shrink-0 bg-black/40 border border-slate-800 p-4 sm:p-6 rounded-2xl">
            <div className="text-5xl sm:text-6xl animate-bounce">
              {isHeavyRain ? '⛈️' : isModerateRain ? '🌧️' : isLightRain ? '🌦️' : '☀️'}
            </div>
            <div>
              <div className="font-orbitron font-extrabold text-4xl sm:text-5xl text-cyan-400">
                {today.blendedTemp}°C
              </div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mt-1">
                Expected Today
              </div>
            </div>
          </div>
        </div>

        {/* 4 Simple Numbers Every Citizen Understands */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-center">
          <div className="p-3 bg-black/30 rounded-xl border border-slate-800">
            <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs font-mono mb-1">
              <CloudRain className="w-4 h-4 text-cyan-400" /> Expected Rain
            </div>
            <div className="font-orbitron font-bold text-xl text-white">
              {today.blendedRain} mm
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {today.blendedRain > 25 ? 'High Rain' : today.blendedRain > 5 ? 'Moderate' : 'Dry / Low'}
            </div>
          </div>

          <div className="p-3 bg-black/30 rounded-xl border border-slate-800">
            <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs font-mono mb-1">
              <Wind className="w-4 h-4 text-emerald-400" /> Wind Speed
            </div>
            <div className="font-orbitron font-bold text-xl text-white">
              {today.blendedWind} km/h
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {today.blendedWind > 35 ? 'Gusty Squalls' : 'Gentle Breeze'}
            </div>
          </div>

          <div className="p-3 bg-black/30 rounded-xl border border-slate-800">
            <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs font-mono mb-1">
              <Droplets className="w-4 h-4 text-blue-400" /> Humidity
            </div>
            <div className="font-orbitron font-bold text-xl text-white">
              {today.blendedRh}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {today.blendedRh > 80 ? 'Very Muggy' : 'Comfortable'}
            </div>
          </div>

          <div className="p-3 bg-black/30 rounded-xl border border-slate-800">
            <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs font-mono mb-1">
              <CheckCircle className="w-4 h-4 text-teal-400" /> Trust Score
            </div>
            <div className="font-orbitron font-bold text-xl text-emerald-400">
              {today.consensusPct || 92}%
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-0.5">
              4 Models Agree
            </div>
          </div>
        </div>
      </div>

      {/* ── Can I Go Outside? Traffic-Light Safety Banner ──────────────── */}
      <div className={`p-5 rounded-2xl border ${safetyLevel.border} ${safetyLevel.bgGlow} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md`}>
        <div className="flex items-center gap-3.5">
          <span className={`w-4 h-4 rounded-full ${safetyLevel.color} animate-ping shrink-0`} />
          <div>
            <span className={`font-orbitron font-bold text-sm sm:text-base ${safetyLevel.text}`}>
              {safetyLevel.title}
            </span>
            <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
              {safetyLevel.desc}
            </p>
          </div>
        </div>

        <button
          onClick={speakForecast}
          className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-slate-700 text-xs text-slate-300 hover:text-white transition"
        >
          <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Read Aloud</span>
        </button>
      </div>

      {/* ── Daily Guidance for Everyday People (Farmers, Fisherfolk, Families) ── */}
      <div className="space-y-3">
        <h3 className="font-orbitron font-bold text-sm sm:text-base text-white flex items-center gap-2">
          <span>👥</span> What Should You Do Today?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Farmers */}
          <div className="p-4 rounded-2xl bg-[#0c1424] border border-slate-800 hover:border-amber-500/40 transition">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Wheat className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">For Farmers</h4>
                <span className="text-[10px] font-mono text-slate-400">Crops & Soil</span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {today.blendedRain > 30
                ? '⚠️ Rain is heavy. Delay applying pesticides or nitrogen fertilizer so it is not washed away. Clear drainage channels in fields.'
                : today.blendedRain > 5
                ? '🌱 Soil moisture will be replenished by afternoon showers. Safe for routine weeding and field preparations.'
                : '☀️ Clear skies. Ideal for harvesting, grain drying, and tractor operations.'}
            </p>
          </div>

          {/* Fishermen */}
          <div className="p-4 rounded-2xl bg-[#0c1424] border border-slate-800 hover:border-blue-500/40 transition">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
                <Fish className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">For Fisherfolk</h4>
                <span className="text-[10px] font-mono text-slate-400">Sea & Waves</span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {today.blendedWind > 35
                ? '🚫 High wind squalls detected (>35 km/h). Do NOT venture into deep waters. Secure boats at harbour.'
                : today.blendedWind > 20
                ? '⚠️ Coastal waters moderately rough. Near-shore artisanal fishing safe, but avoid travelling beyond 10 km.'
                : '✅ Sea conditions are calm and wind is gentle. Completely safe for fishing expeditions.'}
            </p>
          </div>

          {/* Commuters & Families */}
          <div className="p-4 rounded-2xl bg-[#0c1424] border border-slate-800 hover:border-emerald-500/40 transition">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Commuters & Schools</h4>
                <span className="text-[10px] font-mono text-slate-400">Roads & Travel</span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {today.blendedRain > 35
                ? '⚠️ Waterlogging expected at underpasses and low areas. Allow extra travel time for school and office commutes.'
                : today.blendedRain > 10
                ? '🌂 Keep an umbrella with you when leaving home. Minor traffic delays possible during rain.'
                : '✅ Roads are dry and clear. Normal commute conditions throughout the day.'}
            </p>
          </div>
        </div>
      </div>

      {/* ── 7-Day Simple Visual Forecast ───────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-orbitron font-bold text-sm sm:text-base text-white flex items-center gap-2">
            <span>📅</span> 7-Day Weather Outlook
          </h3>
          <span className="text-[11px] font-mono text-cyan-400">
            Tap any day to check details
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {forecasts?.slice(0, 7).map((d, i) => {
            const isToday = i === 0;
            const dayRain = d.blendedRain ?? 0;
            const icon = dayRain > 35 ? '⛈️' : dayRain > 8 ? '🌧️' : dayRain > 1 ? '🌦️' : '☀️';

            return (
              <div
                key={i}
                className={`p-3 rounded-2xl border text-center transition transform hover:-translate-y-1 ${
                  isToday
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                    : 'bg-[#0c1424] border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className={`text-xs font-bold font-mono mb-1 ${isToday ? 'text-cyan-400' : 'text-slate-300'}`}>
                  {d.time}
                </div>
                <div className="text-3xl my-2">{icon}</div>
                <div className="font-orbitron font-extrabold text-base text-white">
                  {d.blendedTemp}°C
                </div>
                <div className="mt-1.5 flex items-center justify-center gap-1 text-[11px] font-mono text-cyan-300">
                  <Droplets className="w-3 h-3 text-cyan-400" />
                  <span>{d.blendedRain} mm</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── How This App Works (3 Simple Pictures) ─────────────────────── */}
      <div className="p-6 rounded-3xl bg-[#0a101e] border border-cyan-500/20 space-y-4">
        <div className="text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 text-xs font-mono mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>HOW DOES THIS WORK?</span>
          </div>
          <h3 className="font-orbitron font-bold text-lg sm:text-xl text-white">
            Why is ForecastFusion More Reliable than Other Apps?
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Think of it like visiting 4 doctors before taking medicine instead of relying on just one doctor's opinion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 text-center space-y-2">
            <div className="text-4xl">🌐</div>
            <h4 className="font-bold text-white text-sm">1. We Ask 4 World Computers</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Normal apps only check 1 weather model. We consult Europe, USA, India, and Global Satellite models simultaneously every hour.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 text-center space-y-2">
            <div className="text-4xl">⚖️</div>
            <h4 className="font-bold text-white text-sm">2. We Check Who Was Right</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              If a computer predicted rain yesterday that never arrived, our system automatically penalizes it and trusts the accurate models more.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 text-center space-y-2">
            <div className="text-4xl">🎯</div>
            <h4 className="font-bold text-white text-sm">3. One Honest Answer</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              We combine the best parts of all models into one single forecast you and your family can trust without confusing technical graphs.
            </p>
          </div>
        </div>

        {/* Pro Mode Banner Link */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <span className="text-slate-400 text-center sm:text-left">
            Are you a meteorologist, student, or disaster response official?
          </span>
          <button
            onClick={() => setViewMode('expert')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-950 border border-cyan-500/40 hover:bg-cyan-900/60 text-cyan-300 font-bold transition"
          >
            <span>Switch to Scientific Curves & Telemetry</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
