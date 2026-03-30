// pages/PracticePage.jsx
// LeetCode-style practice environment with Monaco Editor + Gemini evaluation

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Header from '../components/Header';
import { GoogleGenerativeAI } from '@google/generative-ai';
import practiceData from '../data/practice.json';
import { usePageTitle } from '../hooks/usePageTitle';
import Footer from '../components/Footer';
import './PracticePage.css';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const LANG_OPTIONS = [
  { id: 'python',     label: 'Python',     monaco: 'python',     comment: '# Twój kod tutaj\n' },
  { id: 'cpp',        label: 'C++',        monaco: 'cpp',        comment: '// Twój kod tutaj\n#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n' },
  { id: 'java',       label: 'Java',       monaco: 'java',       comment: '// Twój kod tutaj\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}\n' },
  { id: 'javascript', label: 'JavaScript', monaco: 'javascript', comment: '// Twój kod tutaj\n' },
];

const DIFFICULTY_COLOR = {
  easy:   { text: '#16a34a', bg: 'rgba(22,163,74,0.1)',   border: 'rgba(22,163,74,0.25)'   },
  medium: { text: '#d97706', bg: 'rgba(217,119,6,0.1)',   border: 'rgba(217,119,6,0.25)'   },
  hard:   { text: '#dc2626', bg: 'rgba(220,38,38,0.1)',   border: 'rgba(220,38,38,0.25)'   },
};
const DIFF_LABEL = { easy: 'Łatwe', medium: 'Średnie', hard: 'Trudne' };

