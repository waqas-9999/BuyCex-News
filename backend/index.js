import express from 'express';
import cors from "cors";
import users from './users.js';
import connectDB from './db.js';
import ItemModel from './models/item.js';
import ArticleModel from './models/article.js';
import VisitorModel from './models/visitor.js';
import { trackVisitor, trackPageView } from './middleware/visitorTracking.js';

const app = express();
app.use(express.json());

// Add session support for visitor tracking
app.use((req, res, next) => {
  if (!req.session) {
    req.session = {};
  }
  next();
});

connectDB();

const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://localhost:5173',
];
const envOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const allowedOrigins = [...defaultOrigins, ...envOrigins];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some((o) => origin.startsWith(o))) return callback(null, true);
    return callback(null, true);
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.get('/', async (req, res) => {
  try {
    const items = await ItemModel.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.get('/api', async (req, res) => {
  try {
    const items = await ItemModel.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.get('/api/users', async (req, res) => {
  const items = await ItemModel.find()
  res.send(users);
});

// Articles CRUD
app.get('/api/articles', async (req, res) => {
  try {
    const { published, category, section, featured, limit, page, search } = req.query;
    const filter = {};
    
    // Build filter object
    if (published === 'true') filter.published = true;
    if (published === 'false') filter.published = false;
    if (category) filter.category = category;
    if (section) filter.section = section;
    if (featured === 'true') filter.featured = true;
    
    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;
    
    const articles = await ArticleModel.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-content'); // Exclude content for list view
    
    const total = await ArticleModel.countDocuments(filter);
    
    res.json({
      articles,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error('Error fetching articles:', err);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

app.get('/api/articles/:slug', async (req, res) => {
  try {
    const article = await ArticleModel.findOne({ slug: req.params.slug });
    if (!article) return res.status(404).json({ error: 'Article not found' });
    
    // Increment view count
    await ArticleModel.findByIdAndUpdate(article._id, { $inc: { views: 1 } });
    
    res.json(article);
  } catch (err) {
    console.error('Error fetching article:', err);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// Get article by ID (for admin)
app.get('/api/articles/id/:id', async (req, res) => {
  try {
    const article = await ArticleModel.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (err) {
    console.error('Error fetching article:', err);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

app.post('/api/articles', async (req, res) => {
  try {
    const payload = req.body;
    
    // Validation
    if (!payload.title || !payload.content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    // Generate slug if not provided
    if (!payload.slug) {
      payload.slug = payload.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .substring(0, 80);
    }
    
    // Set publishedAt when published becomes true
    if (payload.published && !payload.publishedAt) {
      payload.publishedAt = new Date();
    }
    
    // Generate meta description from excerpt or content
    if (!payload.metaDescription && payload.excerpt) {
      payload.metaDescription = payload.excerpt.substring(0, 160);
    }
    
    const created = await ArticleModel.create(payload);
    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating article:', err);
    if (err.code === 11000) {
      res.status(400).json({ error: 'An article with this slug already exists' });
    } else {
      res.status(400).json({ error: err.message || 'Failed to create article' });
    }
  }
});

app.put('/api/articles/:id', async (req, res) => {
  try {
    const updates = req.body;
    if (updates.published && !updates.publishedAt) {
      updates.publishedAt = new Date();
    }
    const updated = await ArticleModel.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update article' });
  }
});

app.delete('/api/articles/:id', async (req, res) => {
  try {
    const deleted = await ArticleModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Article not found' });
    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (err) {
    console.error('Error deleting article:', err);
    res.status(400).json({ error: err.message || 'Failed to delete article' });
  }
});

// Additional endpoints for admin functionality

// Get article statistics
app.get('/api/articles/stats', async (req, res) => {
  try {
    const totalArticles = await ArticleModel.countDocuments();
    const publishedArticles = await ArticleModel.countDocuments({ published: true });
    const draftArticles = await ArticleModel.countDocuments({ published: false });
    const featuredArticles = await ArticleModel.countDocuments({ featured: true });
    
    // Get most viewed articles
    const mostViewed = await ArticleModel.find({ published: true })
      .sort({ views: -1 })
      .limit(5)
      .select('title views publishedAt');
    
    // Get articles by category
    const categoryStats = await ArticleModel.aggregate([
      { $match: { published: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      totalArticles,
      publishedArticles,
      draftArticles,
      featuredArticles,
      mostViewed,
      categoryStats
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await ArticleModel.distinct('category', { published: true });
    res.json(categories.filter(Boolean));
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Toggle featured status
app.patch('/api/articles/:id/featured', async (req, res) => {
  try {
    const { featured } = req.body;
    const updated = await ArticleModel.findByIdAndUpdate(
      req.params.id, 
      { featured: Boolean(featured) }, 
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Article not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating featured status:', err);
    res.status(400).json({ error: 'Failed to update featured status' });
  }
});

// ==================== ANALYTICS ENDPOINTS ====================

// Apply visitor tracking to all routes
app.use(trackVisitor);
app.use(trackPageView);

// Get overall analytics dashboard data
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);
    
    // Get today's stats
    const todayStats = await VisitorModel.getDailyStats(today);
    const yesterdayStats = await VisitorModel.getDailyStats(yesterday);
    
    // Get last 7 days trend
    const last7DaysStats = await VisitorModel.aggregate([
      {
        $match: {
          visitDate: { $gte: last7Days },
          isBot: false
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$visitDate' },
            month: { $month: '$visitDate' },
            day: { $dayOfMonth: '$visitDate' }
          },
          visitors: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$sessionId' },
          pageViews: { $sum: '$pageViews' }
        }
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          },
          visitors: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          pageViews: 1
        }
      },
      { $sort: { date: 1 } }
    ]);
    
    // Get top countries
    const topCountries = await VisitorModel.aggregate([
      {
        $match: {
          visitDate: { $gte: last30Days },
          isBot: false
        }
      },
      {
        $group: {
          _id: '$country',
          visitors: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$sessionId' }
        }
      },
      {
        $project: {
          country: '$_id',
          visitors: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' }
        }
      },
      { $sort: { visitors: -1 } },
      { $limit: 10 }
    ]);
    
    // Get device/browser stats
    const deviceStats = await VisitorModel.getDeviceStats({ start: last30Days, end: today });
    
    // Get most visited pages
    const topPages = await VisitorModel.aggregate([
      {
        $match: {
          visitDate: { $gte: last30Days },
          isBot: false
        }
      },
      {
        $group: {
          _id: '$page',
          visitors: { $sum: 1 },
          pageViews: { $sum: '$pageViews' }
        }
      },
      { $sort: { visitors: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      today: todayStats[0] || {
        totalVisitors: 0,
        uniqueVisitors: 0,
        totalPageViews: 0,
        avgVisitDuration: 0,
        newVisitors: 0,
        returningVisitors: 0
      },
      yesterday: yesterdayStats[0] || {
        totalVisitors: 0,
        uniqueVisitors: 0,
        totalPageViews: 0,
        avgVisitDuration: 0,
        newVisitors: 0,
        returningVisitors: 0
      },
      last7Days: last7DaysStats,
      topCountries,
      deviceStats: deviceStats.slice(0, 10),
      topPages
    });
  } catch (err) {
    console.error('Error fetching dashboard analytics:', err);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Get detailed visitor analytics
app.get('/api/analytics/visitors', async (req, res) => {
  try {
    const { startDate, endDate, country, region, device, browser } = req.query;
    
    const matchStage = { isBot: false };
    
    if (startDate && endDate) {
      matchStage.visitDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (country) matchStage.country = country;
    if (region) matchStage.region = region;
    if (device) matchStage.device = device;
    if (browser) matchStage.browser = browser;
    
    const visitors = await VisitorModel.find(matchStage)
      .sort({ visitDate: -1 })
      .limit(100)
      .select('-userAgent -ip');
    
    const totalVisitors = await VisitorModel.countDocuments(matchStage);
    
    res.json({
      visitors,
      totalVisitors,
      hasMore: visitors.length === 100
    });
  } catch (err) {
    console.error('Error fetching visitor analytics:', err);
    res.status(500).json({ error: 'Failed to fetch visitor data' });
  }
});

// Get region-based analytics
app.get('/api/analytics/regions', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateRange = startDate && endDate ? {
      start: new Date(startDate),
      end: new Date(endDate)
    } : null;
    
    const regionStats = await VisitorModel.getRegionStats(dateRange);
    
    res.json(regionStats);
  } catch (err) {
    console.error('Error fetching region analytics:', err);
    res.status(500).json({ error: 'Failed to fetch region data' });
  }
});

// Get daily analytics for charts
app.get('/api/analytics/daily', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const dailyStats = await VisitorModel.aggregate([
      {
        $match: {
          visitDate: { $gte: startDate },
          isBot: false
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$visitDate' },
            month: { $month: '$visitDate' },
            day: { $dayOfMonth: '$visitDate' }
          },
          visitors: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$sessionId' },
          pageViews: { $sum: '$pageViews' },
          avgDuration: { $avg: '$visitDuration' },
          newVisitors: { $sum: { $cond: ['$isNewVisitor', 1, 0] } },
          returningVisitors: { $sum: { $cond: ['$isReturningVisitor', 1, 0] } }
        }
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          },
          visitors: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          pageViews: 1,
          avgDuration: { $round: ['$avgDuration', 2] },
          newVisitors: 1,
          returningVisitors: 1
        }
      },
      { $sort: { date: 1 } }
    ]);
    
    res.json(dailyStats);
  } catch (err) {
    console.error('Error fetching daily analytics:', err);
    res.status(500).json({ error: 'Failed to fetch daily data' });
  }
});

// Get real-time analytics (last hour)
app.get('/api/analytics/realtime', async (req, res) => {
  try {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const realtimeStats = await VisitorModel.aggregate([
      {
        $match: {
          visitDate: { $gte: oneHourAgo },
          isBot: false
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$visitDate' },
            month: { $month: '$visitDate' },
            day: { $dayOfMonth: '$visitDate' },
            hour: { $hour: '$visitDate' }
          },
          visitors: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$sessionId' },
          pageViews: { $sum: '$pageViews' }
        }
      },
      {
        $project: {
          time: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day',
              hour: '$_id.hour'
            }
          },
          visitors: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          pageViews: 1
        }
      },
      { $sort: { time: 1 } }
    ]);
    
    res.json(realtimeStats);
  } catch (err) {
    console.error('Error fetching realtime analytics:', err);
    res.status(500).json({ error: 'Failed to fetch realtime data' });
  }
});

// Track visitor data from frontend
app.post('/api/analytics/track', async (req, res) => {
  try {
    const trackingData = req.body;
    
    // Create visitor record
    const visitorData = {
      sessionId: trackingData.sessionId,
      ip: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || '127.0.0.1',
      userAgent: trackingData.userAgent,
      referrer: trackingData.referrer,
      page: trackingData.page,
      pageTitle: trackingData.pageTitle,
      articleId: trackingData.articleId,
      visitDuration: trackingData.duration || 0,
      pageViews: trackingData.pageViews || 1,
      visitDate: new Date(trackingData.timestamp),
      screenResolution: trackingData.screenResolution,
      language: trackingData.language,
      timezone: trackingData.timezone,
      isNewVisitor: true, // Will be updated by middleware
      isReturningVisitor: false
    };
    
    // Save visitor data
    await VisitorModel.create(visitorData);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error tracking visitor:', err);
    res.status(500).json({ error: 'Failed to track visitor' });
  }
});

// Track conversion events
app.post('/api/analytics/conversion', async (req, res) => {
  try {
    const { sessionId, conversion, conversionValue } = req.body;
    
    // Update visitor record with conversion
    await VisitorModel.findOneAndUpdate(
      { sessionId: sessionId },
      { 
        $set: { 
          conversion: conversion,
          conversionValue: conversionValue,
          lastVisit: new Date()
        }
      }
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error tracking conversion:', err);
    res.status(500).json({ error: 'Failed to track conversion' });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});