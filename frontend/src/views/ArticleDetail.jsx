import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || '';
        const res = await fetch(`${API_BASE}/api/articles/${slug}`);
        const data = await res.json();
        setArticle(data);
      } catch (e) {
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!article) return <div className="p-6 text-red-600">Article not found.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/" className="text-indigo-600 hover:underline mb-6 inline-block">← Back to Home</Link>
      {article.coverImageUrl && (
        <div className="mb-6 rounded-xl overflow-hidden aspect-[16/9] bg-gray-100">
          <img src={article.coverImageUrl} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <h1 className="text-3xl font-bold mb-2">{article.title}</h1>
      <div className="text-xs uppercase tracking-wide text-indigo-600 font-medium mb-2">{article.category || 'General'}{article.section ? ` • ${article.section}` : ''}</div>
      <div className="text-gray-500 text-sm mb-6">{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''}</div>
      {article.excerpt && <p className="text-lg text-gray-700 mb-6">{article.excerpt}</p>}
      <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
      <div className="mt-8 text-xs text-gray-400">Tags: {article.tags?.join(', ')}</div>
    </div>
  );
}
