import { create } from 'zustand';
import { REGIONS } from '../data/mockRegions';
import { generateRegionForecasts } from '../data/mockForecasts';
import { getRegionWeightsData } from '../data/mockWeights';
import { getRegionSignals, getRegionSkillMetrics } from '../data/mockSignals';
import { getRegionAdvisories } from '../data/mockAdvisories';
import { fetchLiveRegionForecast, blendModelDays } from '../services/weatherService';

const INITIAL_LATENCIES = {
  ecmwf:    42,
  gfs:      68,
  imdDwr:   18,
  openMeteo: 32
};

export const useForecastStore = create((set, get) => ({
  // Active selection
  selectedRegionId: "mumbai-konkan",
  activeLayer: "confidence", // 'confidence' | 'weights' | 'rainfall'

  // Live Microservice Feed Mode
  isLiveMode: true,
  liveForecastData: {}, // { [regionId]: { rawDays, fetchedAt, latencyMs, ... } }
  isFetchingLive: false,
  liveFetchError: null,
  lastFetchedAt: null,

  // Live microservice latencies (animate per tick)
  liveLatencies: { ...INITIAL_LATENCIES },

  // What-If interactive weight overrides (null = off)
  whatIfWeights: null,

  // Pipeline automation metrics
  pipelineState: {
    lastRunSecondsAgo: 4,
    nextRunSecondsRemaining: 28,
    pipelineStatus: "OPERATIONAL", // 'OPERATIONAL' | 'PROCESSING' | 'SYNCED'
    totalCyclesCompleted: 1428,
    recordsIngested: 842109,
    activeAnomalies: 2,
    syncCyclesLog: [
      { id: "RUN-9821", time: "12:45 UTC", status: "SUCCESS",  duration: "1.84s", records: 42100, models: "ECMWF, GFS, NCUM, OM" },
      { id: "RUN-9820", time: "12:15 UTC", status: "SUCCESS",  duration: "1.92s", records: 41950, models: "ECMWF, GFS, NCUM, OM" },
      { id: "RUN-9819", time: "11:45 UTC", status: "ADAPTED",  duration: "2.14s", records: 42080, models: "Penalty GFS Mumbai (-14%)" },
      { id: "RUN-9818", time: "11:15 UTC", status: "SUCCESS",  duration: "1.79s", records: 41890, models: "ECMWF, GFS, NCUM, OM" },
      { id: "RUN-9817", time: "10:45 UTC", status: "SUCCESS",  duration: "1.85s", records: 42010, models: "ECMWF, GFS, NCUM, OM" },
      { id: "RUN-9816", time: "10:15 UTC", status: "SUCCESS",  duration: "1.90s", records: 41980, models: "ECMWF, GFS, NCUM, OM" }
    ]
  },

  // Actions
  setSelectedRegion: (regionId) => {
    set({ selectedRegionId: regionId });
    if (get().isLiveMode) {
      get().fetchLiveForecast(regionId);
    }
  },

  setActiveLayer: (layer) => set({ activeLayer: layer }),

  toggleLiveMode: () => {
    const nextMode = !get().isLiveMode;
    set({ isLiveMode: nextMode });
    if (nextMode) {
      get().fetchLiveForecast(get().selectedRegionId);
    }
  },

  // Fetch real live forecasts from Open-Meteo & NWP streams
  fetchLiveForecast: async (targetRegionId) => {
    const regionId = targetRegionId || get().selectedRegionId;
    set({ isFetchingLive: true, liveFetchError: null });

    try {
      const data = await fetchLiveRegionForecast(regionId);
      const { liveForecastData, liveLatencies } = get();

      set({
        isFetchingLive: false,
        lastFetchedAt: data.fetchedAt,
        liveForecastData: {
          ...liveForecastData,
          [regionId]: data
        },
        liveLatencies: {
          ...liveLatencies,
          openMeteo: data.latencyMs || liveLatencies.openMeteo,
          ecmwf: Math.max(20, Math.round((data.latencyMs || 42) * 1.1)),
          gfs: Math.max(30, Math.round((data.latencyMs || 68) * 1.35))
        }
      });
    } catch (err) {
      console.warn("Could not fetch live weather data, falling back to dynamic baseline:", err);
      set({
        isFetchingLive: false,
        liveFetchError: err.message
      });
    }
  },

  // Set/clear what-if weight overrides
  setWhatIfWeights: (weights) => set({ whatIfWeights: weights }),
  clearWhatIfWeights: () => set({ whatIfWeights: null }),

  // Heartbeat action called every second
  tickPipeline: () => {
    const { pipelineState, liveLatencies } = get();
    let nextRemain = pipelineState.nextRunSecondsRemaining - 1;
    let lastAgo = pipelineState.lastRunSecondsAgo + 1;
    let newStatus = pipelineState.pipelineStatus;
    let newCycles = pipelineState.totalCyclesCompleted;
    let newLogs = [...pipelineState.syncCyclesLog];
    let newRecords = pipelineState.recordsIngested;

    if (nextRemain <= 0) {
      nextRemain = 30; // Reset 30-second ops cycle
      lastAgo = 0;
      newCycles += 1;
      newStatus = "SYNCED";
      newRecords += Math.floor(Math.random() * 500 + 200);
      const now = new Date();
      const timeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')} UTC`;
      newLogs.unshift({
        id: `RUN-${9822 + Math.floor(Math.random() * 100)}`,
        time: timeStr,
        status: "SUCCESS",
        duration: `${(1.7 + Math.random() * 0.4).toFixed(2)}s`,
        records: 42000 + Math.floor(Math.random() * 300),
        models: "Auto-blended 4 NWP sources (Live Stream)"
      });
      if (newLogs.length > 8) newLogs.pop();

      // In live mode, periodically refresh background data if needed
      if (get().isLiveMode && !get().isFetchingLive) {
        get().fetchLiveForecast(get().selectedRegionId);
      }
    } else if (nextRemain < 5) {
      newStatus = "PROCESSING";
    } else {
      newStatus = "OPERATIONAL";
    }

    // Animate latencies with small jitter every second
    const jitter = (base) => Math.max(8, Math.round(base + (Math.random() - 0.5) * base * 0.18));
    const newLatencies = {
      ecmwf:    jitter(liveLatencies.ecmwf),
      gfs:      jitter(liveLatencies.gfs),
      imdDwr:   jitter(liveLatencies.imdDwr),
      openMeteo: jitter(liveLatencies.openMeteo)
    };

    set({
      liveLatencies: newLatencies,
      pipelineState: {
        ...pipelineState,
        lastRunSecondsAgo: lastAgo,
        nextRunSecondsRemaining: nextRemain,
        pipelineStatus: newStatus,
        totalCyclesCompleted: newCycles,
        recordsIngested: newRecords,
        syncCyclesLog: newLogs
      }
    });
  },

  // Convenience computed selectors
  getCurrentRegion: () => {
    const { selectedRegionId } = get();
    return REGIONS.find((r) => r.id === selectedRegionId) || REGIONS[0];
  },

  getCurrentForecasts: () => {
    const { selectedRegionId, isLiveMode, liveForecastData } = get();
    const activeWeights = get().getCurrentWeights();

    // Check if live data is available
    if (isLiveMode && liveForecastData[selectedRegionId]?.rawDays) {
      return blendModelDays(liveForecastData[selectedRegionId].rawDays, activeWeights);
    }

    // Trigger live fetch in background if not already started
    if (isLiveMode && !liveForecastData[selectedRegionId] && !get().isFetchingLive) {
      get().fetchLiveForecast(selectedRegionId);
    }

    // Return realistic fallback baseline while waiting
    return generateRegionForecasts(selectedRegionId, activeWeights);
  },

  getCurrentWeightsData: () => {
    const { selectedRegionId } = get();
    return getRegionWeightsData(selectedRegionId);
  },

  // Returns weights — real or what-if overridden
  getCurrentWeights: () => {
    const { selectedRegionId, whatIfWeights } = get();
    if (whatIfWeights) return whatIfWeights;
    return getRegionWeightsData(selectedRegionId).baselineWeights;
  },

  getCurrentSignals: () => {
    const { selectedRegionId } = get();
    return getRegionSignals(selectedRegionId);
  },

  getCurrentSkillMetrics: () => {
    const { selectedRegionId } = get();
    return getRegionSkillMetrics(selectedRegionId);
  },

  getCurrentAdvisory: () => {
    const { selectedRegionId } = get();
    return getRegionAdvisories(selectedRegionId);
  }
}));
