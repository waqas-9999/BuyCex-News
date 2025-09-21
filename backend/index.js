import express from 'express';
import cors from "cors";
import users from './users.js';

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.send('Server is ready!');
});

app.get('/api/users', (req, res) => {
  res.send(users);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});