
from flask import Flask, jsonify, request, send_from_directory
import yfinance as yf
import pandas as pd
import logging

# --- Flask App Setup ---
# This creates a web server that serves files from the current directory.
app = Flask(__name__, static_folder='.', static_url_path='')

# Suppress verbose logging from yfinance to keep the console clean.
logging.getLogger('yfinance').setLevel(logging.ERROR)


# --- Helper Functions for Data Fetching ---
def get_ticker_data(ticker_symbol):
    """Fetches candles, options, and metadata for a single ticker."""
    try:
        ticker = yf.Ticker(ticker_symbol)

        # 1. Get historical data (candles)
        hist = ticker.history(period="60d", interval="1d")
        if hist.empty:
            print(f"Warning: No history data for {ticker_symbol}")
            return None

        # Convert timestamp to ISO 8601 format string
        hist.index = hist.index.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
        candles = hist.reset_index().rename(columns={
            "index": "time", "Open": "open", "High": "high",
            "Low": "low", "Close": "close", "Volume": "volume"
        }).to_dict(orient='records')

        # 2. Get options chain
        top_calls, top_puts, average_iv = [], [], 0.0
        try:
            if ticker.options:
                opt = ticker.option_chain(ticker.options[0])
                calls = opt.calls.sort_values(by='volume', ascending=False).head(5)
                puts = opt.puts.sort_values(by='volume', ascending=False).head(5)

                required_cols = ['contractSymbol', 'strike', 'lastPrice', 'volume', 'openInterest', 'impliedVolatility']
                for col in required_cols:
                    if col not in calls.columns: calls[col] = 0
                    if col not in puts.columns: puts[col] = 0
                
                calls['isUnusual'] = False
                puts['isUnusual'] = False

                top_calls = calls[required_cols + ['isUnusual']].to_dict(orient='records')
                top_puts = puts[required_cols + ['isUnusual']].to_dict(orient='records')
                
                valid_ivs = pd.concat([calls['impliedVolatility'], puts['impliedVolatility']]).dropna()
                average_iv = valid_ivs.mean() if not valid_ivs.empty else 0.0
        except Exception:
             # Fails silently if options data is unavailable
            pass

        # 3. Get earnings date
        earnings_date = None
        try:
            if ticker.earnings_dates is not None and not ticker.earnings_dates.empty:
                # Get the next earnings date
                next_earnings_date = ticker.earnings_dates.index[0]
                earnings_date = next_earnings_date.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
        except Exception:
            # Fails silently if no earnings date is found
            pass

        return {
            "ticker": ticker_symbol,
            "price": candles[-1]['close'] if candles else 0,
            "candles": candles,
            "options": {
                "topCalls": top_calls,
                "topPuts": top_puts,
                "averageIV": float(average_iv)
            },
            "earningsDate": earnings_date,
            "indicators": {} # Calculated on the frontend
        }
    except Exception as e:
        print(f"Error fetching all data for {ticker_symbol}: {e}")
        return None


# --- API Endpoint ---
@app.route('/data')
def get_data():
    """Provides the market data to the frontend."""
    tickers_str = request.args.get('tickers')
    if not tickers_str:
        return jsonify({"error": "No tickers provided in ?tickers=... parameter"}), 400

    ticker_list = tickers_str.split(',')
    all_data = []
    for ticker_symbol in ticker_list:
        data = get_ticker_data(ticker_symbol.strip())
        if data:
            all_data.append(data)
    
    return jsonify({"tickers": all_data})


# --- Static File Serving ---
@app.route('/')
def serve_index():
    """Serves the main index.html file."""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static_files(path):
    """Serves other files like .tsx, .css, etc."""
    return send_from_directory('.', path)


if __name__ == '__main__':
    print("Starting Flask server...")
    print("Dashboard will be available at http://localhost:5000")
    # Use port 5000, a common development port. `debug=False` is better for this use case.
    app.run(port=5000, debug=False)
