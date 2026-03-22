// pages/DashboardPage.jsx
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import questions from '../data/questions.json';
import { useUserSession } from '../hooks/useUserSession';
import Header from '../components/Header';
import { usePageTitle } from '../hooks/usePageTitle';

// ─── shared glass-card style object ───────────────────────────────────────────
const glassCard = {
  background: 'rgba(255,255,255,0.75)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  borderRadius: 22,
  border: '1px solid rgba(167,139,250,0.2)',
  boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDuration(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec < 10 ? '0' : ''}${sec}s`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
}

const ALL_QUESTIONS = questions;
const CATEGORIES = [...new Set(ALL_QUESTIONS.map(q => q.category))];

// ─── MiniBarChart ─────────────────────────────────────────────────────────────

function MiniBarChart({ sessions }) {
  const last6 = sessions.slice(-6);
  if (!last6.length) return (
    <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Brak danych – zrób pierwszy egzamin!</span>
    </div>
  );
  const max = Math.max(...last6.map(s => s.score), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
      {last6.map((s, i) => {
        const pct = (s.score / max) * 100;
        const pass = s.score / s.total >= 0.75;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: 10, color: '#a78bfa', fontWeight: 700 }}>{s.score}</span>
            <div style={{ width: '100%', height: `${Math.max(pct * 0.5, 4)}px`, borderRadius: '4px 4px 2px 2px', background: pass ? 'linear-gradient(180deg,#a78bfa,#7c3aed)' : 'linear-gradient(180deg,#f87171,#b91c1c)' }} />
            <span style={{ fontSize: 9, color: '#9ca3af', whiteSpace: 'nowrap' }}>{formatDate(s.date)}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      style={{ background: accent ? 'linear-gradient(135deg,#7c3aed,#a78bfa)' : glassCard.background, backdropFilter: glassCard.backdropFilter, WebkitBackdropFilter: glassCard.WebkitBackdropFilter, borderRadius: 18, padding: '1.25rem 1.5rem', border: accent ? 'none' : glassCard.border, boxShadow: accent ? '0 8px 32px rgba(124,58,237,0.3)' : glassCard.boxShadow, transition: 'transform .2s' }}
    >
      <span style={{ fontSize: '1.4rem' }}>{icon}</span>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: accent ? '#fff' : '#4c1d95', letterSpacing: '-0.5px', fontFamily: "'Sora',sans-serif", marginTop: 4 }}>{value}</div>
      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: accent ? 'rgba(255,255,255,0.8)' : '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: accent ? 'rgba(255,255,255,0.6)' : '#9ca3af', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ─── CategoryBar ──────────────────────────────────────────────────────────────

function CategoryBar({ name, attempts, correct }) {
  const pct = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
  const pass = pct >= 75;
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '0.78rem', color: '#4c1d95', fontWeight: 500 }}>{name}</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: pass ? '#7c3aed' : '#ef4444' }}>{pct}% ({correct}/{attempts})</span>
      </div>
      <div style={{ height: 7, background: '#ede9fe', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: pass ? 'linear-gradient(90deg,#7c3aed,#a78bfa)' : 'linear-gradient(90deg,#f87171,#fca5a5)', borderRadius: 99, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

// ─── WelcomeScreen ────────────────────────────────────────────────────────────

function WelcomeScreen({ onSave }) {
  const [val, setVal] = useState('');
  const valid = val.trim().length > 0;
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#f5f3ff,#ede9fe,#ddd6fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Sora',sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 440, textAlign: 'center', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)', borderRadius: 28, padding: '3rem 2.5rem', boxShadow: '0 20px 60px rgba(124,58,237,0.18)', border: '1px solid rgba(167,139,250,0.25)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4c1d95', margin: '0 0 0.5rem', letterSpacing: '-0.5px' }}>Witaj w ExamIQ!</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>Zanim zaczniesz, ustaw swój nick.<br />Twoje postępy będą zapisywane lokalnie.</p>
        <input
          autoFocus
          placeholder="Wpisz swój nick..."
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && valid) onSave(val); }}
          maxLength={24}
          style={{ width: '100%', padding: '0.85rem 1rem', border: '2px solid rgba(124,58,237,0.35)', borderRadius: 12, fontSize: '1rem', fontFamily: "'Sora',sans-serif", color: '#4c1d95', background: '#f5f3ff', outline: 'none', boxSizing: 'border-box', marginBottom: '1rem' }}
          onFocus={e => e.target.style.borderColor = '#7c3aed'}
          onBlur={e => e.target.style.borderColor = 'rgba(124,58,237,0.35)'}
        />
        <button
          disabled={!valid}
          onClick={() => onSave(val)}
          style={{ width: '100%', padding: '0.9rem', background: valid ? 'linear-gradient(135deg,#7c3aed,#a78bfa)' : '#e5e7eb', color: valid ? '#fff' : '#9ca3af', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem', cursor: valid ? 'pointer' : 'not-allowed', fontFamily: "'Sora',sans-serif" }}
        >Zaczynamy 🚀</button>
      </div>
    </div>
  );
}

// ─── NameEditor ───────────────────────────────────────────────────────────────

function NameEditor({ current, onSave }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(current);
  if (!editing) return (
    <button
      onClick={() => { setVal(current); setEditing(true); }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.08)'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7c3aed', fontSize: '0.8rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: 6, fontFamily: "'Sora',sans-serif" }}
    >✏️ Zmień nick</button>
  );
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <input
        autoFocus value={val} onChange={e => setVal(e.target.value)} maxLength={24}
        onKeyDown={e => { if (e.key === 'Enter' && val.trim()) { onSave(val); setEditing(false); } if (e.key === 'Escape') setEditing(false); }}
        style={{ border: '1.5px solid rgba(124,58,237,0.4)', borderRadius: 8, padding: '0.3rem 0.6rem', fontSize: '0.875rem', fontFamily: "'Sora',sans-serif", color: '#4c1d95', background: '#f5f3ff', outline: 'none', width: 150 }}
      />
      <button onClick={() => { if (val.trim()) { onSave(val); setEditing(false); } }} style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 7, padding: '0.3rem 0.7rem', fontSize: '0.8rem', cursor: 'pointer', fontFamily: "'Sora',sans-serif" }}>Zapisz</button>
      <button onClick={() => setEditing(false)} style={{ background: 'none', border: '1px solid #e5e7eb', color: '#9ca3af', borderRadius: 7, padding: '0.3rem 0.6rem', fontSize: '0.8rem', cursor: 'pointer', fontFamily: "'Sora',sans-serif" }}>✕</button>
    </div>
  );
}

// ─── QuickExamWidget ──────────────────────────────────────────────────────────

function QuickExamWidget({ onStart }) {
  const [category, setCategory] = useState('all');
  const [count, setCount] = useState(20);

  const poolSize = category === 'all'
    ? ALL_QUESTIONS.length
    : ALL_QUESTIONS.filter(q => q.category === category).length;

  const safeCount = Math.min(count, poolSize);

  function handleCategoryChange(newCat) {
    setCategory(newCat);
    const newPoolSize = newCat === 'all'
      ? ALL_QUESTIONS.length
      : ALL_QUESTIONS.filter(q => q.category === newCat).length;
    setCount(Math.min(count, newPoolSize));
  }

  function handleCountChange(raw) {
    const n = parseInt(raw, 10);
    if (isNaN(n)) return;
    setCount(Math.max(1, Math.min(poolSize, n)));
  }

  return (
    <div style={{ ...glassCard, padding: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '1.3rem' }}>⚡</span>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#4c1d95', fontFamily: "'Sora',sans-serif" }}>Szybki egzamin</h3>
      </div>

      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Kategoria</label>
      <select
        value={category}
        onChange={e => handleCategoryChange(e.target.value)}
        style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 10, border: '1.5px solid rgba(167,139,250,0.35)', background: '#f5f3ff', color: '#4c1d95', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', outline: 'none', marginBottom: '1.25rem', fontFamily: "'Sora',sans-serif" }}
      >
        <option value="all">Wszystkie kategorie ({ALL_QUESTIONS.length})</option>
        {CATEGORIES.map(c => (
          <option key={c} value={c}>{c} ({ALL_QUESTIONS.filter(q => q.category === c).length})</option>
        ))}
      </select>

      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        Liczba pytań: <strong style={{ color: '#4c1d95' }}>{safeCount}</strong> <span style={{ color: '#9ca3af', fontWeight: 400, textTransform: 'none' }}>z {poolSize}</span>
      </label>
      <input
        type="number" min={1} max={poolSize} value={safeCount}
        onChange={e => handleCountChange(e.target.value)}
        style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 10, border: '1.5px solid rgba(167,139,250,0.35)', background: '#f5f3ff', color: '#4c1d95', fontSize: '1rem', fontWeight: 700, outline: 'none', marginBottom: '0.75rem', fontFamily: "'Sora',sans-serif", boxSizing: 'border-box', textAlign: 'center' }}
      />
      <input
        type="range" min={1} max={poolSize} value={safeCount}
        onChange={e => handleCountChange(e.target.value)}
        style={{ width: '100%', accentColor: '#7c3aed', marginBottom: '1.25rem', cursor: 'pointer', display: 'block' }}
      />

      <button
        onClick={() => onStart(safeCount, category)}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        style={{ width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', color: '#fff', border: 'none', borderRadius: 12, fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora',sans-serif", boxShadow: '0 4px 16px rgba(124,58,237,0.35)', transition: 'transform 0.15s' }}
      >Rozpocznij egzamin 🚀</button>
    </div>
  );
}

// ─── ExamRunner ───────────────────────────────────────────────────────────────

function ExamRunner({ pool, category, onFinish }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const scoreRef     = useRef(0);
  const resultsRef   = useRef([]);
  const startTime    = useRef(Date.now());
  const finishedRef  = useRef(false);

  const q = pool[current];

  if (!q) {
    if (!finishedRef.current) {
      finishedRef.current = true;
      const s = scoreRef.current;
      const r = resultsRef.current.slice();
      const d = Math.round((Date.now() - startTime.current) / 1000);
      Promise.resolve().then(() => onFinish({ score: s, total: pool.length, duration: d, category, questions: r }));
    }
    return null;
  }

  const confirm = () => {
    if (!selected || confirmed) return;
    const correct = selected === q.answer;
    if (correct) scoreRef.current += 1;
    resultsRef.current.push({ categoryName: q.category, wasCorrect: correct });
    setConfirmed(true);
  };

  const next = () => { setSelected(null); setConfirmed(false); setCurrent(c => c + 1); };
  const pct = (current / pool.length) * 100;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#f5f3ff,#ede9fe,#ddd6fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Sora',sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 680, background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)', borderRadius: 28, padding: '2.5rem', boxShadow: '0 20px 60px rgba(124,58,237,0.15)', border: '1px solid rgba(167,139,250,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pytanie {current + 1} / {pool.length}</span>
          <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{q.category}</span>
        </div>
        <div style={{ height: 6, background: '#ede9fe', borderRadius: 99, marginBottom: '1.75rem', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#7c3aed,#a78bfa)', borderRadius: 99, transition: 'width 0.4s ease' }} />
        </div>
        <p style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1f1f2e', lineHeight: 1.6, marginBottom: '1.5rem' }}>{q.question}</p>
        {q.type === 'closed' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {Object.entries(q.options).map(([key, val]) => {
              let bg = 'rgba(245,243,255,0.8)', border = '1.5px solid rgba(167,139,250,0.2)', color = '#4c1d95';
              if (confirmed) {
                if (key === q.answer) { bg = '#d1fae5'; border = '1.5px solid #34d399'; color = '#065f46'; }
                else if (key === selected) { bg = '#fee2e2'; border = '1.5px solid #f87171'; color = '#991b1b'; }
              } else if (key === selected) { bg = '#ede9fe'; border = '1.5px solid #7c3aed'; }
              return (
                <button key={key} disabled={confirmed} onClick={() => setSelected(key)}
                  style={{ background: bg, border, color, borderRadius: 12, padding: '0.8rem 1rem', textAlign: 'left', cursor: confirmed ? 'default' : 'pointer', fontSize: '0.875rem', fontWeight: 500, fontFamily: "'Sora',sans-serif", display: 'flex', gap: '0.75rem', alignItems: 'center', transition: 'all 0.15s' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 8, background: key === selected && !confirmed ? '#7c3aed' : 'rgba(167,139,250,0.18)', color: key === selected && !confirmed ? '#fff' : '#7c3aed', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0 }}>{key}</span>
                  {val}
                </button>
              );
            })}
          </div>
        )}
        {confirmed && q.explanation && (
          <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderRadius: 12, border: '1px solid #86efac', fontSize: '0.82rem', color: '#166534', lineHeight: 1.5 }}>
            💡 {q.explanation}
          </div>
        )}
        <div style={{ marginTop: '1.5rem' }}>
          {!confirmed
            ? <button onClick={confirm} disabled={!selected} style={{ width: '100%', padding: '0.9rem', background: selected ? 'linear-gradient(135deg,#7c3aed,#a78bfa)' : '#e5e7eb', color: selected ? '#fff' : '#9ca3af', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '0.9rem', cursor: selected ? 'pointer' : 'not-allowed', fontFamily: "'Sora',sans-serif" }}>Sprawdź odpowiedź</button>
            : <button onClick={next} style={{ width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: "'Sora',sans-serif", boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}>
                {current === pool.length - 1 ? 'Zakończ ✅' : 'Następne →'}
              </button>
          }
        </div>
      </div>
    </div>
  );
}

// ─── ResultScreen ─────────────────────────────────────────────────────────────

function ResultScreen({ score, total, duration, onBack }) {
  const pct = Math.round((score / total) * 100);
  const pass = pct >= 75;
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#f5f3ff,#ede9fe,#ddd6fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Sora',sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 480, textAlign: 'center', background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)', borderRadius: 28, padding: '3rem 2.5rem', boxShadow: '0 20px 60px rgba(124,58,237,0.15)', border: '1px solid rgba(167,139,250,0.2)' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>{pass ? '🏆' : '📚'}</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4c1d95', margin: '0 0 0.25rem', fontFamily: "'Sora',sans-serif" }}>{pass ? 'Świetny wynik!' : 'Jeszcze trochę!'}</h2>
        <p style={{ color: '#9ca3af', marginBottom: '2rem', fontSize: '0.875rem' }}>{pass ? 'Zdałeś próbny egzamin INF04!' : 'Wymagane min. 75% do zaliczenia.'}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          {[[pass ? '#7c3aed' : '#ef4444', `${pct}%`, 'Wynik'], ['#4c1d95', `${score}/${total}`, 'Punkty'], ['#4c1d95', formatDuration(duration), 'Czas']].map(([color, val, label], i) => (
            <div key={i}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color }}>{val}</div>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.8rem', color: '#a78bfa', marginBottom: '1.5rem' }}>✅ Wynik zapisany w Twoim profilu</p>
        <button onClick={onBack} style={{ width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: "'Sora',sans-serif", boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}>
          ← Wróć do dashboardu
        </button>
      </div>
    </div>
  );
}

// ─── DashboardPage ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  usePageTitle('Panel użytkownika')
  const { session, history, categoryProgress, stats, setName, saveExamResult, resetAll } = useUserSession();
  const [examPool, setExamPool]         = useState(null);
  const [examCategory, setExamCategory] = useState('all');
  const [result, setResult]             = useState(null);
  const [showReset, setShowReset]       = useState(false);

  function startExam(count, category) {
    const base = category === 'all'
      ? ALL_QUESTIONS.slice()
      : ALL_QUESTIONS.filter(q => q.category === category);
    const pool = base
      .map(q => ({ q, r: Math.random() }))
      .sort((a, b) => a.r - b.r)
      .map(x => x.q)
      .slice(0, count);
    setExamPool(pool);
    setExamCategory(category);
    setResult(null);
  }

  function finishExam(resultData) {
    saveExamResult(resultData);
    setExamPool(null);
    setResult(resultData);
  }

  if (examPool)      return <ExamRunner pool={examPool} category={examCategory} onFinish={finishExam} />;
  if (result)        return <ResultScreen {...result} onBack={() => setResult(null)} />;
  if (session.isNew) return <WelcomeScreen onSave={setName} />;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#f5f3ff,#ede9fe 40%,#e0e7ff)', fontFamily: "'Sora',sans-serif" }}>

      {/* POPRAWKA: używamy wspólnego komponentu Header zamiast własnego nav */}
      <Header />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* GREETING + streak */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#4c1d95', margin: '0 0 0.2rem', letterSpacing: '-0.5px' }}>Cześć, {session.name}! 👋</h1>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0 }}>Ostatnia aktywność: {session.lastActive}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(124,58,237,0.08)', borderRadius: 99, padding: '0.4rem 0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🔥</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#7c3aed' }}>{session.streak} dni z rzędu</span>
            </div>
            <NameEditor current={session.name} onSave={setName} />
          </div>
        </div>

        {/* STAT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard icon="📝" label="Egzaminów" value={stats.total} sub="wykonanych" accent />
          <StatCard icon="🏆" label="Rekord" value={stats.total ? `${stats.best}%` : '—'} sub="najlepszy wynik" />
          <StatCard icon="📊" label="Średnia" value={stats.total ? `${stats.avg}%` : '—'} sub="ze wszystkich sesji" />
          <StatCard icon="✅" label="Zdanych" value={stats.total ? `${stats.passRate}%` : '—'} sub="sesji ≥ 75%" />
          <StatCard icon="🔥" label="Seria" value={`${session.streak}d`} sub="dni nauki z rzędu" />
        </div>

        {/* MAIN GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>

          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* chart */}
            <div style={{ ...glassCard, padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#4c1d95' }}>📈 Ostatnie sesje</h3>
                {stats.total > 0 && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 99, background: stats.avg >= 75 ? '#d1fae5' : '#fee2e2', color: stats.avg >= 75 ? '#065f46' : '#991b1b' }}>
                    {stats.avg >= 75 ? '✓ Powyżej progu' : '↑ Poniżej progu'}
                  </span>
                )}
              </div>
              <MiniBarChart sessions={history} />
              <div style={{ marginTop: 8, display: 'flex', gap: '1.25rem' }}>
                {[['linear-gradient(135deg,#a78bfa,#7c3aed)', 'Zaliczone (≥75%)'], ['linear-gradient(135deg,#f87171,#b91c1c)', 'Niezaliczone']].map(([bg, label]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: bg }} />
                    <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* category progress */}
            <div style={{ ...glassCard, padding: '1.75rem' }}>
              <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: '#4c1d95' }}>🗂️ Postęp per kategoria</h3>
              {Object.keys(categoryProgress).length === 0
                ? <p style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>Brak danych — zrób egzamin żeby zobaczyć postęp!</p>
                : Object.entries(categoryProgress).map(([cat, data]) => (
                    <CategoryBar key={cat} name={cat} attempts={data.attempts} correct={data.correct} />
                  ))
              }
            </div>

            {/* history */}
            <div style={{ ...glassCard, padding: '1.75rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: '#4c1d95' }}>📋 Historia egzaminów</h3>
              {history.length === 0
                ? <p style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>Brak historii. Zacznij pierwszy egzamin!</p>
                : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <thead>
                        <tr>{['Data', 'Kategoria', 'Wynik', 'Punkty', 'Czas', 'Status'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: '#9ca3af', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(167,139,250,0.15)' }}>{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody>
                        {[...history].reverse().map((s, i) => {
                          // POPRAWKA: stabilny klucz zamiast indeksu
                          const rowKey = `${s.date}-${s.score}-${s.total}-${i}`;
                          const pct = Math.round((s.score / s.total) * 100);
                          const pass = pct >= 75;
                          return (
                            <tr key={rowKey}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.03)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              style={{ borderBottom: '1px solid rgba(167,139,250,0.08)', transition: 'background 0.15s' }}>
                              <td style={{ padding: '0.7rem 0.75rem', color: '#6b7280' }}>{formatDate(s.date)}</td>
                              <td style={{ padding: '0.7rem 0.75rem', color: '#9ca3af', fontSize: '0.78rem' }}>{s.category === 'all' ? 'Wszystkie' : s.category}</td>
                              <td style={{ padding: '0.7rem 0.75rem', fontWeight: 700, color: pass ? '#7c3aed' : '#ef4444' }}>{pct}%</td>
                              <td style={{ padding: '0.7rem 0.75rem', color: '#4c1d95' }}>{s.score}/{s.total}</td>
                              <td style={{ padding: '0.7rem 0.75rem', color: '#6b7280' }}>{formatDuration(s.duration)}</td>
                              <td style={{ padding: '0.7rem 0.75rem' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: 99, background: pass ? '#d1fae5' : '#fee2e2', color: pass ? '#065f46' : '#991b1b' }}>
                                  {pass ? '✓ Zaliczony' : '✗ Niezaliczony'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              }
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <QuickExamWidget onStart={startExam} />

            {/* trenuj kategorię */}
            <div style={{ ...glassCard, padding: '1.75rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: '#4c1d95' }}>⚡ Trenuj kategorię</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {CATEGORIES.map(cat => {
                  const catQ = ALL_QUESTIONS.filter(item => item.category === cat);
                  const prog = categoryProgress[cat];
                  const pct = prog ? Math.round((prog.correct / prog.attempts) * 100) : null;
                  return (
                    <button key={cat}
                      onClick={() => startExam(catQ.length, cat)}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,243,255,0.8)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.2)'; }}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.9rem', background: 'rgba(245,243,255,0.8)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 10, cursor: 'pointer', fontFamily: "'Sora',sans-serif", textAlign: 'left', transition: 'all 0.15s' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 500, color: '#4c1d95', lineHeight: 1.3 }}>{cat}</span>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0, marginLeft: 6 }}>
                        {pct !== null && <span style={{ fontSize: '0.7rem', fontWeight: 700, color: pct >= 75 ? '#059669' : '#ef4444' }}>{pct}%</span>}
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#7c3aed', background: 'rgba(124,58,237,0.1)', padding: '0.15rem 0.45rem', borderRadius: 99 }}>{catQ.length}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* tip */}
            <div style={{ background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', borderRadius: 18, padding: '1.25rem 1.5rem', boxShadow: '0 8px 24px rgba(124,58,237,0.3)' }}>
              <p style={{ margin: '0 0 0.4rem', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>💡 Wskazówka</p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#fff', lineHeight: 1.55 }}>
                Regularne powtórki po 20 pytań są skuteczniejsze niż sesje maratońskie. Cel: <strong>75%</strong> = zdany egzamin!
              </p>
            </div>

            {/* reset */}
            <div style={{ textAlign: 'center' }}>
              {!showReset
                ? <button onClick={() => setShowReset(true)}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', fontSize: '0.75rem', fontFamily: "'Sora',sans-serif" }}>
                    🗑️ Zresetuj wszystkie dane
                  </button>
                : (
                  <div style={{ background: '#fff', borderRadius: 12, padding: '1rem', border: '1px solid #fca5a5' }}>
                    <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: '#991b1b', fontWeight: 600 }}>Na pewno? Usuwa całą historię i postęp.</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { resetAll(); setShowReset(false); }} style={{ flex: 1, padding: '0.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', fontFamily: "'Sora',sans-serif" }}>Tak, usuń</button>
                      <button onClick={() => setShowReset(false)} style={{ flex: 1, padding: '0.5rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', fontFamily: "'Sora',sans-serif" }}>Anuluj</button>
                    </div>
                  </div>
                )
              }
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}