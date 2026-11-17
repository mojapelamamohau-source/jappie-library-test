import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { api('/books').then(setBooks).catch(e => setError(e.message)); }, []);
  const totalCopies = books.reduce((sum, b) => sum + Number(b.quantity), 0);
  const lowStock = books.filter(b => Number(b.quantity) < 2);

  return <div>
    <div className="page-heading"><div><h1>Dashboard</h1><p>Overview of your library collection.</p></div><Link className="button-link" to="/books">Manage books</Link></div>
    {error && <div className="alert error">{error}</div>}
    <div className="stats-grid">
      <div className="stat-card"><div className="stat-icon">B</div><p>Book titles</p><h2>{books.length}</h2></div>
      <div className="stat-card"><div className="stat-icon">C</div><p>Available copies</p><h2>{totalCopies}</h2></div>
      <div className="stat-card"><div className="stat-icon">!</div><p>Low-stock titles</p><h2>{lowStock.length}</h2></div>
    </div>
    <section className="content-card"><div className="section-heading"><div><h2>Low stock books</h2><p>Books with fewer than 2 copies available.</p></div></div>
      <BookRows books={lowStock} empty="All books have sufficient stock." />
    </section>
    <section className="content-card"><div className="section-heading"><div><h2>Current collection</h2><p>Your latest book inventory.</p></div></div><BookRows books={books.slice(0,5)} empty="No books have been added yet." /></section>
  </div>;
}

function BookRows({ books, empty }) {
  if (!books.length) return <p className="empty">{empty}</p>;
  return <div className="table-wrap"><table><thead><tr><th>Title</th><th>Author</th><th>Genre</th><th>Available</th></tr></thead><tbody>
    {books.map(b => <tr key={b.book_id}><td>{b.title}</td><td>{b.author}</td><td>{b.genre}</td><td><span className={Number(b.quantity)<2?'stock-low':'stock-good'}>{b.quantity}</span></td></tr>)}
  </tbody></table></div>;
}
