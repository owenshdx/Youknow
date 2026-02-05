
# Backend Setup for Live Yahoo Finance Data

This application is designed to connect to a local Python backend to fetch live market data from Yahoo Finance. This approach is necessary because of web browser security policies (CORS) that prevent direct data requests from a website to an external service like Yahoo's.

The Python server acts as a middleman: your browser asks the local server for data, and the server gets it from Yahoo Finance for you.

## Step 1: Install Python

If you don't have Python installed, download and install the latest version from [python.org](https://www.python.org/downloads/). Make sure to check the box that says "Add Python to PATH" during installation.

## Step 2: Install Required Libraries

Open your terminal or command prompt and run the following command to install the necessary Python libraries:

```bash
pip install streamlit yfinance pandas streamlit-cors
```

- **streamlit**: A fast and easy way to create web apps in Python. We use it here to create our simple API server.
- **yfinance**: The library that pulls data directly from Yahoo Finance.
- **pandas**: A powerful data manipulation library that `yfinance` depends on.
- **streamlit-cors**: A utility to handle the CORS policy, allowing your browser's frontend to communicate with this backend.

## Step 3: Run the Backend Server

1.  Navigate to the root directory of this project in your terminal (the same directory where `main.py` is located).
2.  Run the following command:

```bash
streamlit run main.py
```

You should see output in your terminal indicating that the server is running, typically on `http://localhost:8501`. A browser window might open showing a blank page; this is normal. The server is running correctly, and the blank page is because we've hidden the UI elements.

**Leave this terminal window open.** The server needs to be running for the dashboard to get live data.

## Step 4: Use the Dashboard

With the backend server running, you can now open or refresh the `index.html` file in your browser. The dashboard will automatically connect to your local server on `http://localhost:8501` and start displaying live data from Yahoo Finance.

## To Stop the Backend

Go back to the terminal window where the server is running and press `Ctrl + C`.
