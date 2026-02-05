
import React, { useMemo } from 'react';
import { Signal } from '../types';
import { Card } from './ui/Card';

interface HistoricalSignalComparisonProps {
  currentSignal: Signal | undefined;
}

const loadSignalHistory = (): Signal[] => {
  try {
    const saved = localStorage.getItem('signalHistory');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load signal history:", error);
    return [];
  }
};

const ScoreDisplay: React.FC<{ title: string; current: number; average: number }> = ({ title, current, average }) => {
  const difference = current - average;
  const diffColor = difference > 0 ? 'text-green-400' : difference < 0 ? 'text-red-400' : 'text-gray-400';
  
  return (
    <div>
      <h5 className="text-sm font-semibold text-gray-400">{title}</h5>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold">{current}</p>
        <p className={`text-sm font-semibold ${diffColor}`}>
          ({difference >= 0 ? '+' : ''}{difference.toFixed(0)} vs avg)
        </p>
      </div>
      <p className="text-xs text-gray-500">Hist. Avg: {average.toFixed(0)}</p>
    </div>
  );
};


const HistoricalSignalComparison: React.FC<HistoricalSignalComparisonProps> = ({ currentSignal }) => {
  const historicalAverages = useMemo(() => {
    if (!currentSignal) return { avgCall: 0, avgPut: 0, count: 0 };

    const history = loadSignalHistory();
    const tickerHistory = history.filter(s => s.ticker === currentSignal.ticker);

    if (tickerHistory.length === 0) return { avgCall: 0, avgPut: 0, count: 0 };

    const totalCall = tickerHistory.reduce((acc, s) => acc + s.callScore, 0);
    const totalPut = tickerHistory.reduce((acc, s) => acc + s.putScore, 0);
    
    return {
      avgCall: totalCall / tickerHistory.length,
      avgPut: totalPut / tickerHistory.length,
      count: tickerHistory.length,
    };
  }, [currentSignal]);

  if (!currentSignal) {
    return null;
  }

  return (
    <Card className="mt-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-200">Historical Score Comparison</h3>
      {historicalAverages.count > 0 ? (
        <div className="grid grid-cols-2 gap-4">
            <ScoreDisplay title="Call Score" current={currentSignal.callScore} average={historicalAverages.avgCall} />
            <ScoreDisplay title="Put Score" current={currentSignal.putScore} average={historicalAverages.avgPut} />
        </div>
      ) : (
        <p className="text-gray-500 text-center py-2">Not enough historical data for this ticker.</p>
      )}
    </Card>
  );
};

export default HistoricalSignalComparison;
