import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navStyle = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '11px 16px', borderRadius: 10,
    color: isActive ? 'var(--text)' : 'var(--text2)',
    background: isActive ? 'var(--accent-glow)' : 'transparent',
    border: isActive ? '1px solid rgba(124,106,247,0.3)' : '1px solid transparent',
    fontSize: 14, fontWeight: isActive ? 500 : 400,
    transition: 'all 0.2s', textDecoration: 'none', marginBottom: 4,
  });

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, height: '100vh', width: 260,
      background: 'var(--card)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', padding: '28px 16px', zIndex: 100
    }}>
      <div style={{ marginBottom: 40, padding: '0 8px' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>
          <span style={{ color: 'var(--accent)' }}>₿</span>udgetly
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Personal Finance Tracker</div>
      </div>

      <nav style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, letterSpacing: 1, marginBottom: 10, padding: '0 8px', textTransform: 'uppercase' }}>Menu</div>
        <NavLink to="/" end style={({ isActive }) => navStyle(isActive)}>⬡ Dashboard</NavLink>
        <NavLink to="/expenses" style={({ isActive }) => navStyle(isActive)}>◈ Expenses</NavLink>
        <NavLink to="/analytics" style={({ isActive }) => navStyle(isActive)}>◉ Analytics</NavLink>
      </nav>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), #A89BFA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#fff'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
          ⏏ Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;