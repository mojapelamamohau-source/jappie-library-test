import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { membership_id, password } = req.body;
    if (!membership_id || !password) {
      return res.status(400).json({ message: 'Membership ID and password are required.' });
    }

    const [rows] = await db.query(
      'SELECT user_id, name, membership_id, password, role FROM users WHERE membership_id = ?',
      [membership_id.trim()]
    );

    if (!rows.length || !(await bcrypt.compare(password, rows[0].password))) {
      return res.status(401).json({ message: 'Invalid membership ID or password.' });
    }

    const user = rows[0];
    const token = jwt.sign(
      { user_id: user.user_id, name: user.name, membership_id: user.membership_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: { user_id: user.user_id, name: user.name, membership_id: user.membership_id, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Could not log in.', detail: error.message });
  }
});

// Public registration always creates a normal User, never an Admin.
router.post('/register', async (req, res) => {
  try {
    const { name, membership_id, password } = req.body;
    if (!name?.trim() || !membership_id?.trim() || !password || password.length < 8) {
      return res.status(400).json({ message: 'Enter your name, membership ID, and a password of at least 8 characters.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, membership_id, password, role) VALUES (?, ?, ?, ?)',
      [name.trim(), membership_id.trim(), hash, 'User']
    );
    res.status(201).json({ message: 'Account created. You can now log in.', user_id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'That membership ID is already registered.' });
    res.status(500).json({ message: 'Could not register user.', detail: error.message });
  }
});

export default router;
