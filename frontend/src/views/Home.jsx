import { useState, useEffect } from "react";
import MarketData from "../components/Home/MarketPrice";
import MarketSlider from "../components/Home/MarketSlider";
import { Link } from "react-router-dom";

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredArticle, setFeaturedArticle] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || '';
        let url = `${API_BASE}/api/articles?published=true`;
        const res = await fetch(url);
        const data = await res.json();
        
        const articlesArray = data.articles ? data.articles : (Array.isArray(data) ? data : []);
        setArticles(articlesArray);
        
        if (articlesArray.length > 0) {
          setFeaturedArticle(articlesArray[0]);
        }
      } catch (e) {
        console.error('Failed to load articles', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const articlesByCategory = articles.reduce((acc, article) => {
    if (article._id === featuredArticle?._id) return acc;
    
    const cat = article.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(article);
    return acc;
  }, {});
  
  const categories = Object.keys(articlesByCategory);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#efb81c] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-medium">Loading articles...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="relative overflow-hidden py-12 px-4 border-b border-gray-800">
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-[#efb81c] to-[#f8d675] bg-clip-text text-transparent mb-2">
            BuyCex News
          </h1>
          <p className="text-lg text-gray-400">
            Latest cryptocurrency insights and market analysis
          </p>
        </div>
      </header>
      
      {/* Market Slider */}
      <MarketSlider />
      
      {/* Featured Article Section */}
      {featuredArticle && (
        <section className="max-w-7xl mx-auto px-4 py-8 border-b border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Featured Article Content */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span className="font-semibold text-[#efb81c]">FEATURED</span>
                <span>•</span>
                <span>{featuredArticle.category || 'General'}</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                {featuredArticle.title}
              </h2>
              
              {featuredArticle.excerpt && (
                <p className="text-lg text-gray-300 leading-relaxed">
                  {featuredArticle.excerpt}
                </p>
              )}
              
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                {featuredArticle.publishedAt && (
                  <span>
                    {new Date(featuredArticle.publishedAt).toLocaleDateString(undefined, { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                )}
                {featuredArticle.section && (
                  <span className="font-semibold text-[#efb81c] uppercase tracking-wide">
                    {featuredArticle.section}
                  </span>
                )}
              </div>
              
              <Link
                to={featuredArticle.slug ? `/article/${featuredArticle.slug}` : "#"}
                className="bg-[#efb81c] hover:bg-[#f8d675] text-black font-semibold px-6 py-3 rounded-lg transition-colors inline-block"
              >
                Read Full Article
              </Link>
            </div>
            
            {/* Featured Article Image */}
            {featuredArticle.coverImageUrl && (
              <div className="relative aspect-[2/1] rounded-xl overflow-hidden">
                <img 
                  src={featuredArticle.coverImageUrl} 
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {categories.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-900 rounded-full flex items-center justify-center">
              <span className="text-4xl">📰</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No articles found</h3>
            <p className="text-gray-400">Check back later for new updates</p>
          </div>
        ) : (
          <div className="space-y-12">
            {categories.map((category) => (
              <section key={category}>
                {/* Category Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-1 h-6 bg-[#efb81c] rounded-full"></div>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-wide">
                      {category}
                    </h2>
                  </div>
                  <a 
                    href="#" 
                    className="text-[#efb81c] hover:text-[#f8d675] transition-colors text-sm font-semibold flex items-center space-x-1"
                  >
                    <span>READ MORE {category.toUpperCase()} →</span>
                  </a>
                </div>

                {/* Articles Grid - Uniform Card Sizes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articlesByCategory[category].map((article) => (
                    <Link
                      to={article.slug ? `/article/${article.slug}` : "#"}
                      key={article._id}
                      className="bg-gray-900/50 rounded-lg border border-gray-800 hover:border-[#efb81c]/30 transition-all duration-300 hover:transform hover:-translate-y-1 group"
                    >
                      {/* Image */}
                      {article.coverImageUrl && (
                        <div className="relative aspect-[5/3] overflow-hidden">
                          <img 
                            src={article.coverImageUrl} 
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="px-2 py-1 bg-black/70 backdrop-blur-sm text-[#efb81c] text-xs rounded-full font-medium uppercase">
                              {article.section || 'News'}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="p-5">
                        <h3 className="font-bold text-white text-lg leading-tight mb-3 line-clamp-2 group-hover:text-[#efb81c] transition-colors">
                          {article.title}
                        </h3>
                        
                        {article.excerpt && (
                          <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
                            {article.excerpt}
                          </p>
                        )}
                        
                        {/* Meta Info */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                          <span className="text-xs text-gray-500">
                            {article.publishedAt ? 
                              new Date(article.publishedAt).toLocaleDateString(undefined, { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              }) 
                              : 'Soon'
                            }
                          </span>
                          <span className="text-xs font-semibold text-[#efb81c] uppercase">
                            {article.category || 'General'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}