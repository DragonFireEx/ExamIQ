// components/Footer.jsx
// Stopka z linkami do dokumentacji i repozytorium

function Footer() {
  return (
    <footer style={{
      backgroundColor: '#161b22',
      color: '#8b949e',
      padding: '2rem',
      textAlign: 'center',
      borderTop: '1px solid #30363d'
    }}>
      <p>&copy; 2024 ExamIQ. Wszystkie prawa zastrzeżone.</p>
      <div style={{ marginTop: '1rem' }}>
        <a href="#" style={{ color: '#58a6ff', textDecoration: 'none', margin: '0 1rem' }}>Dokumentacja</a>
        <a href="#" style={{ color: '#58a6ff', textDecoration: 'none', margin: '0 1rem' }}>GitHub</a>
      </div>
    </footer>
  );
}

export default Footer;