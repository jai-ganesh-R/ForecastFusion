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

export function App() {
  const { tickPipeline } = useForecastStore();

  // Background ticker simulating live meteorological pipeline cycles
  useEffect(() => {
    const timer = setInterval(() => {
      tickPipeline();
    }, 1000);
    return () => clearInterval(timer);
  }, [tickPipeline]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
        {/* Ops Center Navbar */}
        <Navbar />

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
        <footer className="border-t border-slate-900 bg-[#05080f] py-4 px-6 text-center text-xs font-mono text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              ForecastFusion &copy; 2026 | SIH26081 Ministry of Earth Sciences (MoES) Track
            </div>
            <div className="flex items-center space-x-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                ECMWF / NOAA / IMD-NCUM Real-Time Stream
              </span>
              <span>|</span>
              <span className="text-cyan-400">Bayesian Dynamic Blending Active</span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
