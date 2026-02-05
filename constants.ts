
export const DEFAULT_WATCHLIST = ['AAPL', 'TSLA', 'SPY', 'NFLX', 'AMZN', 'GOOGL', 'IWM'];
export const REFRESH_INTERVAL_MS = 60000; // 60 seconds

// Scoring Logic Weights
export const SCORING_WEIGHTS = {
  PRICE_VS_MA: 25,
  RSI: 25,
  MACD: 20,
  OPTIONS_VOLUME: 20,
  IV: 10,
};

// Thresholds
export const IV_HIGH_THRESHOLD = 0.8;
export const IV_LOW_THRESHOLD = 0.2;
export const UNUSUAL_VOLUME_MULTIPLIER = 3;
export const EARNINGS_PROXIMITY_DAYS = 3;
