import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Books from './pages/Books.jsx';
import Transactions from './pages/Transactions.jsx';
import Users from './pages/Users.jsx';

function readUser() {
  try { return JSON.parse(localStorage.getItem('jappieUser') || 'null'); }
  catch { return null; }
}

export default function App() {
  const [user,setUser] = useState(readUser);
  const loggedIn = Boolean(user && localStorage.getItem('jappieToken'));
  const page = element => loggedIn ? <Layout user={user}>{element}</Layout> : <Navigate to="/login" replace />;

  return <Routes>
    <Route path="/login" element={loggedIn?<Navigate to="/" replace/>:<Login onLogin={setUser}/>} />
    <Route path="/register" element={<Register/>}/>
    <Route path="/" element={page(<Dashboard/>)} />
    <Route path="/books" element={page(<Books user={user || {role:'User'}}/>)} />
    <Route path="/transactions" element={page(<Transactions user={user || {role:'User'}}/>)} />
    <Route path="/users" element={loggedIn&&user?.role==='Admin'?page(<Users/>):<Navigate to="/" replace/>} />
    <Route path="*" element={<Navigate to={loggedIn?'/':'/login'} replace/>}/>
  </Routes>;
}
