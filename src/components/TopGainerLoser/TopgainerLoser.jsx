import React, { useEffect, useState } from "react";

import "./TopGainerLoser.css";
const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY; // <-- Paste your API key here
const GAINER_SYMBOLS = ["AAPL", "GOOGL", "MSFT", "AMZN", "META"];
const LOSER_SYMBOLS = ["TSLA", "NFLX", "NVDA", "BABA", "INTC"];

const TopGainerLoser = () => {
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);

  useEffect(() => {
    const fetchQuotes = async (symbols) => {
      return Promise.all(
        symbols.map(async (symbol) => {
          const res = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
          );
          const data = await res.json();
          return {
            symbol,
            price: data.c,
            change: data.d,
            percent: data.dp,
          };
        })
      );
    };

    const fetchData = async () => {
      const gainerData = await fetchQuotes(GAINER_SYMBOLS);
      const loserData = await fetchQuotes(LOSER_SYMBOLS);

      // Sort gainers descending by percent change
      gainerData.sort((a, b) => b.percent - a.percent);
      // Sort losers ascending by percent change
      loserData.sort((a, b) => a.percent - b.percent);

      setGainers(gainerData.slice(0, 3));
      setLosers(loserData.slice(0, 3));
    };

    fetchData();
  }, []);

  return (
    <div
      className="top-gainer-loser-section"
      style={{
        display: "flex",
        gap: 32,
        marginTop: 40,
        justifyContent: "center",
      }}
    >
      <div
        className="gainers"
        style={{
          background: "#e6f9f0",
          borderRadius: 12,
          padding: "1.5rem 2rem",
          minWidth: 220,
        }}
      >
        <h3 style={{ color: "#16a34a", marginBottom: 16 }}>Top Gainers</h3>
        {gainers.map((g) => (
          <div key={g.symbol} style={{ marginBottom: 12 }}>
            <strong>{g.symbol}</strong> &nbsp;
            <span style={{ color: "#16a34a" }}>
              +{g.percent}% (${g.price})
            </span>
          </div>
        ))}
      </div>
      <div
        className="losers"
        style={{
          background: "#fbeaea",
          borderRadius: 12,
          padding: "1.5rem 2rem",
          minWidth: 220,
        }}
      >
        <h3 style={{ color: "#dc2626", marginBottom: 16 }}>Top Losers</h3>
        {losers.map((l) => (
          <div key={l.symbol} style={{ marginBottom: 12 }}>
            <strong>{l.symbol}</strong> &nbsp;
            <span style={{ color: "#dc2626" }}>
              {l.percent}% (${l.price})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopGainerLoser;
