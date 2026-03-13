// components/Header.jsx
// Komponent nagłówka z nazwą aplikacji i menu nawigacyjnym

import { Link } from 'react-router-dom';

function Header() {
  return (
    <header style={{
      backgroundColor: '#0d1117',
      color: '#c9d1d9',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #30363d'
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
        <Link to="/" style={{ color: '#c9d1d9', textDecoration: 'none' }}>ExamIQ</Link>
      </div>
      <nav>
        <ul style={{
          listStyle: 'none',
          display: 'flex',
          gap: '2rem',
          margin: 0,
          padding: 0
        }}>
          <li><Link to="/" style={{ color: '#c9d1d9', textDecoration: 'none', fontSize: '1rem' }}>Home</Link></li>
          <li><Link to="/learn" style={{ color: '#c9d1d9', textDecoration: 'none', fontSize: '1rem' }}>Learn</Link></li>
          <li><Link to="/exam" style={{ color: '#c9d1d9', textDecoration: 'none', fontSize: '1rem' }}>Exam</Link></li>
          <li><Link to="/about" style={{ color: '#c9d1d9', textDecoration: 'none', fontSize: '1rem' }}>About</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;