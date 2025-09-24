import { useEffect, useState } from "react";

export default function AdminArticles() {
	const [articles, setArticles] = useState([]);
	const [form, setForm] = useState({ title: "", content: "", excerpt: "", category: "", tags: "", coverImageUrl: "", published: false });
	const [loading, setLoading] = useState(false);

	async function loadArticles() {
		try {
			const res = await fetch("/api/articles");
			const data = await res.json();
			setArticles(Array.isArray(data) ? data : []);
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
			const res = await fetch("/api/articles", {
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

	return (
		<div className="p-6 max-w-4xl mx-auto">
			<h1 className="text-2xl font-bold mb-4">Articles Admin</h1>
			<form onSubmit={createArticle} className="grid gap-2 mb-6">
				<input className="border px-2 py-1" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
				<input className="border px-2 py-1" placeholder="Excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
				<input className="border px-2 py-1" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
				<input className="border px-2 py-1" placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
				<input className="border px-2 py-1" placeholder="Cover Image URL" value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} />
				<textarea className="border px-2 py-1" placeholder="Content (markdown or HTML)" rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
				<label className="flex items-center gap-2"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Publish now</label>
				<button disabled={loading} className="bg-blue-600 text-white px-3 py-1 rounded">{loading ? "Saving..." : "Create Article"}</button>
			</form>

			<table className="border-collapse border border-gray-400 w-full">
				<thead>
					<tr className="bg-gray-100">
						<th className="border px-3 py-1 text-left">Title</th>
						<th className="border px-3 py-1">Published</th>
						<th className="border px-3 py-1">Updated</th>
					</tr>
				</thead>
				<tbody>
					{articles.map((a) => (
						<tr key={a._id}>
							<td className="border px-3 py-1">{a.title}</td>
							<td className="border px-3 py-1">{a.published ? "Yes" : "No"}</td>
							<td className="border px-3 py-1">{new Date(a.updatedAt).toLocaleString()}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
} 