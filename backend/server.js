require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const axios = require("axios");

app.use(cors());
app.use(express.json());

const MONGODB_URL = process.env.MONGODB_URL; // Default to local MongoDB if not set

mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const watchlistSchema = new mongoose.Schema({
  userId: String,
  stocks: [String],
  cryptos: [String],
});

const Watchlist = mongoose.model("Watchlist", watchlistSchema);

app.post("/api/watchlist", async (req, res) => {
  const { userId, symbol, category } = req.body;
  if (!userId || !symbol || !category) {
    return res.status(400).json({ error: "Missing data" });
  }
  const field = category === "crypto" ? "cryptos" : "stocks";

  const result = await Watchlist.findOneAndUpdate(
    { userId },
    { $addToSet: { [field]: symbol } },
    { upsert: true, new: true }
  );
  res.json({
    success: true,
    stocks: result.stocks,
    cryptos: result.cryptos,
  });
});

// Get watchlist
app.get("/api/watchlist", async (req, res) => {
  const { userId } = req.query;
  const doc = await Watchlist.findOne({ userId });
  res.json({
    stocks: doc?.stocks || [],
    cryptos: doc?.cryptos || [],
  });
});

app.get("/api/yahoo-chart", async (req, res) => {
  const { symbol } = req.query;
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1mo`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Yahoo chart data" });
  }
});

const cache = {};

app.get("/api/coingecko", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing URL");

  // Use the full URL as the cache key
  if (cache[url] && Date.now() - cache[url].timestamp < 2 * 60 * 1000) {
    // 2 minutes cache
    return res.json(cache[url].data);
  }

  const fullUrl = `https://api.coingecko.com${url}`;
  try {
    const { data } = await axios.get(fullUrl);
    cache[url] = { data, timestamp: Date.now() };
    res.json(data);
  } catch (err) {
    if (err.response) {
      res.status(err.response.status).json({
        error: err.response.data?.error || err.message,
        status: err.response.status,
      });
    } else {
      res.status(500).json({ error: "Failed to fetch from CoinGecko" });
    }
    console.error("CoinGecko fetch failed:", err.message);
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
