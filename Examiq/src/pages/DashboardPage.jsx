// pages/DashboardPage.jsx
// Dashboard użytkownika z sesją (ciasteczka) i historią (localStorage)
//
// Wymagane pliki:
//   src/hooks/useUserSession.js  ← skopiuj z outputs/useUserSession.js
//
// W App.jsx:
//   import DashboardPage from './pages/DashboardPage';
//   <Route path="/exam" element={<DashboardPage />} />

import { useState } from 'react';
import { Link } from 'react-router-dom';
import questions from '../data/questions.json';
import { useUserSession } from '../hooks/useUserSession';
import Header from '../components/Header';
import '../App.css'; // dodany import globalnych stylów

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDuration(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec < 10 ? '0' : ''}${sec}s`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
}

const CATEGORIES = [...new Set(questions.map(q => q.category))];

// ─── bar chart ────────────────────────────────────────────────────────────────

function MiniBarChart({ sessions }) {
  const last6 = sessions.slice(-6);
  const max = Math.max(...last6.map(s => s.score), 1);
  if (!last6.length) return (
    <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Brak danych – zrób pierwszy egzamin!</span>
    </div>
  );
  return (
    <div className="mini-chart-container">
      {last6.map((s, i) => {
        const pct = (s.score / max) * 100;
        const pass = s.score / s.total >= 0.75;
        return (
          <div key={i} className="mini-chart-bar-wrapper">
            <span className="mini-chart-score">{s.score}</span>
            <div className={`mini-chart-bar ${pass ? 'mini-chart-bar-pass' : 'mini-chart-bar-fail'}`}
                 style={{ height: `${Math.max(pct * 0.5, 4)}px` }} />
            <span className="mini-chart-date">{formatDate(s.date)}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── stat card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className={`stat-card ${accent ? 'stat-card-accent' : 'stat-card-default'}`}
         onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
         onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
      <span className="stat-icon">{icon}</span>
      <div className={`stat-value ${accent ? 'stat-value-accent' : 'stat-value-default'}`}>{value}</div>
      <div className={`stat-label ${accent ? 'stat-label-accent' : 'stat-label-default'}`}>{label}</div>
      {sub && <div className={`stat-sub ${accent ? 'stat-sub-accent' : 'stat-sub-default'}`}>{sub}</div>}
    </div>
  );
}

// ─── category progress bar ────────────────────────────────────────────────────

function CategoryBar({ name, attempts, correct }) {
  const pct = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
  const pass = pct >= 75;
  return (
    <div className="category-progress-item">
      <div className="category-progress-header">
        <span className="category-name">{name}</span>
        <span className={`category-percent-label ${pass ? 'category-percent-label-pass' : 'category-percent-label-fail'}`}>
          {pct}% ({correct}/{attempts})
        </span>
      </div>
      <div className="category-progress-bar-bg">
        <div className={`category-progress-bar-fill ${pass ? 'category-progress-fill-pass' : 'category-progress-fill-fail'}`}
             style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── welcome screen ───────────────────────────────────────────────────────────

function WelcomeScreen({ onSave }) {
  const [val, setVal] = useState('');
  const valid = val.trim().length > 0;
  return (
    <div className="welcome-screen">
      <div className="welcome-card">
        <div className="welcome-icon">👋</div>
        <h1 className="welcome-title">Witaj w ExamIQ!</h1>
        <p className="welcome-text">
          Zanim zaczniesz, ustaw swój nick.<br />Twoje postępy będą zapisywane lokalnie.
        </p>
        <input
          autoFocus
          placeholder="Wpisz swój nick..."
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && valid) onSave(val); }}
          maxLength={24}
          className="welcome-input"
        />
        <button
          disabled={!valid}
          onClick={() => onSave(val)}
          className={`welcome-button ${valid ? 'welcome-button-active' : 'welcome-button-disabled'}`}
        >
          Zaczynamy 🚀
        </button>
      </div>
    </div>
  );
}

// ─── name editor ──────────────────────────────────────────────────────────────

function NameEditor({ current, onSave }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(current);
  if (!editing) return (
    <button onClick={() => { setVal(current); setEditing(true); }} className="name-editor-button">
      ✏️ Zmień nick
    </button>
  );
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <input autoFocus value={val} onChange={e => setVal(e.target.value)} maxLength={24}
        onKeyDown={e => { if (e.key === 'Enter' && val.trim()) { onSave(val); setEditing(false); } if (e.key === 'Escape') setEditing(false); }}
        className="name-editor-input" />
      <button onClick={() => { if (val.trim()) { onSave(val); setEditing(false); } }} className="name-editor-save">Zapisz</button>
      <button onClick={() => setEditing(false)} className="name-editor-cancel">✕</button>
    </div>
  );
}

// ─── quick exam widget ────────────────────────────────────────────────────────

function QuickExamWidget({ onStart }) {
  const [count, setCount] = useState(20);
  const [category, setCategory] = useState('all');
  return (
    <div className="quick-exam-widget">
      <div className="widget-header">
        <span className="widget-icon">⚡</span>
        <h3 className="widget-title">Szybki egzamin</h3>
      </div>
      <label className="widget-label">
        Pytań: <strong style={{ color: '#4c1d95' }}>{count}</strong>
      </label>
      <input type="range" min={5} max={40} step={5} value={count} onChange={e => setCount(+e.target.value)}
        className="widget-range" />
      <label className="widget-label">Kategoria</label>
      <select value={category} onChange={e => setCategory(e.target.value)} className="widget-select">
        <option value="all">Wszystkie kategorie</option>
        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <button onClick={() => onStart(count, category)} className="widget-button">
        Rozpocznij egzamin 🚀
      </button>
    </div>
  );
}

// ─── exam runner ──────────────────────────────────────────────────────────────

function ExamRunner({ pool, category, onFinish }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [questionResults, setQuestionResults] = useState([]);

  const q = pool[current];
  if (!q) {
    const duration = Math.round((Date.now() - startTime) / 1000);
    onFinish({ score, total: pool.length, duration, category, questions: questionResults });
    return null;
  }

  const confirm = () => {
    if (!selected) return;
    setConfirmed(true);
    const correct = selected === q.answer;
    if (correct) setScore(s => s + 1);
    setQuestionResults(prev => [...prev, { categoryName: q.category, wasCorrect: correct }]);
  };

  const next = () => { setSelected(null); setConfirmed(false); setCurrent(c => c + 1); };
  const pct = (current / pool.length) * 100;

  return (
    <div className="exam-runner">
      <div className="exam-card">
        <div className="exam-progress-header">
          <span className="exam-progress-counter">Pytanie {current + 1} / {pool.length}</span>
          <span className="exam-progress-category">{q.category}</span>
        </div>
        <div className="exam-progress-bar-bg">
          <div className="exam-progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <p className="exam-question">{q.question}</p>
        {q.type === 'closed' && (
          <div className="exam-options">
            {Object.entries(q.options).map(([key, val]) => {
              let bg = 'rgba(245,243,255,0.8)', border = '1.5px solid rgba(167,139,250,0.2)', color = '#4c1d95';
              if (confirmed) {
                if (key === q.answer) { bg = '#d1fae5'; border = '1.5px solid #34d399'; color = '#065f46'; }
                else if (key === selected) { bg = '#fee2e2'; border = '1.5px solid #f87171'; color = '#991b1b'; }
              } else if (key === selected) { bg = '#ede9fe'; border = '1.5px solid #7c3aed'; }
              return (
                <button key={key} disabled={confirmed} onClick={() => setSelected(key)} style={{
                  background: bg, border, color, borderRadius: 12, padding: '0.8rem 1rem',
                  textAlign: 'left', cursor: confirmed ? 'default' : 'pointer',
                  fontSize: '0.875rem', fontWeight: 500, fontFamily: "'Sora',sans-serif",
                  display: 'flex', gap: '0.75rem', alignItems: 'center', transition: 'all 0.15s',
                }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 26, height: 26, borderRadius: 8,
                    background: key === selected && !confirmed ? '#7c3aed' : 'rgba(167,139,250,0.18)',
                    color: key === selected && !confirmed ? '#fff' : '#7c3aed',
                    fontWeight: 700, fontSize: '0.78rem', flexShrink: 0
                  }}>{key}</span>
                  {val}
                </button>
              );
            })}
          </div>
        )}
        {confirmed && q.explanation && (
          <div className="exam-explanation">💡 {q.explanation}</div>
        )}
        <div style={{ marginTop: '1.5rem' }}>
          {!confirmed ? (
            <button onClick={confirm} disabled={!selected}
              className={`exam-action-button ${selected ? 'exam-action-primary' : 'exam-action-disabled'}`}>
              Sprawdź odpowiedź
            </button>
          ) : (
            <button onClick={next} className="exam-action-primary">
              {current === pool.length - 1 ? 'Zakończ ✅' : 'Następne →'}
            </button>
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
    <div className="result-screen">
      <div className="result-card">
        <div className="result-icon">{pass ? '🏆' : '📚'}</div>
        <h2 className="result-title">{pass ? 'Świetny wynik!' : 'Jeszcze trochę!'}</h2>
        <p className="result-subtitle">{pass ? 'Zdałeś próbny egzamin INF04!' : 'Wymagane min. 75% do zaliczenia.'}</p>
        <div className="result-stats">
          <div className="result-stat-item">
            <div className="result-stat-value" style={{ color: pass ? '#7c3aed' : '#ef4444' }}>{pct}%</div>
            <div className="result-stat-label">Wynik</div>
          </div>
          <div className="result-stat-item">
            <div className="result-stat-value" style={{ color: '#4c1d95' }}>{score}/{total}</div>
            <div className="result-stat-label">Punkty</div>
          </div>
          <div className="result-stat-item">
            <div className="result-stat-value" style={{ color: '#4c1d95' }}>{formatDuration(duration)}</div>
            <div className="result-stat-label">Czas</div>
          </div>
        </div>
        <p className="result-saved-note">✅ Wynik zapisany w Twoim profilu</p>
        <button onClick={onBack} className="result-button">← Wróć do dashboardu</button>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { session, history, categoryProgress, stats, setName, saveExamResult, resetAll } = useUserSession();
  const [examPool, setExamPool] = useState(null);
  const [examCategory, setExamCategory] = useState('all');
  const [result, setResult] = useState(null);
  const [showReset, setShowReset] = useState(false);

  const startExam = (count, category) => {
    let pool = category === 'all' ? [...questions] && questions.filter(q => q.type === 'closed') : questions.filter(q => q.category === 'category') && questions.filter(q => q.type === 'closed');
    pool = pool.sort(() => Math.random() - 0.5).slice(0, count);
    setExamPool(pool);
    setExamCategory(category);
    setResult(null);
  };

  const finishExam = (resultData) => {
    saveExamResult(resultData);
    setExamPool(null);
    setResult(resultData);
  };

  if (examPool) return <ExamRunner pool={examPool} category={examCategory} onFinish={finishExam} />;
  if (result) return <ResultScreen {...result} onBack={() => setResult(null)} />;
  if (session.isNew) return <WelcomeScreen onSave={setName} />;

  return (
    <div className="dashboard-page">
      <Header />

      <main className="dashboard-main">

        {/* GREETING */}
        <div className="dashboard-greeting">
          <div>
            <h1 className="dashboard-title">Cześć, {session.name}! 👋</h1>
            <p className="dashboard-subtitle">Ostatnia aktywność: {session.lastActive}</p>
          </div>
          <NameEditor current={session.name} onSave={setName} />
        </div>

        {/* STAT CARDS */}
        <div className="dashboard-stats-grid">
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
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h3 className="dashboard-card-title">📈 Ostatnie sesje</h3>
                {stats.total > 0 && (
                  <span className={`dashboard-badge ${stats.avg >= 75 ? 'dashboard-badge-success' : 'dashboard-badge-warning'}`}>
                    {stats.avg >= 75 ? '✓ Powyżej progu' : '↑ Poniżej progu'}
                  </span>
                )}
              </div>
              <MiniBarChart sessions={history} />
              <div className="dashboard-chart-legend">
                <div className="dashboard-legend-item">
                  <div className="dashboard-legend-dot" style={{ background: 'linear-gradient(135deg,#a78bfa,#7c3aed)' }} />
                  <span className="dashboard-legend-label">Zaliczone (≥75%)</span>
                </div>
                <div className="dashboard-legend-item">
                  <div className="dashboard-legend-dot" style={{ background: 'linear-gradient(135deg,#f87171,#b91c1c)' }} />
                  <span className="dashboard-legend-label">Niezaliczone</span>
                </div>
              </div>
            </div>

            {/* category progress */}
            <div className="dashboard-card">
              <h3 className="dashboard-card-title">🗂️ Postęp per kategoria</h3>
              {Object.keys(categoryProgress).length === 0 ? (
                <p className="dashboard-empty-state">Brak danych — zrób egzamin żeby zobaczyć postęp!</p>
              ) : (
                Object.entries(categoryProgress).map(([cat, data]) => (
                  <CategoryBar key={cat} name={cat} attempts={data.attempts} correct={data.correct} />
                ))
              )}
            </div>

            {/* history table */}
            <div className="dashboard-card">
              <h3 className="dashboard-card-title">📋 Historia egzaminów</h3>
              {history.length === 0 ? (
                <p className="dashboard-empty-state">Brak historii. Zacznij pierwszy egzamin!</p>
              ) : (
                <div className="history-table-container">
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
                        const pct = Math.round((s.score / s.total) * 100);
                        const pass = pct >= 75;
                        return (
                          <tr key={i}>
                            <td>{formatDate(s.date)}</td>
                            <td className="history-category">{s.category === 'all' ? 'Wszystkie' : s.category}</td>
                            <td className={`history-score ${pass ? 'history-score-pass' : 'history-score-fail'}`}>{pct}%</td>
                            <td className="history-points">{s.score}/{s.total}</td>
                            <td className="history-duration">{formatDuration(s.duration)}</td>
                            <td>
                              <span className={`history-status ${pass ? 'history-status-pass' : 'history-status-fail'}`}>
                                {pass ? '✓ Zaliczony' : '✗ Niezaliczony'}
                              </span>
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

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <QuickExamWidget onStart={startExam} />

            {/* categories quick start */}
            <div className="dashboard-card">
              <h3 className="dashboard-card-title">⚡ Trenuj kategorię</h3>
              <div className="categories-grid">
                {CATEGORIES.map(cat => {
                  const count = questions.filter(q => q.category === cat).length;
                  const prog = categoryProgress[cat];
                  const pct = prog ? Math.round((prog.correct / prog.attempts) * 100) : null;
                  return (
                    <button key={cat} onClick={() => startExam(Math.min(10, count), cat)} className="category-button">
                      <span className="category-name">{cat}</span>
                      <div className="category-stats">
                        {pct !== null && <span className={`category-percent ${pct >= 75 ? 'category-percent-high' : 'category-percent-low'}`}>{pct}%</span>}
                        <span className="category-count">{count}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* tip */}
            <div className="tip-card">
              <p className="tip-label">💡 Wskazówka</p>
              <p className="tip-text">
                Regularne powtórki po 20 pytań są skuteczniejsze niż sesje maratońskie. Cel: <strong>75%</strong> = zdany egzamin!
              </p>
            </div>

            {/* reset */}
            <div style={{ textAlign: 'center' }}>
              {!showReset ? (
                <button onClick={() => setShowReset(true)} className="reset-button">
                  🗑️ Zresetuj wszystkie dane
                </button>
              ) : (
                <div className="reset-confirm">
                  <p className="reset-confirm-text">Na pewno? Usuwa całą historię i postęp.</p>
                  <div className="reset-buttons">
                    <button onClick={() => { resetAll(); setShowReset(false); }} className="reset-confirm-yes">Tak, usuń</button>
                    <button onClick={() => setShowReset(false)} className="reset-confirm-no">Anuluj</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}