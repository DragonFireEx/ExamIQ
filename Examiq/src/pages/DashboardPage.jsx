// pages/DashboardPage.jsx
// Dashboard użytkownika - zastępuje ExamPage
// Umieść w: src/pages/DashboardPage.jsx
// W App.jsx zmień: import DashboardPage from './pages/DashboardPage';
// i route: <Route path="/exam" element={<DashboardPage />} />

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import questions from '../data/questions.json';

// ─── helpers ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'examiq_dashboard';

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  // dane demonstracyjne przy pierwszym uruchomieniu
  return {
    user: { name: 'Użytkownik', streak: 7, joinDate: '2025-01-10' },
    sessions: [
      { date: '2025-03-15', score: 18, total: 20, duration: 340 },
      { date: '2025-03-12', score: 14, total: 20, duration: 510 },
      { date: '2025-03-10', score: 16, total: 20, duration: 420 },
      { date: '2025-03-07', score: 12, total: 20, duration: 600 },
      { date: '2025-03-04', score: 19, total: 20, duration: 290 },
      { date: '2025-02-28', score: 10, total: 20, duration: 680 },
    ],
  };
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
}

function formatDuration(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
}

// unique categories from questions
const CATEGORIES = [...new Set(questions.map(q => q.category))];

// ─── mini bar chart ──────────────────────────────────────────────────────────

function MiniBarChart({ sessions }) {
  const last6 = sessions.slice(-6);
  const max = Math.max(...last6.map(s => s.score), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '64px', padding: '0 2px' }}>
      {last6.map((s, i) => {
        const pct = (s.score / max) * 100;
        const pass = s.score / s.total >= 0.75;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '10px', color: '#a78bfa', fontWeight: 700 }}>{s.score}</span>
            <div style={{
              width: '100%',
              height: `${Math.max(pct * 0.48, 4)}px`,
              borderRadius: '4px 4px 2px 2px',
              background: pass
                ? 'linear-gradient(180deg,#a78bfa,#7c3aed)'
                : 'linear-gradient(180deg,#f87171,#b91c1c)',
              transition: 'height 0.6s ease',
              boxShadow: pass ? '0 0 8px rgba(167,139,250,0.5)' : 'none',
            }} />
            <span style={{ fontSize: '9px', color: '#6b7280', whiteSpace: 'nowrap' }}>{formatDate(s.date)}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── stat card ───────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, accent = false }) {
  return (
    <div style={{
      background: accent
        ? 'linear-gradient(135deg,#7c3aed 0%,#a78bfa 100%)'
        : 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(12px)',
      borderRadius: '18px',
      padding: '1.25rem 1.5rem',
      border: accent ? 'none' : '1px solid rgba(167,139,250,0.2)',
      boxShadow: accent
        ? '0 8px 32px rgba(124,58,237,0.35)'
        : '0 2px 12px rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'default',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = accent ? '0 12px 40px rgba(124,58,237,0.45)' : '0 6px 24px rgba(0,0,0,0.1)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = accent ? '0 8px 32px rgba(124,58,237,0.35)' : '0 2px 12px rgba(0,0,0,0.06)'; }}
    >
      <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      <span style={{ fontSize: '1.75rem', fontWeight: 800, color: accent ? '#fff' : '#4c1d95', letterSpacing: '-0.5px', fontFamily: "'Sora', sans-serif" }}>{value}</span>
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: accent ? 'rgba(255,255,255,0.85)' : '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      {sub && <span style={{ fontSize: '0.72rem', color: accent ? 'rgba(255,255,255,0.65)' : '#9ca3af' }}>{sub}</span>}
    </div>
  );
}

// ─── quick exam widget ────────────────────────────────────────────────────────

