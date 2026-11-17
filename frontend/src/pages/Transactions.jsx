import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Transactions({ user }) {
  const [books, setBooks] = useState([]);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ book_id:'', transaction_type:user.role==='Admin'?'ADD':'BORROW', quantity:1 });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    const list = await api('/books'); setBooks(list);
    if (user.role === 'Admin') setHistory(await api('/transactions'));
  }
  useEffect(() => { load().catch(e=>setError(e.message)); }, []);

  async function submit(e) {
    e.preventDefault(); setError(''); setMessage('');
    try {
      const data = await api('/transactions', { method:'POST', body:JSON.stringify({ ...form, quantity:Number(form.quantity) }) });
      setMessage(data.message); await load();
    } catch(e) { setError(e.message); }
  }

  return <div>
    <div className="page-heading"><div><h1>Transactions</h1><p>Record stock additions, borrowing and returns.</p></div></div>
    {error && <div className="alert error">{error}</div>}{message && <div className="alert success">{message}</div>}
    <section className="content-card"><h2>Record a transaction</h2>
      <form className="form-grid" onSubmit={submit}>
        <label>Book<select value={form.book_id} onChange={e=>setForm({...form,book_id:e.target.value})} required><option value="">Select a book</option>{books.map(b=><option key={b.book_id} value={b.book_id}>{b.title} ({b.quantity} available)</option>)}</select></label>
        <label>Transaction type<select value={form.transaction_type} onChange={e=>setForm({...form,transaction_type:e.target.value})}>
          {user.role==='Admin'&&<option value="ADD">Add stock</option>}<option value="BORROW">Borrow</option><option value="RETURN">Return</option>
        </select></label>
        <label>Quantity<input type="number" min="1" step="1" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} required /></label>
        <div className="form-actions"><button className="primary-btn compact">Save transaction</button></div>
      </form>
    </section>
    <section className="content-card"><h2>Current stock</h2><div className="table-wrap"><table><thead><tr><th>Book</th><th>Author</th><th>Available copies</th></tr></thead><tbody>{books.map(b=><tr key={b.book_id}><td>{b.title}</td><td>{b.author}</td><td>{b.quantity}</td></tr>)}{!books.length&&<tr><td colSpan="3" className="empty">No books available.</td></tr>}</tbody></table></div></section>
    {user.role==='Admin'&&<section className="content-card"><h2>Transaction history</h2><div className="table-wrap"><table><thead><tr><th>Date</th><th>Book</th><th>Member</th><th>Type</th><th>Quantity</th></tr></thead><tbody>
      {history.map(t=><tr key={t.transaction_id}><td>{new Date(t.transaction_date).toLocaleString()}</td><td>{t.book_title}</td><td>{t.user_name||'Deleted user'}</td><td>{t.transaction_type}</td><td>{t.quantity}</td></tr>)}
      {!history.length&&<tr><td colSpan="5" className="empty">No transactions recorded yet.</td></tr>}
    </tbody></table></div></section>}
  </div>;
}
