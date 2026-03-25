// pages/HomePage.jsx
// Ulepszona strona główna ExamIQ
// Zastępuje HomePage.jsx + HeroSection + FeaturesSection + CallToActionSection
// Header i Footer pozostają bez zmian

import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { usePageTitle } from '../hooks/usePageTitle';
import { Icon } from '@iconify/react';

// ─── dane ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: 'lucide:book-open',
    title: 'Tryb nauki',
    desc: 'Losowane pytania z natychmiastową informacją zwrotną i wyjaśnieniami. Uczysz się na błędach.',
    color: '#7c3aed',
  },
  {
    icon: 'lucide:target',
    title: 'Symulator egzaminu',
    desc: 'Próbny egzamin INF04 z progiem 75%. Sprawdź czy jesteś gotowy zanim przyjdzie ten prawdziwy.',
    color: '#0ea5e9',
  },
  {
    icon: 'lucide:bar-chart-2',
    title: 'Dashboard postępów',
    desc: 'Historia sesji, postęp per kategoria, seria dni nauki i statystyki — wszystko w jednym miejscu.',
    color: '#10b981',
  },
  {
    icon: 'lucide:layout-grid',
    title: 'Kategorie tematyczne',
    desc: 'Pytania podzielone na kategorie — ćwicz tylko to, z czego czujesz się najsłabiej.',
    color: '#f59e0b',
  },
  {
    icon: 'lucide:flame',
    title: 'Streak i motywacja',
    desc: 'Codzienna seria nauki, żebyś nie zapominał. Małe kroki prowadzą do dużych wyników.',
    color: '#ef4444',
  },
  {
    icon: 'lucide:hard-drive',
    title: 'Bez rejestracji',
    desc: 'Wszystko zapisywane lokalnie w przeglądarce. Zero konta, zero hasła — po prostu uczysz się.',
    color: '#8b5cf6',
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
    <div style={{
      textAlign: 'center',
      padding: '1.25rem 1.5rem',
      background: 'rgba(255,255,255,0.6)',
      backdropFilter: 'blur(10px)',
      borderRadius: 18,
      border: '1px solid rgba(167,139,250,0.25)',
      minWidth: 120,
    }}>
      <div style={{
        fontSize: '2.25rem', fontWeight: 800,
        color: '#4c1d95', letterSpacing: '-1px',
        fontFamily: "'Sora', sans-serif",
        lineHeight: 1,
        marginBottom: '0.35rem',
      }}>{value}</div>
      <div style={{
        fontSize: '0.75rem', fontWeight: 600,
        color: '#a78bfa', textTransform: 'uppercase',
        letterSpacing: '0.07em',
      }}>{label}</div>
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
      }}>
        <Icon icon={icon} style={{ fontSize: '1.5rem', color }} />
      </div>
      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e1b4b', fontFamily: "'Sora', sans-serif" }}>{title}</div>
      <div style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.65 }}>{desc}</div>
    </div>
  );
}

function StepCard({ n, title, desc }) {
  return (
    <div style={{
      display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
    }}>
      <div style={{
        flexShrink: 0,
        width: 44, height: 44, borderRadius: 12,
        background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: '1rem', color: '#fff',
        fontFamily: "'Sora', sans-serif",
        boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
      }}>{n}</div>
      <div>
        <div style={{ fontWeight: 700, color: '#1e1b4b', marginBottom: '0.3rem', fontFamily: "'Sora', sans-serif" }}>{title}</div>
        <div style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.65 }}>{desc}</div>
      </div>
    </div>
  );
}

