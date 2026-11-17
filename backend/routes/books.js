import express from 'express';
import db from '../config/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT book_id, title, author, genre, isbn, quantity, created_at FROM books WHERE is_deleted = FALSE ORDER BY title'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Could not load books.', detail: error.message });
  }
});


router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, author, genre, isbn } = req.body;

    if (![title, author, genre, isbn].every(
      v => typeof v === 'string' && v.trim()
    )) {
      return res.status(400).json({
        message: 'Please complete all four fields.'
      });
    }

    const [result] = await db.query(
      'INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?, ?, ?, ?, ?)',
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), 0]
    );

    res.status(201).json({
      message: 'Book added successfully.',
      book_id: result.insertId
    });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'That ISBN already exists.'
      });
    }

    res.status(500).json({
      message: 'Could not add book.',
      detail: error.message
    });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { title, author, genre, isbn } = req.body;
    if (![title, author, genre, isbn].every(v => typeof v === 'string' && v.trim())) {
      return res.status(400).json({ message: 'Complete all book details.' });
    }
    const [result] = await db.query(
      'UPDATE books SET title=?, author=?, genre=?, isbn=? WHERE book_id=? AND is_deleted=FALSE',
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Book not found.' });
    res.json({ message: 'Book details updated. Use Transactions to change stock.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'That ISBN already belongs to another book.' });
    res.status(500).json({ message: 'Could not update book.', detail: error.message });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const [result] = await db.query(
      'UPDATE books SET is_deleted=TRUE WHERE book_id=? AND is_deleted=FALSE',
      [req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Book not found.' });
    res.json({ message: 'Book removed from the active catalogue.' });
  } catch (error) {
    res.status(500).json({ message: 'Could not delete book.', detail: error.message });
  }
});

export default router;
