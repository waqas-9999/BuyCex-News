
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaStar } from "react-icons/fa";

// Use the same API endpoint as your main app
const API_URL = "https://api.buycex.com/Index/marketInfo";

const MarketData = () => {
  const [marketData, setMarketData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get(API_URL)
      .then((response) => {
        // The API returns { status: 1, data: { market: [...] } }
        if (response.data.status === 1 && response.data.data?.market) {
          setMarketData(response.data.data.market);
        } else {
          setError("Failed to fetch market data");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch market data");
        setLoading(false);
      });
  }, []);

  const toggleFavorite = (id) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const formatPrice = (price) => {
    return Number(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 });
  };

  // Filter coins by search term
  const filteredCoins = marketData?.filter((coin) =>
    coin.coinData?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search coins..."
          className="border rounded px-2 py-1"
        />
      </div>
      <div className="space-y-2">
        {filteredCoins.map((coin) => (
          <div
            key={coin.id}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <img src={coin.icon} alt={coin.coinData?.name} className="w-6 h-6" />
              <span className="font-semibold text-white">{coin.coinData?.name}</span>
            </div>
            <div className="flex text-white items-center gap-3">
              <span>{coin.new_price ? formatPrice(coin.new_price) : "-"}</span>
              <span className={
                `font-medium ${String(coin?.change || '').startsWith('-') ? 'text-red-500' : 'text-green-500'}`
              }>
                {coin?.change ?? '--'}%
              </span>
              <button
                onClick={() => toggleFavorite(coin.id)}
                className="ml-2"
              >
                <FaStar
                  className={
                    `w-5 h-5 transition-colors duration-200 ${favoriteIds.includes(coin.id) ? 'text-yellow-500' : 'text-gray-400'}`
                  }
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketData;
