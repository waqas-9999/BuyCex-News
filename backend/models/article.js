import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		slug: { type: String, required: true, unique: true, index: true },
		excerpt: { type: String, trim: true },
		content: { type: String, required: true },
		coverImageUrl: { type: String },
		category: { type: String, index: true, default: 'General' },
		section: { type: String, index: true, default: 'News' }, // e.g. 'Top Stories', 'Breaking News', 'Opinion'
		tags: { type: [String], index: true, default: [] },
		author: { type: String, default: 'Admin' },
		published: { type: Boolean, default: false, index: true },
		publishedAt: { type: Date, index: true },
		views: { type: Number, default: 0 },
		featured: { type: Boolean, default: false, index: true },
		metaDescription: { type: String },
		readingTime: { type: Number }, // in minutes
	},
	{ 
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);

// Virtual for reading time calculation
ArticleSchema.virtual('estimatedReadingTime').get(function() {
	if (this.readingTime) return this.readingTime;
	const wordsPerMinute = 200;
	const wordCount = this.content ? this.content.split(/\s+/).length : 0;
	return Math.ceil(wordCount / wordsPerMinute);
});

// Pre-save middleware to generate slug if not provided
ArticleSchema.pre('save', function(next) {
	if (!this.slug && this.title) {
		this.slug = this.title
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '')
			.trim()
			.replace(/\s+/g, '-')
			.substring(0, 80);
	}
	
	// Set publishedAt when published becomes true
	if (this.published && !this.publishedAt) {
		this.publishedAt = new Date();
	}
	
	// Calculate reading time
	if (this.content) {
		const wordsPerMinute = 200;
		const wordCount = this.content.split(/\s+/).length;
		this.readingTime = Math.ceil(wordCount / wordsPerMinute);
	}
	
	next();
});

// Indexes for better performance
ArticleSchema.index({ published: 1, publishedAt: -1 });
ArticleSchema.index({ category: 1, published: 1 });
ArticleSchema.index({ tags: 1, published: 1 });
ArticleSchema.index({ featured: 1, published: 1 });

const ArticleModel = mongoose.models.Article || mongoose.model("Article", ArticleSchema);
export default ArticleModel; 