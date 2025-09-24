import express from 'express';
import cors from "cors";
import users from './users.js';
import connectDB from './db.js';
import ItemModel from './models/item.js';
import ArticleModel from './models/article.js';

const app = express();
app.use(express.json());
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
    const { published } = req.query;
    const filter = {};
    if (published === 'true') filter.published = true;
    if (published === 'false') filter.published = false;
    const articles = await ArticleModel.find(filter).sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

app.get('/api/articles/:slug', async (req, res) => {
  try {
    const article = await ArticleModel.findOne({ slug: req.params.slug });
    if (!article) return res.status(404).json({ error: 'Not found' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

app.post('/api/articles', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.slug) {
      payload.slug = payload.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .substring(0, 80);
    }
    if (payload.published && !payload.publishedAt) {
      payload.publishedAt = new Date();
    }
    const created = await ArticleModel.create(payload);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to create article' });
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
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to delete article' });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});