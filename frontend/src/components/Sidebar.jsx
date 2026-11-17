import { NavLink, useNavigate } from 'react-router-dom';

export default function Sidebar({ user }) {
  const navigate = useNavigate();
  function logout() {
    localStorage.removeItem('jappieToken');
    localStorage.removeItem('jappieUser');
    navigate('/login');
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">J</div>
        <div><h2>JAPPIE</h2><span>LIBRARY SYSTEM</span></div>
      </div>
      <p className="menu-label">MAIN MENU</p>
      <nav>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/books">Book Management</NavLink>
        <NavLink to="/transactions">Transactions</NavLink>
        {user?.role === 'Admin' && <NavLink to="/users">User Management</NavLink>}
      </nav>
      <div className="sidebar-bottom">
        <div className="signed-in"><strong>{user?.name}</strong><span>{user?.role}</span></div>
        <button className="logout-btn" onClick={logout}>Log out</button>
      </div>
    </aside>
  );
}
