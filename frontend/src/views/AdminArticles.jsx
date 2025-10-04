import { useEffect, useState } from "react";

export default function AdminArticles() {
	const [articles, setArticles] = useState([]);
	const [form, setForm] = useState({ title: "", content: "", excerpt: "", category: "", tags: "", coverImageUrl: "", published: true });
	const [loading, setLoading] = useState(false);

	async function loadArticles() {
		try {
			const API_BASE = import.meta.env.VITE_API_BASE || '';
			const res = await fetch(`${API_BASE}/api/articles`);
			const data = await res.json();
			
			// Handle new API response format
			const articlesArray = data.articles ? data.articles : (Array.isArray(data) ? data : []);
			setArticles(articlesArray);
		} catch (e) {
			console.error(e);
		}
	}

	useEffect(() => {
		loadArticles();
	}, []);

	async function createArticle(e) {
		e.preventDefault();
		setLoading(true);
		try {
			const payload = {
				...form,
				tags: form.tags
					.split(",")
					.map((t) => t.trim())
					.filter(Boolean),
				published: Boolean(form.published),
			};
			const API_BASE = import.meta.env.VITE_API_BASE || '';
			const res = await fetch(`${API_BASE}/api/articles`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!res.ok) throw new Error("Failed");
			await loadArticles();
			setForm({ title: "", content: "", excerpt: "", category: "", tags: "", coverImageUrl: "", published: false });
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	}

		// Edit and Delete handlers
		async function handleDelete(id) {
			if (!window.confirm('Are you sure you want to delete this article?')) return;
			setLoading(true);
			try {
				const API_BASE = import.meta.env.VITE_API_BASE || '';
				const res = await fetch(`${API_BASE}/api/articles/${id}`, { method: 'DELETE' });
				if (!res.ok) throw new Error('Failed to delete');
				await loadArticles();
			} catch (e) {
				console.error(e);
			} finally {
				setLoading(false);
			}
		}

		function handleEdit(article) {
			setForm({
				title: article.title || '',
				content: article.content || '',
				excerpt: article.excerpt || '',
				category: article.category || '',
				tags: (article.tags || []).join(', '),
				coverImageUrl: article.coverImageUrl || '',
				published: !!article.published,
				_id: article._id,
			});
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}

		async function updateArticle(e) {
			e.preventDefault();
			if (!form._id) return;
			setLoading(true);
			try {
				const payload = {
					...form,
					tags: form.tags
						.split(",")
						.map((t) => t.trim())
						.filter(Boolean),
					published: Boolean(form.published),
				};
				const API_BASE = import.meta.env.VITE_API_BASE || '';
				const res = await fetch(`${API_BASE}/api/articles/${form._id}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});
				if (!res.ok) throw new Error("Failed");
				await loadArticles();
				setForm({ title: "", content: "", excerpt: "", category: "", tags: "", coverImageUrl: "", published: false });
			} catch (e) {
				console.error(e);
			} finally {
				setLoading(false);
			}
		}

	return (
		<div className="min-h-screen bg-black">
			{/* Header */}
			<div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 py-8">
				<div className="max-w-6xl mx-auto px-6">
					<h1 className="text-4xl font-black bg-gradient-to-r from-[#efb81c] to-[#f8d675] bg-clip-text text-transparent mb-2">
						Article Management
					</h1>
					<p className="text-gray-400">Create, edit, and manage your news articles</p>
				</div>
			</div>

			<div className="max-w-6xl mx-auto px-6 py-8">
				{/* Article Form */}
				<div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 mb-8 shadow-2xl">
					<h2 className="text-2xl font-bold text-white mb-6 flex items-center">
						<div className="w-1 h-6 bg-gradient-to-b from-[#efb81c] to-[#f8d675] rounded-full mr-3"></div>
						{form._id ? 'Edit Article' : 'Create New Article'}
					</h2>
					
					<form onSubmit={form._id ? updateArticle : createArticle} className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-semibold text-gray-300 mb-2">Title</label>
								<input 
									className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-[#efb81c] focus:ring-2 focus:ring-[#efb81c]/20 transition-all" 
									placeholder="Enter article title" 
									value={form.title} 
									onChange={(e) => setForm({ ...form, title: e.target.value })} 
								/>
							</div>
							<div>
								<label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
								<input 
									className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-[#efb81c] focus:ring-2 focus:ring-[#efb81c]/20 transition-all" 
									placeholder="e.g., Cryptocurrency, Technology" 
									value={form.category} 
									onChange={(e) => setForm({ ...form, category: e.target.value })} 
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-semibold text-gray-300 mb-2">Excerpt</label>
							<input 
								className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-[#efb81c] focus:ring-2 focus:ring-[#efb81c]/20 transition-all" 
								placeholder="Brief description of the article" 
								value={form.excerpt} 
								onChange={(e) => setForm({ ...form, excerpt: e.target.value })} 
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-semibold text-gray-300 mb-2">Tags</label>
								<input 
									className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-[#efb81c] focus:ring-2 focus:ring-[#efb81c]/20 transition-all" 
									placeholder="bitcoin, crypto, news (comma separated)" 
									value={form.tags} 
									onChange={(e) => setForm({ ...form, tags: e.target.value })} 
								/>
							</div>
							<div>
								<label className="block text-sm font-semibold text-gray-300 mb-2">Cover Image URL</label>
								<input 
									className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-[#efb81c] focus:ring-2 focus:ring-[#efb81c]/20 transition-all" 
									placeholder="https://example.com/image.jpg" 
									value={form.coverImageUrl} 
									onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} 
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-semibold text-gray-300 mb-2">Content</label>
							<textarea 
								className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-[#efb81c] focus:ring-2 focus:ring-[#efb81c]/20 transition-all resize-none" 
								placeholder="Write your article content here (markdown or HTML supported)" 
								rows={8} 
								value={form.content} 
								onChange={(e) => setForm({ ...form, content: e.target.value })} 
							/>
						</div>

						<div className="flex items-center space-x-4">
							<label className="flex items-center space-x-3 cursor-pointer">
								<input 
									type="checkbox" 
									checked={form.published} 
									onChange={(e) => setForm({ ...form, published: e.target.checked })}
									className="w-5 h-5 text-[#efb81c] bg-gray-800 border-gray-600 rounded focus:ring-[#efb81c] focus:ring-2"
								/>
								<span className="text-gray-300 font-medium">Publish immediately</span>
							</label>
						</div>

						<div className="flex space-x-4 pt-4">
							<button 
								disabled={loading} 
								className="bg-gradient-to-r from-[#efb81c] to-[#f8d675] hover:from-[#f8d675] hover:to-[#efb81c] text-black font-bold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
							>
								{loading ? (form._id ? "Updating..." : "Creating...") : (form._id ? "Update Article" : "Create Article")}
							</button>
							{form._id && (
								<button 
									type="button" 
									className="bg-gray-600 hover:bg-gray-500 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300" 
									onClick={() => setForm({ title: "", content: "", excerpt: "", category: "", tags: "", coverImageUrl: "", published: false })}
								>
									Cancel Edit
								</button>
							)}
						</div>
					</form>
				</div>

				{/* Articles Table */}
				<div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl">
					<div className="px-8 py-6 border-b border-gray-700/50">
						<h2 className="text-2xl font-bold text-white flex items-center">
							<div className="w-1 h-6 bg-gradient-to-b from-[#efb81c] to-[#f8d675] rounded-full mr-3"></div>
							Published Articles ({articles.length})
						</h2>
					</div>
					
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="bg-gradient-to-r from-gray-800/50 to-gray-700/50">
									<th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Title</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Category</th>
									<th className="px-6 py-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">Status</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Updated</th>
									<th className="px-6 py-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-700/50">
								{articles.map((article) => (
									<tr key={article._id} className="hover:bg-gray-800/30 transition-colors">
										<td className="px-6 py-4">
											<div className="flex items-center space-x-3">
												{article.coverImageUrl && (
													<img 
														src={article.coverImageUrl} 
														alt={article.title}
														className="w-12 h-12 rounded-lg object-cover"
													/>
												)}
												<div>
													<div className="text-white font-medium text-sm">{article.title}</div>
													{article.excerpt && (
														<div className="text-gray-400 text-xs mt-1 line-clamp-2">{article.excerpt}</div>
													)}
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#efb81c]/20 text-[#efb81c] border border-[#efb81c]/30">
												{article.category || 'General'}
											</span>
										</td>
										<td className="px-6 py-4 text-center">
											<span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
												article.published 
													? 'bg-green-500/20 text-green-400 border border-green-500/30' 
													: 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
											}`}>
												{article.published ? 'Published' : 'Draft'}
											</span>
										</td>
										<td className="px-6 py-4 text-gray-400 text-sm">
											{new Date(article.updatedAt).toLocaleDateString(undefined, { 
												year: 'numeric', 
												month: 'short', 
												day: 'numeric',
												hour: '2-digit',
												minute: '2-digit'
											})}
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center justify-center space-x-2">
												<button 
													className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 transform hover:scale-105"
													onClick={() => handleEdit(article)}
												>
													Edit
												</button>
												<button 
													className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 transform hover:scale-105"
													onClick={() => handleDelete(article._id)}
												>
													Delete
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
						
						{articles.length === 0 && (
							<div className="text-center py-12">
								<div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
									<span className="text-2xl">📝</span>
								</div>
								<h3 className="text-lg font-semibold text-gray-400 mb-2">No articles yet</h3>
								<p className="text-gray-500">Create your first article using the form above</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}