import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { ExplainEngine } from './pages/ExplainEngine';
import { WeightTimeline } from './pages/WeightTimeline';
import { Advisory } from './pages/Advisory';
import { PipelineOps } from './pages/PipelineOps';
import { Methodology } from './pages/Methodology';
import { useForecastStore } from './store/useForecastStore';

import { ThemeProvider } from './context/ThemeContext';

export function App() {
  const { tickPipeline, initTelemetryWs } = useForecastStore();

  // Background ticker simulating live meteorological pipeline cycles
  useEffect(() => {
    // Attempt WebSocket connection to FastAPI backend
    initTelemetryWs();

    const timer = setInterval(() => {
      tickPipeline();
    }, 1000);
    return () => clearInterval(timer);
  }, [tickPipeline, initTelemetryWs]);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-cyan-500 selection:text-black transition-colors duration-300 relative">
          {/* Subtle Ambient Vignette */}
          <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.06)_0%,transparent_70%)]" />
          
          {/* Ops Center Navbar */}
          <div className="relative z-10">
            <Navbar />
          </div>

        {/* Dynamic Route View */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/explain-engine" element={<ExplainEngine />} />
            <Route path="/weight-timeline" element={<WeightTimeline />} />
            <Route path="/advisory" element={<Advisory />} />
            <Route path="/pipeline-ops" element={<PipelineOps />} />
            <Route path="/methodology" element={<Methodology />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-200 dark:border-white/5 bg-white/60 dark:bg-black/40 py-4 px-6 text-center text-xs font-mono text-slate-600 dark:text-slate-500 transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              ForecastFusion &copy; 2026 | SIH26081 Ministry of Earth Sciences (MoES) Track
            </div>
            <div className="flex items-center space-x-4 text-[11px] text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                ECMWF / NOAA / IMD-NCUM Real-Time Stream
              </span>
              <span>|</span>
              <span className="text-cyan-700 dark:text-cyan-400 font-semibold">Bayesian Dynamic Blending Active</span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  </ThemeProvider>
  );
}

export default App;
