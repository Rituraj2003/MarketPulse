// src/pages/News/News.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./News.css";

const NEWS_API_KEY = import.meta.env.VITE_GNEWS_API_KEY;

const News = () => {
  const [articles, setArticles] = useState([]);
  const [lastFetch, setLastFetch] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch fresh news from GNews
  const fetchNews = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("https://gnews.io/api/v4/search", {
        params: {
          q: "stock OR crypto",
          token: NEWS_API_KEY,
          lang: "en",
          country: "us",
          max: 20,
          safe: true,
        },
      });

      // Only update state if there's genuinely new content
      const newestTime = new Date(data.articles[0]?.publishedAt).getTime();
      if (!lastFetch || newestTime > lastFetch) {
        setArticles(data.articles);
        setLastFetch(newestTime);
      }
    } catch (err) {
      console.error("Failed to fetch news:", err);
    } finally {
      setLoading(false);
    }
  };

  // On mount: fetch, then refresh every 3 hours
  useEffect(() => {
    fetchNews();
    const intervalId = setInterval(fetchNews, 3 * 60 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []); // run once

  return (
    <div className="news-page-wrapper">
      <h1>Latest Market News</h1>
      {loading && <p className="news-loading">Loading news…</p>}
      {!loading && articles.length === 0 && (
        <p className="news-empty">No news available right now.</p>
      )}
      <div className="news-grid">
        {articles.map((a, idx) => (
          <a
            key={idx}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="news-card"
          >
            {a.image && (
              <img src={a.image} alt={a.title} className="news-thumb" />
            )}
            <div className="news-content">
              <h2 className="news-title">{a.title}</h2>
              <p className="news-desc">{a.description}</p>
              <div className="news-footer">
                <span className="news-source">{a.source.name}</span>
                <time className="news-date">
                  {new Date(a.publishedAt).toLocaleDateString()}
                </time>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default News;
