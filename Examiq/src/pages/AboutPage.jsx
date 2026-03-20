// pages/AboutPage.jsx
// Strona "O nas" - opis projektu, autorzy, jak działa aplikacja
//
// W App.jsx zastąp inline AboutPage tym importem:
//   import AboutPage from './pages/AboutPage';
//   <Route path="/about" element={<AboutPage />} />

import { Link } from 'react-router-dom';
import Header from '../components/Header';
import '../App.css'; // importujemy style (jeśli nie był wcześniej importowany)

const AUTHORS = [
  { name: 'Marcel Turwanicki',  role: 'FullStack',      emoji: '💻' },
  { name: 'Filip Czepiej', role: 'FullStack',     emoji: '🧠' },
  { name: 'Piotr Lipiński', role: 'Design & UX / DevOps / Docs',             emoji: '🎨' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Tryb nauki',
    desc: 'Wybierz liczbę pytań i tryb — teoria lub praktyka. Pytania są losowane z bazy INF04 i wyświetlane jedno po drugim z natychmiastową informacją zwrotną.',
    emoji: '📚',
  },
  {
    step: '02',
    title: 'Tryb egzaminu',
    desc: 'Symuluj prawdziwy egzamin: wybierz kategorię i liczbę pytań. Po zakończeniu widzisz wynik, czas i czy przekroczyłeś próg 75% wymagany do zaliczenia.',
    emoji: '📝',
  },
  {
    step: '03',
    title: 'Dashboard & postępy',
    desc: 'Twoje wyniki zapisywane są lokalnie w przeglądarce. Dashboard pokazuje historię sesji, postęp per kategoria, serię dni nauki i statystyki ogólne.',
    emoji: '📊',
  },
  {
    step: '04',
    title: 'Technologia',
    desc: 'Aplikacja zbudowana w React + Vite, bez backendu. Sesja użytkownika przechowywana jest w ciasteczkach (nick, streak), a historia egzaminów w localStorage.',
    emoji: '⚙️',
  },
];

const TECH = ['React 18', 'Vite', 'React Router', 'JavaScript ES2023', 'CSS-in-JS', 'LocalStorage API', 'Cookie API'];

export default function AboutPage() {
  return (
    <div className="about-page">
      <Header />

      <main className="about-main">
        {/* HERO */}
        <div className="about-hero">
          <div className="about-badge">
            Projekt na zaliczenie · 2025
          </div>
          <h1 className="about-title">
            O projekcie<br />
            <span className="about-gradient-text">ExamIQ</span>
          </h1>
          <p className="about-subtitle">
            ExamIQ to interaktywna platforma do nauki i samodzielnego przygotowania
            się do egzaminu zawodowego <strong style={{ color: '#7c3aed' }}>INF04</strong> — kwalifikacji
            z zakresu programowania, baz danych i administracji systemami.
          </p>
        </div>

        {/* CEL PROJEKTU */}
        <div className="about-goal-card">
          <div className="about-goal-header">
            <span className="about-goal-icon">🎯</span>
            <h2 className="about-goal-title">Cel projektu</h2>
          </div>
          <p className="about-goal-text">
            Projekt powstał jako zaliczenie przedmiotu z zakresu tworzenia aplikacji webowych.
            Celem było stworzenie użytecznego narzędzia edukacyjnego, które pomoże uczniom
            technikum informatycznego w systematycznej nauce do egzaminu INF04.
            Aplikacja łączy gamifikację (serie dni, statystyki, progi zaliczenia) z praktycznym
            zestawem pytań egzaminacyjnych podzielonych na kategorie tematyczne.
          </p>
        </div>

        {/* JAK DZIAŁA */}
        <h2 className="about-how-title">Jak działa aplikacja?</h2>

        <div className="about-how-grid">
          {HOW_IT_WORKS.map(({ step, title, desc, emoji }) => (
            <div key={step} className="about-how-card">
              <div className="about-how-emoji">{emoji}</div>
              <div>
                <div className="about-how-step">{step}</div>
                <h3 className="about-how-card-title">{title}</h3>
                <p className="about-how-desc">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* TECHNOLOGIE */}
        <div className="about-tech-card">
          <div className="about-tech-header">
            <span className="about-tech-icon">🛠️</span>
            <h2 className="about-tech-title">Stack technologiczny</h2>
          </div>
          <div className="about-tech-list">
            {TECH.map(t => (
              <span key={t} className="about-tech-badge">{t}</span>
            ))}
          </div>
        </div>

        {/* AUTORZY */}
        <h2 className="about-authors-title">Autorzy</h2>

        <div className="about-authors-grid">
          {AUTHORS.map(({ name, role, emoji }) => (
            <div key={name} className="about-author-card">
              <div className="about-author-avatar">{emoji}</div>
              <div className="about-author-name">{name}</div>
              <div className="about-author-role">{role}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="about-cta">
          <h3 className="about-cta-title">Gotowy żeby zacząć?</h3>
          <p className="about-cta-text">
            Przetestuj swoją wiedzę z INF04 już teraz.
          </p>
          <div className="about-cta-buttons">
            <Link to="/learn" className="about-cta-button-primary">
              📚 Tryb nauki
            </Link>
            <Link to="/exam" className="about-cta-button-secondary">
              📊 Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}