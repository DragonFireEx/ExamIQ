// components/HeroSection.jsx
// Główna sekcja powitalna z tytułem, opisem i przyciskiem

import { Link } from 'react-router-dom';

function HeroSection() {
  return (
    <section style={{
      backgroundColor: '#0d1117',
      color: '#c9d1d9',
      padding: '4rem 2rem',
      textAlign: 'center',
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <h1 style={{
        fontSize: '3rem',
        marginBottom: '1rem',
        color: '#c9d1d9'
      }}>
        Witaj w ExamIQ
      </h1>
      <p style={{
        fontSize: '1.25rem',
        marginBottom: '2rem',
        maxWidth: '600px',
        margin: '0 auto 2rem',
        color: '#8b949e'
      }}>
        Przygotuj się do egzaminu zawodowego INF04 z naszą interaktywną platformą nauki.
        Ćwiczenia, testy i materiały pomocne w zdobyciu certyfikatu.
      </p>
      <Link to="/learn">
        <button style={{
          backgroundColor: '#238636',
          color: 'white',
          border: 'none',
          padding: '1rem 2rem',
          fontSize: '1.125rem',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'background-color 0.3s'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#2ea043'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#238636'}
        >
          Rozpocznij naukę
        </button>
      </Link>
    </section>
  );
}

export default HeroSection;