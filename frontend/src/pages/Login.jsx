import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function Login({ onLogin }) {
  const [membership_id, setMembershipId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ membership_id, password }) });
      localStorage.setItem('jappieToken', data.token);
      localStorage.setItem('jappieUser', JSON.stringify(data.user));
      onLogin(data.user); navigate('/');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="brand-logo login-logo">J</div>
        <h1>Jappie Library</h1><p>Welcome back. Sign in to continue.</p>
        {error && <div className="alert error">{error}</div>}
        <label>Membership ID</label>
        <input value={membership_id} onChange={e => setMembershipId(e.target.value)} placeholder="Enter membership ID" required />
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required />
        <button className="primary-btn" disabled={busy}>{busy ? 'Signing in...' : 'Login'}</button>
        <p className="form-foot">New member? <Link to="/register">Create an account</Link></p>
      </form>
    </div>
  );
}
