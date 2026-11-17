import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';

dotenv.config();

try {
  const name = process.env.ADMIN_NAME;
  const membershipId = process.env.ADMIN_MEMBERSHIP_ID;
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !membershipId || !password || password.length < 8) {
    throw new Error('Set ADMIN_NAME, ADMIN_MEMBERSHIP_ID, and ADMIN_PASSWORD (at least 8 characters) in .env.');
  }

  const [existing] = await db.query('SELECT user_id FROM users WHERE membership_id=?', [membershipId]);
  if (existing.length) {
    console.log('An account with this membership ID already exists. No changes made.');
  } else {
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (name, membership_id, password, role) VALUES (?, ?, ?, ?)',
      [name, membershipId, hash, 'Admin']
    );
    console.log(`Administrator created. Membership ID: ${membershipId}`);
  }
} catch (error) {
  console.error('Could not create administrator:', error.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
