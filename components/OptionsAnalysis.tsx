
import React from 'react';
import { OptionsData, OptionContract } from '../types';
import { Card } from './ui/Card';
import { IV_HIGH_THRESHOLD, IV_LOW_THRESHOLD } from '../constants';

interface OptionsAnalysisProps {
  optionsData: OptionsData;
}

const OptionTable: React.FC<{ contracts: OptionContract[], type: 'Calls' | 'Puts' }> = ({ contracts, type }) => (
  <div>
    <h4 className={`text-lg font-semibold ${type === 'Calls' ? 'text-green-400' : 'text-red-400'}`}>Top {type} by Volume</h4>
    <div className="overflow-x-auto mt-2">
      <table className="w-full text-left text-sm">
        <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
          <tr>
            <th className="p-2">Strike</th>
            <th className="p-2">Volume</th>
            <th className="p-2">IV</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map(contract => (
            <tr key={contract.contractSymbol} className="border-b border-gray-700">
              <td className="p-2 font-mono">${contract.strike.toFixed(2)}</td>
              <td className={`p-2 font-mono ${contract.isUnusual ? 'text-yellow-400 font-bold' : ''}`}>
                {contract.volume}
                {contract.isUnusual && ' 🔥'}
              </td>
              <td className="p-2 font-mono">{(contract.impliedVolatility * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);


const OptionsAnalysis: React.FC<OptionsAnalysisProps> = ({ optionsData }) => {
    const ivStatus = optionsData.averageIV > IV_HIGH_THRESHOLD ? 'High' : (optionsData.averageIV < IV_LOW_THRESHOLD ? 'Low' : 'Normal');
    const ivColor = ivStatus === 'High' ? 'text-red-400' : (ivStatus === 'Low' ? 'text-green-400' : 'text-gray-300');

  return (
    <Card>
      <h3 className="text-xl font-semibold mb-4 text-gray-200">Options Analytics</h3>
        <div className="mb-4 text-center bg-gray-900/50 p-3 rounded-lg">
            <p className="text-sm text-gray-400">Average Implied Volatility</p>
            <p className={`text-2xl font-bold ${ivColor}`}>
                {(optionsData.averageIV * 100).toFixed(1)}% ({ivStatus})
            </p>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <OptionTable contracts={optionsData.topCalls} type="Calls" />
        <OptionTable contracts={optionsData.topPuts} type="Puts" />
      </div>
    </Card>
  );
};

export default OptionsAnalysis;
