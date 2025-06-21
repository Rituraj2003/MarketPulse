// src/components/CryptoTicker/CryptoTicker.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CryptoTicker.css";

const CryptoTicker = () => {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    // Fetch top 10 cryptocurrencies by market cap
    const BASE_URL = import.meta.env.VITE_COINGECKO_BASE_URL;
    axios
      .get(
        `${BASE_URL}/coins/markets`, 
        {
          params: {
            vs_currency: "usd",
            order: "market_cap_desc",
            per_page: 10,
            page: 1,
            sparkline: false
          },
        }
      )
      .then((res) => {
        setCoins(res.data);
      })
      .catch((err) => {
        console.error("Failed to load crypto ticker:", err);
      });
  }, []);

  return (
    <div className="crypto-ticker">
      <div className="ticker-track">
        {coins.map((coin) => (
          <div key={coin.id} className="ticker-item">
            <img src={coin.image} alt={coin.symbol} />
            <span className="symbol">{coin.symbol.toUpperCase()}</span>
            <span className={`price ${coin.price_change_percentage_24h >= 0 ? "up" : "down"}`}>
              ${coin.current_price.toLocaleString()}
              <small>
                {coin.price_change_percentage_24h.toFixed(2)}%
              </small>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CryptoTicker;
