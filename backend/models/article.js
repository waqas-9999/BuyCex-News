import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		slug: { type: String, required: true, unique: true, index: true },
		excerpt: { type: String },
		content: { type: String, required: true },
		coverImageUrl: { type: String },
		category: { type: String, index: true },
		tags: { type: [String], index: true, default: [] },
		author: { type: String },
		published: { type: Boolean, default: false },
		publishedAt: { type: Date },
	},
	{ timestamps: true }
);

const ArticleModel = mongoose.models.Article || mongoose.model("Article", ArticleSchema);
export default ArticleModel; 