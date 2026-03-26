// components/Footer.jsx
// Stopka z linkami do dokumentacji i repozytorium

import '../App.css'; // import globalnych stylów

function Footer() {
  return (
    <footer className="footer">
      <p>&copy; 2026 ExamIQ. Wszystkie prawa zastrzeżone.</p>
      <div className="footer-links">
        <a href="#" className="footer-link"
          onMouseOver={(e) => e.target.style.color = '#A084E8'}
          onMouseOut={(e) => e.target.style.color = 'white'}
        >Dokumentacja</a>
        <a href="#" className="footer-link"
          onMouseOver={(e) => e.target.style.color = '#A084E8'}
          onMouseOut={(e) => e.target.style.color = 'white'}
        >GitHub</a>
        <a href="#" className="footer-link"
          onMouseOver={(e) => e.target.style.color = '#A084E8'}
          onMouseOut={(e) => e.target.style.color = 'white'}
        >Kontakt</a>
      </div>
    </footer>
  );
}

export default Footer;