// ─── strona główna ────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg,#f5f3ff 0%,#ede9fe 35%,#e0e7ff 70%,#f0fdf4 100%)',
      fontFamily: "'Sora', sans-serif",
    }}>
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '5rem 2rem 3rem',
        display: 'flex', alignItems: 'center',
        gap: '3rem', flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {/* left */}
        <div style={{ flex: '1 1 420px', maxWidth: 560 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 99, padding: '0.35rem 1rem',
            marginBottom: '1.5rem',
          }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Egzamin INF04 · Kwalifikacja EE.09
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
            fontWeight: 800, lineHeight: 1.1,
            color: '#1e1b4b', margin: '0 0 1.25rem',
            letterSpacing: '-1.5px',
          }}>
            Zdaj INF04<br />
            <span style={{
              background: 'linear-gradient(135deg,#7c3aed 0%,#a78bfa 50%,#60a5fa 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>za pierwszym razem.</span>
          </h1>

          <p style={{
            fontSize: '1.1rem', color: '#6b7280',
            lineHeight: 1.75, marginBottom: '2.25rem',
            maxWidth: 460,
          }}>
            Interaktywna platforma do nauki i symulacji egzaminu zawodowego.
            Pytania, wyjaśnienia, postępy — wszystko w przeglądarce, bez rejestracji.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/learn">
              <button style={{
                padding: '0.9rem 2rem',
                background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
                color: '#fff', border: 'none', borderRadius: 14,
                fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                fontFamily: "'Sora', sans-serif",
                boxShadow: '0 6px 20px rgba(124,58,237,0.4)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                letterSpacing: '0.01em',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(124,58,237,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.4)'; }}
              >
                <Icon icon="lucide:book-open" />
                Zacznij naukę
              </button>
            </Link>
            <Link to="/exam">
              <button style={{
                padding: '0.9rem 1.75rem',
                background: 'rgba(255,255,255,0.8)',
                color: '#7c3aed', border: '1.5px solid rgba(124,58,237,0.3)',
                borderRadius: 14, fontWeight: 700, fontSize: '1rem',
                cursor: 'pointer', fontFamily: "'Sora', sans-serif",
                backdropFilter: 'blur(8px)',
                transition: 'all 0.15s',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; e.currentTarget.style.borderColor = '#7c3aed'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.8)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; }}
              >
                <Icon icon="lucide:layout-dashboard" />
                Panel użytkownika
              </button>
            </Link>
          </div>
        </div>

        {/* right — mascot + floating cards */}
        <div style={{
          flex: '1 1 280px', maxWidth: 400,
          position: 'relative', display: 'flex',
          justifyContent: 'center', alignItems: 'center',
          minHeight: 340,
        }}>
          <img
            src="/curious_alt_jamiq.png"
            alt="JamIQ"
            style={{ width: 280, height: 280, objectFit: 'contain', position: 'relative', zIndex: 1 }}
            className="bounce"
          />

          {/* floating badge top-right */}
          <div style={{
            position: 'absolute', top: 25, right: 0,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            borderRadius: 14, padding: '0.6rem 1rem',
            border: '1px solid rgba(167,139,250,0.3)',
            boxShadow: '0 4px 20px rgba(124,58,237,0.15)',
            zIndex: 2,
            animation: 'floatA 3s ease-in-out infinite',
          }}>
            <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600 }}>Ostatni wynik</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#7c3aed', display: 'flex', alignItems: 'center', gap: 6 }}>
              92%
              <Icon icon="lucide:check-check" />
            </div>
          </div>

          {/* floating badge bottom-left */}
          <div style={{
            position: 'absolute', bottom: 20, left: 0,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            borderRadius: 14, padding: '0.6rem 1rem',
            border: '1px solid rgba(167,139,250,0.3)',
            boxShadow: '0 4px 20px rgba(124,58,237,0.15)',
            zIndex: 2,
            animation: 'floatB 3.5s ease-in-out infinite',
          }}>
            <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600 }}>Seria nauki</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon icon="lucide:flame" />
              7 dni
            </div>
          </div>

          <style>{`
            @keyframes floatA {
              0%,100% { transform: translateY(0px); }
              50% { transform: translateY(-8px); }
            }
            @keyframes floatB {
              0%,100% { transform: translateY(0px); }
              50% { transform: translateY(8px); }
            }
          `}</style>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '1rem 2rem 4rem' }}>
        <div style={{
          display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {STATS.map(s => <StatPill key={s.label} {...s} />)}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section style={{
        background: 'rgba(255,255,255,0.4)',
        borderTop: '1px solid rgba(167,139,250,0.15)',
        borderBottom: '1px solid rgba(167,139,250,0.15)',
        padding: '5rem 2rem',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
              fontWeight: 800, color: '#1e1b4b',
              margin: '0 0 0.75rem', letterSpacing: '-0.5px',
            }}>Co oferuje ExamIQ?</h2>
            <p style={{ color: '#9ca3af', fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>
              Wszystko czego potrzebujesz do zdania INF04 — w jednej aplikacji.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
          }}>
            {FEATURES.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 2rem' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '4rem', alignItems: 'center',
        }}
        className="how-it-works-grid"
        >
          {/* left text */}
          <div>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
              fontWeight: 800, color: '#1e1b4b',
              margin: '0 0 0.75rem', letterSpacing: '-0.5px',
            }}>Jak to działa?</h2>
            <p style={{ color: '#9ca3af', fontSize: '1rem', marginBottom: '2.5rem', lineHeight: 1.7 }}>
              Cztery kroki do lepszego wyniku na egzaminie zawodowym.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {STEPS.map(s => <StepCard key={s.n} {...s} />)}
            </div>
          </div>

          {/* right — visual card */}
          <div style={{
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(16px)',
            borderRadius: 28, padding: '2rem',
            border: '1px solid rgba(167,139,250,0.2)',
            boxShadow: '0 8px 40px rgba(124,58,237,0.12)',
          }}>
            {/* fake question preview */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pytanie 7 / 20</span>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Bazy danych</span>
              </div>
              <div style={{ height: 5, background: '#ede9fe', borderRadius: 99, overflow: 'hidden', marginBottom: '1.25rem' }}>
                <div style={{ height: '100%', width: '35%', background: 'linear-gradient(90deg,#7c3aed,#a78bfa)', borderRadius: 99 }} />
              </div>
              <p style={{ fontWeight: 600, color: '#1e1b4b', fontSize: '0.9rem', lineHeight: 1.55, marginBottom: '1rem' }}>
                Które polecenie SQL służy do pobierania danych z tabeli?
              </p>
            </div>
            {[
              { k: 'A', v: 'INSERT INTO', correct: false, selected: false },
              { k: 'B', v: 'SELECT', correct: true, selected: true },
              { k: 'C', v: 'UPDATE', correct: false, selected: false },
              { k: 'D', v: 'DELETE', correct: false, selected: false },
            ].map(({ k, v, correct, selected }) => (
              <div key={k} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.65rem 0.9rem', borderRadius: 10,
                marginBottom: 6,
                background: correct ? '#d1fae5' : selected ? '#fee2e2' : 'rgba(245,243,255,0.8)',
                border: `1.5px solid ${correct ? '#34d399' : selected ? '#f87171' : 'rgba(167,139,250,0.2)'}`,
              }}>
                <span style={{
                  width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: correct ? '#34d399' : 'rgba(167,139,250,0.2)',
                  color: correct ? '#fff' : '#7c3aed',
                  fontWeight: 700, fontSize: '0.75rem',
                }}>{k}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: correct ? '#065f46' : '#4c1d95' }}>{v}</span>
                {correct && (
                  <span style={{ marginLeft: 'auto', color: '#059669', display: 'flex', alignItems: 'center' }}>
                    <Icon icon="lucide:check-circle-2" style={{ fontSize: '1rem' }} />
                  </span>
                )}
              </div>
            ))}
            <div style={{ marginTop: '1rem', padding: '0.8rem', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderRadius: 10, border: '1px solid #86efac', fontSize: '0.8rem', color: '#166534', lineHeight: 1.5, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <Icon icon="lucide:lightbulb" style={{ fontSize: '1rem', flexShrink: 0, marginTop: 1 }} />
              SELECT służy do odczytywania danych. INSERT dodaje, UPDATE modyfikuje, DELETE usuwa rekordy.
            </div>
          </div>
        </div>
        <style>{`
          @media (max-width: 768px) {
            .how-it-works-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section style={{ padding: '0 2rem 6rem' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          background: 'linear-gradient(135deg,#4c1d95,#7c3aed,#a78bfa)',
          borderRadius: 32, padding: '4rem 3rem',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(124,58,237,0.35)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* decorative circles */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <Icon icon="lucide:graduation-cap" style={{ fontSize: '2.5rem', color: '#fff' }} />
            </div>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 800, color: '#fff',
              margin: '0 0 1rem', letterSpacing: '-0.5px',
            }}>Gotowy na egzamin?</h2>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '1.05rem', marginBottom: '2.25rem', lineHeight: 1.65, maxWidth: 480, margin: '0 auto 2.25rem' }}>
              Zacznij dziś, ćwicz systematycznie i zdobądź kwalifikację INF04.<br />
              Twoje wyniki czekają na Ciebie w dashboardzie.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/learn">
                <button style={{
                  padding: '0.9rem 2.25rem',
                  background: '#fff', color: '#7c3aed',
                  border: 'none', borderRadius: 14,
                  fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                  fontFamily: "'Sora', sans-serif",
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                  transition: 'transform 0.15s',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Icon icon="lucide:book-open" />
                  Zacznij naukę
                </button>
              </Link>
              <Link to="/exam">
                <button style={{
                  padding: '0.9rem 2rem',
                  background: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  border: '1.5px solid rgba(255,255,255,0.4)',
                  borderRadius: 14,
                  fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                  fontFamily: "'Sora', sans-serif",
                  transition: 'all 0.15s',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <Icon icon="lucide:bar-chart-2" />
                  Panel użytkownika
                </button>
              </Link>
              <Link to="/about">
                <button style={{
                  padding: '0.9rem 2rem',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.8)',
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  borderRadius: 14,
                  fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
                  fontFamily: "'Sora', sans-serif",
                  transition: 'all 0.15s',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                >
                  <Icon icon="lucide:info" />
                  O nas
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}