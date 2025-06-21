import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Usercontext } from "../../context/Usercontext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "./CryptoChart.css";

// register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Proxy base URL
const API_BASE = import.meta.env.VITE_API_BASE_URL + "/api/coingecko";


// Resolve coin ID via proxy
const resolveCoinId = async (symbol) => {
  const { data } = await axios.get(API_BASE, {
    params: { url: `/api/v3/search?query=${symbol}` },
  });
  return data.coins.find((c) => c.symbol.toLowerCase() === symbol.toLowerCase())
    ?.id;
};

// Fetch chart data via proxy
const fetchCryptoChartData = async (symbol) => {
  const id = await resolveCoinId(symbol);
  if (!id) throw new Error("Coin not found");
  const { data } = await axios.get(API_BASE, {
    params: { url: `/api/v3/coins/${id}/market_chart?vs_currency=usd&days=30` },
  });
  return {
    labels: data.prices.map((p) => new Date(p[0]).toLocaleDateString()),
    datasets: [
      {
        label: `${symbol.toUpperCase()} Price`,
        data: data.prices.map((p) => p[1]),
        borderColor: "#F7931A",
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.2,
      },
    ],
  };
};

const CryptoChart = () => {
  const { user } = useContext(Usercontext);
  const [watchlist, setWatchlist] = useState([]);
  const [selected, setSelected] = useState("");
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  // Fetch watchlist
  useEffect(() => {
    if (!user) return;
    axios
      .get(`${API_BASE_URL}/api/watchlist?userId=${user.uid}`)
      .then((res) => {
        const cryptos = res.data.cryptos || [];
        setWatchlist(cryptos);
        if (cryptos.length > 0) setSelected(cryptos[0]);
      });
  }, [user]);

  // Fetch chart for selected
  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    fetchCryptoChartData(selected)
      .then((data) => setChartData(data))
      .catch((err) => console.error("Chart error:", err.message))
      .finally(() => setLoading(false));
  }, [selected]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `${selected.toUpperCase()} — Last Month`,
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#eee" } },
    },
  };

  return (
    <div>
      <h2 className="chart-title">Your Watchlist</h2>
      <div className="button-bar">
        {watchlist.map((symbol) => (
          <button
            key={symbol}
            onClick={() => setSelected(symbol)}
            className={
              "btn " + (selected === symbol ? "btn-active" : "btn-inactive")
            }
          >
            {symbol.toUpperCase()}
          </button>
        ))}
      </div>

      {loading && <p className="loading">Loading chart…</p>}

      {chartData && (
        <div className="chart-card">
          <Line data={chartData} options={options} key={selected} />
        </div>
      )}

      {!loading && !chartData && (
        <p className="no-data">No chart data available.</p>
      )}
    </div>
  );
};

export default CryptoChart;
