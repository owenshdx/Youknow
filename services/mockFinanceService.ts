
import { TickerData, Candle, OptionContract, OptionsData } from '../types';
import { UNUSUAL_VOLUME_MULTIPLIER, EARNINGS_PROXIMITY_DAYS } from '../constants';
import { calculateIndicators } from '../utils/technicalIndicators';

// Define more realistic profiles for each ticker
const TICKER_PROFILES: { [key: string]: { base: number; range: number; volatility: number } } = {
  AAPL: { base: 190, range: 40, volatility: 1.2 },
  TSLA: { base: 180, range: 60, volatility: 2.5 },
  SPY: { base: 500, range: 50, volatility: 0.8 },
  NFLX: { base: 650, range: 80, volatility: 2.0 },
  AMZN: { base: 180, range: 30, volatility: 1.5 },
  GOOGL: { base: 170, range: 30, volatility: 1.3 },
  IWM: { base: 200, range: 40, volatility: 1.1 },
  DEFAULT: { base: 150, range: 50, volatility: 1.0 },
};

// Helper to generate a more realistic price path with trends and volatility
const generateCandles = (ticker: string, numCandles = 200): { candles: Candle[], currentPrice: number } => {
  const profile = TICKER_PROFILES[ticker] || TICKER_PROFILES.DEFAULT;
  const candles: Candle[] = [];
  
  // Start with a price in the defined range
  let currentPrice = profile.base - profile.range / 2 + Math.random() * profile.range;

  let trend = Math.random() > 0.5 ? 1 : -1; // Start with an up or down trend

  for (let i = 0; i < numCandles; i++) {
    // Small chance for the trend to reverse
    if (Math.random() < 0.05) {
      trend *= -1;
    }

    const open = currentPrice;
    
    // Generate a change influenced by trend and volatility
    const volatilityFactor = (currentPrice * 0.005) * profile.volatility;
    const trendInfluence = trend * Math.random() * 0.3; // Make trend effect random
    const randomNoise = (Math.random() - 0.5) * 1.5;
    const change = (trendInfluence + randomNoise) * volatilityFactor;

    const close = currentPrice + change;

    // Ensure high is highest and low is lowest
    const high = Math.max(open, close) + Math.random() * volatilityFactor * 0.5;
    const low = Math.min(open, close) - Math.random() * volatilityFactor * 0.5;
    
    const volume = 100000 + Math.random() * 500000;
    
    const time = new Date();
    time.setMinutes(time.getMinutes() - (numCandles - i));

    candles.push({ time: time.toISOString(), open, high, low, close, volume });
    currentPrice = close;
  }
  return { candles, currentPrice: candles[candles.length - 1].close };
};

const generateOptionsChain = (ticker: string, currentPrice: number): OptionsData => {
  const topCalls: OptionContract[] = [];
  const topPuts: OptionContract[] = [];
  let totalIV = 0;

  for (let i = 0; i < 5; i++) {
    // Calls
    const callStrike = Math.ceil(currentPrice / 5) * 5 + i * 5;
    const callVolume = 500 + Math.random() * 5000;
    topCalls.push({
      contractSymbol: `${ticker}C${callStrike}`,
      strike: callStrike,
      lastPrice: Math.max(0.1, currentPrice - callStrike + Math.random() * 5),
      volume: callVolume,
      openInterest: callVolume * (2 + Math.random() * 5),
      impliedVolatility: 0.2 + Math.random() * 0.6,
      isUnusual: Math.random() > 0.8, // 20% chance of being unusual
    });
    totalIV += topCalls[i].impliedVolatility;

    // Puts
    const putStrike = Math.floor(currentPrice / 5) * 5 - i * 5;
    const putVolume = 500 + Math.random() * 5000;
    topPuts.push({
      contractSymbol: `${ticker}P${putStrike}`,
      strike: putStrike,
      lastPrice: Math.max(0.1, putStrike - currentPrice + Math.random() * 5),
      volume: putVolume,
      openInterest: putVolume * (2 + Math.random() * 5),
      impliedVolatility: 0.2 + Math.random() * 0.6,
      isUnusual: Math.random() > 0.8,
    });
    totalIV += topPuts[i].impliedVolatility;
  }
  
  // Simulate unusual volume based on multiplier logic
  const avgCallVol = topCalls.reduce((acc, c) => acc + c.volume, 0) / topCalls.length;
  topCalls.forEach(c => {
      c.isUnusual = c.volume > avgCallVol * UNUSUAL_VOLUME_MULTIPLIER;
  });
  const avgPutVol = topPuts.reduce((acc, p) => acc + p.volume, 0) / topPuts.length;
  topPuts.forEach(p => {
      p.isUnusual = p.volume > avgPutVol * UNUSUAL_VOLUME_MULTIPLIER;
  });


  return { topCalls, topPuts, averageIV: totalIV / 10 };
};

const getEarningsDate = (ticker: string): Date | null => {
    // Give some tickers an upcoming earnings date
    const seed = ticker.charCodeAt(0);
    if (seed % 3 === 0) {
        const date = new Date();
        const daysToAdd = Math.floor(Math.random() * (EARNINGS_PROXIMITY_DAYS + 2));
        date.setDate(date.getDate() + daysToAdd);
        return date;
    }
    return null;
}

const fetchTickerData = async (ticker: string): Promise<TickerData> => {
  const { candles, currentPrice } = generateCandles(ticker);
  const options = generateOptionsChain(ticker, currentPrice);
  const indicators = calculateIndicators(candles);
  const earningsDate = getEarningsDate(ticker);

  return {
    ticker,
    price: currentPrice,
    candles,
    indicators,
    options,
    earningsDate,
  };
};

export const fetchAllTickerData = async (tickers: string[]): Promise<TickerData[]> => {
  return Promise.all(tickers.map(fetchTickerData));
};
