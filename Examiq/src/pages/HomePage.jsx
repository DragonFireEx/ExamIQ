// pages/HomePage.jsx
// Ulepszona strona główna ExamIQ
// Zastępuje HomePage.jsx + HeroSection + FeaturesSection + CallToActionSection
// Header i Footer pozostają bez zmian

import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { usePageTitle } from '../hooks/usePageTitle';
import { Icon } from '@iconify/react';
import './HomePage.css';

// ─── dane ─────────────────────────────────────────────────────────────────────

// Helper to convert hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
};

const FEATURES = [
  {
    icon: 'lucide:book-open',
    title: 'Tryb nauki',
    desc: 'Losowane pytania z natychmiastową informacją zwrotną i wyjaśnieniami. Uczysz się na błędach.',
    color: '#7c3aed',
    colorRgb: '124, 58, 237',
  },
  {
    icon: 'lucide:target',
    title: 'Symulator egzaminu',
    desc: 'Próbny egzamin INF04 z progiem 75%. Sprawdź czy jesteś gotowy zanim przyjdzie ten prawdziwy.',
    color: '#0ea5e9',
    colorRgb: '14, 165, 233',
  },
  {
    icon: 'lucide:bar-chart-2',
    title: 'Dashboard postępów',
    desc: 'Historia sesji, postęp per kategoria, seria dni nauki i statystyki — wszystko w jednym miejscu.',
    color: '#10b981',
    colorRgb: '16, 185, 129',
  },
  {
    icon: 'lucide:layout-grid',
    title: 'Kategorie tematyczne',
    desc: 'Pytania podzielone na kategorie — ćwicz tylko to, z czego czujesz się najsłabiej.',
    color: '#f59e0b',
    colorRgb: '245, 158, 11',
  },
  {
    icon: 'lucide:flame',
    title: 'Streak i motywacja',
    desc: 'Codzienna seria nauki, żebyś nie zapominał. Małe kroki prowadzą do dużych wyników.',
    color: '#ef4444',
    colorRgb: '239, 68, 68',
  },
  {
    icon: 'lucide:hard-drive',
    title: 'Bez rejestracji',
    desc: 'Wszystko zapisywane lokalnie w przeglądarce. Zero konta, zero hasła — po prostu uczysz się.',
    color: '#8b5cf6',
    colorRgb: '139, 92, 246',
  },
];

const STATS = [
  { value: '200+', label: 'pytań w bazie' },
  { value: '9',   label: 'kategorii tematycznych' },
  { value: '75%', label: 'próg zaliczenia' },
  { value: <Icon icon="lucide:infinity" style={{ verticalAlign: 'middle', marginRight: 4 }} />,   label: 'prób egzaminacyjnych' },
];

const STEPS = [
  { n: '1', title: 'Ustaw nick', desc: 'Przy pierwszym wejściu wpisujesz swój nick — dane zapisywane są lokalnie.' },
  { n: '2', title: 'Wybierz tryb', desc: 'Nauka lub egzamin. Możesz filtrować pytania po kategorii i wybrać ich liczbę.' },
  { n: '3', title: 'Odpowiadaj', desc: 'Po każdej odpowiedzi widzisz czy była poprawna i dlaczego — uczysz się na błędach.' },
  { n: '4', title: 'Śledź wyniki', desc: 'Dashboard pokazuje Twój postęp, historię i które kategorie wymagają powtórki.' },
];

// ─── komponenty ───────────────────────────────────────────────────────────────

function StatPill({ value, label }) {
  usePageTitle('Strona główna')
  return (
    <div className="home-stat-pill">
      <div className="home-stat-pill-value">{value}</div>
      <div className="home-stat-pill-label">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, colorRgb }) {
  return (
    <div className="home-feature-card" style={{ '--feature-color-rgb': colorRgb }}>
      <div className="home-feature-icon-wrapper">
        <Icon icon={icon} className="home-feature-icon" />
      </div>
      <div className="home-feature-title">{title}</div>
      <div className="home-feature-description">{desc}</div>
    </div>
  );
}

function StepCard({ n, title, desc }) {
  return (
    <div className="home-step-card">
      <div className="home-step-number">{n}</div>
      <div>
        <div className="home-step-title">{title}</div>
        <div className="home-step-description">{desc}</div>
      </div>
    </div>
  );
}

