import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaEye, 
  FaClock, 
  FaGlobe, 
  FaDesktop, 
  FaMobile, 
  FaTablet,
  FaChartLine,
  FaMapMarkerAlt,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const API_BASE = import.meta.env.VITE_API_BASE || '';
      
      const [dashboardRes, dailyRes, regionsRes] = await Promise.all([
        fetch(`${API_BASE}/api/analytics/dashboard`),
        fetch(`${API_BASE}/api/analytics/daily?days=${selectedPeriod}`),
        fetch(`${API_BASE}/api/analytics/regions`)
      ]);

      const [dashboardData, dailyData, regionsData] = await Promise.all([
        dashboardRes.json(),
        dailyRes.json(),
        regionsRes.json()
      ]);

      setAnalyticsData({
        dashboard: dashboardData,
        daily: dailyData,
        regions: regionsData
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  const getChangePercentage = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getDeviceIcon = (device) => {
    switch (device?.toLowerCase()) {
      case 'mobile': return <FaMobile className="text-blue-400" />;
      case 'tablet': return <FaTablet className="text-green-400" />;
      case 'desktop': return <FaDesktop className="text-purple-400" />;
      default: return <FaDesktop className="text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#efb81c] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <FaChartLine className="text-red-400 text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Error Loading Analytics</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={fetchAnalyticsData}
            className="bg-[#efb81c] hover:bg-[#f8d675] text-black font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { dashboard, daily, regions } = analyticsData;
  const today = dashboard.today;
  const yesterday = dashboard.yesterday;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-[#efb81c] to-[#f8d675] bg-clip-text text-transparent mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-gray-400">Real-time visitor tracking and analytics</p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-[#efb81c] focus:ring-2 focus:ring-[#efb81c]/20"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              <button 
                onClick={fetchAnalyticsData}
                className="bg-[#efb81c] hover:bg-[#f8d675] text-black font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Visitors */}
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Visitors</p>
                <p className="text-3xl font-bold text-white mt-2">{formatNumber(today.totalVisitors)}</p>
                <div className="flex items-center mt-2">
                  {getChangePercentage(today.totalVisitors, yesterday.totalVisitors) >= 0 ? (
                    <FaArrowUp className="text-green-400 text-sm mr-1" />
                  ) : (
                    <FaArrowDown className="text-red-400 text-sm mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    getChangePercentage(today.totalVisitors, yesterday.totalVisitors) >= 0 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    {Math.abs(getChangePercentage(today.totalVisitors, yesterday.totalVisitors))}%
                  </span>
                  <span className="text-gray-400 text-sm ml-1">vs yesterday</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <FaUsers className="text-blue-400 text-xl" />
              </div>
            </div>
          </div>

          {/* Unique Visitors */}
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Unique Visitors</p>
                <p className="text-3xl font-bold text-white mt-2">{formatNumber(today.uniqueVisitors)}</p>
                <div className="flex items-center mt-2">
                  {getChangePercentage(today.uniqueVisitors, yesterday.uniqueVisitors) >= 0 ? (
                    <FaArrowUp className="text-green-400 text-sm mr-1" />
                  ) : (
                    <FaArrowDown className="text-red-400 text-sm mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    getChangePercentage(today.uniqueVisitors, yesterday.uniqueVisitors) >= 0 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    {Math.abs(getChangePercentage(today.uniqueVisitors, yesterday.uniqueVisitors))}%
                  </span>
                  <span className="text-gray-400 text-sm ml-1">vs yesterday</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <FaEye className="text-green-400 text-xl" />
              </div>
            </div>
          </div>

          {/* Page Views */}
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Page Views</p>
                <p className="text-3xl font-bold text-white mt-2">{formatNumber(today.totalPageViews)}</p>
                <div className="flex items-center mt-2">
                  {getChangePercentage(today.totalPageViews, yesterday.totalPageViews) >= 0 ? (
                    <FaArrowUp className="text-green-400 text-sm mr-1" />
                  ) : (
                    <FaArrowDown className="text-red-400 text-sm mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    getChangePercentage(today.totalPageViews, yesterday.totalPageViews) >= 0 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    {Math.abs(getChangePercentage(today.totalPageViews, yesterday.totalPageViews))}%
                  </span>
                  <span className="text-gray-400 text-sm ml-1">vs yesterday</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <FaChartLine className="text-purple-400 text-xl" />
              </div>
            </div>
          </div>

          {/* Avg Duration */}
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Avg. Duration</p>
                <p className="text-3xl font-bold text-white mt-2">{formatDuration(today.avgVisitDuration)}</p>
                <div className="flex items-center mt-2">
                  {getChangePercentage(today.avgVisitDuration, yesterday.avgVisitDuration) >= 0 ? (
                    <FaArrowUp className="text-green-400 text-sm mr-1" />
                  ) : (
                    <FaArrowDown className="text-red-400 text-sm mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    getChangePercentage(today.avgVisitDuration, yesterday.avgVisitDuration) >= 0 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    {Math.abs(getChangePercentage(today.avgVisitDuration, yesterday.avgVisitDuration))}%
                  </span>
                  <span className="text-gray-400 text-sm ml-1">vs yesterday</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <FaClock className="text-orange-400 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Countries */}
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <FaGlobe className="text-[#efb81c] mr-3" />
              Top Countries
            </h3>
            <div className="space-y-4">
              {dashboard.topCountries?.slice(0, 5).map((country, index) => (
                <div key={country.country} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium">{country.country}</p>
                      <p className="text-gray-400 text-sm">{country.uniqueVisitors} unique visitors</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{formatNumber(country.visitors)}</p>
                    <p className="text-gray-400 text-sm">visits</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Device Stats */}
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <FaDesktop className="text-[#efb81c] mr-3" />
              Device Breakdown
            </h3>
            <div className="space-y-4">
              {dashboard.deviceStats?.slice(0, 5).map((device, index) => (
                <div key={`${device.device}-${device.browser}`} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                      {getDeviceIcon(device.device)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{device.device}</p>
                      <p className="text-gray-400 text-sm">{device.browser} on {device.os}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{formatNumber(device.visitors)}</p>
                    <p className="text-gray-400 text-sm">visits</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <FaChartLine className="text-[#efb81c] mr-3" />
            Most Visited Pages
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-300 py-3">Page</th>
                  <th className="text-right text-gray-300 py-3">Visitors</th>
                  <th className="text-right text-gray-300 py-3">Page Views</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.topPages?.slice(0, 10).map((page, index) => (
                  <tr key={page._id} className="border-b border-gray-800/50">
                    <td className="py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-white">
                          {index + 1}
                        </div>
                        <span className="text-white font-medium">{page._id}</span>
                      </div>
                    </td>
                    <td className="text-right text-white font-semibold">{formatNumber(page.visitors)}</td>
                    <td className="text-right text-gray-400">{formatNumber(page.pageViews)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
