// pages/HomePage.jsx
// Ulepszona strona główna ExamIQ
// Zastępuje HomePage.jsx + HeroSection + FeaturesSection + CallToActionSection
// Header i Footer pozostają bez zmian

import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../App.css'; // dodane: import globalnych stylów

// ─── dane ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '📚',
    title: 'Tryb nauki',
    desc: 'Losowane pytania z natychmiastową informacją zwrotną i wyjaśnieniami. Uczysz się na błędach.',
    color: '#7c3aed',
  },
  {
    icon: '🎯',
    title: 'Symulator egzaminu',
    desc: 'Próbny egzamin INF04 z progiem 75%. Sprawdź czy jesteś gotowy zanim przyjdzie ten prawdziwy.',
    color: '#0ea5e9',
  },
  {
    icon: '📊',
    title: 'Dashboard postępów',
    desc: 'Historia sesji, postęp per kategoria, seria dni nauki i statystyki — wszystko w jednym miejscu.',
    color: '#10b981',
  },
  {
    icon: '🗂️',
    title: 'Kategorie tematyczne',
    desc: 'Pytania podzielone na kategorie — ćwicz tylko to, z czego czujesz się najsłabiej.',
    color: '#f59e0b',
  },
  {
    icon: '🔥',
    title: 'Streak i motywacja',
    desc: 'Codzienna seria nauki, żebyś nie zapominał. Małe kroki prowadzą do dużych wyników.',
    color: '#ef4444',
  },
  {
    icon: '💾',
    title: 'Bez rejestracji',
    desc: 'Wszystko zapisywane lokalnie w przeglądarce. Zero konta, zero hasła — po prostu uczysz się.',
    color: '#8b5cf6',
  },
];

const STATS = [
  { value: '40+', label: 'pytań w bazie' },
  { value: '6',   label: 'kategorii tematycznych' },
  { value: '75%', label: 'próg zaliczenia' },
  { value: '∞',   label: 'prób egzaminacyjnych' },
];

const STEPS = [
  { n: '1', title: 'Ustaw nick', desc: 'Przy pierwszym wejściu wpisujesz swój nick — dane zapisywane są lokalnie.' },
  { n: '2', title: 'Wybierz tryb', desc: 'Nauka lub egzamin. Możesz filtrować pytania po kategorii i wybrać ich liczbę.' },
  { n: '3', title: 'Odpowiadaj', desc: 'Po każdej odpowiedzi widzisz czy była poprawna i dlaczego — uczysz się na błędach.' },
  { n: '4', title: 'Śledź wyniki', desc: 'Dashboard pokazuje Twój postęp, historię i które kategorie wymagają powtórki.' },
];

// ─── komponenty ───────────────────────────────────────────────────────────────

function StatPill({ value, label }) {
  return (
    <div className="stat-pill">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.75)',
      backdropFilter: 'blur(12px)',
      borderRadius: 20, padding: '1.75rem',
      border: '1px solid rgba(167,139,250,0.18)',
      boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      display: 'flex', flexDirection: 'column', gap: '0.75rem',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${color}22`; e.currentTarget.style.borderColor = `${color}44`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.18)'; }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: `${color}18`,
        border: `1.5px solid ${color}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.5rem',
      }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e1b4b', fontFamily: "'Sora', sans-serif" }}>{title}</div>
      <div style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.65 }}>{desc}</div>
    </div>
  );
}

function StepCard({ n, title, desc }) {
  return (
    <div className="step-card">
      <div className="step-number">{n}</div>
      <div>
        <div className="step-title">{title}</div>
        <div className="step-desc">{desc}</div>
      </div>
    </div>
  );
}