// ─── SETUP SCREEN ─────────────────────────────────────────────────────────────
function SetupScreen({ onStart }) {
  const [mode,       setMode]       = useState('random');   // 'random' | 'pick'
  const [selected,   setSelected]   = useState(null);
  const [timerMode,  setTimerMode]  = useState('none');     // 'none'|'15'|'30'|'60'|'90'
  const [lang,       setLang]       = useState('python');
  const [filter,     setFilter]     = useState('all');

  const dataArray = Array.isArray(practiceData) ? practiceData : [];
  const categories = ['all', ...new Set(dataArray.map(q => q.category))];
  const filtered   = filter === 'all' ? dataArray : dataArray.filter(q => q.category === filter);

  const canStart = mode === 'random' ? filtered.length > 0 : selected !== null;

  function handleStart() {
    if (mode === 'random') {
      if (filtered.length === 0) return;
      const question = filtered[Math.floor(Math.random() * filtered.length)];
      if (!question) return;
      onStart({ question, lang, timerMode });
    } else {
      const question = practiceData.find(q => q.id === selected);
      if (!question) return;
      onStart({ question, lang, timerMode });
    }
  }

  return (
    <div className="practice-container">
      <Header />
      <div className="practice-content">

        {/* Title */}
        <div className="practice-setup-header">
          <div className="practice-badge">
            <Icon icon="lucide:hammer" className="practice-badge__icon" />
            <span className="practice-badge__text">
              Praktyka
            </span>
          </div>
          <h1 className="practice-setup-title">
            Wybierz zadanie
          </h1>
          <p className="practice-setup-description">
            Napisz kod, Gemini oceni Twoje rozwiązanie
          </p>
        </div>

        {/* Card */}
        <div className="practice-card">

          {/* Mode toggle */}
          <div>
            <label className="practice-label">
              Tryb wyboru
            </label>
            <div className="practice-grid-2">
              {[
                { val: 'random', icon: 'lucide:shuffle',    label: 'Losowe zadanie' },
                { val: 'pick',   icon: 'lucide:list',       label: 'Wybierz z listy' },
              ].map(opt => (
                <button key={opt.val} onClick={() => setMode(opt.val)} className="practice-option" data-active={mode === opt.val}>
                  <Icon icon={opt.icon} className="practice-option__icon" />
                  <span className="practice-option__label">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category filter (random) or question picker (pick) */}
          {mode === 'random' ? (
            <div>
              <label className="practice-label">
                Kategoria
              </label>
              <div className="practice-category-filters">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setFilter(cat)} className="practice-pill" data-active={filter === cat}>
                    {cat === 'all' ? 'Wszystkie' : cat}
                  </button>
                ))}
              </div>
              <p className="practice-category-count">
                {filtered.length} zadań dostępnych
              </p>
            </div>
          ) : (
            <div>
              <label className="practice-label">
                Wybierz zadanie
              </label>
              <div className="practice-question-list">
                {dataArray.map(q => {
                  const isSelected = selected === q.id;
                  const badgeVariant = q.difficulty === 'easy' ? 'success' : q.difficulty === 'medium' ? 'warning' : q.difficulty === 'hard' ? 'danger' : 'primary';
                  return (
                    <button key={q.id} onClick={() => setSelected(q.id)} className="question-item" data-selected={isSelected}>
                      <span className={`badge badge--${badgeVariant}`}>
                        {DIFF_LABEL[q.difficulty] || q.difficulty || 'Średnie'}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="question-item__title">{q.title}</div>
                        <div className="question-item__category">{q.category}</div>
                      </div>
                      {isSelected && (
                        <Icon icon="lucide:check" className="question-item__check" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Language */}
          <div>
            <label className="practice-label">
              Język programowania
            </label>
            <div className="practice-grid-4">
              {LANG_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => setLang(opt.id)} className="practice-option" data-active={lang === opt.id}>
                  <span className="practice-option__label">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Timer */}
          <div>
            <label className="practice-label">
              Limit czasu
            </label>
            <div className="practice-grid-5">
              {[
                { val: 'none', label: <Icon icon="lucide:infinity" className="timer-btn__icon" />, sub: 'bez limitu' },
                { val: '15',   label: '15min', sub: 'sprint'     },
                { val: '30',   label: '30min', sub: 'normalny'   },
                { val: '45',   label: '45min', sub: 'egzamin'    },
                { val: '60',   label: '60min', sub: 'spokojny'   },
              ].map(opt => (
                <button key={opt.val} onClick={() => setTimerMode(opt.val)} className="timer-btn" data-active={timerMode === opt.val}>
                  <div className="timer-btn__label">{opt.label}</div>
                  <div className="timer-btn__sub">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Start button */}
          <button onClick={handleStart} disabled={!canStart} className="start-btn">
            {canStart ? (
              <>Rozpocznij zadanie <Icon icon="lucide:arrow-right" style={{ fontSize: '1rem' }} /></>
            ) : 'Wybierz zadanie z listy'}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─── TIMER HOOK ───────────────────────────────────────────────────────────────
function useTimer(timerMode, onExpire) {
  const totalSeconds = timerMode === 'none' ? null : parseInt(timerMode) * 60;
  const [elapsed, setElapsed]   = useState(0);
  const [running, setRunning]   = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        if (totalSeconds !== null && next >= totalSeconds) {
          clearInterval(intervalRef.current);
          setRunning(false);
          onExpire();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, totalSeconds, onExpire]);

  const remaining = totalSeconds !== null ? totalSeconds - elapsed : null;
  const pct = totalSeconds !== null ? (elapsed / totalSeconds) * 100 : 0;

  function fmt(s) {
    if (s === null) return fmtElapsed(elapsed);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  }
  function fmtElapsed(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  }

  const danger = remaining !== null && remaining < 120;
  const warning = remaining !== null && remaining < 300;

  return { remaining, elapsed, pct, fmt, danger, warning, pause: () => setRunning(false), resume: () => setRunning(true), running };
}

// ─── EDITOR SCREEN (main LeetCode layout) ────────────────────────────────────
function EditorScreen({ question, lang: initialLang, timerMode, onFinish, onAbort }) {
  // Guard against missing question
  if (!question) {
    return (
      <div className="practice-editor-root">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem' }}>
          <p style={{ color: 'var(--gray-500)' }}>Nie znaleziono zadania.</p>
          <button onClick={onAbort} className="btn btn--secondary">
            <Icon icon="lucide:arrow-left" style={{ fontSize: '0.85rem' }} />
            Powrót
          </button>
        </div>
      </div>
    );
  }

  const [lang,         setLang]         = useState(initialLang);
  const [code,         setCode]         = useState(() => LANG_OPTIONS.find(l => l.id === initialLang)?.comment || '');
  const [tab,          setTab]          = useState('zadanie');  // 'zadanie' | 'podpowiedzi' | 'przyklad'
  const [submitting,   setSubmitting]   = useState(false);
  const [feedback,     setFeedback]     = useState(null);       // null | { score, verdict, details, tips }
  const [hintsOpen,    setHintsOpen]    = useState([]);
  const editorRef     = useRef(null);
  const monacoRef     = useRef(null);
  const containerRef  = useRef(null);

  const dc = DIFFICULTY_COLOR[question.difficulty] || DIFFICULTY_COLOR.medium;

  // Timer
  const handleExpire = useCallback(() => {
    if (!feedback) setTab('zadanie');
  }, [feedback]);
  const timer = useTimer(timerMode, handleExpire);

  // Load Monaco
  useEffect(() => {
    if (!window.monaco) {
      console.error('Monaco not loaded');
      return;
    }
    if (monacoRef.current) return;

    const monacoLang = LANG_OPTIONS.find(l => l.id === lang)?.monaco || 'python';
    monacoRef.current = window.monaco.editor.create(containerRef.current, {
      value: code,
      language: monacoLang,
      theme: 'vs-dark',
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      padding: { top: 16, bottom: 16 },
      lineNumbers: 'on',
      renderLineHighlight: 'all',
      tabSize: 4,
      insertSpaces: true,
      wordWrap: 'on',
      automaticLayout: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
    });
    editorRef.current = monacoRef.current;
    monacoRef.current.onDidChangeModelContent(() => {
      setCode(monacoRef.current.getValue());
    });

    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose();
        monacoRef.current = null;
      }
    };
  }, []);

  // Language change
  useEffect(() => {
    if (!monacoRef.current) return;
    const monacoLang = LANG_OPTIONS.find(l => l.id === lang)?.monaco || 'python';
    const model = monacoRef.current.getModel();
    if (model) window.monaco.editor.setModelLanguage(model, monacoLang);
  }, [lang]);

  // Switch language — confirm reset
  function handleLangChange(newLang) {
    if (newLang === lang) return;
    const template = LANG_OPTIONS.find(l => l.id === newLang)?.comment || '';
    const isEmpty = code.trim() === '' || code.trim() === (LANG_OPTIONS.find(l => l.id === lang)?.comment || '').trim();
    if (!isEmpty && !window.confirm('Zmiana języka wyczyści edytor. Kontynuować?')) return;
    setLang(newLang);
    setCode(template);
    if (monacoRef.current) {
      monacoRef.current.setValue(template);
      const monacoLang = LANG_OPTIONS.find(l => l.id === newLang)?.monaco || 'python';
      const model = monacoRef.current.getModel();
      if (model) window.monaco.editor.setModelLanguage(model, monacoLang);
    }
  }

  // Gemini evaluation
  async function handleSubmit() {
    const currentCode = monacoRef.current ? monacoRef.current.getValue() : code;
    if (!currentCode.trim()) return;
    setSubmitting(true);
    timer.pause();
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

      const criteriaList = (question.evaluation_criteria || []).map((c, i) => `${i+1}. ${c}`).join('\n');
      const prompt = `Jesteś egzaminatorem oceniającym zadanie programistyczne z egzaminu zawodowego INF.04 (technik programista). Oceniasz kod ucznia.

ZADANIE:
${question.title}

TREŚĆ ZADANIA:
${question.description}

KRYTERIA OCENY:
${criteriaList}

PRZYKŁADOWE WYJŚCIE:
${question.example_output || 'Brak'}

KOD UCZNIA (${LANG_OPTIONS.find(l => l.id === lang)?.label || lang}):
\`\`\`
${currentCode}
\`\`\`

Oceń kod zgodnie z kryteriami. Odpowiedz TYLKO w formacie JSON (bez markdown, bez backticks):
{
  "score": <liczba 0-100>,
  "verdict": "<ZALICZONO|CZĘŚCIOWO|NIEZALICZONO>",
  "criteria_results": [
    { "criterion": "<treść kryterium>", "passed": <true|false>, "comment": "<krótki komentarz>" }
  ],
  "general_comment": "<ogólny komentarz po polsku, max 3 zdania>",
  "tips": ["<wskazówka 1>", "<wskazówka 2>", "<wskazówka 3>"]
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(text);
      setFeedback({ ...parsed, elapsed: timer.elapsed });
    } catch (err) {
      setFeedback({ error: true, message: err.message });
    }
    setSubmitting(false);
  }

  const timerState = timer.danger ? 'danger' : timer.warning ? 'warning' : 'normal';

  return (
    <div className="practice-editor-root">

      {/* ── TOP BAR ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.25rem', height: 56, flexShrink: 0,
        backgroundColor: 'rgba(245,243,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(124,58,237,0.12)',
        boxShadow: '0 2px 16px rgba(124,58,237,0.07)',
        gap: '1rem',
      }}>
        {/* Left: logo + breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
          <Link to="/learn/praktyka" onClick={onAbort} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <img src="/landscape_jamiq.png" alt="JamIQ" style={{ height: 32, width: 'auto' }} />
          </Link>
          <span style={{ color: 'rgba(124,58,237,0.3)', fontSize: '1.1rem', flexShrink: 0 }}>›</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
            <span style={{
              fontSize: '0.68rem', fontWeight: 800, padding: '0.22rem 0.6rem',
              borderRadius: 6, background: dc.bg, color: dc.text, border: `1px solid ${dc.border}`,
              flexShrink: 0, letterSpacing: '0.02em',
            }}>{DIFF_LABEL[question.difficulty] || 'Średnie'}</span>
            <span style={{ color: '#3b0764', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {question.title}
            </span>
          </div>
        </div>

        {/* Center: timer */}
        <div className="timer-pill" data-timer-state={timerState}>
          {timerMode !== 'none' && (
            <div className="timer-pill__track">
              <div className="timer-pill__fill" style={{ width: `${100 - timer.pct}%` }} />
            </div>
          )}
          <Icon icon="lucide:timer" className="timer-pill__icon" />
          <span className="timer-pill__time">
            {timerMode === 'none' ? timer.fmt(null) : timer.fmt(timer.remaining)}
          </span>
          {timerMode === 'none' && <span className="timer-pill__elapsed">minęło</span>}
        </div>

        {/* Right: lang selector + actions */}
        <div className="top-bar__right">
          <select
            value={lang}
            onChange={e => handleLangChange(e.target.value)}
            className="language-select"
          >
            {LANG_OPTIONS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>

          <button onClick={onAbort} className="exit-btn">
            <Icon icon="lucide:arrow-left" style={{ fontSize: '0.85rem' }} />
            Wyjdź
          </button>

          <button onClick={handleSubmit} disabled={submitting} className="submit-btn">
            {submitting
              ? <><Icon icon="lucide:loader-circle" style={{ fontSize: '0.9rem', animation: 'spin 1s linear infinite' }} /> Oceniam…</>
              : <><Icon icon="lucide:play" style={{ fontSize: '0.9rem' }} /> Oceń kod</>
            }
          </button>
        </div>
      </div>

      {/* ── MAIN SPLIT ── */}
      <div className="split-layout">

        {/* ══ LEFT PANEL ══ */}
        <div className="left-panel">

          {/* Tab bar */}
          <div className="tab-bar">
            {[
              { id: 'zadanie',     label: 'Zadanie',     icon: 'lucide:file-text' },
              { id: 'podpowiedzi', label: 'Podpowiedzi', icon: 'lucide:lightbulb' },
              { id: 'przyklad',   label: 'Przykład',    icon: 'lucide:play-circle' },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className="tab-btn" data-active={tab === t.id}>
                <Icon icon={t.icon} />
                {t.label}
              </button>
            ))}
          </div>

          {/* ── TAB: ZADANIE ── */}
          <div className={`tab-panel ${tab === 'zadanie' ? 'tab-panel--active' : ''}`}>
            {/* Header card */}
            <div className="task-header">
              <div className="task-header__meta">
                <span className="task-header__badge" style={{ background: dc.bg, color: dc.text, border: `1px solid ${dc.border}` }}>
                  {DIFF_LABEL[question.difficulty] || 'Średnie'}
                </span>
                <span className="task-header__category">{question.category}</span>
                <span className="task-header__any-lang">dowolny język</span>
              </div>
              <h2 className="task-header__title">{question.title || 'Brak tytułu'}</h2>
            </div>

            {/* Description */}
            <div className="description-content">
              {(question.description || '').split('\n').map((line, i) => {
                const stepMatch = line.match(/^(\d+)\.\s+(.+)/);
                const subMatch  = line.match(/^(\s+[-•])\s+(.+)/);
                const isBlank   = line.trim() === '';

                if (isBlank) return <div key={i} style={{ height: '0.5rem' }} />;

                if (stepMatch) {
                  return (
                    <div key={i} className="description-step">
                      <span className="description-step__num">{stepMatch[1]}</span>
                      <span className="description-step__text">{stepMatch[2]}</span>
                    </div>
                  );
                }

                if (subMatch) {
                  return (
                    <div key={i} className="description-sub">
                      <Icon icon="lucide:chevron-right" className="description-sub__icon" />
                      <span className="description-sub__text">{subMatch[2]}</span>
                    </div>
                  );
                }

                const isCode = line.match(/^\s{2,}/) || line.match(/^[A-Za-z_\[{("].*[:=]/) || line.includes('→');
                if (isCode) {
                  return (
                    <pre key={i} className="description-code">{line}</pre>
                  );
                }

                return (
                  <p key={i} className="description-text">{line}</p>
                );
              })}
            </div>
          </div>

          {/* ── TAB: PODPOWIEDZI ── */}
          <div className={`tab-panel ${tab === 'podpowiedzi' ? 'tab-panel--active' : ''} hints-section`}>
            <div className="hints-header">
              <Icon icon="lucide:lightbulb" className="hints-header__icon" />
              <span className="hints-header__text">Podpowiedzi</span>
            </div>
            <p className="hints-intro">
              Spróbuj najpierw sam — odkryj podpowiedź tylko gdy utkniesz.
            </p>
            {(question.hints || []).map((hint, i) => (
              <div key={i} className="hint-block">
                <button
                  onClick={() => setHintsOpen(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                  className="hint-btn"
                  data-open={hintsOpen.includes(i)}
                >
                  <span>Podpowiedź {i + 1}</span>
                  <Icon icon="lucide:chevron-down" className="hint-btn__icon" />
                </button>
                {hintsOpen.includes(i) && (
                  <div className="hint-content">{hint}</div>
                )}
              </div>
            ))}
          </div>

          {/* ── TAB: PRZYKŁAD ── */}
          <div className={`tab-panel ${tab === 'przyklad' ? 'tab-panel--active' : ''} example-section`}>
            <div className="example-label">
              <Icon icon="lucide:play-circle" className="example-label__icon" />
              <span className="example-label__text">Przykład I/O</span>
            </div>

            {question.example_input && (
              <div className="example-block">
                <div className="example-block__label">Wejście</div>
                <pre className="example-block__content example-block__content--input">{question.example_input}</pre>
              </div>
            )}

            {question.example_output && (
              <div className="example-block">
                <div className="example-block__label">Wyjście</div>
                <pre className="example-block__content example-block__content--output">{question.example_output}</pre>
              </div>
            )}

            {question.evaluation_criteria && question.evaluation_criteria.length > 0 && (
              <div>
                <div className="example-block__label">Kryteria oceny Gemini</div>
                <div className="criteria-list">
                  {question.evaluation_criteria.map((c, i) => (
                    <div key={i} className="criteria-list__item">
                      <span className="criteria-list__number">{i + 1}</span>
                      <span className="criteria-list__text">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══ RIGHT PANEL — Monaco editor + feedback ══ */}
        <div className="right-panel">

          {/* Editor topbar */}
          <div className="top-bar top-bar--dark">
            <div className="window-controls">
              <div className="window-controls__dot window-controls__dot--red"></div>
              <div className="window-controls__dot window-controls__dot--yellow"></div>
              <div className="window-controls__dot window-controls__dot--green"></div>
              <span className="window-controls__label">{LANG_OPTIONS.find(l => l.id === lang)?.label}</span>
            </div>
            <button
              onClick={() => {
                const template = LANG_OPTIONS.find(l => l.id === lang)?.comment || '';
                if (window.confirm('Na pewno wyczyścić edytor?')) {
                  if (monacoRef.current) monacoRef.current.setValue(template);
                  setCode(template);
                }
              }}
              className="clear-btn"
            >Wyczyść</button>
          </div>

          {/* Monaco */}
          <div ref={containerRef} className={`monaco-container ${feedback ? 'monaco-container--split' : ''}`} />

          {/* ── FEEDBACK PANEL ── */}
          {feedback && (
            <div className="feedback-panel">
              {feedback.error ? (
                <div className="alert alert--error">
                  <Icon icon="lucide:x-circle" style={{ fontSize: '1.1rem', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--danger-dark)' }}>Błąd oceniania</div>
                    <div style={{ color: 'var(--gray-500)', fontSize: '0.78rem', marginTop: 2 }}>{feedback.message}</div>
                  </div>
                </div>
              ) : (
                <div className="feedback-section">

                  {/* Verdict + Score row */}
                  <div className="verdict-row">
                    <div className={`badge badge--${feedback.verdict === 'ZALICZONO' ? 'success' : feedback.verdict === 'CZĘŚCIOWO' ? 'warning' : 'danger'}`}>
                      <Icon
                        icon={feedback.verdict === 'ZALICZONO' ? 'lucide:check-circle' : feedback.verdict === 'CZĘŚCIOWO' ? 'lucide:alert-triangle' : 'lucide:x-circle'}
                      />
                      {feedback.verdict}
                    </div>

                    {/* Score pill */}
                    <div className="score-row">
                      <div className="score-circle" style={{ '--score-deg': `${feedback.score * 3.6}deg`, '--score-color': feedback.score >= 75 ? 'var(--success)' : feedback.score >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                        <div className="score-circle__inner">{feedback.score}</div>
                      </div>
                      <div>
                        <div className="score-label">WYNIK</div>
                        <div className="score-value">{feedback.score}/100</div>
                      </div>
                    </div>

                    {feedback.elapsed !== undefined && (
                      <div className="elapsed-time">
                        <Icon icon="lucide:timer" style={{ fontSize: '0.85rem' }} />
                        {Math.floor(feedback.elapsed/60)}:{String(feedback.elapsed%60).padStart(2,'0')}
                      </div>
                    )}
                  </div>

                  {/* General comment */}
                  {feedback.general_comment && (
                    <div className="comment-box">
                      {feedback.general_comment}
                    </div>
                  )}

                  {/* Criteria */}
                  {feedback.criteria_results && feedback.criteria_results.length > 0 && (
                    <div className="criteria-section">
                      <div className="criteria-title">Kryteria oceny</div>
                      <div className="criteria-list-custom">
                        {feedback.criteria_results.map((cr, i) => (
                          <div key={i} className={`criteria-item ${cr.passed ? 'passed' : 'failed'}`}>
                            <span className="criteria-icon">
                              <Icon icon={cr.passed ? 'lucide:check' : 'lucide:x'} style={{ fontSize: '0.65rem' }} />
                            </span>
                            <div className="criteria-content">
                              <div className="criterion-text">{cr.criterion}</div>
                              {cr.comment && <div className="criterion-comment">{cr.comment}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tips */}
                  {feedback.tips && feedback.tips.length > 0 && (
                    <div className="tips-box">
                      <div className="tips-header">
                        <Icon icon="lucide:lightbulb" style={{ fontSize: '0.85rem' }} />
                        Wskazówki do poprawy
                      </div>
                      {feedback.tips.map((tip, i) => (
                        <div key={i} className="tip-item">
                          {tip}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="action-buttons">
                    <button onClick={() => { setFeedback(null); timer.resume(); }} className="btn btn--secondary">
                      <Icon icon="lucide:pencil" style={{ fontSize: '0.85rem' }} />
                      Popraw kod
                    </button>
                    <button onClick={() => onFinish(feedback)} className="btn btn--solid">
                      Następne zadanie
                      <Icon icon="lucide:arrow-right" style={{ fontSize: '0.85rem' }} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// ─── SUMMARY SCREEN ───────────────────────────────────────────────────────────
function SummaryScreen({ feedback, onRestart }) {
  const passed  = feedback.verdict === 'ZALICZONO';
  const partial = feedback.verdict === 'CZĘŚCIOWO';

  return (
    <div className="summary-container">
      <Header />
      <div className="summary-content">
        <div className="summary-icon pop" style={{ color: passed ? 'var(--success)' : partial ? 'var(--warning)' : 'var(--danger)' }}>
          <Icon
            icon={passed ? 'lucide:party-popper' : partial ? 'lucide:alert-triangle' : 'lucide:frown'}
            style={{ fontSize: '4rem' }}
          />
        </div>
        <h1 className={`summary-score summary-score--${passed ? 'pass' : partial ? 'partial' : 'fail'}`}>
          {feedback.score}%
        </h1>
        <p className={`summary-verdict summary-verdict--${passed ? 'pass' : partial ? 'partial' : 'fail'}`}>
          <Icon
            icon={passed ? 'lucide:check-circle' : partial ? 'lucide:alert-triangle' : 'lucide:x-circle'}
            style={{ fontSize: '1rem' }}
          />
          {passed ? 'Zaliczono!' : partial ? 'Częściowo poprawne' : 'Nie zaliczono — spróbuj jeszcze raz'}
        </p>

        {/* Criteria summary */}
        {feedback.criteria_results && (
          <div className="summary-criteria-card">
            <div className="summary-criteria-title">Kryteria</div>
            {feedback.criteria_results.map((cr, i) => (
              <div key={i} className={`summary-criteria-item ${cr.passed ? 'passed' : 'failed'}`}>
                <Icon
                  icon={cr.passed ? 'lucide:check' : 'lucide:x'}
                  className="summary-criteria-icon"
                />
                <div className="summary-criteria-text">{cr.criterion}</div>
              </div>
            ))}
          </div>
        )}

        <div className="summary-actions">
          <button onClick={onRestart} className="btn btn--solid">
            Nowe zadanie
            <Icon icon="lucide:arrow-right" style={{ fontSize: '1rem' }} />
          </button>
          <Link to="/exam" className="btn btn--secondary">
            <Icon icon="lucide:layout-dashboard" style={{ fontSize: '1rem' }} />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function PracticePage() {
  usePageTitle('Praktyka')
  const [phase,    setPhase]    = useState('setup');  // 'setup' | 'editor' | 'summary'
  const [config,   setConfig]   = useState(null);
  const [lastFb,   setLastFb]   = useState(null);

  if (phase === 'setup') {
    return (
      <SetupScreen
        onStart={cfg => { setConfig(cfg); setPhase('editor'); }}
      />
    );
  }

  if (phase === 'editor') {
    return (
      <EditorScreen
        question={config.question}
        lang={config.lang}
        timerMode={config.timerMode}
        onFinish={fb => { setLastFb(fb); setPhase('summary'); }}
        onAbort={() => setPhase('setup')}
      />
    );
  }

  return (
    <SummaryScreen
      feedback={lastFb}
      onRestart={() => setPhase('setup')}
    />
  );
}
