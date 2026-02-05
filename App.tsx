
import React, { useState, useMemo } from 'react';
import { useMarketData } from './hooks/useMarketData';
import { Signal, TickerData, IVLevel } from './types';
import TickerChart from './components/TickerChart';
import OptionsAnalysis from './components/OptionsAnalysis';
import SignalHistory from './components/SignalHistory';
import { Card } from './components/ui/Card';
import HistoricalSignalComparison from './components/HistoricalSignalComparison';

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
};

const getIVColor = (ivLevel: IVLevel) => {
    switch (ivLevel) {
        case 'High': return 'text-red-400';
        case 'Low': return 'text-green-400';
        default: return 'text-gray-400';
    }
}

const DataStatusBanner: React.FC<{ status: 'mock' | 'live' | 'loading', onRetry: () => void }> = ({ status, onRetry }) => {
    if (status !== 'mock') return null;

    return (
        <div className="bg-yellow-800/50 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-lg relative mb-6 flex justify-between items-center" role="alert">
            <div>
                <strong className="font-bold">Local Backend Connection Failed!</strong>
                <span className="block sm:inline ml-2">Displaying mock data. Please ensure the Python server is running. See `backend_instructions.md` for setup.</span>
            </div>
            <button onClick={onRetry} className="bg-yellow-600/50 hover:bg-yellow-500/50 text-white font-bold py-2 px-4 rounded-md">
                Retry Connection
            </button>
        </div>
    );
};


const App: React.FC = () => {
  const { marketData, signals, isMarketOpen, lastUpdated, dataStatus, retryLiveConnect } = useMarketData();
  const [selectedTicker, setSelectedTicker] = useState<string | null>('AAPL');
  const [minScore, setMinScore] = useState(0);
  const [ivFilter, setIvFilter] = useState<IVLevel | 'All'>('All');
  const [unusualVolumeOnly, setUnusualVolumeOnly] = useState(false);

  const selectedTickerData = useMemo(() => {
    return marketData.find(d => d.ticker === selectedTicker) || null;
  }, [marketData, selectedTicker]);
  
  const currentSignal = useMemo(() => {
      return signals.find(s => s.ticker === selectedTicker);
  }, [signals, selectedTicker]);

  const filteredSignals = useMemo(() => {
    return signals.filter(signal => {
      const scoreCondition = signal.callScore >= minScore || signal.putScore >= minScore;
      const ivCondition = ivFilter === 'All' || signal.ivLevel === ivFilter;
      const volumeCondition = !unusualVolumeOnly || signal.unusualVolume;
      return scoreCondition && ivCondition && volumeCondition;
    });
  }, [signals, minScore, ivFilter, unusualVolumeOnly]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex flex-col sm:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400">Options Analysis Dashboard</h1>
            <p className="text-gray-400">Personal-use tool for identifying opportunities</p>
          </div>
          <div className="text-right mt-4 sm:mt-0">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isMarketOpen ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                <span className={`h-2 w-2 rounded-full ${isMarketOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>Market is {isMarketOpen ? 'Open' : 'Closed'}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Last Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'N/A'}</p>
          </div>
        </header>
        
        <DataStatusBanner status={dataStatus} onRetry={retryLiveConnect} />

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <h2 className="text-xl font-semibold mb-4 text-gray-200">Watchlist Signals</h2>
                <div className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex flex-col">
                        <label htmlFor="minScore" className="text-sm text-gray-400 mb-1">Min Score</label>
                        <input type="range" id="minScore" min="0" max="100" value={minScore} onChange={e => setMinScore(Number(e.target.value))} className="w-40" />
                        <span className="text-sm text-center">{minScore}</span>
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="ivFilter" className="text-sm text-gray-400 mb-1">IV Level</label>
                        <select id="ivFilter" value={ivFilter} onChange={e => setIvFilter(e.target.value as IVLevel | 'All')} className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1">
                            <option value="All">All</option>
                            <option value="High">High</option>
                            <option value="Normal">Normal</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" id="unusualVolume" checked={unusualVolumeOnly} onChange={e => setUnusualVolumeOnly(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600"/>
                        <label htmlFor="unusualVolume" className="ml-2 text-sm text-gray-300">Unusual Volume Only</label>
                    </div>
                </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                    <tr>
                      <th className="p-3">Ticker</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Call Score</th>
                      <th className="p-3">Put Score</th>
                      <th className="p-3">IV Level</th>
                      <th className="p-3">Unusual Volume</th>
                      <th className="p-3">Earnings Soon</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataStatus === 'loading' ? (
                        <tr>
                            <td colSpan={7} className="text-center p-6 text-gray-400">Loading market data...</td>
                        </tr>
                    ) : filteredSignals.length === 0 ? (
                         <tr>
                            <td colSpan={7} className="text-center p-6 text-gray-400">No signals match your filters.</td>
                        </tr>
                    ) : (
                        filteredSignals.map(signal => (
                          <tr 
                            key={signal.ticker} 
                            className="border-b border-gray-700 hover:bg-gray-800 cursor-pointer"
                            onClick={() => setSelectedTicker(signal.ticker)}
                          >
                            <td className={`p-3 font-bold ${selectedTicker === signal.ticker ? 'text-cyan-400' : ''}`}>{signal.ticker}</td>
                            <td className="p-3">${signal.price.toFixed(2)}</td>
                            <td className={`p-3 font-semibold ${getScoreColor(signal.callScore)}`}>{signal.callScore}</td>
                            <td className={`p-3 font-semibold ${getScoreColor(signal.putScore)}`}>{signal.putScore}</td>
                            <td className={`p-3 font-semibold ${getIVColor(signal.ivLevel)}`}>{signal.ivLevel}</td>
                            <td className="p-3">{signal.unusualVolume ? '🔥' : '-'}</td>
                            <td className="p-3">{signal.earningsSoon ? '⚠️' : '-'}</td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {selectedTickerData && (
            <>
              <div className="lg:col-span-2">
                 <TickerChart tickerData={selectedTickerData} />
              </div>
              <div>
                <OptionsAnalysis optionsData={selectedTickerData.options} />
                <HistoricalSignalComparison currentSignal={currentSignal} />
              </div>
            </>
          )}

          <div className="lg:col-span-3">
             <SignalHistory />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
