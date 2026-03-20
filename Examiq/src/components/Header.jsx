// components/Header.jsx
// Nagłówek z menu rozwijanym "Nauka" (Teoria / Praktyka)

import { Link, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

const NAV_LINKS = [
  { path: '/',      label: 'Home'      },
  { path: '/exam',  label: 'Dashboard' },
  { path: '/about', label: 'O nas'     },
];

const LEARN_LINKS = [
  { path: '/learn/teoria',   label: 'Teoria' },
  { path: '/learn/praktyka', label: 'Praktyka' },
];

export default function Header() {
  const location = useLocation();
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isLearnActive = location.pathname.startsWith('/learn');

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const navLinkStyle = (active) => ({
    textDecoration: 'none',
    padding: '0.45rem 1rem',
    borderRadius: 10,
    fontSize: '0.9rem',
    fontWeight: active ? 700 : 600,
    color: active ? '#7c3aed' : '#6b7280',
    background: active ? 'rgba(124,58,237,0.1)' : 'transparent',
    border: active ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
    transition: 'all 0.15s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    cursor: 'pointer',
  });

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
      <nav style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
        {/* Home */}
        <Link to="/"
          style={navLinkStyle(location.pathname === '/')}
          onMouseEnter={e => { if (location.pathname !== '/') { e.currentTarget.style.color = '#7c3aed'; e.currentTarget.style.background = 'rgba(124,58,237,0.06)'; } }}
          onMouseLeave={e => { if (location.pathname !== '/') { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = 'transparent'; } }}
        >Home</Link>

        {/* DROPDOWN: Nauka */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(o => !o)}
            style={{
              ...navLinkStyle(isLearnActive),
              background: isLearnActive ? 'rgba(124,58,237,0.1)' : dropdownOpen ? 'rgba(124,58,237,0.06)' : 'transparent',
              border: isLearnActive ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
              fontFamily: "'Sora', sans-serif",
            }}
            onMouseEnter={e => { if (!isLearnActive) { e.currentTarget.style.color = '#7c3aed'; e.currentTarget.style.background = 'rgba(124,58,237,0.06)'; } }}
            onMouseLeave={e => { if (!isLearnActive && !dropdownOpen) { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = 'transparent'; } }}
          >
            Nauka
            <span style={{
              fontSize: '0.6rem',
              transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              marginLeft: '0.1rem',
              opacity: 0.7,
            }}>▼</span>
          </button>

          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(245,243,255,0.97)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(124,58,237,0.18)',
              borderRadius: 14,
              boxShadow: '0 8px 32px rgba(124,58,237,0.15)',
              padding: '0.5rem',
              minWidth: 160,
              animation: 'dropIn 0.18s ease',
            }}>
              {LEARN_LINKS.map(({ path, label, icon }) => {
                const active = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.6rem 0.9rem',
                      borderRadius: 10,
                      fontSize: '0.9rem',
                      fontWeight: active ? 700 : 600,
                      color: active ? '#7c3aed' : '#4b5563',
                      background: active ? 'rgba(124,58,237,0.1)' : 'transparent',
                      transition: 'all 0.12s',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#7c3aed'; e.currentTarget.style.background = 'rgba(124,58,237,0.07)'; } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.color = '#4b5563'; e.currentTarget.style.background = 'transparent'; } }}
                  >
                    <span style={{ fontSize: '1rem' }}>{icon}</span>
                    {label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Dashboard */}
        <Link to="/exam"
          style={navLinkStyle(location.pathname === '/exam')}
          onMouseEnter={e => { if (location.pathname !== '/exam') { e.currentTarget.style.color = '#7c3aed'; e.currentTarget.style.background = 'rgba(124,58,237,0.06)'; } }}
          onMouseLeave={e => { if (location.pathname !== '/exam') { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = 'transparent'; } }}
        >Dashboard</Link>

        {/* O nas */}
        <Link to="/about"
          style={navLinkStyle(location.pathname === '/about')}
          onMouseEnter={e => { if (location.pathname !== '/about') { e.currentTarget.style.color = '#7c3aed'; e.currentTarget.style.background = 'rgba(124,58,237,0.06)'; } }}
          onMouseLeave={e => { if (location.pathname !== '/about') { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = 'transparent'; } }}
        >O nas</Link>
      </nav>

      {/* CTA button desktop */}
      <Link to="/exam" style={{ textDecoration: 'none' }} className="desktop-cta">
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

      {/* HAMBURGER */}
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
          {[{ path: '/', label: 'Home' }].map(({ path, label }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} onClick={() => setMenuOpen(false)} style={{
                textDecoration: 'none', padding: '0.75rem 1rem',
                borderRadius: 12, fontSize: '1rem',
                fontWeight: active ? 700 : 600,
                color: active ? '#7c3aed' : '#4b5563',
                background: active ? 'rgba(124,58,237,0.1)' : 'transparent',
                display: 'block',
              }}>{label}</Link>
            );
          })}

          <div style={{
            padding: '0.4rem 1rem 0.2rem',
            fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af',
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>Nauka</div>

          {LEARN_LINKS.map(({ path, label, icon }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} onClick={() => setMenuOpen(false)} style={{
                textDecoration: 'none',
                padding: '0.65rem 1rem 0.65rem 1.5rem',
                borderRadius: 12, fontSize: '0.95rem',
                fontWeight: active ? 700 : 600,
                color: active ? '#7c3aed' : '#4b5563',
                background: active ? 'rgba(124,58,237,0.1)' : 'transparent',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <span>{icon}</span>{label}
              </Link>
            );
          })}

          {[{ path: '/exam', label: 'Dashboard' }, { path: '/about', label: 'O nas' }].map(({ path, label }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} onClick={() => setMenuOpen(false)} style={{
                textDecoration: 'none', padding: '0.75rem 1rem',
                borderRadius: 12, fontSize: '1rem',
                fontWeight: active ? 700 : 600,
                color: active ? '#7c3aed' : '#4b5563',
                background: active ? 'rgba(124,58,237,0.1)' : 'transparent',
                display: 'block',
              }}>{label}</Link>
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
        @keyframes dropIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @media (max-width: 768px) {
          .hamburger-btn { display: block !important; }
          nav, .desktop-cta { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu { display: none !important; }
        }
      `}</style>
    </header>
  );
}
