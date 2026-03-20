// pages/LearnPage.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import questions from '../data/questions.json';
import { useUserSession } from '../hooks/useUserSession';
import { GoogleGenerativeAI } from '@google/generative-ai';
import '../App.css'; // dodany import globalnych stylów

const JAMIQ_HAPPY = '/happy_jamiq.png';
const JAMIQ_SAD   = '/sad_jamiq.png';
const JAMIQ_ANGRY = '/angry_jamiq.png';

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ─── SETUP ────────────────────────────────────────────────────────────────────
function SetupScreen({ onStart }) {
  const [count,    setCount]    = useState(10);
  const [timeMode, setTimeMode] = useState('none');
  const [typeMode, setTypeMode] = useState('both');

  const available = questions.filter(q =>
    typeMode === 'both' ? true : q.type === typeMode
  ).length;
  const maxCount = Math.min(available, 40);

  return (
    <div className="learn-page">
      <Header />
      <div className="learn-container">

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="learn-badge">
            <span className="learn-badge-text">
              Tryb nauki
            </span>
          </div>
          <h1 className="learn-title">
            Skonfiguruj quiz
          </h1>
          <p className="learn-subtitle">
            Dostępnych pytań: <strong style={{ color: '#7c3aed' }}>{available}</strong>
          </p>
        </div>

        <div className="learn-card">
          {/* Liczba pytań */}
          <div>
            <label style={{ display: 'block', color: '#374151', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>
              Liczba pytań: <span style={{ color: '#7c3aed', fontSize: '1.1rem' }}>{Math.min(count, maxCount)}</span>
            </label>
            <input
              type="range" min={1} max={maxCount} value={Math.min(count, maxCount)}
              onChange={e => setCount(+e.target.value)}
              className="learn-range"
            />
            <div className="learn-range-labels">
              <span className="learn-range-label">1</span>
              <span className="learn-range-label">{maxCount}</span>
            </div>
          </div>

          {/* Czas */}
          <div>
            <label style={{ display: 'block', color: '#374151', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Czas na pytanie</label>
            <div className="learn-option-group learn-option-group-4">
              {[
                { val: 'none', label: '∞',   sub: 'bez limitu' },
                { val: '15',   label: '15s',  sub: 'szybki' },
                { val: '30',   label: '30s',  sub: 'normalny' },
                { val: '60',   label: '60s',  sub: 'spokojny' },
              ].map(opt => (
                <button key={opt.val} onClick={() => setTimeMode(opt.val)}
                  className={`learn-option-btn ${timeMode === opt.val ? 'learn-option-btn-active' : ''}`}
                  style={{
                    color: timeMode === opt.val ? '#7c3aed' : '#9ca3af',
                  }}>
                  <div className="learn-option-label" style={{ color: timeMode === opt.val ? '#7c3aed' : '#9ca3af' }}>{opt.label}</div>
                  <div className="learn-option-sub" style={{ color: timeMode === opt.val ? '#a78bfa' : '#c4b5fd' }}>{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Typ */}
          <div>
            <label style={{ display: 'block', color: '#374151', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Typ pytań</label>
            <div className="learn-option-group learn-option-group-3">
              {[
                { val: 'both',   label: '🎲 Oba typy' },
                { val: 'closed', label: '🔘 Zamknięte' },
                { val: 'open',   label: '✏️ Otwarte' },
              ].map(opt => (
                <button key={opt.val} onClick={() => setTypeMode(opt.val)}
                  className={`learn-option-btn ${typeMode === opt.val ? 'learn-option-btn-active' : ''}`}
                  style={{
                    color: typeMode === opt.val ? '#7c3aed' : '#6b7280',
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onStart({ count: Math.min(count, maxCount), timeLimit: timeMode === 'none' ? null : +timeMode, typeMode })}
            className="learn-button-primary"
          >
            Rozpocznij quiz →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── QUIZ ─────────────────────────────────────────────────────────────────────
function QuizScreen({ config, onFinish }) {
  const [pool] = useState(() => {
    const filtered = questions.filter(q =>
      config.typeMode === 'both' ? true : q.type === config.typeMode
    );
    return shuffle(filtered).slice(0, config.count);
  });

  const [idx,        setIdx]        = useState(0);
  const [selected,   setSelected]   = useState(null);
  const [openAnswer, setOpenAnswer] = useState('');
  const [revealed,   setRevealed]   = useState(false);
  const [isCorrect,  setIsCorrect]  = useState(null);
  const [results,    setResults]    = useState([]);
  const [streak,     setStreak]     = useState(0);
  const [showFlame,  setShowFlame]  = useState(false);
  const [timeLeft,   setTimeLeft]   = useState(config.timeLimit);
  const [timerPulse, setTimerPulse] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const timerRef = useRef(null);

  const checkWithGemini = async (question, correctAnswer, userAnswer) => {
    try {
      const ai = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);
      const model = ai.getGenerativeModel({ model: 'gemini-flash-latest' });
      const prompt = `Jesteś weryfikatorem odpowiedzi na pytania egzaminacyjne z IT (egzamin INF04).

Pytanie: ${question}
Wzorcowa odpowiedź: ${correctAnswer}
Odpowiedź ucznia: ${userAnswer}

Oceń czy odpowiedź ucznia jest merytorycznie poprawna. Nie wymagaj identycznego brzmienia — liczy się sens i kluczowe pojęcia techniczne. Odpowiedz TYLKO jednym słowem: TAK lub NIE.`;
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim().toUpperCase();
      return text.startsWith('TAK');
    } catch (err) {
      console.error('Gemini error:', err);
      return userAnswer.trim().toLowerCase().includes(correctAnswer.trim().toLowerCase());
    }
  };

  const q = pool[idx];
  const progress = idx / pool.length;

  const handleReveal = useCallback((correct) => {
    clearInterval(timerRef.current);
    setRevealed(true);
    setIsCorrect(correct);
    if (correct) {
      setStreak(prev => { const n = prev + 1; if (n >= 2) setShowFlame(true); return n; });
    } else {
      setStreak(0);
      setShowFlame(false);
    }
    setResults(prev => [...prev, { q, correct }]);
  }, [q]);

  useEffect(() => {
    if (!config.timeLimit || revealed) return;
    setTimeLeft(config.timeLimit);
    setTimerPulse(false);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleReveal(false); return 0; }
        if (t <= 6) setTimerPulse(true);
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [idx, config.timeLimit]);

  const handleOpenSubmit = async () => {
    if (revealed || !openAnswer.trim() || isChecking) return;
    setIsChecking(true);
    clearInterval(timerRef.current);
    const correct = await checkWithGemini(q.question, q.answer, openAnswer);
    setIsChecking(false);
    handleReveal(correct);
  };

  const handleNext = () => {
    if (idx + 1 >= pool.length) { onFinish(results); return; }
    setIdx(i => i + 1);
    setSelected(null); setOpenAnswer(''); setRevealed(false); setIsCorrect(null);
  };

  if (!q) return null;

  const timerPct   = config.timeLimit ? (timeLeft / config.timeLimit) : 1;
  const timerColor = timerPct > 0.5 ? '#16a34a' : timerPct > 0.25 ? '#d97706' : '#dc2626';

  return (
    <div className="learn-page">
      <Header />

      {/* PROGRESS BAR */}
      <div className="learn-progress-bar-container">
        <div className="learn-progress-bar-fill" style={{ width: `${progress * 100}%` }} />
        <div className="learn-progress-thumb" style={{ left: `${progress * 100}%` }} />
      </div>

      <div className="learn-container-wide">

        {/* TOPBAR */}
        <div className="learn-topbar">
          <span className="learn-counter">
            Pytanie <span className="learn-counter-highlight">{idx + 1}</span> / {pool.length}
          </span>
          <div style={{ display: 'flex', gap: 10 }}>
            {/* STREAK */}
            <div className={`learn-streak ${showFlame ? 'learn-streak-active' : ''}`}>
              <span className="learn-streak-icon" style={{ filter: showFlame ? 'none' : 'grayscale(1) opacity(0.3)', animation: showFlame ? 'flameDance 0.5s ease' : 'none' }}>🔥</span>
              <span className="learn-streak-count" style={{ color: showFlame ? '#d97706' : '#c4b5fd' }}>{streak}</span>
            </div>
            {/* TIMER */}
            {config.timeLimit && (
              <div className="learn-timer" style={{
                background: timerPct > 0.5 ? 'rgba(22,163,74,0.08)' : timerPct > 0.25 ? 'rgba(217,119,6,0.08)' : 'rgba(220,38,38,0.08)',
                border: `1px solid ${timerPct > 0.5 ? 'rgba(22,163,74,0.25)' : timerPct > 0.25 ? 'rgba(217,119,6,0.25)' : 'rgba(220,38,38,0.25)'}`,
                animation: timerPulse && !revealed ? 'timerBlink 0.5s infinite' : 'none',
              }}>
                <span style={{ fontSize: '0.85rem' }}>⏱</span>
                <span className="learn-timer-value" style={{ color: timerColor }}>{timeLeft}</span>
              </div>
            )}
          </div>
        </div>

        {/* PYTANIE */}
        <div className="learn-card-sm">
          <div className="learn-question-category">
            {q.category}
          </div>
          <p className="learn-question-text">{q.question}</p>
          {q.snippet && <div dangerouslySetInnerHTML={{ __html: q.snippet }} style={{ marginTop: '1rem' }} />}
        </div>

        {/* ZAMKNIĘTE */}
        {q.type === 'closed' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: '1.25rem' }}>
            {Object.entries(q.options).map(([key, val]) => {
              const isRight  = revealed && key === q.answer;
              const isWrong  = revealed && key === selected && key !== q.answer;
              const isDimmed = revealed && key !== q.answer && key !== selected;
              let optionClass = 'learn-option';
              if (revealed) optionClass += ' learn-option-disabled';
              if (isRight) optionClass += ' learn-option-correct';
              else if (isWrong) optionClass += ' learn-option-wrong';
              else if (isDimmed) optionClass += ' learn-option-dimmed';

              const letterClass = `learn-option-letter ${isRight ? 'learn-option-letter-correct' : isWrong ? 'learn-option-letter-wrong' : ''}`;

              return (
                <button key={key} onClick={() => { if (!revealed) { setSelected(key); handleReveal(key === q.answer); } }}
                  className={optionClass}
                  style={{
                    boxShadow: revealed ? 'none' : '0 1px 4px rgba(124,58,237,0.06)',
                  }}
                  onMouseEnter={e => { if (!revealed) { e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.35)'; e.currentTarget.style.transform = 'translateX(5px)'; } }}
                  onMouseLeave={e => { if (!revealed) { e.currentTarget.style.background = 'rgba(255,255,255,0.85)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.12)'; e.currentTarget.style.transform = 'translateX(0)'; } }}
                >
                  <span className={letterClass}>{key}</span>
                  {val}
                </button>
              );
            })}
          </div>
        )}

        {/* OTWARTE */}
        {q.type === 'open' && (
          <div style={{ marginBottom: '1.25rem' }}>
            <textarea
              value={openAnswer} onChange={e => setOpenAnswer(e.target.value)}
              disabled={revealed || isChecking} rows={3}
              placeholder="Wpisz odpowiedź... (Ctrl+Enter aby sprawdzić)"
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleOpenSubmit(); }}
              className={`learn-textarea ${revealed ? (isCorrect ? 'learn-textarea-correct' : 'learn-textarea-wrong') : ''}`}
              style={{
                opacity: isChecking ? 0.7 : 1,
              }}
            />
            {!revealed && (
              <button onClick={handleOpenSubmit}
                disabled={!openAnswer.trim() || isChecking}
                className={`learn-check-button ${openAnswer.trim() && !isChecking ? 'learn-check-button-active' : 'learn-check-button-disabled'}`}
              >
                {isChecking ? (
                  <>
                    <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite', fontSize: '0.9rem' }}>⏳</span>
                    Weryfikuje Gemini...
                  </>
                ) : 'Sprawdź'}
              </button>
            )}
          </div>
        )}

        {/* FEEDBACK */}
        {revealed && (
          <div className={`learn-feedback ${isCorrect ? 'learn-feedback-correct' : 'learn-feedback-wrong'}`}>
            <div className="learn-feedback-content">
              <img src={isCorrect ? JAMIQ_HAPPY : JAMIQ_SAD} alt="Jamiq"
                className="learn-feedback-image" />
              <div className="learn-feedback-text">
                <div className={`learn-feedback-header ${isCorrect ? 'learn-feedback-header-correct' : 'learn-feedback-header-wrong'}`}>
                  {isCorrect
                    ? (streak >= 2 ? `🔥 Streak ×${streak}! Świetnie!` : '✓ Poprawna odpowiedź!')
                    : `✗ Błąd${q.type === 'closed' ? ` — poprawna: ${q.answer}` : ''}`}
                </div>
                {q.type === 'open' && !isCorrect && (
                  <div className="learn-feedback-answer">
                    Wzorcowa odpowiedź: {q.answer}
                  </div>
                )}
                <p className={`learn-feedback-explanation ${isCorrect ? 'learn-feedback-explanation-correct' : 'learn-feedback-explanation-wrong'}`}>
                  {q.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* NASTĘPNE */}
        {revealed && (
          <button onClick={handleNext} className="learn-button-primary" style={{ fontSize: '1rem' }}>
            {idx + 1 >= pool.length ? 'Zobacz wyniki →' : 'Następne pytanie →'}
          </button>
        )}
      </div>

      <style>{`
        pre.code-snippet {
          background: rgba(124,58,237,0.05) !important;
          border: 1px solid rgba(124,58,237,0.12);
          border-radius: 10px; padding: 1rem;
          overflow-x: auto; font-size: 0.85rem; margin: 0;
        }
        .kw  { color: #7c3aed; font-weight: 700; }
        .fn  { color: #2563eb; }
        .st  { color: #16a34a; }
        .nm  { color: #d97706; }
        .cm  { color: #9ca3af; font-style: italic; }
        .tp  { color: #7c3aed; }
        .gap { background: rgba(217,119,6,0.12); color: #b45309; padding: 0 4px; border-radius: 4px; border: 1px dashed #d97706; }
      `}</style>
    </div>
  );
}

// ─── WYNIKI ───────────────────────────────────────────────────────────────────
function ResultsScreen({ results, onRestart }) {
  const { saveExamResult } = useUserSession();
  const saved = useRef(false);

  const total   = results.length;
  const correct = results.filter(r => r.correct).length;
  const pct     = Math.round((correct / total) * 100);
  const passed  = pct >= 75;
  const stars   = pct >= 90 ? 3 : pct >= 75 ? 2 : pct >= 50 ? 1 : 0;

  useEffect(() => {
    if (saved.current) return;
    saved.current = true;
    saveExamResult({
      score: correct, total, duration: 0, category: 'Nauka',
      questions: results.map(r => ({ categoryName: r.q.category, wasCorrect: r.correct })),
    });
  }, []);

  return (
    <div className="learn-page">
      <Header />
      <div className="learn-container-results">

        {/* JAMIQ */}
        <div className="learn-results-jamiq">
          <img
            src={pct >= 75 ? JAMIQ_HAPPY : pct >= 50 ? JAMIQ_SAD : JAMIQ_ANGRY}
            alt="Jamiq"
            style={{ width: 110, height: 110, objectFit: 'contain', animation: 'jamiqPop 0.6s ease' }}
          />
          <div className="learn-results-stars">
            {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
          </div>
          <h1 className={`learn-results-percent ${passed ? 'learn-results-pass' : 'learn-results-fail'}`}>{pct}%</h1>
          <p className={`learn-results-status ${passed ? 'learn-results-status-pass' : 'learn-results-status-fail'}`}>
            {passed ? '🎉 Zaliczono! Próg 75% osiągnięty.' : '😓 Nie zaliczono — próg to 75%'}
          </p>
          <p className="learn-results-saved">Wynik zapisano w historii</p>
        </div>

        {/* KARTY STAT */}
        <div className="learn-stats-grid">
          {[
            { label: 'Poprawne',   val: correct,        color: '#166534', bg: 'rgba(22,163,74,0.08)',   border: 'rgba(22,163,74,0.2)' },
            { label: 'Błędne',     val: total - correct, color: '#991b1b', bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.2)' },
            { label: 'Wszystkich', val: total,           color: '#5b21b6', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)' },
          ].map(s => (
            <div key={s.label} className="learn-stat-card" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <div className="learn-stat-value" style={{ color: s.color }}>{s.val}</div>
              <div className="learn-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* PASEK */}
        <div className="learn-result-bar">
          <div className="learn-result-bar-header">
            <span className="learn-result-bar-label">Wynik końcowy</span>
            <span className="learn-result-bar-threshold">próg 75%</span>
          </div>
          <div className="learn-result-bar-bg">
            <div className={`learn-result-bar-fill ${passed ? 'learn-result-bar-fill-pass' : 'learn-result-bar-fill-fail'}`} style={{ width: `${pct}%` }} />
            <div className="learn-result-bar-marker" />
          </div>
        </div>

        {/* LISTA */}
        <div className="learn-answers-list">
          <h3 className="learn-answers-title">
            Przegląd odpowiedzi
          </h3>
          {results.map((r, i) => (
            <div key={i} className="learn-answer-item">
              <span className={`learn-answer-icon ${r.correct ? 'learn-answer-icon-correct' : 'learn-answer-icon-wrong'}`}>
                {r.correct ? '✓' : '✗'}
              </span>
              <div className="learn-answer-text">
                <p className="learn-answer-question">
                  {r.q.question.slice(0, 90)}{r.q.question.length > 90 ? '…' : ''}
                </p>
                {!r.correct && (
                  <p className="learn-answer-correct">
                    ✓ {r.q.answer}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* PRZYCISKI */}
        <div style={{ display: 'flex', gap: 10, animation: 'riseIn 0.9s ease' }}>
          <button onClick={onRestart} className="learn-button-outline">
            Zagraj ponownie
          </button>
          <Link to="/exam" style={{ flex: 1, textDecoration: 'none' }}>
            <button className="learn-button-secondary">
              Dashboard →
            </button>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes jamiqPop {
          0%   { transform: scale(0.4) rotate(-15deg); opacity: 0; }
          65%  { transform: scale(1.18) rotate(5deg); opacity: 1; }
          85%  { transform: scale(0.95); }
          100% { transform: scale(1) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function LearnPage() {
  const [phase,   setPhase]   = useState('setup');
  const [config,  setConfig]  = useState(null);
  const [results, setResults] = useState([]);

  if (phase === 'setup')
    return <SetupScreen onStart={cfg => { setConfig(cfg); setPhase('quiz'); }} />;
  if (phase === 'quiz')
    return <QuizScreen config={config} onFinish={res => { setResults(res); setPhase('results'); }} />;
  return <ResultsScreen results={results} onRestart={() => setPhase('setup')} />;
}