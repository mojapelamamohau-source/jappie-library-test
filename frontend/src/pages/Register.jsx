import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function Register() {
  const [form, setForm] = useState({ name:'', membership_id:'', password:'' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setError(''); setMessage('');
    try {
      const data = await api('/auth/register', { method:'POST', body:JSON.stringify(form) });
      setMessage(data.message);
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) { setError(err.message); }
  }

  return <div className="login-page"><form className="login-card" onSubmit={submit}>
    <div className="brand-logo login-logo">J</div><h1>Create account</h1><p>Register as a library member.</p>
    {error && <div className="alert error">{error}</div>}{message && <div className="alert success">{message}</div>}
    <label>Full name</label><input name="name" value={form.name} onChange={change} required />
    <label>Membership ID</label><input name="membership_id" value={form.membership_id} onChange={change} required />
    <label>Password (at least 8 characters)</label><input type="password" name="password" value={form.password} onChange={change} minLength="8" required />
    <button className="primary-btn">Create account</button>
    <p className="form-foot"><Link to="/login">Back to login</Link></p>
  </form></div>;
}
