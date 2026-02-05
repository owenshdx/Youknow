
import React, { useState } from 'react';
import { TickerData } from '../types';
import { Card } from './ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area, Bar } from 'recharts';

interface TickerChartProps {
  tickerData: TickerData;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2 bg-gray-700 border border-gray-600 rounded-md text-sm">
        <p className="label">{`Time : ${new Date(label).toLocaleTimeString()}`}</p>
        <p className="text-cyan-400">{`Close : ${data.close?.toFixed(2)}`}</p>
        <p className="text-yellow-400">{`MA50 : ${data.ma50?.toFixed(2)}`}</p>
        <p className="text-purple-400">{`RSI : ${data.rsi?.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};

const TickerChart: React.FC<TickerChartProps> = ({ tickerData }) => {
  const [candleCount, setCandleCount] = useState<number>(100);

  const chartData = tickerData.candles.map((c, i) => ({
    time: c.time,
    close: c.close,
    ma50: tickerData.indicators.ma50?.[i],
    bbUpper: tickerData.indicators.bollingerBands?.upper[i],
    bbLower: tickerData.indicators.bollingerBands?.lower[i],
    rsi: tickerData.indicators.rsi?.[i],
    macd: tickerData.indicators.macd?.macd[i],
    macdSignal: tickerData.indicators.macd?.signal[i],
    macdHist: tickerData.indicators.macd?.histogram[i],
  })).slice(-candleCount);

  const rangeOptions = [
      { label: '50D', value: 50 },
      { label: '100D', value: 100 },
      { label: 'All', value: tickerData.candles.length }
  ];

  return (
    <Card>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-200 mb-2 sm:mb-0">{tickerData.ticker} - Price Chart & Indicators</h3>
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Range:</span>
            {rangeOptions.map(opt => (
                <button 
                    key={opt.label}
                    onClick={() => setCandleCount(opt.value)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        candleCount === opt.value 
                            ? 'bg-cyan-600 text-white' 
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
      </div>
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis dataKey="time" tickFormatter={(time) => new Date(time).toLocaleTimeString()} stroke="#A0AEC0" />
            <YAxis yAxisId="left" stroke="#A0AEC0" domain={['dataMin - 5', 'dataMax + 5']} />
            <YAxis yAxisId="right" orientation="right" stroke="#A0AEC0" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area yAxisId="left" type="monotone" dataKey="bbUpper" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} dot={false} name="BB Upper" />
            <Area yAxisId="left" type="monotone" dataKey="bbLower" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} dot={false} name="BB Lower" />
            <Line yAxisId="left" type="monotone" dataKey="close" stroke="#22d3ee" strokeWidth={2} dot={false} name="Price" />
            <Line yAxisId="left" type="monotone" dataKey="ma50" stroke="#facc15" strokeWidth={1.5} dot={false} name="50 MA" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div style={{ width: '100%', height: 150 }} className="mt-4">
        <ResponsiveContainer>
          <ComposedChart data={chartData}>
             <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis dataKey="time" tickFormatter={(time) => new Date(time).toLocaleTimeString()} stroke="#A0AEC0" />
            <YAxis yAxisId="left" stroke="#A0AEC0" domain={[0, 100]} ticks={[30, 70]}/>
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="rsi" stroke="#c084fc" strokeWidth={1.5} dot={false} name="RSI (14)" />
            <Line yAxisId="left" type="monotone" dataKey={() => 70} stroke="#f87171" strokeDasharray="5 5" dot={false} />
            <Line yAxisId="left" type="monotone" dataKey={() => 30} stroke="#4ade80" strokeDasharray="5 5" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div style={{ width: '100%', height: 150 }} className="mt-4">
        <ResponsiveContainer>
          <ComposedChart data={chartData}>
             <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis dataKey="time" tickFormatter={(time) => new Date(time).toLocaleTimeString()} stroke="#A0AEC0" />
            <YAxis yAxisId="left" stroke="#A0AEC0" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="macdHist" name="Histogram" >
              {chartData.map((entry, index) => (
                <Bar key={`cell-${index}`} fill={entry.macdHist > 0 ? '#4ade80' : '#f87171'} />
              ))}
            </Bar>
            <Line yAxisId="left" type="monotone" dataKey="macd" stroke="#fb923c" dot={false} name="MACD" />
            <Line yAxisId="left" type="monotone" dataKey="macdSignal" stroke="#60a5fa" dot={false} name="Signal" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default TickerChart;
