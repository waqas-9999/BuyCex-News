import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://api.buycex.com/Index/marketInfo";

const MarketSlider = () => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(API_URL)
      .then((response) => {
        if (response.data.status === 1 && response.data.data?.market) {
          setMarketData(response.data.data.market);
        }
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  }, []);

  const formatPrice = (price) => {
    return Number(price).toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 8 
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 border-b border-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#efb81c] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border-b border-gray-800 py-4 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-6 animate-scroll">
          {/* Duplicate the array for seamless loop */}
          {[...marketData, ...marketData].map((coin, index) => (
            <div
              key={`${coin.id}-${index}`}
              className="flex items-center space-x-3 bg-gray-800/50 rounded-lg px-4 py-2 min-w-max hover:bg-gray-800/70 transition-colors"
            >
              {/* Coin Image */}
              <img 
                src={coin.icon} 
                alt={coin.coinData?.name} 
                className="w-6 h-6"
              />
              
              {/* Coin Name */}
              <span className="text-white uppercase font-medium text-sm">
                {coin.coinData?.name}
              </span>
              
              {/* Price */}
              <span className="text-gray-300 text-sm">
                ${coin.new_price ? formatPrice(coin.new_price) : "-"}
              </span>
              
              {/* Percentage Change */}
              <span className={`text-sm font-semibold ${
                String(coin?.change || '').startsWith('-') 
                  ? 'text-red-400' 
                  : 'text-green-400'
              }`}>
                {coin?.change ? `${coin.change}%` : '--%'}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default MarketSlider;
