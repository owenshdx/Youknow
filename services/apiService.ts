
import { TickerData } from '../types';

/**
 * NOTE TO USER:
 * This service is now configured to fetch data from your local Python backend
 * running on http://localhost:8501. This is the most reliable method and avoids
 * errors from public proxies.
 *
 * To get live data, you MUST run the Python server as described in `backend_instructions.md`.
 * If the server is not running, the app will fall back to mock data.
 */
export const fetchAllTickerData = async (tickers: string[]): Promise<TickerData[]> => {
  try {
    const response = await fetch(`http://localhost:8501/data?tickers=${tickers.join(',')}`);
    
    if (!response.ok) {
        // This will be caught by the calling hook, triggering the mock data fallback.
        throw new Error(`Failed to fetch from local backend (status: ${response.status})`);
    }
    
    const data = await response.json();

    if (data && data.tickers) {
        // The backend returns dates as ISO strings, so we must convert them back to Date objects.
        return data.tickers.map((ticker: any) => ({
            ...ticker,
            earningsDate: ticker.earningsDate ? new Date(ticker.earningsDate) : null
        }));
    } else {
        console.error("Backend response was malformed:", data);
        throw new Error("Malformed response from local backend.");
    }

  } catch (error) {
    console.error("Error connecting to local backend. Is the Python server running? See `backend_instructions.md`.", error);
    // Re-throw the error to ensure the fallback to mock data is triggered.
    throw error;
  }
};
