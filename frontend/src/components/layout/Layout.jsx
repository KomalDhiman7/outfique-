import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Sparkles, Shirt, Bell, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationsAPI } from '../../services/api';
import CreatePostModal from '../posts/CreatePostModal';
import { Plus } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', icon: Home, exact: true },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/stylist', label: 'AI Stylist', icon: Sparkles },
  { to: '/wardrobe', label: 'Wardrobe', icon: Shirt },
  { to: '/notifications', label: 'Notifications', icon: Bell, badge: true },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!user) return;
    notificationsAPI.getAll()
      .then(({ data }) => setUnread(data.unread_count))
      .catch(() => {});
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>Out<span>fique</span></h1>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map(({ to, label, icon: Icon, exact, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              {label}
              {badge && unread > 0 && (
                <span className="badge">{unread > 9 ? '9+' : unread}</span>
              )}
            </NavLink>
          ))}

          <button
            className="nav-link w-full"
            style={{ marginTop: 8 }}
            onClick={() => setShowCreate(true)}
          >
            <Plus size={18} />
            New Post
          </button>
        </nav>

        <div className="sidebar-bottom">
          <NavLink
            to={`/profile/${user?.username}`}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={{ padding: '12px 0' }}
          >
            <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>
              {user?.profile_picture
                ? <img src={`http://localhost:5000${user.profile_picture}`} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : user?.username?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: '0.875rem' }}>{user?.username}</span>
            {user?.is_premium && <span className="premium-badge" style={{ marginLeft: 'auto', fontSize: '0.55rem' }}>✦ PRO</span>}
          </NavLink>

          <button className="nav-link w-full" onClick={handleLogout} style={{ color: 'var(--muted)', padding: '10px 0' }}>
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav">
        {navItems.map(({ to, label, icon: Icon, exact, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <div style={{ position: 'relative' }}>
              <Icon size={22} />
              {badge && unread > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -6,
                  width: 14, height: 14, borderRadius: '50%',
                  background: 'var(--gold)', color: '#fff',
                  fontSize: '0.5rem', fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{unread}</span>
              )}
            </div>
            {label}
          </NavLink>
        ))}
        <button className="mobile-nav-item" onClick={() => setShowCreate(true)}>
          <Plus size={22} />
          Post
        </button>
      </nav>

      {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}