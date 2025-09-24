import { useState, useEffect } from "react";

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/articles?published=true');
        const data = await res.json();
        setArticles(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load articles', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Latest Articles</h1>
        <p className="text-gray-600 mt-1">Insights and news from the BuyCex crypto world.</p>
      </div>
      {articles.length === 0 && <div className="text-gray-600">No articles yet.</div>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map(a => (
          <article key={a._id} className="group rounded-xl border bg-white overflow-hidden hover:shadow-md transition-shadow">
            {a.coverImageUrl && (
              <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
                <img src={a.coverImageUrl} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" />
              </div>
            )}
            <div className="p-4">
              <div className="text-xs uppercase tracking-wide text-indigo-600 font-medium">{a.category || 'General'}</div>
              <h2 className="mt-1 text-lg font-semibold leading-snug">{a.title}</h2>
              {a.excerpt && <p className="text-gray-700 mt-2 line-clamp-3">{a.excerpt}</p>}
              <div className="text-xs text-gray-500 mt-3">
                {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : ''}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
