// components/Header.jsx
// Nagłówek z menu rozwijanym "Nauka" (Teoria / Praktyka / Egzamin praktyczny)

import { Link, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import '../App.css'; // import globalnych stylów

const NAV_LINKS = [
  { path: '/',      label: 'Strona główna' },
  { path: '/about', label: 'O nas' },
];

const LEARN_LINKS = [
  { path: '/learn/teoria',             label: 'Teoria',              icon: '📖' },
  { path: '/learn/praktyka',           label: 'Praktyka',            icon: '🔨' },
  { path: '/learn/egzamin-praktyczny', label: 'Egzamin praktyczny',  icon: '📋' },
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

  // Funkcja zwracająca dynamiczne style dla linków nawigacyjnych
  const navLinkStyle = (active) => ({
    fontWeight: active ? 700 : 600,
    color: active ? '#7c3aed' : '#6b7280',
    background: active ? 'rgba(124,58,237,0.1)' : 'transparent',
    border: active ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
  });

  return (
    <header className="header">
      {/* LOGO */}
      <Link to="/" className="header-logo">
        <img src="/landscape_jamiq.png" alt="ExamIQ Logo" className="header-logo-img" />
      </Link>

      {/* DESKTOP NAV */}
      <nav className="header-nav">
        {/* Home */}
        <Link
          to="/"
          className="nav-link-base"
          style={navLinkStyle(location.pathname === '/')}
          onMouseEnter={e => {
            if (location.pathname !== '/') {
              e.currentTarget.style.color = '#7c3aed';
              e.currentTarget.style.background = 'rgba(124,58,237,0.06)';
            }
          }}
          onMouseLeave={e => {
            if (location.pathname !== '/') {
              e.currentTarget.style.color = '#6b7280';
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          Strona Główna
        </Link>

        {/* DROPDOWN: Nauka */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(o => !o)}
            className="nav-link-base dropdown-button"
            style={{
              ...navLinkStyle(isLearnActive),
              background: isLearnActive ? 'rgba(124,58,237,0.1)' : dropdownOpen ? 'rgba(124,58,237,0.06)' : 'transparent',
              border: isLearnActive ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
            }}
            onMouseEnter={e => {
              if (!isLearnActive) {
                e.currentTarget.style.color = '#7c3aed';
                e.currentTarget.style.background = 'rgba(124,58,237,0.06)';
              }
            }}
            onMouseLeave={e => {
              if (!isLearnActive && !dropdownOpen) {
                e.currentTarget.style.color = '#6b7280';
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            Nauka
            <span
              style={{
                fontSize: '0.6rem',
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
                marginLeft: '0.1rem',
                opacity: 0.7,
              }}
            >
              ▼
            </span>
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu">
              {LEARN_LINKS.map(({ path, label, icon }) => {
                const active = location.pathname === path;
                const isExam = path === '/learn/egzamin-praktyczny';
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setDropdownOpen(false)}
                    className={`dropdown-item ${isExam ? 'dropdown-item-exam' : ''}`}
                    style={{
                      fontWeight: active ? 700 : 600,
                      color: active ? '#7c3aed' : '#4b5563',
                      background: active ? 'rgba(124,58,237,0.1)' : 'transparent',
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.color = '#7c3aed';
                        e.currentTarget.style.background = 'rgba(124,58,237,0.07)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.color = '#4b5563';
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <span className="dropdown-item-icon">{icon}</span>
                    <div>
                      <div className="dropdown-item-label">{label}</div>
                      {isExam && (
                        <div className="dropdown-item-badge">
                          3 zadania · ocena AI
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* O nas */}
        <Link
          to="/about"
          className="nav-link-base"
          style={navLinkStyle(location.pathname === '/about')}
          onMouseEnter={e => {
            if (location.pathname !== '/about') {
              e.currentTarget.style.color = '#7c3aed';
              e.currentTarget.style.background = 'rgba(124,58,237,0.06)';
            }
          }}
          onMouseLeave={e => {
            if (location.pathname !== '/about') {
              e.currentTarget.style.color = '#6b7280';
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          O nas
        </Link>
      </nav>

      {/* CTA button desktop */}
      <Link to="/exam" style={{ textDecoration: 'none' }} className="desktop-cta">
        <button
          className="cta-button-desktop"
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.4)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 10px rgba(124,58,237,0.3)';
          }}
        >
          Panel użytkownika →
        </button>
      </Link>

      {/* HAMBURGER */}
      <button
        onClick={() => setMenuOpen(o => !o)}
        className="hamburger-btn"
        aria-label="Menu"
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="mobile-menu">
          {[{ path: '/', label: 'Strona główna' }].map(({ path, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setMenuOpen(false)}
                className="mobile-menu-link"
                style={{
                  fontWeight: active ? 700 : 600,
                  color: active ? '#7c3aed' : '#4b5563',
                  background: active ? 'rgba(124,58,237,0.1)' : 'transparent',
                }}
              >
                {label}
              </Link>
            );
          })}

          <div className="mobile-menu-section-title">Nauka</div>

          {LEARN_LINKS.map(({ path, label, icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setMenuOpen(false)}
                className="mobile-menu-link-icon"
                style={{
                  fontWeight: active ? 700 : 600,
                  color: active ? '#7c3aed' : '#4b5563',
                  background: active ? 'rgba(124,58,237,0.1)' : 'transparent',
                }}
              >
                <span>{icon}</span>{label}
              </Link>
            );
          })}

          {[{ path: '/exam', label: 'Panel użytkownika' }, { path: '/about', label: 'O nas' }].map(({ path, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setMenuOpen(false)}
                className="mobile-menu-link"
                style={{
                  fontWeight: active ? 700 : 600,
                  color: active ? '#7c3aed' : '#4b5563',
                  background: active ? 'rgba(124,58,237,0.1)' : 'transparent',
                }}
              >
                {label}
              </Link>
            );
          })}

          <Link to="/exam" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', marginTop: '0.5rem' }}>
            <button className="mobile-cta-button">Panel użytkownika →</button>
          </Link>
        </div>
      )}
    </header>
  );
}