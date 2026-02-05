
import { useState, useEffect, useCallback } from 'react';
import { TickerData, Signal } from '../types';
import { DEFAULT_WATCHLIST, REFRESH_INTERVAL_MS } from '../constants';
import { fetchAllTickerData as fetchLiveData } from '../services/apiService';
import { fetchAllTickerData as fetchMockData } from '../services/mockFinanceService';
import { calculateScores } from '../services/scoringService';
import { isMarketOpen } from '../utils/time';
import { calculateIndicators } from '../utils/technicalIndicators';

const loadSignalHistory = (): Signal[] => {
  try {
    const saved = localStorage.getItem('signalHistory');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load signal history:", error);
    return [];
  }
};

const saveSignalHistory = (signals: Signal[], isLive: boolean) => {
  if (!isLive) return; // Do not save signals from mock data
  try {
    const existing = loadSignalHistory();
    const updatedHistory = [...signals, ...existing].slice(0, 1000); // Keep last 1000 signals
    localStorage.setItem('signalHistory', JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Failed to save signal history:", error);
  }
};

export const useMarketData = () => {
  const [marketData, setMarketData] = useState<TickerData[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [marketOpen, setMarketOpen] = useState(isMarketOpen());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataStatus, setDataStatus] = useState<'loading' | 'live' | 'mock'>('loading');

  const processAndSetData = useCallback((rawData: TickerData[], status: 'live' | 'mock') => {
    const dataWithIndicators = rawData.map(tickerData => ({
        ...tickerData,
        indicators: calculateIndicators(tickerData.candles),
    }));
    setMarketData(dataWithIndicators);

    const newSignals = calculateScores(dataWithIndicators);
    setSignals(newSignals);
    
    if (newSignals.length > 0 && isMarketOpen()) {
      saveSignalHistory(newSignals, status === 'live');
    }
    setLastUpdated(new Date());
    setDataStatus(status);
  }, []);

  const fetchData = useCallback(async (forceLive = false) => {
    setDataStatus('loading');
    
    // If we're already on mock, stay there unless a retry is forced.
    if (dataStatus === 'mock' && !forceLive) {
      console.log("Maintaining mock data state.");
      const mockData = await fetchMockData(DEFAULT_WATCHLIST);
      processAndSetData(mockData, 'mock');
      return;
    }

    try {
      console.log("Attempting to fetch live data...");
      const liveData = await fetchLiveData(DEFAULT_WATCHLIST);
      if (liveData.length === 0) throw new Error("Live data source returned no data.");
      
      console.log("Live data fetched successfully.");
      processAndSetData(liveData, 'live');
    } catch (error) {
      console.error("Live data failed, falling back to mock data.", error);
      const mockData = await fetchMockData(DEFAULT_WATCHLIST);
      processAndSetData(mockData, 'mock');
    }
  }, [dataStatus, processAndSetData]);

  const retryLiveConnect = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    fetchData(); // Initial fetch on component mount

    const refreshInterval = setInterval(() => {
      if (isMarketOpen()) {
        fetchData(); // Periodically refresh, will respect current data state (live/mock)
      }
    }, REFRESH_INTERVAL_MS);

    const marketStatusInterval = setInterval(() => {
      setMarketOpen(isMarketOpen());
    }, 10000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(marketStatusInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  return { marketData, signals, isMarketOpen, lastUpdated, dataStatus, retryLiveConnect };
};
