
# Backend Setup for Live Yahoo Finance Data

The dashboard runs on a simple, local Python web server to reliably fetch live market data from Yahoo Finance. This approach avoids browser security issues and is more stable than public proxies.

The new, simplified process is to run a single command and visit a single URL.

## Step 1: Install Python

If you don't have Python installed, download and install the latest version from [python.org](https://www.python.org/downloads/). Make sure to check the box that says "Add Python to PATH" during installation.

## Step 2: Install Required Libraries

Open your terminal or command prompt and run the following command to install the necessary Python libraries. If you previously installed `streamlit`, this command will add the new required libraries.

```bash
pip install Flask Flask-Cors yfinance pandas
```

- **Flask**: A lightweight and powerful web server framework for Python.
- **Flask-Cors**: An extension for Flask that handles cross-origin resource sharing (CORS).
- **yfinance**: The library that pulls data directly from Yahoo Finance.
- **pandas**: A powerful data manipulation library that `yfinance` depends on.

## Step 3: Run the Backend Server

1.  Navigate to the root directory of this project in your terminal (the same directory where `main.py` is located).
2.  Run the following command:

```bash
python main.py
```

You should see output in your terminal like this:
```
Starting Flask server...
Dashboard will be available at http://localhost:5000
```

**Leave this terminal window open.** The server needs to be running for the dashboard to get live data.

## Step 4: Use the Dashboard

With the backend server running, open your web browser and go to the following URL:

[http://localhost:5000](http://localhost:5000)

The dashboard will load and automatically connect to your local server to display live data. There is no longer any need to open the `index.html` file directly.

## To Stop the Backend

Go back to the terminal window where the server is running and press `Ctrl + C`.
