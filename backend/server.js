import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';
import authRoutes from './routes/auth.js';
import booksRoutes from './routes/books.js';
import transactionsRoutes from './routes/transactions.js';
import usersRoutes from './routes/users.js';

dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('Set JWT_SECRET in backend/.env to a random value of at least 32 characters.');
}

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ success: true, message: 'Jappie Library API is running', database: 'Connected' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res) => res.status(404).json({ message: 'API route not found.' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Jappie Library API running at http://localhost:${PORT}`));
