import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { SearchContext } from "../../context/Searchcontext";
import { Usercontext } from "../../context/Usercontext";
import CryptoTicker from "../../components/CryptoTicker/CryptoTicker";
import CryptoNews from "../../components/CryptoNews/CryptoNews";
import CryptoChart from "../../components/Chart/CryptoChart";

import "./Crypto.css";

const resolveCoinId = async (symbol) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/api/coingecko`,
    { params: { url: `/api/v3/search?query=${symbol}` } }
  );
  const coin = data.coins.find(
    (c) => c.symbol.toLowerCase() === symbol.toLowerCase()
  );
  if (!coin) throw new Error(`No coin found for symbol "${symbol}"`);
  return coin.id;
};

const fetchFullCryptoDetails = async (symbol) => {
  const id = await resolveCoinId(symbol);
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/api/coingecko`,
    {
      params: {
        url: `/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
      }
    }
  );
  return data.market_data;
};


const Crypto = () => {
  const { search } = useContext(SearchContext);
  const { user } = useContext(Usercontext);

  const [quote, setQuote] = useState(null);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // Fetch crypto details
  useEffect(() => {
    if (search.page === "/crypto" && search.term) {
      setError("");
      setQuote(null);
      setAdded(false);

      fetchFullCryptoDetails(search.term)
        .then((md) => {
          setQuote({
            current: md.current_price.usd,
            high24: md.high_24h.usd,
            low24: md.low_24h.usd,
            marketCap: md.market_cap.usd,
            changePct24: md.price_change_percentage_24h,
          });
        })
        .catch(() => {
          setError("Crypto not found or API error.");
        });
    } else {
      setQuote(null);
      setError("");
      setAdded(false);
    }
  }, [search]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  // Check if in crypto watchlist
  useEffect(() => {
    if (!user || search.page !== "/crypto" || !search.term) return;

    axios
      .get(`${API_BASE_URL}/api/watchlist?userId=${user.uid}`)
      .then((res) => {
        const cryptos = res.data.cryptos || [];
        setAdded(
          cryptos.some(
            (c) => c.toLowerCase() === search.term.toLowerCase()
          )
        );
      })
      .catch(() => setAdded(false));
  }, [user, search]);

  // Add to crypto watchlist
  const handleAddToWatchlist = async () => {
    if (!user) return;
    setAdding(true);
    try {
      await axios.post(`${API_BASE_URL}/api/watchlist`, {
        userId: user.uid,
        symbol: search.term.toUpperCase(),
        category: "crypto",
      });
      setAdded(true);
    } catch {
      alert("Failed to add to watchlist. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="crypto-page-wrapper">
      <CryptoTicker />

      <div className="crypto-main-content">
        {search.page === "/crypto" && search.term && (
          <div className="crypto-details-card">
            <h2 className="crypto-heading">
              {search.term.toUpperCase()} Live Data
            </h2>

            {quote ? (
              <div className="crypto-stats">
                <p>
                  <strong>Current:</strong> ${quote.current.toLocaleString()}
                </p>
                <p>
                  <strong>24h High:</strong> ${quote.high24.toLocaleString()}
                </p>
                <p>
                  <strong>24h Low:</strong> ${quote.low24.toLocaleString()}
                </p>
                <p>
                  <strong>Market Cap:</strong> $
                  {quote.marketCap.toLocaleString()}
                </p>
                <p>
                  <strong>Change (24h):</strong>{" "}
                  <span
                    className={
                      quote.changePct24 >= 0 ? "pos-change" : "neg-change"
                    }
                  >
                    {quote.changePct24.toFixed(2)}%
                  </span>
                </p>
              </div>
            ) : (
              <p className="error">{error || "Loading..."}</p>
            )}

            {user && quote && (
              <button
                className={`watchlist-btn ${
                  added ? "btn-added" : ""
                }`}
                onClick={handleAddToWatchlist}
                disabled={adding || added}
              >
                {adding
                  ? "Adding..."
                  : added
                  ? "Added to Watchlist"
                  : "Add to Watchlist"}
              </button>
            )}

            {!user && quote && (
              <p className="login-note">
                Login to add this crypto to your watchlist
              </p>
            )}
          </div>
        )}

        <div className="crypto-chart-container">
          <CryptoChart />
        </div>
      </div>

      <div className="crypto-news-section">
        <CryptoNews symbol={search.term || "BTC"} />
      </div>
    </div>
  );
};

export default Crypto;
