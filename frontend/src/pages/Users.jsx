import { useEffect, useState } from 'react';
import { api } from '../api.js';

const emptyForm = { name:'', membership_id:'', password:'', role:'User' };

export default function Users() {
  const [users,setUsers] = useState([]);
  const [form,setForm] = useState(emptyForm);
  const [editing,setEditing] = useState(null);
  const [error,setError] = useState('');
  const [message,setMessage] = useState('');

  async function load(){ try{setUsers(await api('/users'));}catch(e){setError(e.message);} }
  useEffect(()=>{load();},[]);
  function change(e){setForm({...form,[e.target.name]:e.target.value});}
  function reset(){setForm(emptyForm);setEditing(null);}

  async function submit(e){
    e.preventDefault();setError('');setMessage('');
    try{
      const path=editing?`/users/${editing}`:'/users';
      const method=editing?'PUT':'POST';
      const payload={...form}; if(editing&&!payload.password) delete payload.password;
      const data=await api(path,{method,body:JSON.stringify(payload)});
      setMessage(data.message);reset();await load();
    }catch(e){setError(e.message);}
  }
  async function remove(id){
    if(!window.confirm('Delete this user account?'))return;
    try{const data=await api(`/users/${id}`,{method:'DELETE'});setMessage(data.message);await load();}
    catch(e){setError(e.message);}
  }

  return <div><div className="page-heading"><div><h1>User Management</h1><p>Manage library members and administrator accounts.</p></div></div>
    {error&&<div className="alert error">{error}</div>}{message&&<div className="alert success">{message}</div>}
    <section className="content-card"><h2>{editing?'Update user':'Add a user'}</h2>
      <form className="form-grid" onSubmit={submit}>
        <label>Full name<input name="name" value={form.name} onChange={change} required /></label>
        <label>Membership ID<input name="membership_id" value={form.membership_id} onChange={change} required /></label>
        <label>Password{editing&&<span className="hint"> Leave blank to keep current password.</span>}<input type="password" name="password" value={form.password} onChange={change} required={!editing} minLength="8" /></label>
        <label>Role<select name="role" value={form.role} onChange={change}><option>User</option><option>Admin</option></select></label>
        <div className="form-actions full-width"><button className="primary-btn compact">{editing?'Save changes':'Add user'}</button>{editing&&<button type="button" className="secondary-btn" onClick={reset}>Cancel</button>}</div>
      </form>
    </section>
    <section className="content-card"><h2>Registered users</h2><div className="table-wrap"><table><thead><tr><th>Name</th><th>Membership ID</th><th>Role</th><th>Actions</th></tr></thead><tbody>
      {users.map(u=><tr key={u.user_id}><td>{u.name}</td><td>{u.membership_id}</td><td>{u.role}</td><td className="actions"><button className="small-btn" onClick={()=>{setEditing(u.user_id);setForm({name:u.name,membership_id:u.membership_id,password:'',role:u.role});}}>Edit</button><button className="small-btn danger-btn" onClick={()=>remove(u.user_id)}>Delete</button></td></tr>)}
      {!users.length&&<tr><td colSpan="4" className="empty">No users found.</td></tr>}
    </tbody></table></div></section>
  </div>;
}
