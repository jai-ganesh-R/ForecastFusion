import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Radio,
  Layers,
  BrainCircuit,
  TrendingUp,
  FileText,
  Activity,
  HelpCircle,
  ShieldCheck,
  Zap,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useForecastStore } from '../../store/useForecastStore';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

export const Navbar = () => {
  const { pipelineState, isBackendConnected, viewMode, setViewMode } = useForecastStore();
  const { t } = useLanguage();
  const { theme, isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: '/', label: t('nav_overview'), icon: Radio },
    { to: '/dashboard', label: t('nav_dashboard'), icon: Layers },
    { to: '/explain-engine', label: t('nav_explain'), icon: BrainCircuit },
    { to: '/weight-timeline', label: t('nav_weights'), icon: TrendingUp },
    { to: '/advisory', label: t('nav_advisory'), icon: FileText },
    { to: '/pipeline-ops', label: t('nav_pipeline'), icon: Activity },
    { to: '/methodology', label: t('nav_methodology'), icon: HelpCircle },
  ];

  const getLinkClass = ({ isActive }) =>
    `flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
      isActive
        ? 'bg-cyan-100/80 dark:bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,229,255,0.15)]'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
    }`;

  const getMobileLinkClass = ({ isActive }) =>
    `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-cyan-100/80 dark:bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/40'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
    }`;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[#070b13]/85 backdrop-blur-xl transition-colors duration-300">
        {/* Top Banner Ticker */}
        <div className="flex items-center justify-between px-4 py-1 border-b border-slate-200/60 dark:border-white/5 text-[11px] font-mono tracking-wider text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-black/30 transition-colors">
          <div className="flex items-center space-x-3 overflow-hidden">
            <span className="flex items-center text-cyan-400 font-bold uppercase tracking-widest gap-1.5 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              SIH26081 MOES
            </span>
            <span className="text-slate-600">|</span>
            <span className="truncate text-slate-300">
              NWP AUTO-ENSEMBLE ENGINE: 4 MULTI-SCALE MODELS SYNCHRONIZED
            </span>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="text-emerald-400 hidden md:inline flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 inline" /> BAYESIAN DRIFT CALIBRATION: ACTIVE
            </span>
          </div>

          <div className="flex items-center space-x-4 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">CYCLE:</span>
              <span className="text-cyan-300 font-bold font-mono">#{pipelineState.totalCyclesCompleted}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded bg-cyan-950/40">
              <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>T-{pipelineState.nextRunSecondsRemaining}s</span>
            </div>
          </div>
        </div>

        {/* Main Nav */}
        <div className="flex items-center justify-between px-6 py-3">
          {/* Brand */}
          <NavLink to="/" className="flex items-center space-x-3 group">
            <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 p-[1px] flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.4)]">
              <div className="w-full h-full bg-[#090e1a] rounded-[7px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-cyan-400 group-hover:rotate-45 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-orbitron font-extrabold text-xl tracking-wider text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-cyan-400 dark:via-sky-300 dark:to-white">
                  FORECAST<span className="text-cyan-500 dark:text-cyan-400">FUSION</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-cyan-100 dark:bg-cyan-950 border border-cyan-500/40 text-cyan-800 dark:text-cyan-300 rounded">
                  v2.6-AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-tight -mt-1">
                HYBRID AI–NWP METEOROLOGICAL BLENDING PLATFORM
              </p>
            </div>
          </NavLink>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} className={getLinkClass}>
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
          {/* Right side: Mode pill + language switcher + status + hamburger */}
          <div className="flex items-center space-x-3">
            {/* Citizen vs Pro Mode Toggle Pill */}
            <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl p-0.5 text-xs font-mono shadow-inner">
              <button
                onClick={() => setViewMode('citizen')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                  viewMode === 'citizen'
                    ? 'bg-emerald-500 text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Simple Citizen Mode with voice assistance"
              >
                <span>🌱 Citizen</span>
              </button>
              <button
                onClick={() => setViewMode('expert')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                  viewMode === 'expert'
                    ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(0,229,255,0.5)]'
                    : 'text-slate-400 hover:text-white'
                }`}
                <span>🔬 Pro</span>
              </button>
            </div>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Light / Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-300/80 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:border-cyan-500/40 transition-all duration-200 shadow-sm"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle color theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-90" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>

            {/* Status indicator */}
            <div className="hidden sm:flex flex-col items-end text-right pl-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                {isBackendConnected ? "Backend Engine" : "Ensemble State"}
              </span>
              {isBackendConnected ? (
                <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-cyan-500/30 bg-cyan-50 dark:bg-cyan-950/40 sheen-badge" title="Connected to FastAPI backend with WebSocket telemetry">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-ping" />
                  FASTAPI LIVE
                </span>
              ) : (
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 sheen-badge" title="Active client-side Bayesian synthesis">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
                  ONLINE & ADAPTING
                </span>
              )}
            </div>

            {/* Hamburger (mobile) */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="lg:hidden p-2 rounded-lg border border-slate-700 bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-in Drawer */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          onClick={() => setMobileOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Drawer */}
          <nav
            className="absolute top-0 right-0 h-full w-72 bg-white dark:bg-[#070b13] border-l border-slate-200 dark:border-white/10 shadow-2xl flex flex-col text-slate-900 dark:text-slate-100 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10">
              <span className="font-orbitron font-bold text-cyan-600 dark:text-cyan-400 text-sm tracking-wider">NAVIGATION</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleTheme}
                  className="p-1.5 rounded-lg border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
                  aria-label="Toggle theme"
                >
                  {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                </button>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg border border-slate-300 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Nav Links */}
            <div className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={getMobileLinkClass}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>

            {/* Drawer footer */}
            <div className="p-4 border-t border-slate-800 text-[10px] font-mono text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ECMWF / NOAA / IMD-NCUM Real-Time Stream</span>
              </div>
              <div className="text-cyan-400">Bayesian Dynamic Blending Active</div>
              <div>ForecastFusion © 2026 | SIH26081 MoES</div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};
