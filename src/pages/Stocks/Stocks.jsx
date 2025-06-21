// src/pages/Stocks/Stocks.jsx

import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { SearchContext } from "../../context/Searchcontext";
import StockTicker from "../../components/StockTicker/StockTicker";
import { Usercontext } from "../../context/Usercontext";
import "./Stocks.css";
import StockNews from "../../components/StockNews/StockNews";
import StockChart from "../../components/Chart/StockChart";

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

const Stocks = () => {
  const { search } = useContext(SearchContext);
  const { user } = useContext(Usercontext);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // Fetch live quote when search changes
  useEffect(() => {
    if (search.page === "/stocks" && search.term) {
      setError("");
      setQuote(null);
      setAdded(false);

      axios
        .get(
          `https://finnhub.io/api/v1/quote?symbol=${search.term}&token=${FINNHUB_API_KEY}`
        )
        .then((res) => {
          if (res.data && res.data.c) {
            setQuote(res.data);
          } else {
            setError("Stock not found or API error.");
          }
        })
        .catch(() => setError("Stock not found or API error."));
    } else {
      setQuote(null);
      setError("");
      setAdded(false);
    }
  }, [search]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  // Check if this symbol is already in the stock watchlist
  useEffect(() => {
    if (!user || search.page !== "/stocks" || !search.term) return;

    axios
      .get(`${API_BASE_URL}/api/watchlist?userId=${user.uid}`)
      .then((res) => {
        const stocks = res.data.stocks || [];
        setAdded(
          stocks.some(
            (s) => s.toUpperCase() === search.term.toUpperCase()
          )
        );
      })
      .catch(() => setAdded(false));
  }, [user, search]);

  // Add to watchlist
  const handleAddToWatchlist = async () => {
    if (!user) return;
    setAdding(true);

    try {
      await axios.post(`${API_BASE_URL}/api/watchlist`, {
        userId: user.uid,
        symbol: search.term.toUpperCase(),
        category: "stock",    // <–– use "stock" here
      });
      setAdded(true);
    } catch (err) {
      alert("Failed to add to watchlist. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      <StockTicker />

      <div className="stocks-main-wrapper">
        {search.page === "/stocks" && search.term && (
          <div className="stock-container">
            <h2>{search.term.toUpperCase()} Live Price</h2>
            {quote ? (
              <div className="details">
                <p>Current: ${quote.c}</p>
                <p>Open: ${quote.o}</p>
                <p>High: ${quote.h}</p>
                <p>Low: ${quote.l}</p>
                <p>Previous Close: ${quote.pc}</p>
              </div>
            ) : (
              <p>{error || "Loading..."}</p>
            )}

            {user && quote && (
              <button
                onClick={handleAddToWatchlist}
                disabled={adding || added}
                style={{
                  marginTop: "1rem",
                  background: added ? "#4ade80" : "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.6rem 1.2rem",
                  fontWeight: 600,
                  cursor: added ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                }}
              >
                {adding
                  ? "Adding..."
                  : added
                  ? "Added to Watchlist"
                  : "Add to Watchlist"}
              </button>
            )}

            {!user && quote && (
              <p style={{ color: "#888", marginTop: "1rem" }}>
                Login to add to watchlist
              </p>
            )}
          </div>
        )}

        <div className="stock-news">
          <StockNews symbol={search.term} />
        </div>
      </div>

      <div className="watchlist">
        <StockChart />
      </div>
    </div>
  );
};

export default Stocks;
