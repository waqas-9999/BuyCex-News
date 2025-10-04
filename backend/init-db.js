// Database initialization script
// Run this to set up initial data and indexes

import mongoose from 'mongoose';
import ArticleModel from './models/article.js';
import connectDB from './db.js';

const initializeDatabase = async () => {
  try {
    await connectDB();
    console.log('Connected to database');
    
    // Create indexes for better performance
    await ArticleModel.createIndexes();
    console.log('Indexes created successfully');
    
    // Check if we have any articles
    const articleCount = await ArticleModel.countDocuments();
    console.log(`Found ${articleCount} articles in database`);
    
    // Create sample article if none exist
    if (articleCount === 0) {
      const sampleArticle = {
        title: "Welcome to BuyCex News",
        excerpt: "Your premier source for cryptocurrency news and market analysis",
        content: "# Welcome to BuyCex News\n\nThis is your premier destination for the latest cryptocurrency news, market analysis, and insights. Stay updated with the most important developments in the crypto world.\n\n## What We Cover\n\n- Market Analysis\n- Breaking News\n- Technology Updates\n- Regulatory Changes\n- Investment Insights\n\nStay tuned for more updates!",
        category: "General",
        section: "Welcome",
        tags: ["welcome", "cryptocurrency", "news"],
        author: "Admin",
        published: true,
        featured: true,
        coverImageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop"
      };
      
      await ArticleModel.create(sampleArticle);
      console.log('Sample article created successfully');
    }
    
    console.log('Database initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

initializeDatabase();
