// pages/DashboardPage.jsx
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import questions from '../data/questions.json';
import { useUserSession } from '../hooks/useUserSession';
import Header from '../components/Header';
import { usePageTitle } from '../hooks/usePageTitle';
import Footer from '../components/Footer';
import './DashboardPage.css';

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
            <div style={{
              width: '100%',
              height: `${Math.max(pct * 0.5, 4)}px`,
              borderRadius: '4px 4px 2px 2px',
              background: pass
                ? 'linear-gradient(180deg,#a78bfa,#7c3aed)'
                : 'linear-gradient(180deg,#f87171,#b91c1c)',
            }} />
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
    <div className={`stat-card${accent ? ' stat-card--accent' : ''}`}>
      <Icon icon={icon} style={{ fontSize: '1.4rem', color: accent ? 'rgba(255,255,255,0.9)' : '#7c3aed' }} />
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
      {sub && <div className="stat-card__sub">{sub}</div>}
    </div>
  );
}

// ─── CategoryBar ──────────────────────────────────────────────────────────────

function CategoryBar({ name, attempts, correct }) {
  const pct = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
  const pass = pct >= 75;
  return (
    <div className="category-bar">
      <div className="category-bar__header">
        <span className="category-bar__name">{name}</span>
        <span className={`category-bar__pct category-bar__pct--${pass ? 'pass' : 'fail'}`}>
          {pct}% ({correct}/{attempts})
        </span>
      </div>
      <div className="category-bar__track">
        <div
          className={`category-bar__fill category-bar__fill--${pass ? 'pass' : 'fail'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── WelcomeScreen ────────────────────────────────────────────────────────────

function WelcomeScreen({ onSave }) {
  const [val, setVal] = useState('');
  const valid = val.trim().length > 0;
  return (
    <div className="dash-fullscreen">
      <div className="dash-modal" style={{ maxWidth: 440, textAlign: 'center', padding: '3rem 2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <Icon icon="lucide:hand-metal" style={{ fontSize: '3rem', color: '#7c3aed' }} />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4c1d95', margin: '0 0 0.5rem', letterSpacing: '-0.5px' }}>
          Witaj w ExamIQ!
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          Zanim zaczniesz, ustaw swój nick.<br />Twoje postępy będą zapisywane lokalnie.
        </p>
        <input
          autoFocus
          placeholder="Wpisz swój nick..."
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && valid) onSave(val); }}
          maxLength={24}
          className="dash-input"
          style={{ marginBottom: '1rem' }}
          onFocus={e => e.target.style.borderColor = '#7c3aed'}
          onBlur={e => e.target.style.borderColor = 'rgba(124,58,237,0.35)'}
        />
        <button
          disabled={!valid}
          onClick={() => onSave(val)}
          className="dash-btn-primary"
          style={{ opacity: valid ? 1 : undefined }}
        >
          Zaczynamy
          <Icon icon="lucide:rocket" style={{ fontSize: '1rem' }} />
        </button>
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
      className="dash-btn-ghost"
    >
      <Icon icon="lucide:pencil" style={{ fontSize: '0.85rem' }} />
      Zmień nick
    </button>
  );

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <input
        autoFocus value={val} onChange={e => setVal(e.target.value)} maxLength={24}
        onKeyDown={e => {
          if (e.key === 'Enter' && val.trim()) { onSave(val); setEditing(false); }
          if (e.key === 'Escape') setEditing(false);
        }}
        className="dash-input dash-input--sm"
      />
      <button
        onClick={() => { if (val.trim()) { onSave(val); setEditing(false); } }}
        className="dash-btn-save"
      >
        Zapisz
      </button>
      <button onClick={() => setEditing(false)} className="dash-btn-cancel">
        <Icon icon="lucide:x" style={{ fontSize: '0.85rem' }} />
      </button>
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
    <div className="glass-card" style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
        <Icon icon="lucide:zap" style={{ fontSize: '1.3rem', color: '#7c3aed' }} />
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#4c1d95' }}>Szybki egzamin</h3>
      </div>

      <label className="dash-label">Kategoria</label>
      <select
        value={category}
        onChange={e => handleCategoryChange(e.target.value)}
        className="dash-select"
      >
        <option value="all">Wszystkie kategorie ({ALL_QUESTIONS.length})</option>
        {CATEGORIES.map(c => (
          <option key={c} value={c}>{c} ({ALL_QUESTIONS.filter(q => q.category === c).length})</option>
        ))}
      </select>

      <label className="dash-label">
        Liczba pytań: <strong style={{ color: '#4c1d95' }}>{safeCount}</strong>{' '}
        <span style={{ color: '#9ca3af', fontWeight: 400, textTransform: 'none' }}>z {poolSize}</span>
      </label>
      <input
        type="number" min={1} max={poolSize} value={safeCount}
        onChange={e => handleCountChange(e.target.value)}
        className="dash-input dash-input--center"
        style={{ marginBottom: '0.75rem' }}
      />
      <input
        type="range" min={1} max={poolSize} value={safeCount}
        onChange={e => handleCountChange(e.target.value)}
        className="dash-range"
      />

      <button onClick={() => onStart(safeCount, category)} className="dash-btn-primary">
        Rozpocznij egzamin
        <Icon icon="lucide:rocket" style={{ fontSize: '1rem' }} />
      </button>
    </div>
  );
}

// ─── ExamRunner ───────────────────────────────────────────────────────────────

function ExamRunner({ pool, category, onFinish }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const scoreRef    = useRef(0);
  const resultsRef  = useRef([]);
  const startTime   = useRef(Date.now());
  const finishedRef = useRef(false);

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
    <div className="dash-fullscreen">
      <div className="dash-modal" style={{ maxWidth: 680, padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Pytanie {current + 1} / {pool.length}
          </span>
          <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{q.category}</span>
        </div>

        <div className="exam-progress-track">
          <div className="exam-progress-fill" style={{ width: `${pct}%` }} />
        </div>

        <p style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1f1f2e', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {q.question}
        </p>

        {q.type === 'closed' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {Object.entries(q.options).map(([key, val]) => {
              let bg = 'rgba(245,243,255,0.8)', border = '1.5px solid rgba(167,139,250,0.2)', color = '#4c1d95';
              if (confirmed) {
                if (key === q.answer)       { bg = '#d1fae5'; border = '1.5px solid #34d399'; color = '#065f46'; }
                else if (key === selected)  { bg = '#fee2e2'; border = '1.5px solid #f87171'; color = '#991b1b'; }
              } else if (key === selected)  { bg = '#ede9fe'; border = '1.5px solid #7c3aed'; }
              return (
                <button key={key} disabled={confirmed} onClick={() => setSelected(key)}
                  style={{ background: bg, border, color, borderRadius: 12, padding: '0.8rem 1rem', textAlign: 'left', cursor: confirmed ? 'default' : 'pointer', fontSize: '0.875rem', fontWeight: 500, display: 'flex', gap: '0.75rem', alignItems: 'center', transition: 'all 0.15s' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 8, background: key === selected && !confirmed ? '#7c3aed' : 'rgba(167,139,250,0.18)', color: key === selected && !confirmed ? '#fff' : '#7c3aed', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0 }}>
                    {key}
                  </span>
                  {val}
                </button>
              );
            })}
          </div>
        )}

        {confirmed && q.explanation && (
          <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderRadius: 12, border: '1px solid #86efac', fontSize: '0.82rem', color: '#166534', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <Icon icon="lucide:lightbulb" style={{ fontSize: '1rem', flexShrink: 0, marginTop: 1 }} />
            {q.explanation}
          </div>
        )}

        <div style={{ marginTop: '1.5rem' }}>
          {!confirmed
            ? <button onClick={confirm} disabled={!selected} className="dash-btn-primary">
                Sprawdź odpowiedź
              </button>
            : <button onClick={next} className="dash-btn-primary">
                {current === pool.length - 1
                  ? <><Icon icon="lucide:check-circle" style={{ fontSize: '1rem' }} /> Zakończ</>
                  : <>Następne <Icon icon="lucide:arrow-right" style={{ fontSize: '1rem' }} /></>
                }
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
    <div className="dash-fullscreen">
      <div className="dash-modal" style={{ maxWidth: 480, textAlign: 'center', padding: '3rem 2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
          <Icon
            icon={pass ? 'lucide:trophy' : 'lucide:book-open'}
            style={{ fontSize: '3.5rem', color: pass ? '#7c3aed' : '#a78bfa' }}
          />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4c1d95', margin: '0 0 0.25rem' }}>
          {pass ? 'Świetny wynik!' : 'Jeszcze trochę!'}
        </h2>
        <p style={{ color: '#9ca3af', marginBottom: '2rem', fontSize: '0.875rem' }}>
          {pass ? 'Zdałeś próbny egzamin INF04!' : 'Wymagane min. 75% do zaliczenia.'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          {[[pass ? '#7c3aed' : '#ef4444', `${pct}%`, 'Wynik'], ['#4c1d95', `${score}/${total}`, 'Punkty'], ['#4c1d95', formatDuration(duration), 'Czas']].map(([color, val, label], i) => (
            <div key={i}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color }}>{val}</div>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.8rem', color: '#a78bfa', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Icon icon="lucide:check-circle" style={{ fontSize: '0.9rem' }} />
          Wynik zapisany w Twoim profilu
        </p>
        <button onClick={onBack} className="dash-btn-primary">
          <Icon icon="lucide:arrow-left" style={{ fontSize: '1rem' }} />
          Wróć do dashboardu
        </button>
      </div>
    </div>
  );
}

// ─── DashboardPage ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  usePageTitle('Panel użytkownika');
  const { session, history, categoryProgress, stats, setName, saveExamResult, resetAll } = useUserSession();
  const [examPool,     setExamPool]     = useState(null);
  const [examCategory, setExamCategory] = useState('all');
  const [result,       setResult]       = useState(null);
  const [showReset,    setShowReset]    = useState(false);

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
    <div className="page-root">
      <Header />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* GREETING */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#4c1d95', margin: '0 0 0.2rem', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 10 }}>
              Cześć, {session.name}!
              <Icon icon="lucide:hand-metal" style={{ fontSize: '1.75rem', color: '#7c3aed' }} />
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0 }}>Ostatnia aktywność: {session.lastActive}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="tag-badge" style={{ gap: 6 }}>
              <Icon icon="lucide:flame" style={{ fontSize: '1rem', color: '#f97316' }} />
              <span style={{ color: '#7c3aed' }}>{session.streak} dni z rzędu</span>
            </div>
            <NameEditor current={session.name} onSave={setName} />
          </div>
        </div>

        {/* STAT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard icon="lucide:file-text"   label="Egzaminów"  value={stats.total}                           sub="wykonanych"          accent />
          <StatCard icon="lucide:trophy"       label="Rekord"     value={stats.total ? `${stats.best}%` : '—'}  sub="najlepszy wynik" />
          <StatCard icon="lucide:bar-chart-2"  label="Średnia"    value={stats.total ? `${stats.avg}%` : '—'}   sub="ze wszystkich sesji" />
          <StatCard icon="lucide:check-circle" label="Zdanych"    value={stats.total ? `${stats.passRate}%` : '—'} sub="sesji ≥ 75%" />
          <StatCard icon="lucide:flame"        label="Seria"      value={`${session.streak}d`}                  sub="dni nauki z rzędu" />
        </div>

        {/* MAIN GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>

          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* chart */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#4c1d95', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon icon="lucide:trending-up" style={{ fontSize: '1.1rem', color: '#7c3aed' }} />
                  Ostatnie sesje
                </h3>
                {stats.total > 0 && (
                  <span className={`status-badge status-badge--${stats.avg >= 75 ? 'pass' : 'fail'}`}>
                    <Icon icon={stats.avg >= 75 ? 'lucide:check' : 'lucide:arrow-up'} style={{ fontSize: '0.7rem' }} />
                    {stats.avg >= 75 ? 'Powyżej progu' : 'Poniżej progu'}
                  </span>
                )}
              </div>
              <MiniBarChart sessions={history} />
              <div style={{ marginTop: 8, display: 'flex', gap: '1.25rem' }}>
                {[
                  ['linear-gradient(135deg,#a78bfa,#7c3aed)', 'Zaliczone (≥75%)'],
                  ['linear-gradient(135deg,#f87171,#b91c1c)', 'Niezaliczone'],
                ].map(([bg, label]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: bg }} />
                    <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* category progress */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: '#4c1d95', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon icon="lucide:layers" style={{ fontSize: '1.1rem', color: '#7c3aed' }} />
                Postęp per kategoria
              </h3>
              {Object.keys(categoryProgress).length === 0
                ? <p style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                    Brak danych — zrób egzamin żeby zobaczyć postęp!
                  </p>
                : Object.entries(categoryProgress).map(([cat, data]) => (
                    <CategoryBar key={cat} name={cat} attempts={data.attempts} correct={data.correct} />
                  ))
              }
            </div>

            {/* history */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: '#4c1d95', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon icon="lucide:clipboard-list" style={{ fontSize: '1.1rem', color: '#7c3aed' }} />
                Historia egzaminów
              </h3>
              {history.length === 0
                ? <p style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>
                    Brak historii. Zacznij pierwszy egzamin!
                  </p>
                : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="history-table">
                      <thead>
                        <tr>
                          {['Data', 'Kategoria', 'Wynik', 'Punkty', 'Czas', 'Status'].map(h => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...history].reverse().map((s, i) => {
                          const rowKey = `${s.date}-${s.score}-${s.total}-${i}`;
                          const pct = Math.round((s.score / s.total) * 100);
                          const pass = pct >= 75;
                          return (
                            <tr key={rowKey}>
                              <td style={{ color: '#6b7280' }}>{formatDate(s.date)}</td>
                              <td style={{ color: '#9ca3af', fontSize: '0.78rem' }}>{s.category === 'all' ? 'Wszystkie' : s.category}</td>
                              <td style={{ fontWeight: 700, color: pass ? '#7c3aed' : '#ef4444' }}>{pct}%</td>
                              <td style={{ color: '#4c1d95' }}>{s.score}/{s.total}</td>
                              <td style={{ color: '#6b7280' }}>{formatDuration(s.duration)}</td>
                              <td>
                                <span className={`status-badge status-badge--${pass ? 'pass' : 'fail'}`}>
                                  <Icon icon={pass ? 'lucide:check' : 'lucide:x'} style={{ fontSize: '0.65rem' }} />
                                  {pass ? 'Zaliczony' : 'Niezaliczony'}
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
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: '#4c1d95', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon icon="lucide:zap" style={{ fontSize: '1.1rem', color: '#7c3aed' }} />
                Trenuj kategorię
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {CATEGORIES.map(cat => {
                  const catQ = ALL_QUESTIONS.filter(item => item.category === cat);
                  const prog = categoryProgress[cat];
                  const pct  = prog ? Math.round((prog.correct / prog.attempts) * 100) : null;
                  return (
                    <button key={cat} onClick={() => startExam(catQ.length, cat)} className="dash-cat-btn">
                      <span style={{ fontSize: '0.78rem', fontWeight: 500, color: '#4c1d95', lineHeight: 1.3 }}>{cat}</span>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0, marginLeft: 6 }}>
                        {pct !== null && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: pct >= 75 ? '#059669' : '#ef4444' }}>{pct}%</span>
                        )}
                        <span className="tech-badge" style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}>{catQ.length}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* tip */}
            <div className="tip-card">
              <p className="tip-card__title">
                <Icon icon="lucide:lightbulb" style={{ fontSize: '0.9rem' }} />
                Wskazówka
              </p>
              <p className="tip-card__body">
                Regularne powtórki po 20 pytań są skuteczniejsze niż sesje maratońskie. Cel: <strong>75%</strong> = zdany egzamin!
              </p>
            </div>

            {/* reset */}
            <div style={{ textAlign: 'center' }}>
              {!showReset
                ? <button onClick={() => setShowReset(true)} className="dash-btn-danger">
                    <Icon icon="lucide:trash-2" style={{ fontSize: '0.85rem' }} />
                    Zresetuj wszystkie dane
                  </button>
                : (
                  <div style={{ background: '#fff', borderRadius: 12, padding: '1rem', border: '1px solid #fca5a5' }}>
                    <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: '#991b1b', fontWeight: 600 }}>
                      Na pewno? Usuwa całą historię i postęp.
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { resetAll(); setShowReset(false); }} className="dash-btn-confirm-delete">
                        Tak, usuń
                      </button>
                      <button onClick={() => setShowReset(false)} className="dash-btn-cancel-delete">
                        Anuluj
                      </button>
                    </div>
                  </div>
                )
              }
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}