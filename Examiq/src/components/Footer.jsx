// components/Footer.jsx
// Stopka z linkami do dokumentacji i repozytorium

function Footer() {
  return (
    <footer style={{
      backgroundColor: '#8A63D2',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      color: 'white',
      padding: '2rem',
      textAlign: 'center',
      borderTop: '1px solid #5a3ec7'
    }}>
      <p>&copy; 2026 ExamIQ. Wszystkie prawa zastrzeżone.</p>
      <div style={{ marginTop: '1rem' }}>
        <a href="#" style={{
          color: 'white',
          textDecoration: 'none',
          margin: '0 1rem',
          transition: 'color 0.3s'
        }}
        onMouseOver={(e) => e.target.style.color = '#A084E8'}
        onMouseOut={(e) => e.target.style.color = 'white'}
        >Dokumentacja</a>
        <a href="#" style={{
          color: 'white',
          textDecoration: 'none',
          margin: '0 1rem',
          transition: 'color 0.3s'
        }}
        onMouseOver={(e) => e.target.style.color = '#A084E8'}
        onMouseOut={(e) => e.target.style.color = 'white'}
        >GitHub</a>
        <a href="#" style={{
          color: 'white',
          textDecoration: 'none',
          margin: '0 1rem',
          transition: 'color 0.3s'
        }}
        onMouseOver={(e) => e.target.style.color = '#A084E8'}
        onMouseOut={(e) => e.target.style.color = 'white'}
        >Kontakt</a>
      </div>
    </footer>
  );
}

export default Footer;