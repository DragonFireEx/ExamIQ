// components/Header.jsx
// Nagłówek z poprawną nawigacją i responsywnym menu

import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';


const NAV_LINKS = [
  { path: '/',       label: 'Home'      },
  { path: '/learn',  label: 'Nauka'     },
  { path: '/exam',   label: 'Dashboard' },
  { path: '/about',  label: 'O nas'     },
];

export default function Header() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{
      backgroundColor: 'rgba(245, 243, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      padding: '0.9rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 16px rgba(124,58,237,0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      borderBottom: '1px solid rgba(138, 99, 210, 0.12)',
      fontFamily: "'Sora', sans-serif",
    }}>

      {/* LOGO */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
        <img src="/landscape_jamiq.png" alt="ExamIQ Logo" style={{ height: 40, width: 'auto' }} />
      </Link>

      {/* DESKTOP NAV */}
      <nav style={{ display: 'flex', gap: '0.25rem' }}>
        {NAV_LINKS.map(({ path, label }) => {
          const active = location.pathname === path;
          return (
            <Link key={path} to={path} style={{
              textDecoration: 'none',
              padding: '0.45rem 1rem',
              borderRadius: 10,
              fontSize: '0.9rem',
              fontWeight: active ? 700 : 600,
              color: active ? '#7c3aed' : '#6b7280',
              background: active ? 'rgba(124,58,237,0.1)' : 'transparent',
              border: active ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              if (!active) {
                e.currentTarget.style.color = '#7c3aed';
                e.currentTarget.style.background = 'rgba(124,58,237,0.06)';
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                e.currentTarget.style.color = '#6b7280';
                e.currentTarget.style.background = 'transparent';
              }
            }}
            >{label}</Link>
          );
        })}
      </nav>

      {/* CTA button desktop */}
      <Link to="/exam" style={{ textDecoration: 'none' }}>
        <button style={{
          padding: '0.5rem 1.25rem',
          background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
          color: '#fff', border: 'none', borderRadius: 10,
          fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
          fontFamily: "'Sora', sans-serif",
          boxShadow: '0 2px 10px rgba(124,58,237,0.3)',
          transition: 'transform 0.15s, box-shadow 0.15s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.4)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(124,58,237,0.3)'; }}
        >Mój dashboard →</button>
      </Link>

      {/* HAMBURGER — mobile only via CSS */}
      <button
        onClick={() => setMenuOpen(o => !o)}
        style={{
          display: 'none',
          background: 'none', border: 'none',
          fontSize: '1.5rem', cursor: 'pointer',
          color: '#7c3aed', padding: '0.25rem',
        }}
        className="hamburger-btn"
        aria-label="Menu"
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%', left: 0, right: 0,
          background: 'rgba(245,243,255,0.97)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(124,58,237,0.12)',
          padding: '1rem 1.5rem 1.5rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
        }}
        className="mobile-menu"
        >
          {NAV_LINKS.map(({ path, label }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path}
                onClick={() => setMenuOpen(false)}
                style={{
                  textDecoration: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: 12,
                  fontSize: '1rem',
                  fontWeight: active ? 700 : 600,
                  color: active ? '#7c3aed' : '#4b5563',
                  background: active ? 'rgba(124,58,237,0.1)' : 'transparent',
                  display: 'block',
                }}
              >{label}</Link>
            );
          })}
          <Link to="/exam" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', marginTop: '0.5rem' }}>
            <button style={{
              width: '100%', padding: '0.8rem',
              background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
              color: '#fff', border: 'none', borderRadius: 12,
              fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
              fontFamily: "'Sora', sans-serif",
            }}>Mój dashboard →</button>
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hamburger-btn { display: block !important; }
          nav, header > a:last-of-type button { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu { display: none !important; }
        }
      `}</style>
    </header>
  );
}