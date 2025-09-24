import express from 'express';
import cors from "cors";
import users from './users.js';
import connectDB from './db.js';
import ItemModel from './models/item.js';

const app = express();
app.use(express.json());
connectDB();
app.use(cors());

app.get('/', async (req, res) => {
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});