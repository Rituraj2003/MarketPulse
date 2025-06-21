import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
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
import { Usercontext } from "../../context/Usercontext";
import "./StockChart.css";

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

const fetchYahooChartData = async (symbol) => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
const url = `${API_BASE}/api/yahoo-chart?symbol=${symbol}`;

  const res = await axios.get(url);
  const result = res.data.chart.result[0];
  return {
    labels: result.timestamp.map((ts) =>
      new Date(ts * 1000).toLocaleDateString()
    ),
    data: result.indicators.quote[0].close,
  };
};

const StockChart = () => {
  const { user } = useContext(Usercontext);
  const [watchlist, setWatchlist] = useState([]);
  const [selected, setSelected] = useState("");
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  // Fetch user's watchlist
  useEffect(() => {
    if (!user) return;
    // new—grab only the stocks array
    axios
      .get(`${API_BASE_URL}/api/watchlist?userId=${user.uid}`)
      .then((res) => {
        const stocks = res.data.stocks || [];
        setWatchlist(stocks);
        if (stocks.length > 0) setSelected(stocks[0]);
      });
  }, [user]);

  // Fetch chart data for selected stock
  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    fetchYahooChartData(selected)
      .then(({ labels, data }) => {
        setChartData({
          labels,
          datasets: [
            {
              label: `${selected} Close Price`,
              data,
            },
          ],
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selected]);

  // Chart.js styling options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#334155",
          font: { size: 12 },
        },
      },
      title: {
        display: true,
        text: selected ? `${selected} — Last Month` : "",
        color: "#1e293b",
        font: { size: 16, weight: "500" },
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        titleFont: { weight: "600" },
        bodyFont: { size: 14 },
        padding: 8,
      },
    },
    scales: {
      x: {
        ticks: { color: "#64748b" },
        grid: { color: "#e2e8f0" },
      },
      y: {
        ticks: { color: "#64748b" },
        grid: { color: "#e2e8f0" },
      },
    },
  };

  // Inject styling into dataset
  const styledData = chartData && {
    ...chartData,
    datasets: chartData.datasets.map((ds) => ({
      ...ds,
      borderColor: "#2563eb",
      borderWidth: 2,
      pointRadius: 3,
      pointBackgroundColor: "#2563eb",
      pointHoverRadius: 6,
      tension: 0.3,
    })),
  };

  return (
    <div className="stock-chart-wrapper">
      <h2 className="chart-title">Your Watchlist</h2>
      <div className="button-bar">
        {watchlist.map((symbol) => (
          <button
            key={symbol}
            onClick={() => setSelected(symbol)}
            className={
              selected === symbol ? "btn btn-active" : "btn btn-inactive"
            }
          >
            {symbol}
          </button>
        ))}
      </div>

      {loading && <p className="loading">Loading chart…</p>}

      {styledData && (
        <div className="chart-card">
          <Line data={styledData} options={options} />
        </div>
      )}

      {!loading && !styledData && (
        <p className="no-data">No chart data available.</p>
      )}
    </div>
  );
};

export default StockChart;
