import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT user_id, name, membership_id, role, created_at FROM users ORDER BY user_id DESC'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Could not load users.', detail: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, membership_id, password, role } = req.body;
    if (!name?.trim() || !membership_id?.trim() || !password || password.length < 8 ||
        !['Admin', 'User'].includes(role)) {
      return res.status(400).json({ message: 'Enter all fields, a password of at least 8 characters, and a valid role.' });
    }
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, membership_id, password, role) VALUES (?, ?, ?, ?)',
      [name.trim(), membership_id.trim(), hash, role]
    );
    res.status(201).json({ message: 'User added successfully.', user_id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Membership ID already exists.' });
    res.status(500).json({ message: 'Could not add user.', detail: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, membership_id, password, role } = req.body;
    if (!name?.trim() || !membership_id?.trim() || !['Admin', 'User'].includes(role)) {
      return res.status(400).json({ message: 'Enter valid user details.' });
    }

    let result;
    if (password) {
      if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
      const hash = await bcrypt.hash(password, 10);
      [result] = await db.query(
        'UPDATE users SET name=?, membership_id=?, password=?, role=? WHERE user_id=?',
        [name.trim(), membership_id.trim(), hash, role, req.params.id]
      );
    } else {
      [result] = await db.query(
        'UPDATE users SET name=?, membership_id=?, role=? WHERE user_id=?',
        [name.trim(), membership_id.trim(), role, req.params.id]
      );
    }

    if (!result.affectedRows) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User updated successfully.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Membership ID already exists.' });
    res.status(500).json({ message: 'Could not update user.', detail: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  if (Number(req.params.id) === req.user.user_id) {
    return res.status(400).json({ message: 'You cannot delete the account you are currently using.' });
  }
  try {
    const [result] = await db.query('DELETE FROM users WHERE user_id=?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Could not delete user.', detail: error.message });
  }
});

export default router;
