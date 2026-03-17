// components/Header.jsx
// Komponent nagłówka z logo aplikacji i menu nawigacyjnym

import { Link } from 'react-router-dom';
import { useState } from 'react';
// import jamIQ from '../assets/jamIQ.png'; // Zakładamy, że obraz istnieje

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header style={{
      backgroundColor: 'rgba(245, 243, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238A63D2' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      borderBottom: '1px solid rgba(138, 99, 210, 0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <img src="/default_jamiq.png" alt="JamIQ Logo" style={{ width: '40px', height: '40px' }} />
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: '700',
          fontFamily: "'Inter', sans-serif",
          background: 'linear-gradient(135deg, #8A63D2 0%, #A084E8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 2px 4px rgba(138, 99, 210, 0.3)'
        }}>ExamIQ</h1>
      </div>

      {/* Desktop Menu */}
      <nav style={{
        display: window.innerWidth >= 768 ? 'block' : 'none'
      }}>
        <ul style={{
          listStyle: 'none',
          display: 'flex',
          gap: '2rem',
          margin: 0,
          padding: 0
        }}>
          <li><Link to="/" style={{
            color: '#8A63D2',
            textDecoration: 'none',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.3s',
            padding: '0.5rem 1rem',
            borderRadius: '20px'
          }}
          onMouseOver={(e) => {
            e.target.style.color = '#A084E8';
            e.target.style.transform = 'scale(1.05)';
            e.target.style.textShadow = '0 2px 4px rgba(138, 99, 210, 0.3)';
            e.target.style.backgroundColor = 'rgba(138, 99, 210, 0.1)';
          }}
          onMouseOut={(e) => {
            e.target.style.color = '#8A63D2';
            e.target.style.transform = 'scale(1)';
            e.target.style.textShadow = 'none';
            e.target.style.backgroundColor = 'transparent';
          }}
          >Home</Link></li>
          <li><Link to="/learn" style={{
            color: '#8A63D2',
            textDecoration: 'none',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.3s',
            padding: '0.5rem 1rem',
            borderRadius: '20px'
          }}
          onMouseOver={(e) => {
            e.target.style.color = '#A084E8';
            e.target.style.transform = 'scale(1.05)';
            e.target.style.textShadow = '0 2px 4px rgba(138, 99, 210, 0.3)';
            e.target.style.backgroundColor = 'rgba(138, 99, 210, 0.1)';
          }}
          onMouseOut={(e) => {
            e.target.style.color = '#8A63D2';
            e.target.style.transform = 'scale(1)';
            e.target.style.textShadow = 'none';
            e.target.style.backgroundColor = 'transparent';
          }}
          >Learn</Link></li>
          <li><Link to="/exam" style={{
            color: '#8A63D2',
            textDecoration: 'none',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.3s',
            padding: '0.5rem 1rem',
            borderRadius: '20px'
          }}
          onMouseOver={(e) => {
            e.target.style.color = '#A084E8';
            e.target.style.transform = 'scale(1.05)';
            e.target.style.textShadow = '0 2px 4px rgba(138, 99, 210, 0.3)';
            e.target.style.backgroundColor = 'rgba(138, 99, 210, 0.1)';
          }}
          onMouseOut={(e) => {
            e.target.style.color = '#8A63D2';
            e.target.style.transform = 'scale(1)';
            e.target.style.textShadow = 'none';
            e.target.style.backgroundColor = 'transparent';
          }}
          >Exam</Link></li>
          <li><Link to="/about" style={{
            color: '#8A63D2',
            textDecoration: 'none',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.3s',
            padding: '0.5rem 1rem',
            borderRadius: '20px'
          }}
          onMouseOver={(e) => {
            e.target.style.color = '#A084E8';
            e.target.style.transform = 'scale(1.05)';
            e.target.style.textShadow = '0 2px 4px rgba(138, 99, 210, 0.3)';
            e.target.style.backgroundColor = 'rgba(138, 99, 210, 0.1)';
          }}
          onMouseOut={(e) => {
            e.target.style.color = '#8A63D2';
            e.target.style.transform = 'scale(1)';
            e.target.style.textShadow = 'none';
            e.target.style.backgroundColor = 'transparent';
          }}
          >About</Link></li>
        </ul>
      </nav>

      {/* Hamburger Menu Button */}
      <button
        onClick={toggleMenu}
        style={{
          display: window.innerWidth < 768 ? 'block' : 'none',
          background: 'none',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          color: '#8A63D2'
        }}
      >
        ☰
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: '#F5F3FF',
          padding: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: window.innerWidth < 768 ? 'block' : 'none'
        }}>
          <ul style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            textAlign: 'center'
          }}>
            <li style={{ marginBottom: '1rem' }}><Link to="/" style={{
              color: '#6E4AFF',
              textDecoration: 'none',
              fontSize: '1.1rem'
            }}>Home</Link></li>
            <li style={{ marginBottom: '1rem' }}><Link to="/learn" style={{
              color: '#6E4AFF',
              textDecoration: 'none',
              fontSize: '1.1rem'
            }}>Learn</Link></li>
            <li style={{ marginBottom: '1rem' }}><Link to="/exam" style={{
              color: '#6E4AFF',
              textDecoration: 'none',
              fontSize: '1.1rem'
            }}>Exam</Link></li>
            <li><Link to="/about" style={{
              color: '#6E4AFF',
              textDecoration: 'none',
              fontSize: '1.1rem'
            }}>About</Link></li>
          </ul>
        </div>
      )}
    </header>
  );
}

export default Header;