// ─── strona główna ────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="home-page">
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="home-hero">
        {/* left */}
        <div className="home-hero-left">
          <div className="home-badge">
            <span className="home-badge-text">
              Egzamin INF04 · Kwalifikacja EE.09
            </span>
          </div>

          <h1 className="home-title">
            Zdaj INF04<br />
            <span className="home-title-gradient">za pierwszym razem.</span>
          </h1>

          <p className="home-description">
            Interaktywna platforma do nauki i symulacji egzaminu zawodowego.
            Pytania, wyjaśnienia, postępy — wszystko w przeglądarce, bez rejestracji.
          </p>

          <div className="home-buttons">
            <Link to="/learn" className="btn-primary">Zacznij naukę 🚀</Link>
            <Link to="/exam" className="btn-secondary">Mój dashboard →</Link>
          </div>
        </div>

        {/* right — mascot + floating cards */}
        <div className="home-mascot">
          <img
            src="/curious_jamiq.png"
            alt="JamIQ"
            className="mascot-image"
          />

          {/* floating badge top-right */}
          <div className="floating-badge floating-badge-top">
            <div className="badge-label">Ostatni wynik</div>
            <div className="badge-value badge-value-success">92% ✅</div>
          </div>

          {/* floating badge bottom-left */}
          <div className="floating-badge floating-badge-bottom">
            <div className="badge-label">Seria nauki</div>
            <div className="badge-value badge-value-streak">🔥 7 dni</div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────────── */}
      <section className="home-stats-section">
        <div className="stats-container">
          {STATS.map(s => <StatPill key={s.label} {...s} />)}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section className="home-features-section">
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-title">Co oferuje ExamIQ?</h2>
            <p className="section-subtitle">
              Wszystko czego potrzebujesz do zdania INF04 — w jednej aplikacji.
            </p>
          </div>
          <div className="features-grid">
            {FEATURES.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="home-how-section">
        <div className="how-grid">
          {/* left text */}
          <div>
            <h2 className="how-title">Jak to działa?</h2>
            <p className="how-description">
              Cztery kroki do lepszego wyniku na egzaminie zawodowym.
            </p>
            <div className="steps-list">
              {STEPS.map(s => <StepCard key={s.n} {...s} />)}
            </div>
          </div>

          {/* right — visual card */}
          <div className="preview-card">
            {/* fake question preview */}
            <div className="preview-header">
              <span className="preview-category">Pytanie 7 / 20</span>
              <span className="preview-counter">Bazy danych</span>
            </div>
            <div className="preview-progress">
              <div className="preview-progress-bar" />
            </div>
            <p className="preview-question">
              Które polecenie SQL służy do pobierania danych z tabeli?
            </p>
            {[
              { k: 'A', v: 'INSERT INTO', correct: false, selected: false },
              { k: 'B', v: 'SELECT', correct: true, selected: true },
              { k: 'C', v: 'UPDATE', correct: false, selected: false },
              { k: 'D', v: 'DELETE', correct: false, selected: false },
            ].map(({ k, v, correct, selected }) => {
              let optionClass = 'preview-option';
              if (correct) optionClass += ' preview-option-correct';
              else if (selected) optionClass += ' preview-option-selected-wrong';
              const letterClass = `preview-option-letter ${correct ? 'preview-option-letter-correct' : ''}`;
              const textClass = `preview-option-text ${correct ? 'preview-option-text-correct' : ''}`;
              return (
                <div key={k} className={optionClass}>
                  <span className={letterClass}>{k}</span>
                  <span className={textClass}>{v}</span>
                  {correct && <span className="preview-option-check">✅</span>}
                </div>
              );
            })}
            <div className="preview-explanation">
              💡 SELECT służy do odczytywania danych. INSERT dodaje, UPDATE modyfikuje, DELETE usuwa rekordy.
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="home-cta-section">
        <div className="cta-card">
          {/* decorative circles */}
          <div className="cta-decor cta-decor-1" />
          <div className="cta-decor cta-decor-2" />

          <div className="cta-content">
            <div className="cta-icon">🎓</div>
            <h2 className="cta-title">Gotowy na egzamin?</h2>
            <p className="cta-description">
              Zacznij dziś, ćwicz systematycznie i zdobądź kwalifikację INF04.<br />
              Twoje wyniki czekają na Ciebie w dashboardzie.
            </p>
            <div className="cta-buttons">
              <Link to="/learn" className="btn-white">📚 Zacznij naukę</Link>
              <Link to="/exam" className="btn-ghost-light">📊 Mój dashboard</Link>
              <Link to="/about" className="btn-outline-light">ℹ️ O projekcie</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}