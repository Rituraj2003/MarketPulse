import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TopMovers.css";

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY; // keep secure
const STOCKS = ["AAPL", "GOOGL", "MSFT", "META", "NVDA", "INTC", "BABA"];

const TopMovers = () => {
  const [movers, setMovers] = useState({ gainers: [], losers: [] });

  const fetchMovers = async () => {
    try {
      const results = await Promise.all(
        STOCKS.map(async (symbol) => {
          const res = await axios.get(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
          );
          return {
            symbol,
            change: res.data.dp, // percentage change
            price: res.data.c,
          };
        })
      );

      const sorted = [...results].sort((a, b) => b.change - a.change);
      const gainers = sorted.slice(0, 3);
      const losers = sorted.slice(-3).reverse();

      setMovers({ gainers, losers });
    } catch (err) {
      console.error("Error fetching top movers:", err);
    }
  };

  useEffect(() => {
    fetchMovers();
    const interval = setInterval(fetchMovers, 60 * 1000); // refresh every 1 min
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="top-movers-wrapper">
      <div className="mover-column gainers">
        <h3>🔺 Top Gainers</h3>
        {movers.gainers.map((stock) => (
          <div key={stock.symbol} className="mover-item up">
            <span>{stock.symbol}</span>
            <span>{stock.change.toFixed(2)}%</span>
            <span>${stock.price.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="mover-column losers">
        <h3>🔻 Top Losers</h3>
        {movers.losers.map((stock) => (
          <div key={stock.symbol} className="mover-item down">
            <span>{stock.symbol}</span>
            <span>{stock.change.toFixed(2)}%</span>
            <span>${stock.price.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopMovers;
