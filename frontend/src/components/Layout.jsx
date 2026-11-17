import Sidebar from './Sidebar.jsx';

export default function Layout({ user, children }) {
  return <div className="app-layout"><Sidebar user={user} /><main className="main-content">{children}</main></div>;
}
