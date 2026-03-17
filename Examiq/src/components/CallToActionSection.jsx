// components/CallToActionSection.jsx
// Sekcja z wezwaniem do działania

import { Link } from 'react-router-dom';

function CallToActionSection() {
  return (
    <section style={{
      background: 'linear-gradient(135deg, #8A63D2 0%, #7B52C5 100%)',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      padding: '4rem 2rem',
      textAlign: 'center',
      color: '#8A63D2'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: '2.5rem',
          marginBottom: '1rem',
          fontWeight: 'bold',
          color: '#8A63D2'
        }}>Gotowy na wyzwanie?</h2>
        <p style={{
          fontSize: '1.125rem',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>Zacznij swoją przygodę z nauką już dziś i zdobądź certyfikat INF04!</p>
        <Link to="/learn">
          <button style={{
            background: 'linear-gradient(135deg, #A084E8 0%, #7B52C5 100%)',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            fontSize: '1.125rem',
            borderRadius: '50px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            fontWeight: 'bold'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
          }}
          >
            Zacznij teraz! 🚀
          </button>
        </Link>
      </div>
    </section>
  );
}

export default CallToActionSection;