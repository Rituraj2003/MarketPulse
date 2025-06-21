import React, { useEffect, useState } from "react";
import axios from "axios";
import "./StockTicker.css"; // Ensure you have a CSS file for styling

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY; // Use VITE_ prefix for environment variables in Vite
const TICKER_SYMBOLS = ["AAPL", "GOOGL", "MSFT", "TSLA", "NFLX","CSCO","AMZN","NVDA"]; // Add your favorite stocks

const StockTicker = () => {
  const [prices, setPrices] = useState({});

  useEffect(() => {
    let intervalId;

    const fetchPrices = async () => {
      const newPrices = {};
      await Promise.all(
        TICKER_SYMBOLS.map(async (symbol) => {
          try {
            const res = await axios.get(
              `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
            );
            newPrices[symbol] = res.data.c;
          } catch {
            newPrices[symbol] = "N/A";
          }
        })
      );
      setPrices(newPrices);
    };

    fetchPrices();
    intervalId = setInterval(fetchPrices, 30000); // Update every 100 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="stock-ticker" >
      {TICKER_SYMBOLS.map((symbol) => (
        <span key={symbol} className="stock-ticker-item">
          {symbol}: {prices[symbol] !== undefined ? `$${prices[symbol]}` : "Loading..."}
        </span>
      ))}
    </div>
  );
};

export default StockTicker;