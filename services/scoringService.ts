
import { TickerData, Signal, IVLevel } from '../types';
import { SCORING_WEIGHTS, IV_HIGH_THRESHOLD, IV_LOW_THRESHOLD, EARNINGS_PROXIMITY_DAYS } from '../constants';
import { isWithinTradingDays } from '../utils/time';

const normalizeScore = (score: number, totalWeight: number): number => {
    return Math.round(Math.max(0, Math.min(100, (score / totalWeight) * 100)));
};

export const calculateScores = (allData: TickerData[]): Signal[] => {
    const totalWeight = Object.values(SCORING_WEIGHTS).reduce((a, b) => a + b, 0);

    return allData.map(data => {
        let callScore = 0;
        let putScore = 0;

        const closePrices = data.candles.map(c => c.close);
        const lastPrice = closePrices[closePrices.length - 1];
        
        // 1. Price vs 50 MA
        const ma50 = data.indicators.ma50;
        if (ma50 && ma50.length > 0) {
            const lastMa50 = ma50[ma50.length - 1];
            if (lastPrice > lastMa50) {
                callScore += SCORING_WEIGHTS.PRICE_VS_MA;
            } else {
                putScore += SCORING_WEIGHTS.PRICE_VS_MA;
            }
        }

        // 2. RSI
        const rsi = data.indicators.rsi;
        if (rsi && rsi.length > 1) {
            const lastRsi = rsi[rsi.length - 1];
            const prevRsi = rsi[rsi.length - 2];
            if (lastRsi > prevRsi && lastRsi >= 40 && lastRsi <= 65) {
                callScore += SCORING_WEIGHTS.RSI;
            }
            if (lastRsi < prevRsi && lastRsi >= 35 && lastRsi <= 60) {
                putScore += SCORING_WEIGHTS.RSI;
            }
        }

        // 3. MACD
        const macd = data.indicators.macd;
        if (macd && macd.histogram.length > 1) {
            const lastHist = macd.histogram[macd.histogram.length - 1];
            const prevHist = macd.histogram[macd.histogram.length - 2];
            // Positive crossover
            if (lastHist > 0 && prevHist <= 0) {
                callScore += SCORING_WEIGHTS.MACD;
            }
            // Negative crossover
            if (lastHist < 0 && prevHist >= 0) {
                putScore += SCORING_WEIGHTS.MACD;
            }
        }

        // 4. Options Flow (Unusual Volume)
        const unusualCallVolume = data.options.topCalls.some(c => c.isUnusual);
        const unusualPutVolume = data.options.topPuts.some(p => p.isUnusual);
        if (unusualCallVolume) callScore += SCORING_WEIGHTS.OPTIONS_VOLUME;
        if (unusualPutVolume) putScore += SCORING_WEIGHTS.OPTIONS_VOLUME;

        // 5. IV Context
        const avgIV = data.options.averageIV;
        if (avgIV < IV_LOW_THRESHOLD) {
             // Low IV is good for buying both
            callScore += SCORING_WEIGHTS.IV;
            putScore += SCORING_WEIGHTS.IV;
        } else if (avgIV > IV_HIGH_THRESHOLD) {
            // High IV is bad for buying, reduce score by half the weight
            callScore -= SCORING_WEIGHTS.IV / 2;
            putScore -= SCORING_WEIGHTS.IV / 2;
        }

        let finalCallScore = normalizeScore(callScore, totalWeight);
        let finalPutScore = normalizeScore(putScore, totalWeight);

        // 6. Earnings Proximity Penalty
        const earningsSoon = data.earningsDate ? isWithinTradingDays(data.earningsDate, EARNINGS_PROXIMITY_DAYS) : false;
        if (earningsSoon) {
            finalCallScore = Math.round(finalCallScore * 0.5);
            finalPutScore = Math.round(finalPutScore * 0.5);
        }
        
        const ivLevel: IVLevel = avgIV > IV_HIGH_THRESHOLD ? 'High' : (avgIV < IV_LOW_THRESHOLD ? 'Low' : 'Normal');

        return {
            timestamp: new Date().toISOString(),
            ticker: data.ticker,
            price: lastPrice,
            callScore: finalCallScore,
            putScore: finalPutScore,
            ivLevel,
            unusualVolume: unusualCallVolume || unusualPutVolume,
            earningsSoon,
        };
    });
};
