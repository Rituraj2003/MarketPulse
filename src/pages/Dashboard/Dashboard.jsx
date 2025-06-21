import React, { useContext, useEffect, useState } from "react";
import Datacard from "../../components/Datacard/Datacard";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./Dashboard.css";
import TopgainerLoser from "../../components/TopGainerLoser/TopgainerLoser";
import { fetchCryptoMetrics } from "../../services/cryptoService";
import StockDetails from "../../components/StockDetails/StockDetails";
import { SearchContext } from "../../context/SearchContext"; // Make sure the path matches your project
import TopMovers from "../../components/TopMovers/TopMovers";

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const STOCKS = ["AAPL", "GOOGL", "MSFT"];
const CRYPTOS = ["bitcoin", "ethereum", "solana"];

const Dashboard = () => {
  const [metrics, setMetrics] = useState([
    { label: "Top Stock Price", value: "Loading..." },
    { label: "Top Crypto Price", value: "Loading..." },
    { label: "24h Volume (Stocks)", value: "Loading..." },
    { label: "24h Volume (Crypto)", value: "Loading..." },
  ]);
  const [stockData, setStockData] = useState([]);
  const [cryptoData, setCryptoData] = useState([]);
  const [stockInfo, setStockInfo] = useState(null);
  const [error, setError] = useState("");
  const [selectedStock, setSelectedStock] = useState(null);
  const { search } = useContext(SearchContext);

  useEffect(() => {
    const fetchStocks = async () => {
      const results = await Promise.all(
        STOCKS.map(async (symbol) => {
          const quoteRes = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
          );
          const quote = await quoteRes.json();

          const profileRes = await fetch(
            `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
          );
          const profile = await profileRes.json();

          return {
            symbol,
            name: profile.name || symbol,
            price: quote.c || 0,
            volume: quote.v || "N/A",
          };
        })
      );
      setStockData(results);

      let topPrice = "N/A";
      let volume24h = "N/A";
      if (results.length > 0) {
        const topStock = results.reduce(
          (a, b) => (a.price > b.price ? a : b),
          results[0]
        );
        const totalVolume = results.reduce(
          (sum, s) => sum + (typeof s.volume === "number" ? s.volume : 0),
          0
        );
        topPrice = `$${topStock.price.toLocaleString()}`;
        volume24h = totalVolume ? `$${(totalVolume / 1e6).toFixed(1)}M` : "N/A";
      }
      return {
        topPrice,
        volume24h,
      };
    };

    const fetchCrypto = async () => {
      const data = await fetchCryptoMetrics(CRYPTOS);
      if (!data || data.length === 0)
        return { topPrice: "N/A", volume24h: "N/A", chartData: [] };
      const top = data.reduce((a, b) => (a.price > b.price ? a : b));
      const totalVolume = data.reduce((sum, coin) => sum + coin.volume24h, 0);
      const chartData = data.map((coin) => ({
        name: coin.symbol,
        value: coin.price,
      }));
      setCryptoData(chartData);
      return {
        topPrice: `$${top.price.toLocaleString()}`,
        volume24h: `$${(totalVolume / 1e6).toFixed(1)}M`,
      };
    };

    const fetchAll = async () => {
      const [stock, crypto] = await Promise.all([fetchStocks(), fetchCrypto()]);
      setMetrics([
        { label: "Top Stock Price", value: stock.topPrice },
        { label: "Top Crypto Price", value: crypto.topPrice },
        { label: "24h Volume (Stocks)", value: stock.volume24h },
        { label: "24h Volume (Crypto)", value: crypto.volume24h },
      ]);
    };

    fetchAll();
  }, []);

  // Listen for searchTerm changes and fetch stock info
  useEffect(() => {
    if (search.page !== "/" || !search.term) {
      setStockInfo(null);
      setSelectedStock(null);
      setError("");
      return;
    }

    const fetchStock = async () => {
      setError("");
      try {
        const quoteRes = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${search.term}&token=${FINNHUB_API_KEY}`
        );
        const quote = await quoteRes.json();
        if (!quote || !quote.c) {
          setError("Stock not found or API error.");
          setStockInfo(null);
          setSelectedStock(null);
        } else {
          setStockInfo(quote);
          setSelectedStock(search.term);
        }
      } catch (err) {
        setError("Stock not found or API error.");
        setStockInfo(null);
        setSelectedStock(null);
      }
    };

    fetchStock();
  }, [search]);

  const getEasternTime = () => {
    const now = new Date();
    const estTime = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    }).format(now);
    return estTime;
  };

  const isMarketOpen = () => {
    const now = new Date();
    const options = { timeZone: "America/New_York", hour12: false };
    const day = now.toLocaleDateString("en-US", {
      timeZone: "America/New_York",
      weekday: "short",
    });
    const hour = parseInt(
      new Intl.DateTimeFormat("en-US", {
        ...options,
        hour: "2-digit",
      }).format(now)
    );
    const minute = parseInt(
      new Intl.DateTimeFormat("en-US", {
        ...options,
        minute: "2-digit",
      }).format(now)
    );

    const totalMinutes = hour * 60 + minute;
    const open = 9 * 60 + 30;
    const close = 16 * 60;

    return (
      ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(day) &&
      totalMinutes >= open &&
      totalMinutes <= close
    );
  };

  const [clock, setClock] = useState(getEasternTime());
  const [marketOpen, setMarketOpen] = useState(isMarketOpen());

  useEffect(() => {
    const interval = setInterval(() => {
      setClock(getEasternTime());
      setMarketOpen(isMarketOpen());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container">
      <div className="market-status-bar">
        <span className="clock-display">🕒 {clock} ET</span>
        <span className={`market-indicator ${marketOpen ? "open" : "closed"}`}>
          {marketOpen ? "🟢 Market Open" : "🔴 Market Closed"}
        </span>
      </div>

      <h1 style={{ textAlign: "center", color: "#2563eb", fontWeight: 700 }}>
        Dashboard
      </h1>

      {selectedStock ? (
        <div className="dashboard-top-section">
          <StockDetails
            symbol={selectedStock}
            stockInfo={stockInfo}
            error={error}
          />
          <div className="metrics-section">
            {metrics.map((m, i) => (
              <Datacard key={i} label={m.label} value={m.value} />
            ))}
          </div>
        </div>
      ) : (
        <div
          className="metrics-section"
          style={{ maxWidth: 1100, margin: "2.5rem auto" }}
        >
          {metrics.map((m, i) => (
            <Datacard key={i} label={m.label} value={m.value} />
          ))}
        </div>
      )}

      {/* Charts Section */}
      <div className="charts-section">
        {/* Bar Chart for Stocks */}
        <div className="chart-wrapper">
          <h2>Stocks Overview</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stockData}>
              <XAxis dataKey="symbol" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="price" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart for Crypto */}
        <div className="chart-wrapper">
          <h2>Crypto Overview</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={cryptoData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {cryptoData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={["#2563eb", "#00C49F", "#FFBB28"][index % 3]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <TopMovers />
    </div>
  );
};

export default Dashboard;
