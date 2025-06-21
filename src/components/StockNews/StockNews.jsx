import React, { useEffect, useState } from "react";
import axios from "axios";

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY; // Use VITE_ prefix for environment variables in Vite

const StockNews = ({ symbol }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Use a default symbol if none is provided
  const displaySymbol = symbol || "AAPL"; // or "MSFT", "GOOGL", etc.

  useEffect(() => {
    if (!displaySymbol) return;
    const fetchNews = async () => {
      setLoading(true);
      setError("");
      setNews([]);
      try {
        const to = new Date().toISOString().split("T")[0];
        const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
        const res = await axios.get(
          `https://finnhub.io/api/v1/company-news?symbol=${displaySymbol}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`
        );
        setNews(res.data.slice(0, 10));
      } catch (err) {
        setError("Failed to load news.");
      }
      setLoading(false);
    };
    fetchNews();
  }, [displaySymbol]);

  return (
    <div className="stock-news">
      <h3 style={{ color: "#2563eb", marginBottom: "1rem" }}>
        {symbol ? `${symbol} Latest News` : "Latest News"}
      </h3>
      {loading && <p>Loading news...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {news.length === 0 && !loading && !error && <p>No news found.</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {news.map((item) => (
          <li key={item.id} style={{ marginBottom: "1.2rem" }}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#2563eb", fontWeight: 600 }}
            >
              {item.headline}
            </a>
            <div style={{ fontSize: "0.95rem", color: "#555" }}>
              {item.source} &middot;{" "}
              {new Date(item.datetime * 1000).toLocaleDateString()}
            </div>
            <div style={{ marginTop: "0.3rem", color: "#333" }}>
              {item.summary}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StockNews;
