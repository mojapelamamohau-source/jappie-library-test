import { useEffect, useState } from 'react';
import { api } from '../api.js';

const blank = { title:'', author:'', genre:'', isbn:'' };

export default function Books({ user }) {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() { try { setBooks(await api('/books')); } catch(e) { setError(e.message); } }
  useEffect(() => { load(); }, []);

  function change(e) { setForm({ ...form, [e.target.name]:e.target.value }); }
  function reset() { setForm(blank); setEditing(null); }

  async function submit(e) {
    e.preventDefault(); setError(''); setMessage('');
    try {
      const path = editing ? `/books/${editing}` : '/books';
      const method = editing ? 'PUT' : 'POST';
      const data = await api(path, { method, body:JSON.stringify(form) });
      setMessage(data.message); reset(); await load();
    } catch(e) { setError(e.message); }
  }

  function startEdit(book) {
    setEditing(book.book_id);
    setForm({ title:book.title, author:book.author, genre:book.genre, isbn:book.isbn });
    window.scrollTo({ top:0, behavior:'smooth' });
  }

  async function remove(id) {
    if (!window.confirm('Remove this book from the active catalogue?')) return;
    try { const data = await api(`/books/${id}`, { method:'DELETE' }); setMessage(data.message); await load(); }
    catch(e) { setError(e.message); }
  }

  const visible = books.filter(b => `${b.title} ${b.author} ${b.genre} ${b.isbn}`.toLowerCase().includes(search.toLowerCase()));

  return <div>
    <div className="page-heading"><div><h1>Book Management</h1><p>Add, search, update and remove books.</p></div></div>
    {error && <div className="alert error">{error}</div>}{message && <div className="alert success">{message}</div>}
    {user.role === 'Admin' && <section className="content-card">
      <h2>{editing ? 'Update book details' : 'Add a new book'}</h2>
      <form className="form-grid" onSubmit={submit}>
        <label>Title<input name="title" value={form.title} onChange={change} required /></label>
        <label>Author<input name="author" value={form.author} onChange={change} required /></label>
        <label>Genre<input name="genre" value={form.genre} onChange={change} required /></label>
        <label>ISBN<input name="isbn" value={form.isbn} onChange={change} required /></label>
        {!editing && <p className="hint full-width">Initial stock is added using the Transactions page after saving the book.</p>}
        <div className="form-actions full-width"><button className="primary-btn compact">{editing?'Save changes':'Add book'}</button>{editing && <button type="button" className="secondary-btn" onClick={reset}>Cancel</button>}</div>
      </form>
    </section>}
    <section className="content-card">
      <div className="section-heading"><div><h2>Library catalogue</h2><p>{books.length} book title(s)</p></div><input className="search-input" placeholder="Search books..." value={search} onChange={e=>setSearch(e.target.value)} /></div>
      <div className="table-wrap"><table><thead><tr><th>Title</th><th>Author</th><th>Genre</th><th>ISBN</th><th>Stock</th>{user.role==='Admin'&&<th>Actions</th>}</tr></thead><tbody>
        {visible.map(b=><tr key={b.book_id}><td>{b.title}</td><td>{b.author}</td><td>{b.genre}</td><td>{b.isbn}</td><td><span className={Number(b.quantity)<2?'stock-low':'stock-good'}>{b.quantity}</span></td>{user.role==='Admin'&&<td className="actions"><button className="small-btn" onClick={()=>startEdit(b)}>Edit</button><button className="small-btn danger-btn" onClick={()=>remove(b.book_id)}>Delete</button></td>}</tr>)}
        {!visible.length && <tr><td colSpan={user.role==='Admin'?6:5} className="empty">No matching books found.</td></tr>}
      </tbody></table></div>
    </section>
  </div>;
}
