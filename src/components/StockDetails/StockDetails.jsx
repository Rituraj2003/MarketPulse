import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import "./StockDetails.css";

const StockDetails = ({ symbol, stockInfo, stockHistory, error }) => {
  if (!symbol) return null;

  return (
    <div className="stock-details-section">
      <h2>{symbol}</h2>
      {error && <div style={{ color: "#dc2626" }}>{error}</div>}
      {stockInfo && (
        <div className="stock-details-list">
          <div>
            <span>Current Price:</span> ${stockInfo.c}
          </div>
          <div>
            <span>Open:</span> ${stockInfo.o}
          </div>
          <div>
            <span>High:</span> ${stockInfo.h}
          </div>
          <div>
            <span>Low:</span> ${stockInfo.l}
          </div>
          <div>
            <span>Previous Close:</span> ${stockInfo.pc}
          </div>
        </div>
      )}
    </div>
  );
};

export default StockDetails;
