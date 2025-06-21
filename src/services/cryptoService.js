// Fetch prices and 24h volume for selected cryptos from CoinGecko
export const fetchCryptoMetrics = async (ids = ['bitcoin', 'ethereum', 'solana']) => {
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids.join(',')}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch crypto data');
  const data = await response.json();

  // Format for metrics and charts
  return data.map(coin => ({
    id: coin.id,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    price: coin.current_price,
    volume24h: coin.total_volume,
  }));
};