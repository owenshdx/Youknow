
import React, { useState, useEffect } from 'react';
import { Signal, IVLevel } from '../types';
import { Card } from './ui/Card';

const loadSignalHistory = (): Signal[] => {
  try {
    const saved = localStorage.getItem('signalHistory');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load signal history:", error);
    return [];
  }
};

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

const SignalHistory: React.FC = () => {
  const [history, setHistory] = useState<Signal[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (showHistory) {
      setHistory(loadSignalHistory());
    }
  }, [showHistory]);

  const clearHistory = () => {
    localStorage.removeItem('signalHistory');
    setHistory([]);
  };
  
  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-200">Signal Log</h3>
        <div>
            <button
                onClick={() => setShowHistory(!showHistory)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md mr-2"
            >
                {showHistory ? 'Hide' : 'Show'} History
            </button>
            {showHistory && (
                 <button
                    onClick={clearHistory}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md"
                >
                    Clear History
                </button>
            )}
        </div>
      </div>

      {showHistory && (
        <div className="overflow-auto max-h-96">
          {history.length > 0 ? (
            <table className="w-full text-left text-sm">
                <thead className="text-xs text-gray-400 uppercase bg-gray-900/50 sticky top-0">
                    <tr>
                    <th className="p-2">Timestamp</th>
                    <th className="p-2">Ticker</th>
                    <th className="p-2">Price</th>
                    <th className="p-2">Call Score</th>
                    <th className="p-2">Put Score</th>
                    <th className="p-2">IV Level</th>
                    <th className="p-2">Unusual Vol</th>
                    <th className="p-2">Earnings</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map((signal, index) => (
                    <tr key={index} className="border-b border-gray-700">
                        <td className="p-2 text-gray-400">{new Date(signal.timestamp).toLocaleString()}</td>
                        <td className="p-2 font-bold">{signal.ticker}</td>
                        <td className="p-2">${signal.price.toFixed(2)}</td>
                        <td className={`p-2 font-semibold ${getScoreColor(signal.callScore)}`}>{signal.callScore}</td>
                        <td className={`p-2 font-semibold ${getScoreColor(signal.putScore)}`}>{signal.putScore}</td>
                        <td className={`p-2 font-semibold ${getIVColor(signal.ivLevel)}`}>{signal.ivLevel}</td>
                        <td className="p-2">{signal.unusualVolume ? '🔥' : '-'}</td>
                        <td className="p-2">{signal.earningsSoon ? '⚠️' : '-'}</td>
                    </tr>
                    ))}
                </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-center py-4">No signal history found.</p>
          )}
        </div>
      )}
    </Card>
  );
};

export default SignalHistory;
