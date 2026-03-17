// components/HeroSection.jsx
// Główna sekcja powitalna z tytułem, opisem i przyciskiem

import { Link } from 'react-router-dom';
// import jamIQ from '../assets/jamIQ.png'; // Zakładamy, że obraz istnieje

function HeroSection() {
  return (
    <section style={{
      background: 'linear-gradient(135deg, #F5F3FF 0%, #E0E7FF 100%)',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238A63D2' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      padding: '4rem 2rem',
      textAlign: 'center',
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }} className="fade-in-up">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h1 style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            color: '#8A63D2',
            fontWeight: 'bold'
          }}>
            Nauka INF04 z JamIQ!
          </h1>
          <p style={{
            fontSize: '1.25rem',
            marginBottom: '2rem',
            maxWidth: '600px',
            color: '#1F1F1F',
            lineHeight: '1.6'
          }}>
            Przygotuj się do egzaminu zawodowego INF04 z naszą interaktywną platformą nauki.
            JamIQ pomoże Ci w zabawie i efektywnym uczeniu się!
          </p>
          <Link to="/learn">
            <button style={{
              background: 'linear-gradient(135deg, #7B52C5 0%, #A084E8 100%)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              fontSize: '1.125rem',
              borderRadius: '50px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 15px rgba(138, 99, 210, 0.3)',
              fontWeight: 'bold'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 6px 20px rgba(138, 99, 210, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 15px rgba(138, 99, 210, 0.3)';
            }}
            >
              Rozpocznij naukę 🚀
            </button>
          </Link>
        </div>
        <div style={{
          flex: 1,
          minWidth: '200px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <img src="/curious_jamiq.png" alt="JamIQ Mascot" style={{ width: '350px', height: '350px' }} className="bounce" />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;