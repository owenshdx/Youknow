
import { Candle, Indicators } from '../types';

const calculateSMA = (data: number[], period: number): number[] => {
    const result: number[] = [];
    for (let i = period - 1; i < data.length; i++) {
        const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        result.push(sum / period);
    }
    // Pad with nulls at the beginning
    return Array(period - 1).fill(null).concat(result);
};

const calculateEMA = (data: number[], period: number): number[] => {
    const multiplier = 2 / (period + 1);
    const ema: number[] = [];
    if (data.length < period) return Array(data.length).fill(null);

    let sma = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    ema.push(sma);

    for (let i = period; i < data.length; i++) {
        const currentEma = (data[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
        ema.push(currentEma);
    }
     // Pad with nulls at the beginning
    return Array(period - 1).fill(null).concat(ema);
};


const calculateBollingerBands = (data: number[], period: number, stdDev: number) => {
    const middle: number[] = [];
    const upper: number[] = [];
    const lower: number[] = [];
    
    for (let i = period - 1; i < data.length; i++) {
        const slice = data.slice(i - period + 1, i + 1);
        const mean = slice.reduce((a, b) => a + b, 0) / period;
        const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
        const sd = Math.sqrt(variance);
        
        middle.push(mean);
        upper.push(mean + stdDev * sd);
        lower.push(mean - stdDev * sd);
    }
     // Pad with nulls
    const padding = Array(period - 1).fill(null);
    return { 
        upper: padding.concat(upper), 
        middle: padding.concat(middle), 
        lower: padding.concat(lower) 
    };
};

const calculateRSI = (data: number[], period: number): number[] => {
    const rsi: number[] = [];
    let avgGain = 0;
    let avgLoss = 0;

    if (data.length <= period) return Array(data.length).fill(null);

    for (let i = 1; i <= period; i++) {
        const change = data[i] - data[i - 1];
        if (change > 0) {
            avgGain += change;
        } else {
            avgLoss -= change;
        }
    }
    avgGain /= period;
    avgLoss /= period;
    
    let rs = avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));

    for (let i = period + 1; i < data.length; i++) {
        const change = data[i] - data[i - 1];
        let gain = change > 0 ? change : 0;
        let loss = change < 0 ? -change : 0;

        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;

        rs = avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
    }
    
    return Array(period).fill(null).concat(rsi);
};

const calculateMACD = (data: number[], fast: number, slow: number, signal: number) => {
    const emaFast = calculateEMA(data, fast);
    const emaSlow = calculateEMA(data, slow);
    
    const macdLine = emaSlow.map((slowVal, i) => slowVal !== null && emaFast[i] !== null ? emaFast[i] - slowVal : null);
    
    const validMacd = macdLine.filter(val => val !== null) as number[];
    if (validMacd.length === 0) {
        return { macd: [], signal: [], histogram: [] };
    }

    const signalLine = calculateEMA(validMacd, signal);
    
    // Align signal line with original MACD line
    const alignedSignalLine = Array(macdLine.length - signalLine.length).fill(null).concat(signalLine);

    const histogram = macdLine.map((macdVal, i) => macdVal !== null && alignedSignalLine[i] !== null ? macdVal - alignedSignalLine[i] : null);

    return { macd: macdLine, signal: alignedSignalLine, histogram };
};


export const calculateIndicators = (candles: Candle[]): Indicators => {
    const closePrices = candles.map(c => c.close);
    
    const ma50 = calculateSMA(closePrices, 50);
    const bollingerBands = calculateBollingerBands(closePrices, 20, 2);
    const rsi = calculateRSI(closePrices, 14);
    const macd = calculateMACD(closePrices, 12, 26, 9);

    return { ma50, bollingerBands, rsi, macd };
};
