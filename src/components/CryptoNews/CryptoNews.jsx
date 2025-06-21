// src/components/CryptoNews/CryptoNews.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CryptoNews.css";

const CryptoNews = ({ symbol }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    if (!symbol) return;

    setLoading(true);
    setError("");
    setArticles([]);

    const url = "https://min-api.cryptocompare.com/data/v2/news/";
    axios
      .get(url, {
        params: {
          lang: "EN",
          categories: symbol.toUpperCase(),  // filter by symbol or use "Cryptocurrency"
          api_key: import.meta.env.VITE_CRYPTOCOMPARE_API_KEY

        },
      })
      .then((res) => {
        // CryptoCompare wraps data in Data array
        setArticles(res.data.Data.slice(0, 6));
      })
      .catch(() => {
        setError("Failed to load news.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [symbol]);

  if (loading) return <p className="crypto-news-loading">Loading news…</p>;
  if (error)   return <p className="crypto-news-error">{error}</p>;
  if (!articles.length)
    return <p className="crypto-news-empty">No news available.</p>;

  return (
    <div className="crypto-news-wrapper">
      {articles.map((a) => (
        <a
          key={a.id}
          href={a.url}
          target="_blank"
          rel="noopener noreferrer"
          className="crypto-news-item"
        >
          {a.imageurl && (
            <img src={a.imageurl} alt="" className="crypto-news-thumb" />
          )}
          <div className="crypto-news-content">
            <h3 className="crypto-news-title">{a.title}</h3>
            <p className="crypto-news-desc">{a.body.slice(0, 100)}…</p>
            <div className="crypto-news-footer">
              <span className="crypto-news-source">{a.source}</span>
              <span className="crypto-news-date">
                {new Date(a.published_on * 1000).toLocaleDateString()}
              </span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
};

export default CryptoNews;
