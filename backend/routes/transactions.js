import express from 'express';
import db from '../config/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.get('/', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.transaction_id, t.book_id, b.title AS book_title,
             t.user_id, u.name AS user_name, t.transaction_type,
             t.quantity, t.transaction_date
      FROM transactions t
      JOIN books b ON b.book_id=t.book_id
      LEFT JOIN users u ON u.user_id=t.user_id
      ORDER BY t.transaction_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Could not load transactions.', detail: error.message });
  }
});

router.post('/', async (req, res) => {
  const { book_id, transaction_type, quantity } = req.body;
  const amount = Number(quantity);
  const bookId = Number(book_id);

  if (!Number.isInteger(bookId) || bookId < 1 ||
      !Number.isInteger(amount) || amount < 1 ||
      !['ADD', 'BORROW', 'RETURN'].includes(transaction_type)) {
    return res.status(400).json({ message: 'Choose a book, transaction type, and a positive whole-number quantity.' });
  }

  if (transaction_type === 'ADD' && req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Only administrators can add new stock.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [books] = await connection.query(
      'SELECT quantity FROM books WHERE book_id=? AND is_deleted=FALSE FOR UPDATE',
      [bookId]
    );
    if (!books.length) {
      await connection.rollback();
      return res.status(404).json({ message: 'Book not found.' });
    }

    const current = books[0].quantity;
    if (transaction_type === 'BORROW' && current < amount) {
      await connection.rollback();
      return res.status(400).json({ message: 'There are not enough copies available.' });
    }

    const change = transaction_type === 'BORROW' ? -amount : amount;
    await connection.query('UPDATE books SET quantity=quantity+? WHERE book_id=?', [change, bookId]);
    await connection.query(
      'INSERT INTO transactions (book_id, user_id, transaction_type, quantity) VALUES (?, ?, ?, ?)',
      [bookId, req.user.user_id, transaction_type, amount]
    );

    await connection.commit();
    res.status(201).json({ message: 'Transaction recorded successfully.' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Could not record transaction.', detail: error.message });
  } finally {
    connection.release();
  }
});

export default router;
