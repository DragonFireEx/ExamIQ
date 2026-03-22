// pages/AboutPage.jsx
// Strona "O nas" - opis projektu, autorzy, jak działa aplikacja
//
// W App.jsx zastąp inline AboutPage tym importem:
//   import AboutPage from './pages/AboutPage';
//   <Route path="/about" element={<AboutPage />} />

import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { usePageTitle } from '../hooks/usePageTitle';

const AUTHORS = [
  { name: 'Marcel Turwanicki', role: 'FullStack / DevOps',           github: 'DragonFireEx' },
  { name: 'Filip Czepiel',     role: 'FullStack / DevOps',           github: 'filekk' },
  { name: 'Piotr Lipiński',    role: 'Design & UX / DevOps / Docs', github: 'PIotrr23' },
  { name: 'Bartosz Wryszcz',   role: 'FullStack / DevOps',           github: 'BartoszBartoszewski' },
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

const TECH = ['React 18', 'Vite', 'React Router', 'JavaScript ES2023', 'CSS-in-JS', 'LocalStorage API', 'Cookie API', 'Monaco Editor', 'Google Gemini'];

// GitHub SVG icon
function GitHubIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"

      
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export default function AboutPage() {
  usePageTitle('O nas');
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg,#f5f3ff 0%,#ede9fe 45%,#e0e7ff 100%)',
      fontFamily: "'Sora', sans-serif",
    }}>

      <Header />

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '4rem 2rem 6rem' }}>

        {/* HERO */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(124,58,237,0.1)',
            color: '#7c3aed', fontSize: '0.78rem', fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            padding: '0.4rem 1rem', borderRadius: 99,
            marginBottom: '1.25rem',
            border: '1px solid rgba(124,58,237,0.2)',
          }}>
            Projekt na zaliczenie · 2025
          </div>
          <h1 style={{
            fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
            fontWeight: 800, color: '#4c1d95',
            margin: '0 0 1rem', letterSpacing: '-1px', lineHeight: 1.1,
          }}>
            O projekcie<br />
            <span style={{
              background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>ExamIQ</span>
          </h1>
          <p style={{
            fontSize: '1.1rem', color: '#6b7280', lineHeight: 1.7,
            maxWidth: 580, margin: '0 auto',
          }}>
            ExamIQ to interaktywna platforma do nauki i samodzielnego przygotowania
            się do egzaminu zawodowego <strong style={{ color: '#7c3aed' }}>INF04</strong> — kwalifikacji
            z zakresu programowania, baz danych i administracji systemami.
          </p>
        </div>

        {/* CEL PROJEKTU */}
        <div style={{
          background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(14px)',
          borderRadius: 24, padding: '2.5rem',
          border: '1px solid rgba(167,139,250,0.2)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          marginBottom: '2.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🎯</span>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#4c1d95' }}>Cel projektu</h2>
          </div>
          <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.8, fontSize: '0.975rem' }}>
            Projekt powstał jako zaliczenie przedmiotu z zakresu tworzenia aplikacji webowych.
            Celem było stworzenie użytecznego narzędzia edukacyjnego, które pomoże uczniom
            technikum informatycznego w systematycznej nauce do egzaminu INF04.
            Aplikacja łączy gamifikację (serie dni, statystyki, progi zaliczenia) z praktycznym
            zestawem pytań egzaminacyjnych podzielonych na kategorie tematyczne.
          </p>
        </div>

        {/* JAK DZIAŁA */}
        <h2 style={{
          fontSize: '1.5rem', fontWeight: 800, color: '#4c1d95',
          margin: '0 0 1.5rem', letterSpacing: '-0.3px',
        }}>Jak działa aplikacja?</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1rem', marginBottom: '3rem',
        }}>
          {HOW_IT_WORKS.map(({ step, title, desc, emoji }) => (
            <div key={step} style={{
              background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(14px)',
              borderRadius: 20, padding: '1.75rem',
              border: '1px solid rgba(167,139,250,0.2)',
              boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
              display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.05)'; }}
            >
              <div style={{
                flexShrink: 0,
                width: 52, height: 52, borderRadius: 14,
                background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem',
                boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
              }}>{emoji}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.1em' }}>{step}</span>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#4c1d95' }}>{title}</h3>
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.7 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* TECHNOLOGIE */}
        <div style={{
          background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(14px)',
          borderRadius: 24, padding: '2rem 2.5rem',
          border: '1px solid rgba(167,139,250,0.2)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
          marginBottom: '2.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🛠️</span>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#4c1d95' }}>Stack technologiczny</h2>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TECH.map(t => (
              <span key={t} style={{
                padding: '0.4rem 0.9rem',
                background: 'rgba(124,58,237,0.08)',
                color: '#7c3aed', fontWeight: 600,
                fontSize: '0.82rem', borderRadius: 99,
                border: '1px solid rgba(124,58,237,0.18)',
                letterSpacing: '0.02em',
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* AUTORZY */}
        <h2 style={{
          fontSize: '1.5rem', fontWeight: 800, color: '#4c1d95',
          margin: '0 0 1.5rem', letterSpacing: '-0.3px',
        }}>Autorzy</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem', marginBottom: '3rem',
        }}>
          {AUTHORS.map(({ name, role, github }) => (
            <div key={name} style={{
              background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(14px)',
              borderRadius: 20, padding: '1.75rem',
              border: '1px solid rgba(167,139,250,0.2)',
              boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
              textAlign: 'center',
              transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 36px rgba(124,58,237,0.14)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.05)'; }}
            >
              {/* Avatar z GitHuba */}
              <img
                src={`https://github.com/${github}.png`}
                alt={name}
                style={{
                  width: 72, height: 72, borderRadius: '50%',
                  objectFit: 'cover',
                  margin: '0 auto 1rem',
                  display: 'block',
                  border: '3px solid rgba(124,58,237,0.25)',
                  boxShadow: '0 4px 16px rgba(124,58,237,0.2)',
                }}
              />

              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', marginBottom: '0.9rem' }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#4c1d95' }}>{name}</div>
                <div style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: 600, letterSpacing: '0.04em' }}>{role}</div>
              </div>

              {/* Link do GitHuba */}
              <a
                href={`https://github.com/${github}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '0.35rem 0.85rem',
                  background: 'rgba(124,58,237,0.08)',
                  color: '#7c3aed',
                  border: '1px solid rgba(124,58,237,0.2)',
                  borderRadius: 99,
                  fontSize: '0.78rem', fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#7c3aed'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; e.currentTarget.style.color = '#7c3aed'; }}
              >
                <GitHubIcon />
                GitHub
              </a>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
          borderRadius: 24, padding: '2.5rem',
          textAlign: 'center',
          boxShadow: '0 12px 40px rgba(124,58,237,0.3)',
        }}>
          <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
            Gotowy żeby zacząć?
          </h3>
          <p style={{ margin: '0 0 1.75rem', color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem' }}>
            Przetestuj swoją wiedzę z INF04 już teraz.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/learn">
              <button style={{
                padding: '0.8rem 1.75rem',
                background: '#fff', color: '#7c3aed',
                border: 'none', borderRadius: 12,
                fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                fontFamily: "'Sora',sans-serif",
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >📚 Tryb nauki</button>
            </Link>
            <Link to="/exam">
              <button style={{
                padding: '0.8rem 1.75rem',
                background: 'rgba(255,255,255,0.15)', color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 12,
                fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                fontFamily: "'Sora',sans-serif",
                transition: 'transform 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
              >📊 Panel użytkownika</button>
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}