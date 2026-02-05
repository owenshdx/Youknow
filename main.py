
import streamlit as st
import yfinance as yf
import pandas as pd
from streamlit_cors import add_cors_headers

# --- Helper Functions for Data Fetching ---

def get_ticker_data(ticker_symbol):
    """Fetches candles, options, and metadata for a single ticker."""
    ticker = yf.Ticker(ticker_symbol)

    # 1. Get historical data (candles) - 60 days of 1-minute data is a common intraday scope
    # Note: yfinance 1m data is limited to the last 7 days. We'll use a larger timeframe for indicators.
    hist = ticker.history(period="60d", interval="1d")
    if hist.empty:
        return None

    # Convert timestamp to ISO 8601 format string
    hist.index = hist.index.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
    candles = hist.reset_index().rename(columns={
        "index": "time", "Open": "open", "High": "high",
        "Low": "low", "Close": "close", "Volume": "volume"
    }).to_dict(orient='records')

    # 2. Get options chain
    try:
        opt = ticker.option_chain(ticker.options[0])
        calls = opt.calls.sort_values(by='volume', ascending=False).head(5)
        puts = opt.puts.sort_values(by='volume', ascending=False).head(5)

        # Ensure required columns exist, adding them with default values if they don't
        for col in ['contractSymbol', 'strike', 'lastPrice', 'volume', 'openInterest', 'impliedVolatility']:
            if col not in calls.columns:
                calls[col] = 0
            if col not in puts.columns:
                puts[col] = 0
        
        # We don't have a reliable "isUnusual" flag, so we'll set it to False
        calls['isUnusual'] = False
        puts['isUnusual'] = False
        
        top_calls = calls[['contractSymbol', 'strike', 'lastPrice', 'volume', 'openInterest', 'impliedVolatility', 'isUnusual']].to_dict(orient='records')
        top_puts = puts[['contractSymbol', 'strike', 'lastPrice', 'volume', 'openInterest', 'impliedVolatility', 'isUnusual']].to_dict(orient='records')
        
        average_iv = (calls['impliedVolatility'].mean() + puts['impliedVolatility'].mean()) / 2
    except Exception as e:
        # If options data fails, provide empty structure
        top_calls = []
        top_puts = []
        average_iv = 0.0

    # 3. Get earnings date
    try:
        earnings_date = ticker.earnings_dates.index[0].strftime('%Y-%m-%dT%H:%M:%S.%fZ') if ticker.earnings_dates is not None and not ticker.earnings_dates.empty else None
    except Exception as e:
        earnings_date = None

    return {
        "ticker": ticker_symbol,
        "price": hist['Close'].iloc[-1],
        "candles": candles,
        "options": {
            "topCalls": top_calls,
            "topPuts": top_puts,
            "averageIV": average_iv
        },
        "earningsDate": earnings_date,
        # Indicators are calculated on the frontend, so we don't need to compute them here.
        "indicators": {} 
    }

# --- Streamlit App Setup ---

# Configure the page to be minimal - we're just using it as an API server
st.set_page_config(layout="wide")

# This is the key part for allowing the frontend to connect
add_cors_headers()

# Get tickers from query parameters
query_params = st.query_params
tickers_str = query_params.get("tickers", "")

if tickers_str:
    ticker_list = tickers_str.split(',')
    
    all_data = []
    for ticker_symbol in ticker_list:
        data = get_ticker_data(ticker_symbol)
        if data:
            all_data.append(data)
    
    # Return the data as a JSON object
    st.json({"tickers": all_data})
else:
    st.json({"error": "No tickers provided. Use ?tickers=AAPL,TSLA format."})

# Hide the default Streamlit UI elements
st.markdown("""
<style>
    /* This hides the main Streamlit app UI */
    .stApp {
        display: none;
    }
</style>
""", unsafe_allow_html=True)
