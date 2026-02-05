
export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Indicators {
  ma50?: number[];
  bollingerBands?: {
    upper: number[];
    middle: number[];
    lower: number[];
  };
  rsi?: number[];
  macd?: {
    macd: number[];
    signal: number[];
    histogram: number[];
  };
}

export interface OptionContract {
  contractSymbol: string;
  strike: number;
  lastPrice: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  isUnusual: boolean;
}

export interface OptionsData {
  topCalls: OptionContract[];
  topPuts: OptionContract[];
  averageIV: number;
}

export interface TickerData {
  ticker: string;
  price: number;
  candles: Candle[];
  indicators: Indicators;
  options: OptionsData;
  earningsDate: Date | null;
}

export type IVLevel = 'High' | 'Normal' | 'Low';

export interface Signal {
  timestamp: string;
  ticker: string;
  price: number;
  callScore: number;
  putScore: number;
  ivLevel: IVLevel;
  unusualVolume: boolean;
  earningsSoon: boolean;
}