// ─── strona główna ────────────────────────────────────────────────────────────

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="homepage-container">
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="home-hero-section">
        {/* left */}
        <div className="home-hero-left">
          <div className="home-hero-badge">
            <span className="home-hero-badge-text">
              Egzamin INF04 · Kwalifikacja EE.09
            </span>
          </div>

          <h1 className="home-hero-title">
            Zdaj INF04<br />
            <span className="home-hero-title-gradient">za pierwszym razem.</span>
          </h1>

          <p className="home-hero-description">
            Interaktywna platforma do nauki i symulacji egzaminu zawodowego.
            Pytania, wyjaśnienia, postępy — wszystko w przeglądarce, bez rejestracji.
          </p>

          <div className="home-hero-buttons">
            <button className="home-hero-primary-btn" onClick={() => navigate('/learn')}>
              <Icon icon="lucide:book-open" />
              Zacznij naukę
            </button>
            <button className="home-hero-secondary-btn" onClick={() => navigate('/exam')}>
              <Icon icon="lucide:layout-dashboard" />
              Panel użytkownika
            </button>
          </div>
        </div>

        {/* right — mascot + floating cards */}
        <div className="home-hero-right">
          <img
            src="/curious_alt_jamiq.png"
            alt="JamIQ"
            className="home-mascot-image bounce"
          />

          {/* floating badge top-right */}
          <div className="home-floating-badge home-floating-badge-top">
            <div className="home-badge-label">Ostatni wynik</div>
            <div className="home-badge-value" style={{color: 'rgb(16, 185, 129)'}}>
              92%
              <Icon icon="lucide:check-check" />
            </div>
          </div>

          {/* floating badge bottom-left */}
          <div className="home-floating-badge home-floating-badge-bottom">
            <div className="home-badge-label">Seria nauki</div>
            <div className="home-badge-value" style={{color: 'rgb(239, 68, 68)'}}>
              <Icon icon="lucide:flame" className="home-badge-flame" />
              7 dni
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────────── */}
      <section className="home-stats-section">
        <div className="home-stats-container">
          {STATS.map(s => <StatPill key={s.label} {...s} />)}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section className="home-features-section">
        <div className="home-features-container">
          <div className="home-features-title">
            <h2 className="home-features-heading">Co oferuje ExamIQ?</h2>
            <p className="home-features-subtitle">
              Wszystko czego potrzebujesz do zdania INF04 — w jednej aplikacji.
            </p>
          </div>
          <div className="home-features-grid">
            {FEATURES.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="home-how-it-works-section">
        <div className="home-how-it-works-grid">
          {/* left text */}
          <div>
            <h2 className="home-how-it-works-heading">Jak to działa?</h2>
            <p className="home-how-it-works-subtitle">
              Cztery kroki do lepszego wyniku na egzaminie zawodowym.
            </p>
            <div className="home-steps-list">
              {STEPS.map(s => <StepCard key={s.n} {...s} />)}
            </div>
          </div>

          {/* right — visual card */}
          <div className="home-visual-card">
            {/* fake question preview */}
            <div className="home-visual-card-header">
              <div className="home-visual-card-progress">
                <span className="home-visual-card-progress-label">Pytanie 7 / 20</span>
                <span className="home-visual-card-category">Bazy danych</span>
              </div>
              <div className="home-progress-bar-container">
                <div className="home-progress-bar" />
              </div>
              <p className="home-question-text">
                Które polecenie SQL służy do pobierania danych z tabeli?
              </p>
            </div>
            {[
              { k: 'A', v: 'INSERT INTO', correct: false, selected: false },
              { k: 'B', v: 'SELECT', correct: true, selected: true },
              { k: 'C', v: 'UPDATE', correct: false, selected: false },
              { k: 'D', v: 'DELETE', correct: false, selected: false },
            ].map(({ k, v, correct, selected }) => (
              <div key={k} className={`home-answer-option ${correct ? 'correct' : ''} ${selected ? 'selected' : ''}`}>
                <span className="home-answer-key">{k}</span>
                <span className="home-answer-text">{v}</span>
                {correct && (
                  <span className="home-correct-indicator">
                    <Icon icon="lucide:check-circle-2" />
                  </span>
                )}
              </div>
            ))}
            <div className="home-explanation-box">
              <Icon icon="lucide:lightbulb" style={{ fontSize: '1rem', flexShrink: 0, marginTop: 1 }} />
              SELECT służy do odczytywania danych. INSERT dodaje, UPDATE modyfikuje, DELETE usuwa rekordy.
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="home-cta-section">
        <div className="home-cta-container">
          <div className="home-cta-decoration-circle home-cta-circle-top" />
          <div className="home-cta-decoration-circle home-cta-circle-bottom" />

          <div className="home-cta-content">
            <div className="home-cta-icon">
              <Icon icon="lucide:graduation-cap" />
            </div>
            <h2 className="home-cta-heading">Gotowy na egzamin?</h2>
            <p className="home-cta-description">
              Zacznij dziś, ćwicz systematycznie i zdobądź kwalifikację INF04.<br />
              Twoje wyniki czekają na Ciebie w dashboardzie.
            </p>
            <div className="home-cta-buttons">
              <button className="home-cta-primary-btn" onClick={() => navigate('/learn')}>
                <Icon icon="lucide:book-open" />
                Zacznij naukę
              </button>
              <button className="home-cta-secondary-btn" onClick={() => navigate('/exam')}>
                <Icon icon="lucide:bar-chart-2" />
                Panel użytkownika
              </button>
              <button className="home-cta-tertiary-btn" onClick={() => navigate('/about')}>
                <Icon icon="lucide:info" />
                O nas
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