function QuickExamWidget({ onStartExam }) {
  const [count, setCount] = useState(20);
  const [category, setCategory] = useState('all');

  return (
    <div style={{
      background: 'rgba(255,255,255,0.75)',
      backdropFilter: 'blur(14px)',
      borderRadius: '22px',
      padding: '1.75rem',
      border: '1px solid rgba(167,139,250,0.2)',
      boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '1.4rem' }}>⚡</span>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#4c1d95', fontFamily: "'Sora', sans-serif" }}>Szybki egzamin</h3>
      </div>

      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
        Liczba pytań: <strong style={{ color: '#4c1d95' }}>{count}</strong>
      </label>
      <input
        type="range" min={5} max={40} step={5} value={count}
        onChange={e => setCount(+e.target.value)}
        style={{ width: '100%', accentColor: '#7c3aed', marginBottom: '1rem', cursor: 'pointer' }}
      />

      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
        Kategoria
      </label>
      <select
        value={category}
        onChange={e => setCategory(e.target.value)}
        style={{
          width: '100%', padding: '0.6rem 0.75rem', borderRadius: '10px',
          border: '1.5px solid rgba(167,139,250,0.4)', background: '#f5f3ff',
          color: '#4c1d95', fontSize: '0.875rem', fontWeight: 500,
          cursor: 'pointer', outline: 'none', marginBottom: '1.25rem',
          fontFamily: "'Sora', sans-serif",
        }}
      >
        <option value="all">Wszystkie kategorie</option>
        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <button
        onClick={() => onStartExam(count, category)}
        style={{
          width: '100%', padding: '0.85rem',
          background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
          color: 'white', border: 'none', borderRadius: '12px',
          fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
          fontFamily: "'Sora', sans-serif",
          boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
          transition: 'transform 0.15s, box-shadow 0.15s',
          letterSpacing: '0.02em',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.35)'; }}
      >
        Rozpocznij egzamin 🚀
      </button>
    </div>
  );
}

// ─── exam runner ─────────────────────────────────────────────────────────────

function ExamRunner({ pool, onFinish }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());

  const q = pool[current];

  if (!q) {
    const duration = Math.round((Date.now() - startTime) / 1000);
    onFinish(score, pool.length, duration);
    return null;
  }

  const isLast = current === pool.length - 1;

  const confirm = () => {
    if (!selected) return;
    setConfirmed(true);
    if (selected === q.answer) setScore(s => s + 1);
  };

  const next = () => {
    setSelected(null);
    setConfirmed(false);
    setCurrent(c => c + 1);
  };

  const progress = ((current) / pool.length) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#f5f3ff 0%,#ede9fe 50%,#ddd6fe 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', fontFamily: "'Sora', sans-serif",
    }}>
      <div style={{
        width: '100%', maxWidth: '680px',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(16px)',
        borderRadius: '28px', padding: '2.5rem',
        boxShadow: '0 20px 60px rgba(124,58,237,0.15)',
        border: '1px solid rgba(167,139,250,0.2)',
      }}>
        {/* progress */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Pytanie {current + 1} / {pool.length}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{q.category}</span>
        </div>
        <div style={{ height: '6px', background: '#ede9fe', borderRadius: '99px', marginBottom: '1.75rem', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg,#7c3aed,#a78bfa)',
            borderRadius: '99px',
            transition: 'width 0.4s ease',
          }} />
        </div>

        <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1f1f2e', lineHeight: 1.55, marginBottom: '1.75rem' }}>
          {q.question}
        </p>

        {q.type === 'closed' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {Object.entries(q.options).map(([key, val]) => {
              let bg = 'rgba(245,243,255,0.8)';
              let border = '1.5px solid rgba(167,139,250,0.25)';
              let color = '#4c1d95';
              if (confirmed) {
                if (key === q.answer) { bg = '#d1fae5'; border = '1.5px solid #34d399'; color = '#065f46'; }
                else if (key === selected) { bg = '#fee2e2'; border = '1.5px solid #f87171'; color = '#991b1b'; }
              } else if (key === selected) {
                bg = '#ede9fe'; border = '1.5px solid #7c3aed';
              }
              return (
                <button
                  key={key}
                  disabled={confirmed}
                  onClick={() => setSelected(key)}
                  style={{
                    background: bg, border, color,
                    borderRadius: '12px', padding: '0.85rem 1rem',
                    textAlign: 'left', cursor: confirmed ? 'default' : 'pointer',
                    fontSize: '0.9rem', fontWeight: 500,
                    transition: 'all 0.15s', fontFamily: "'Sora', sans-serif",
                    display: 'flex', gap: '0.75rem', alignItems: 'center',
                  }}
                >
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '26px', height: '26px', borderRadius: '8px',
                    background: key === selected && !confirmed ? '#7c3aed' : 'rgba(167,139,250,0.2)',
                    color: key === selected && !confirmed ? '#fff' : '#7c3aed',
                    fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
                  }}>{key}</span>
                  {val}
                </button>
              );
            })}
          </div>
        )}

        {confirmed && q.explanation && (
          <div style={{
            marginTop: '1rem', padding: '0.9rem 1rem',
            background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
            borderRadius: '12px', border: '1px solid #86efac',
            fontSize: '0.85rem', color: '#166534', lineHeight: 1.5,
          }}>
            💡 {q.explanation}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          {!confirmed ? (
            <button
              onClick={confirm}
              disabled={!selected}
              style={{
                flex: 1, padding: '0.9rem',
                background: selected ? 'linear-gradient(135deg,#7c3aed,#a78bfa)' : '#e5e7eb',
                color: selected ? '#fff' : '#9ca3af',
                border: 'none', borderRadius: '12px',
                fontWeight: 700, fontSize: '0.9rem', cursor: selected ? 'pointer' : 'not-allowed',
                fontFamily: "'Sora', sans-serif",
                transition: 'all 0.2s',
              }}
            >Sprawdź odpowiedź</button>
          ) : (
            <button
              onClick={next}
              style={{
                flex: 1, padding: '0.9rem',
                background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
                color: '#fff', border: 'none', borderRadius: '12px',
                fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                fontFamily: "'Sora', sans-serif",
                boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
              }}
            >{isLast ? 'Zakończ egzamin ✅' : 'Następne pytanie →'}</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── result screen ────────────────────────────────────────────────────────────

function ResultScreen({ score, total, duration, onBack }) {
  const pct = Math.round((score / total) * 100);
  const pass = pct >= 75;
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#f5f3ff,#ede9fe,#ddd6fe)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', fontFamily: "'Sora', sans-serif",
    }}>
      <div style={{
        width: '100%', maxWidth: '480px', textAlign: 'center',
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(16px)',
        borderRadius: '28px', padding: '3rem 2.5rem',
        boxShadow: '0 20px 60px rgba(124,58,237,0.15)',
        border: '1px solid rgba(167,139,250,0.2)',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>
          {pass ? '🏆' : '📚'}
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4c1d95', margin: '0 0 0.25rem' }}>
          {pass ? 'Świetny wynik!' : 'Jeszcze trochę!'}
        </h2>
        <p style={{ color: '#9ca3af', marginBottom: '2rem', fontSize: '0.9rem' }}>
          {pass ? 'Zdałeś próbny egzamin!' : 'Wymagane min. 75% do zaliczenia.'}
        </p>

        <div style={{
          display: 'flex', justifyContent: 'center', gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: pass ? '#7c3aed' : '#ef4444' }}>{pct}%</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wynik</div>
          </div>
          <div style={{ width: '1px', background: '#e5e7eb' }} />
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4c1d95' }}>{score}/{total}</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Punkty</div>
          </div>
          <div style={{ width: '1px', background: '#e5e7eb' }} />
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4c1d95' }}>{formatDuration(duration)}</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Czas</div>
          </div>
        </div>

        <button
          onClick={onBack}
          style={{
            width: '100%', padding: '0.9rem',
            background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
            color: '#fff', border: 'none', borderRadius: '12px',
            fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
            fontFamily: "'Sora', sans-serif",
            boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
          }}
        >← Wróć do dashboardu</button>
      </div>
    </div>
  );
}

// ─── main dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState(loadData);
  const [examPool, setExamPool] = useState(null);
  const [result, setResult] = useState(null);

  const sessions = data.sessions;
  const totalSessions = sessions.length;
  const bestScore = sessions.length ? Math.max(...sessions.map(s => Math.round((s.score / s.total) * 100))) : 0;
  const avgScore = sessions.length
    ? Math.round(sessions.reduce((a, s) => a + (s.score / s.total) * 100, 0) / sessions.length)
    : 0;
  const lastSession = sessions[sessions.length - 1];

  const startExam = (count, category) => {
    let pool = category === 'all'
      ? [...questions]
      : questions.filter(q => q.category === category);
    pool = pool.sort(() => Math.random() - 0.5).slice(0, count);
    setExamPool(pool);
    setResult(null);
  };

  const finishExam = (score, total, duration) => {
    const newSession = {
      date: new Date().toISOString().split('T')[0],
      score, total, duration,
    };
    const updated = { ...data, sessions: [...data.sessions, newSession] };
    setData(updated);
    saveData(updated);
    setExamPool(null);
    setResult({ score, total, duration });
  };

  if (examPool) {
    return <ExamRunner pool={examPool} onFinish={finishExam} />;
  }

  if (result) {
    return <ResultScreen {...result} onBack={() => setResult(null)} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg,#f5f3ff 0%,#ede9fe 40%,#e0e7ff 100%)',
      fontFamily: "'Sora', sans-serif",
    }}>
      {/* top nav */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 2rem',
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(167,139,250,0.15)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontSize: '1.3rem', fontWeight: 800, color: '#7c3aed',
              background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>ExamIQ</span>
          </Link>
          <nav style={{ display: 'flex', gap: '0.25rem' }}>
            {[['/', 'Home'], ['/learn', 'Nauka'], ['/exam', 'Dashboard'], ['/about', 'O nas']].map(([path, label]) => (
              <Link key={path} to={path} style={{
                textDecoration: 'none', padding: '0.4rem 0.9rem',
                borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600,
                color: path === '/exam' ? '#7c3aed' : '#6b7280',
                background: path === '/exam' ? 'rgba(124,58,237,0.1)' : 'transparent',
                transition: 'all 0.15s',
              }}>{label}</Link>
            ))}
          </nav>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          background: 'rgba(124,58,237,0.08)', borderRadius: '99px',
          padding: '0.4rem 0.9rem',
        }}>
          <span style={{ fontSize: '1.1rem' }}>🔥</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#7c3aed' }}>
            {data.user.streak} dni z rzędu
          </span>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* greeting */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2rem', fontWeight: 800, color: '#4c1d95',
            margin: '0 0 0.25rem', letterSpacing: '-0.5px',
          }}>
            Cześć, {data.user.name}! 👋
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem', margin: 0 }}>
            Twój dashboard egzaminacyjny INF04
          </p>
        </div>

        {/* stat cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem', marginBottom: '2rem',
        }}>
          <StatCard icon="📝" label="Egzaminów" value={totalSessions} sub="łącznie wykonanych" accent />
          <StatCard icon="🏆" label="Najlepszy wynik" value={`${bestScore}%`} sub="rekord osobisty" />
          <StatCard icon="📊" label="Średnia" value={`${avgScore}%`} sub="ze wszystkich sesji" />
          <StatCard icon="🔥" label="Seria" value={`${data.user.streak}d`} sub="dni nauki z rzędu" />
          <StatCard icon="⏱️" label="Ostatnia sesja" value={lastSession ? `${Math.round((lastSession.score / lastSession.total) * 100)}%` : '—'} sub={lastSession ? formatDate(lastSession.date) : 'brak danych'} />
        </div>

        {/* main grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: '1.5rem',
          alignItems: 'start',
        }}>
          {/* left col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* chart card */}
            <div style={{
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(14px)',
              borderRadius: '22px', padding: '1.75rem',
              border: '1px solid rgba(167,139,250,0.2)',
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#4c1d95' }}>
                  📈 Postępy (ostatnie sesje)
                </h3>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 600,
                  color: avgScore >= 75 ? '#059669' : '#ef4444',
                  background: avgScore >= 75 ? '#d1fae5' : '#fee2e2',
                  padding: '0.2rem 0.6rem', borderRadius: '99px',
                }}>
                  {avgScore >= 75 ? '✓ Na poziomie' : '↑ Poniżej progu'}
                </span>
              </div>
              <MiniBarChart sessions={sessions} />
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'linear-gradient(135deg,#a78bfa,#7c3aed)' }} />
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Zaliczone (≥75%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'linear-gradient(135deg,#f87171,#b91c1c)' }} />
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Niezaliczone</span>
                </div>
              </div>
            </div>

            {/* history table */}
            <div style={{
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(14px)',
              borderRadius: '22px', padding: '1.75rem',
              border: '1px solid rgba(167,139,250,0.2)',
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
            }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: '#4c1d95' }}>
                📋 Historia egzaminów
              </h3>
              {sessions.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>
                  Brak historii. Zacznij pierwszy egzamin!
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr>
                        {['Data', 'Wynik', 'Punkty', 'Czas', 'Status'].map(h => (
                          <th key={h} style={{
                            textAlign: 'left', padding: '0.5rem 0.75rem',
                            color: '#9ca3af', fontWeight: 600, fontSize: '0.75rem',
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                            borderBottom: '1px solid rgba(167,139,250,0.15)',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...sessions].reverse().map((s, i) => {
                        const pct = Math.round((s.score / s.total) * 100);
                        const pass = pct >= 75;
                        return (
                          <tr key={i} style={{
                            borderBottom: '1px solid rgba(167,139,250,0.08)',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.03)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '0.75rem', color: '#6b7280' }}>{formatDate(s.date)}</td>
                            <td style={{ padding: '0.75rem', fontWeight: 700, color: pass ? '#7c3aed' : '#ef4444' }}>{pct}%</td>
                            <td style={{ padding: '0.75rem', color: '#4c1d95' }}>{s.score}/{s.total}</td>
                            <td style={{ padding: '0.75rem', color: '#6b7280' }}>{formatDuration(s.duration)}</td>
                            <td style={{ padding: '0.75rem' }}>
                              <span style={{
                                fontSize: '0.72rem', fontWeight: 600,
                                padding: '0.2rem 0.6rem', borderRadius: '99px',
                                background: pass ? '#d1fae5' : '#fee2e2',
                                color: pass ? '#065f46' : '#991b1b',
                              }}>{pass ? '✓ Zaliczony' : '✗ Nie zaliczony'}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* right col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <QuickExamWidget onStartExam={startExam} />

            {/* categories */}
            <div style={{
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(14px)',
              borderRadius: '22px', padding: '1.75rem',
              border: '1px solid rgba(167,139,250,0.2)',
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
            }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: '#4c1d95' }}>
                🗂️ Kategorie pytań
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {CATEGORIES.map(cat => {
                  const count = questions.filter(q => q.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => startExam(Math.min(10, count), cat)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.65rem 0.9rem',
                        background: 'rgba(245,243,255,0.8)',
                        border: '1px solid rgba(167,139,250,0.2)',
                        borderRadius: '10px', cursor: 'pointer',
                        transition: 'all 0.15s', fontFamily: "'Sora', sans-serif",
                        textAlign: 'left',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.35)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,243,255,0.8)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.2)'; }}
                    >
                      <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#4c1d95', lineHeight: 1.3 }}>{cat}</span>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 700, color: '#7c3aed',
                        background: 'rgba(124,58,237,0.1)', padding: '0.15rem 0.5rem',
                        borderRadius: '99px', flexShrink: 0, marginLeft: '0.5rem',
                      }}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* tip */}
            <div style={{
              background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
              borderRadius: '18px', padding: '1.25rem 1.5rem',
              boxShadow: '0 8px 24px rgba(124,58,237,0.3)',
            }}>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                💡 Wskazówka
              </p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#fff', lineHeight: 1.5 }}>
                Regularne powtórki po 20 pytań są skuteczniejsze niż jednorazowe sesje maratońskie. Cel: 75% = zdany egzamin!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}