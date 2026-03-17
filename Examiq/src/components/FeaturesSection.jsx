// components/FeaturesSection.jsx
// Sekcja prezentująca główne funkcje aplikacji

function FeatureCard({ icon, title, description, className = '' }) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '2rem',
      boxShadow: '0 4px 20px rgba(138, 99, 210, 0.1)',
      textAlign: 'center',
      transition: 'transform 0.3s, box-shadow 0.3s'
    }}
    className={`slide-in-center ${className}`}
    >
      <div style={{
        width: '60px',
        height: '60px',
        background: 'linear-gradient(135deg, #8A63D2 0%, #A084E8 100%)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '30px',
        margin: '0 auto 1rem',
        transition: 'transform 0.3s',
        cursor: 'pointer'
      }}
      onMouseOver={(e) => {
        e.target.parentElement.style.transform = 'translateY(-5px)';
        e.target.parentElement.style.boxShadow = '0 8px 30px rgba(138, 99, 210, 0.2)';
      }}
      onMouseOut={(e) => {
        e.target.parentElement.style.transform = 'translateY(0)';
        e.target.parentElement.style.boxShadow = '0 4px 20px rgba(138, 99, 210, 0.1)';
      }}
      >{icon}</div>
      <h3 style={{ color: '#8A63D2', marginBottom: '1rem', fontSize: '1.25rem' }}>{title}</h3>
      <p style={{ color: '#1F1F1F', lineHeight: '1.6' }}>{description}</p>
    </div>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: '📚',
      title: 'Ćwicz zadania praktyczne',
      description: 'Rozwiązuj interaktywne zadania z zakresu informatyki, aby utrwalić wiedzę w zabawie.'
    },
    {
      icon: '📝',
      title: 'Tryb egzaminu',
      description: 'Symuluj prawdziwy egzamin INF04 z timerem i sprawdzaniem odpowiedzi w czasie rzeczywistym.'
    },
    {
      icon: '📊',
      title: 'Śledź swoje postępy',
      description: 'Monitoruj swoje wyniki i postęp w nauce dzięki szczegółowym statystykom i wykresom.'
    },
    {
      icon: '💻',
      title: 'Symulator terminala',
      description: 'Ćwicz komendy terminala i programowanie w bezpiecznym środowisku wirtualnym.'
    }
  ];

  return (
    <section style={{
      padding: '4rem 2rem',
      backgroundColor: '#FAF9FF',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%238A63D2' fill-opacity='0.03' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0h1L41 1 1 41H0zm40 0v-1l-1-1v2h2zM0 0v1l1 1V0H0z'/%3E%3C/g%3E%3C/svg%3E")`,
      backgroundSize: '40px 40px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          color: '#8A63D2',
          marginBottom: '1rem',
          fontWeight: 'bold'
        }}>Co oferuje ExamIQ?</h2>
        <p style={{
          fontSize: '1.125rem',
          color: '#1F1F1F',
          marginBottom: '3rem',
          maxWidth: '600px',
          margin: '0 auto 3rem'
        }}>Odkryj funkcje, które pomogą Ci przygotować się do egzaminu zawodowego INF04 w przyjazny sposób.</p>
        <div className="features-grid">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} className={index === 3 ? 'center-last' : ''} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;