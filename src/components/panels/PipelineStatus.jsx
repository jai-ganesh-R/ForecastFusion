import React from 'react';
import { useState, useEffect } from 'react';
import { Activity, Clock, CheckCircle2, RefreshCw, Cpu, Database, Wifi, Zap } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { useLanguage } from '../../context/LanguageContext';

export const PipelineStatus = ({ pipelineState }) => {
  const { t } = useLanguage();
  const isProcessing = pipelineState.pipelineStatus === 'PROCESSING';
  const isSynced = pipelineState.pipelineStatus === 'SYNCED';

  // Progress bar for countdown
  const progress = Math.round(((30 - pipelineState.nextRunSecondsRemaining) / 30) * 100);

  return (
    <GlassCard
      title={t('pipe_title')}
      badge={
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1.5 ${
          isProcessing ? 'bg-amber-950 text-amber-300 border border-amber-500/50' :
          isSynced    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50' :
                        'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            isProcessing ? 'bg-amber-400 animate-ping' :
            isSynced    ? 'bg-cyan-400 animate-pulse' :
                          'bg-emerald-400'
          }`} />
          {pipelineState.pipelineStatus}
        </span>
      }
    >
      <div className="space-y-4">
        {/* Plain language subtitle */}
        <p className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed border-b border-slate-200 dark:border-slate-800 pb-3">
          {t('pipe_subtitle')}
        </p>

        {/* Top 4 Metric Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-slate-100/70 dark:bg-black/40 border border-slate-200/80 dark:border-slate-800 rounded-xl">
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">{t('last_update')}</div>
            <div className="text-lg font-bold font-orbitron text-cyan-600 dark:text-cyan-400 mt-1 flex items-center gap-1">
              <Clock className="w-4 h-4 text-cyan-500" />
              <span>{pipelineState.lastRunSecondsAgo}s ago</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-100/70 dark:bg-black/40 border border-slate-200/80 dark:border-slate-800 rounded-xl">
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">{t('next_update')}</div>
            <div className="text-lg font-bold font-orbitron text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
              <RefreshCw className={`w-4 h-4 text-amber-500 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{pipelineState.nextRunSecondsRemaining}s</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-100/70 dark:bg-black/40 border border-slate-200/80 dark:border-slate-800 rounded-xl">
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">Completed Cycles</div>
            <div className="text-lg font-bold font-orbitron text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <Cpu className="w-4 h-4 text-emerald-500" />
              <span>#{pipelineState.totalCyclesCompleted}</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-100/70 dark:bg-black/40 border border-slate-200/80 dark:border-slate-800 rounded-xl">
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">Records Today</div>
            <div className="text-lg font-bold font-orbitron text-sky-600 dark:text-sky-400 mt-1 flex items-center gap-1">
              <Database className="w-4 h-4 text-sky-500" />
              <span>{(pipelineState.recordsIngested / 1000).toFixed(0)}K</span>
            </div>
          </div>
        </div>

        {/* Countdown progress bar */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              Next blend cycle in {pipelineState.nextRunSecondsRemaining}s
            </span>
            <span>{progress}% complete</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isProcessing ? 'bg-amber-400' : 'bg-gradient-to-r from-cyan-500 to-blue-500'
              }`}
              style={{ width: `${progress}%`, boxShadow: '0 0 8px rgba(0,229,255,0.4)' }}
            />
          </div>
        </div>

        {/* Processing banner */}
        {isProcessing && (
          <div className="p-3 rounded-xl border border-amber-300 dark:border-amber-500/50 bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between animate-pulse">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
              <span className="font-semibold">🔄 Blending new weather data right now…</span>
            </div>
            <span className="font-mono text-[10px]">~2s</span>
          </div>
        )}

        {/* SYNCED flash */}
        {isSynced && (
          <div className="p-3 rounded-xl border border-cyan-300 dark:border-cyan-500/50 bg-cyan-50 dark:bg-cyan-950/30 text-xs text-cyan-800 dark:text-cyan-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="font-semibold">✅ Blend complete! All 4 models synchronized.</span>
          </div>
        )}

        {/* Execution Log */}
        <div>
          <div className="text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            Recent Blend Runs:
          </div>
          <div className="space-y-1.5">
            {pipelineState.syncCyclesLog.slice(0, 6).map((log, idx) => (
              <div
                key={log.id}
                className={`flex items-center justify-between text-[11px] font-mono p-2.5 rounded-xl border ${
                  idx === 0 ? 'border-cyan-300 dark:border-cyan-500/30 bg-cyan-50/70 dark:bg-cyan-950/20' : 'border-slate-200 dark:border-slate-800/60 bg-slate-50/80 dark:bg-slate-900/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    log.status === 'SUCCESS' ? 'bg-emerald-500' :
                    log.status === 'ADAPTED' ? 'bg-amber-500' : 'bg-rose-500'
                  }`} />
                  <span className="text-cyan-700 dark:text-cyan-400 font-semibold">{log.id}</span>
                  <span className="text-slate-500 dark:text-slate-400">{log.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    log.status === 'SUCCESS' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40' :
                    log.status === 'ADAPTED' ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/40' :
                    'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-500/40'
                  }`}>
                    {log.status === 'SUCCESS' ? '✓ OK' : log.status === 'ADAPTED' ? '⚡ ADAPTED' : '✗ ERR'}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">{log.duration}</span>
                  <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">{log.records?.toLocaleString()} obs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
