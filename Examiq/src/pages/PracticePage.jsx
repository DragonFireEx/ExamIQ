// pages/PracticePage.jsx
// LeetCode-style practice environment with Monaco Editor + Gemini evaluation

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { GoogleGenerativeAI } from '@google/generative-ai';
import practiceData from '../data/practice.json';
import { usePageTitle } from '../hooks/usePageTitle';

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

  const categories = ['all', ...new Set(practiceData.map(q => q.category))];
  const filtered   = filter === 'all' ? practiceData : practiceData.filter(q => q.category === filter);

  const canStart = mode === 'random' || selected !== null;

  function handleStart() {
    const question = mode === 'random'
      ? filtered[Math.floor(Math.random() * filtered.length)]
      : practiceData.find(q => q.id === selected);
    onStart({ question, lang, timerMode });
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#f5f3ff 0%,#ede9fe 45%,#e0e7ff 100%)', fontFamily: "'Sora', sans-serif" }}>
      <Header />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 99, padding: '0.4rem 1.1rem', marginBottom: '1.2rem',
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              🔨 Tryb praktyki
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,2.6rem)', fontWeight: 900, color: '#3b0764', margin: 0, letterSpacing: '-1px', lineHeight: 1.1 }}>
            Wybierz zadanie
          </h1>
          <p style={{ color: '#6b7280', marginTop: '0.75rem', fontSize: '0.95rem' }}>
            Napisz kod, Gemini oceni Twoje rozwiązanie
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(14px)',
          border: '1px solid rgba(124,58,237,0.12)', borderRadius: 24,
          padding: '2rem', boxShadow: '0 4px 32px rgba(124,58,237,0.08)',
          display: 'flex', flexDirection: 'column', gap: '1.75rem',
        }}>

          {/* Mode toggle */}
          <div>
            <label style={{ display: 'block', color: '#374151', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Tryb wyboru
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { val: 'random', icon: '🎲', label: 'Losowe zadanie' },
                { val: 'pick',   icon: '📋', label: 'Wybierz z listy' },
              ].map(opt => (
                <button key={opt.val} onClick={() => setMode(opt.val)} style={{
                  padding: '0.9rem', borderRadius: 14, textAlign: 'center',
                  border: mode === opt.val ? '2px solid #7c3aed' : '2px solid rgba(124,58,237,0.12)',
                  background: mode === opt.val ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer', fontFamily: "'Sora', sans-serif", transition: 'all 0.15s',
                }}>
                  <div style={{ fontSize: '1.4rem' }}>{opt.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: mode === opt.val ? '#7c3aed' : '#6b7280', marginTop: 4 }}>{opt.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Category filter (random) or question picker (pick) */}
          {mode === 'random' ? (
            <div>
              <label style={{ display: 'block', color: '#374151', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Kategoria
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setFilter(cat)} style={{
                    padding: '0.45rem 1rem', borderRadius: 99,
                    border: filter === cat ? '1.5px solid #7c3aed' : '1.5px solid rgba(124,58,237,0.15)',
                    background: filter === cat ? 'rgba(124,58,237,0.12)' : 'transparent',
                    color: filter === cat ? '#7c3aed' : '#6b7280',
                    fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                    fontFamily: "'Sora', sans-serif", transition: 'all 0.12s',
                  }}>
                    {cat === 'all' ? 'Wszystkie' : cat}
                  </button>
                ))}
              </div>
              <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '0.6rem' }}>
                {filtered.length} zadań dostępnych
              </p>
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', color: '#374151', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Wybierz zadanie
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto', paddingRight: 4 }}>
                {practiceData.map(q => {
                  const dc = DIFFICULTY_COLOR[q.difficulty] || DIFFICULTY_COLOR.medium;
                  const isSelected = selected === q.id;
                  return (
                    <button key={q.id} onClick={() => setSelected(q.id)} style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.85rem 1rem', borderRadius: 12, textAlign: 'left',
                      border: isSelected ? '2px solid #7c3aed' : '1.5px solid rgba(124,58,237,0.1)',
                      background: isSelected ? 'rgba(124,58,237,0.07)' : 'rgba(255,255,255,0.7)',
                      cursor: 'pointer', fontFamily: "'Sora', sans-serif", transition: 'all 0.12s',
                    }}>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 800, padding: '0.25rem 0.6rem',
                        borderRadius: 6, background: dc.bg, color: dc.text, border: `1px solid ${dc.border}`,
                        whiteSpace: 'nowrap', flexShrink: 0,
                      }}>{DIFF_LABEL[q.difficulty] || q.difficulty}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 2 }}>{q.category}</div>
                      </div>
                      {isSelected && <span style={{ color: '#7c3aed', fontSize: '1.1rem', flexShrink: 0 }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Language */}
          <div>
            <label style={{ display: 'block', color: '#374151', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Język programowania
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {LANG_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => setLang(opt.id)} style={{
                  padding: '0.7rem 0.5rem', borderRadius: 12, textAlign: 'center',
                  border: lang === opt.id ? '2px solid #7c3aed' : '2px solid rgba(124,58,237,0.12)',
                  background: lang === opt.id ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer', fontFamily: "'Sora', sans-serif", transition: 'all 0.12s',
                  fontWeight: 700, fontSize: '0.82rem', color: lang === opt.id ? '#7c3aed' : '#6b7280',
                }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timer */}
          <div>
            <label style={{ display: 'block', color: '#374151', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Limit czasu
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
              {[
                { val: 'none', label: '∞',    sub: 'bez limitu' },
                { val: '15',   label: '15min', sub: 'sprint'     },
                { val: '30',   label: '30min', sub: 'normalny'   },
                { val: '45',   label: '45min', sub: 'egzamin'    },
                { val: '60',   label: '60min', sub: 'spokojny'   },
              ].map(opt => (
                <button key={opt.val} onClick={() => setTimerMode(opt.val)} style={{
                  padding: '0.7rem 0.3rem', borderRadius: 12, textAlign: 'center',
                  border: timerMode === opt.val ? '2px solid #7c3aed' : '2px solid rgba(124,58,237,0.12)',
                  background: timerMode === opt.val ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer', fontFamily: "'Sora', sans-serif", transition: 'all 0.12s',
                }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: timerMode === opt.val ? '#7c3aed' : '#374151' }}>{opt.label}</div>
                  <div style={{ fontSize: '0.65rem', marginTop: 2, color: timerMode === opt.val ? '#a78bfa' : '#9ca3af' }}>{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            disabled={!canStart}
            style={{
              padding: '1rem', background: canStart ? 'linear-gradient(135deg,#7c3aed,#a78bfa)' : '#e5e7eb',
              color: canStart ? '#fff' : '#9ca3af', border: 'none', borderRadius: 14,
              fontWeight: 800, fontSize: '1rem', cursor: canStart ? 'pointer' : 'not-allowed',
              fontFamily: "'Sora', sans-serif",
              boxShadow: canStart ? '0 4px 20px rgba(124,58,237,0.35)' : 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (canStart) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(124,58,237,0.45)'; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = canStart ? '0 4px 20px rgba(124,58,237,0.35)' : 'none'; }}
          >
            {canStart ? 'Rozpocznij zadanie →' : 'Wybierz zadanie z listy'}
          </button>
        </div>
      </div>
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
    if (monacoRef.current) return; // already initialized

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

  const timerColor = timer.danger ? '#dc2626' : timer.warning ? '#d97706' : '#7c3aed';
  const timerBg    = timer.danger ? 'rgba(220,38,38,0.08)' : timer.warning ? 'rgba(217,119,6,0.08)' : 'rgba(124,58,237,0.07)';
  const timerBorder = timer.danger ? 'rgba(220,38,38,0.25)' : timer.warning ? 'rgba(217,119,6,0.25)' : 'rgba(124,58,237,0.2)';

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Sora', sans-serif", background: '#f5f3ff', overflow: 'hidden' }}>

      {/* ── TOP BAR — app colors ── */}
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
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          background: timerBg, border: `1px solid ${timerBorder}`,
          borderRadius: 10, padding: '0.38rem 0.9rem', flexShrink: 0,
          transition: 'all 0.3s',
        }}>
          {timerMode !== 'none' && (
            <div style={{ width: 40, height: 3, borderRadius: 2, background: 'rgba(124,58,237,0.12)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${100 - timer.pct}%`,
                background: timerColor, borderRadius: 2,
                transition: 'width 1s linear, background 0.3s',
              }} />
            </div>
          )}
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '0.92rem', color: timerColor, letterSpacing: 1, transition: 'color 0.3s' }}>
            {timerMode === 'none' ? timer.fmt(null) : timer.fmt(timer.remaining)}
          </span>
          {timerMode === 'none' && <span style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 600 }}>minęło</span>}
        </div>

        {/* Right: lang selector + actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <select
            value={lang}
            onChange={e => handleLangChange(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(124,58,237,0.18)',
              color: '#374151', borderRadius: 9, padding: '0.32rem 0.65rem',
              fontSize: '0.82rem', fontFamily: "'Sora', sans-serif", cursor: 'pointer',
              fontWeight: 700, outline: 'none',
            }}
          >
            {LANG_OPTIONS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>

          <button
            onClick={onAbort}
            style={{
              background: 'transparent', border: '1.5px solid rgba(124,58,237,0.18)',
              color: '#6b7280', borderRadius: 9, padding: '0.32rem 0.8rem',
              fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora', sans-serif",
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'; e.currentTarget.style.color = '#7c3aed'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.18)'; e.currentTarget.style.color = '#6b7280'; }}
          >← Wyjdź</button>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              background: submitting ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg,#7c3aed,#a78bfa)',
              border: 'none', color: '#fff', borderRadius: 9,
              padding: '0.38rem 1.15rem', fontSize: '0.88rem', fontWeight: 800,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: "'Sora', sans-serif",
              boxShadow: submitting ? 'none' : '0 2px 14px rgba(124,58,237,0.4)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.5)'; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = submitting ? 'none' : '0 2px 14px rgba(124,58,237,0.4)'; }}
          >
            {submitting ? '⏳ Oceniam…' : '▶ Oceń kod'}
          </button>
        </div>
      </div>

      {/* ── MAIN SPLIT ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ══ LEFT PANEL — task description (app style) ══ */}
        <div style={{
          width: '40%', minWidth: 340, display: 'flex', flexDirection: 'column',
          borderRight: '1px solid rgba(124,58,237,0.1)',
          background: 'rgba(245,243,255,0.7)',
          overflow: 'hidden',
        }}>

          {/* Tab bar */}
          <div style={{
            display: 'flex', gap: 0,
            borderBottom: '1px solid rgba(124,58,237,0.1)',
            background: 'rgba(255,255,255,0.6)',
            padding: '0 1rem', flexShrink: 0,
          }}>
            {[
              { id: 'zadanie',     label: 'Zadanie',     icon: '📄' },
              { id: 'podpowiedzi', label: 'Podpowiedzi', icon: '💡' },
              { id: 'przyklad',   label: 'Przykład',    icon: '▶' },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '0.7rem 0.95rem', border: 'none', background: 'none',
                color: tab === t.id ? '#7c3aed' : '#9ca3af',
                fontWeight: tab === t.id ? 700 : 600, fontSize: '0.82rem',
                borderBottom: tab === t.id ? '2px solid #7c3aed' : '2px solid transparent',
                cursor: 'pointer', fontFamily: "'Sora', sans-serif",
                transition: 'all 0.12s', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: '0.3rem',
              }}>
                <span style={{ fontSize: '0.8rem' }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── TAB: ZADANIE ── */}
          <div style={{ flex: 1, overflowY: 'auto', display: tab === 'zadanie' ? 'flex' : 'none', flexDirection: 'column' }}>
            {/* Header card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.07) 0%, rgba(167,139,250,0.05) 100%)',
              borderBottom: '1px solid rgba(124,58,237,0.08)',
              padding: '1.25rem 1.4rem',
            }}>
              {/* Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 800, padding: '0.22rem 0.65rem',
                  borderRadius: 6, background: dc.bg, color: dc.text, border: `1px solid ${dc.border}`,
                  letterSpacing: '0.02em',
                }}>{DIFF_LABEL[question.difficulty] || 'Średnie'}</span>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, color: '#7c3aed',
                  background: 'rgba(124,58,237,0.08)', padding: '0.22rem 0.65rem',
                  borderRadius: 6, border: '1px solid rgba(124,58,237,0.18)',
                }}>{question.category}</span>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 600, color: '#6b7280',
                  background: 'rgba(107,114,128,0.07)', padding: '0.22rem 0.65rem',
                  borderRadius: 6, border: '1px solid rgba(107,114,128,0.15)',
                }}>dowolny język</span>
              </div>
              {/* Title */}
              <h2 style={{ color: '#3b0764', fontSize: '1.15rem', fontWeight: 900, margin: 0, lineHeight: 1.3, letterSpacing: '-0.3px' }}>
                {question.title}
              </h2>
            </div>

            {/* Description — numbered steps rendered nicely */}
            <div style={{ padding: '1.25rem 1.4rem 2rem', flex: 1 }}>
              {question.description.split('\n').map((line, i) => {
                const stepMatch = line.match(/^(\d+)\.\s+(.+)/);
                const subMatch  = line.match(/^(\s+[-•])\s+(.+)/);
                const isBlank   = line.trim() === '';

                if (isBlank) return <div key={i} style={{ height: '0.5rem' }} />;

                if (stepMatch) {
                  return (
                    <div key={i} style={{
                      display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                      marginBottom: '0.7rem',
                    }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                        background: 'rgba(124,58,237,0.12)', border: '1.5px solid rgba(124,58,237,0.22)',
                        color: '#7c3aed', fontSize: '0.72rem', fontWeight: 900,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginTop: 2,
                      }}>{stepMatch[1]}</span>
                      <span style={{ color: '#374151', fontSize: '0.88rem', lineHeight: 1.65, flex: 1 }}>
                        {stepMatch[2]}
                      </span>
                    </div>
                  );
                }

                if (subMatch) {
                  return (
                    <div key={i} style={{
                      display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
                      marginBottom: '0.4rem', paddingLeft: '2rem',
                    }}>
                      <span style={{ color: '#a78bfa', fontSize: '0.75rem', marginTop: 5, flexShrink: 0 }}>▸</span>
                      <span style={{ color: '#4b5563', fontSize: '0.85rem', lineHeight: 1.6 }}>{subMatch[2]}</span>
                    </div>
                  );
                }

                // code-looking lines (indented or starts with special chars)
                const isCode = line.match(/^\s{2,}/) || line.match(/^[A-Za-z_\[{("].*[:=]/) || line.includes('→');
                if (isCode) {
                  return (
                    <pre key={i} style={{
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      fontSize: '0.8rem', color: '#6d28d9',
                      background: 'rgba(124,58,237,0.05)',
                      border: '1px solid rgba(124,58,237,0.1)',
                      borderRadius: 7, padding: '0.3rem 0.75rem',
                      margin: '0.25rem 0', whiteSpace: 'pre-wrap', lineHeight: 1.6,
                    }}>{line}</pre>
                  );
                }

                return (
                  <p key={i} style={{ color: '#374151', fontSize: '0.88rem', lineHeight: 1.65, marginBottom: '0.35rem' }}>
                    {line}
                  </p>
                );
              })}
            </div>
          </div>

          {/* ── TAB: PODPOWIEDZI ── */}
          <div style={{ flex: 1, overflowY: 'auto', display: tab === 'podpowiedzi' ? 'flex' : 'none', flexDirection: 'column', padding: '1.25rem 1.4rem 2rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.18)',
              borderRadius: 99, padding: '0.35rem 0.9rem', marginBottom: '1.1rem', alignSelf: 'flex-start',
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7c3aed', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                💡 Podpowiedzi
              </span>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.82rem', marginBottom: '1.1rem', lineHeight: 1.5 }}>
              Spróbuj najpierw sam — odkryj podpowiedź tylko gdy utkniesz.
            </p>
            {(question.hints || []).map((hint, i) => (
              <div key={i} style={{ marginBottom: '0.6rem' }}>
                <button
                  onClick={() => setHintsOpen(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                  style={{
                    width: '100%', textAlign: 'left', padding: '0.8rem 1rem',
                    background: hintsOpen.includes(i) ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.7)',
                    border: `1.5px solid ${hintsOpen.includes(i) ? 'rgba(124,58,237,0.3)' : 'rgba(124,58,237,0.12)'}`,
                    borderRadius: hintsOpen.includes(i) ? '12px 12px 0 0' : 12,
                    cursor: 'pointer', fontFamily: "'Sora', sans-serif",
                    color: '#7c3aed', fontWeight: 700, fontSize: '0.85rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'all 0.15s',
                  }}
                >
                  <span>Podpowiedź {i + 1}</span>
                  <span style={{
                    fontSize: '0.65rem', opacity: 0.6,
                    transform: hintsOpen.includes(i) ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}>▼</span>
                </button>
                {hintsOpen.includes(i) && (
                  <div style={{
                    padding: '0.85rem 1rem',
                    background: 'rgba(124,58,237,0.04)',
                    border: '1.5px solid rgba(124,58,237,0.18)', borderTop: 'none',
                    borderRadius: '0 0 12px 12px',
                    color: '#4b5563', fontSize: '0.87rem', lineHeight: 1.65,
                  }}>{hint}</div>
                )}
              </div>
            ))}
          </div>

          {/* ── TAB: PRZYKŁAD ── */}
          <div style={{ flex: 1, overflowY: 'auto', display: tab === 'przyklad' ? 'flex' : 'none', flexDirection: 'column', padding: '1.25rem 1.4rem 2rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.18)',
              borderRadius: 99, padding: '0.35rem 0.9rem', marginBottom: '1.1rem', alignSelf: 'flex-start',
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7c3aed', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                ▶ Przykład I/O
              </span>
            </div>

            {question.example_input && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  fontSize: '0.72rem', fontWeight: 700, color: '#6b7280',
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.45rem',
                }}>Wejście</div>
                <pre style={{
                  background: 'rgba(99,102,241,0.06)',
                  border: '1px solid rgba(99,102,241,0.18)',
                  borderRadius: 10, padding: '0.85rem 1rem', margin: 0,
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '0.83rem',
                  color: '#4338ca', overflowX: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.6,
                }}>{question.example_input}</pre>
              </div>
            )}

            {question.example_output && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{
                  fontSize: '0.72rem', fontWeight: 700, color: '#6b7280',
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.45rem',
                }}>Wyjście</div>
                <pre style={{
                  background: 'rgba(22,163,74,0.05)',
                  border: '1px solid rgba(22,163,74,0.18)',
                  borderRadius: 10, padding: '0.85rem 1rem', margin: 0,
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '0.83rem',
                  color: '#166534', overflowX: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.6,
                }}>{question.example_output}</pre>
              </div>
            )}

            {question.evaluation_criteria && question.evaluation_criteria.length > 0 && (
              <div>
                <div style={{
                  fontSize: '0.72rem', fontWeight: 700, color: '#6b7280',
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.7rem',
                }}>Kryteria oceny Gemini</div>
                <div style={{
                  background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(124,58,237,0.12)',
                  borderRadius: 12, overflow: 'hidden',
                }}>
                  {question.evaluation_criteria.map((c, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: '0.7rem', alignItems: 'flex-start',
                      padding: '0.75rem 1rem',
                      borderBottom: i < question.evaluation_criteria.length - 1 ? '1px solid rgba(124,58,237,0.07)' : 'none',
                      background: i % 2 === 0 ? 'transparent' : 'rgba(124,58,237,0.02)',
                    }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                        background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
                        color: '#7c3aed', fontSize: '0.68rem', fontWeight: 900,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginTop: 2,
                      }}>{i + 1}</span>
                      <span style={{ color: '#374151', fontSize: '0.85rem', lineHeight: 1.55 }}>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══ RIGHT PANEL — Monaco editor + feedback ══ */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Editor topbar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.45rem 1rem',
            background: '#1e1e2e',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
              <span style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, marginLeft: '0.35rem' }}>
                {LANG_OPTIONS.find(l => l.id === lang)?.label}
              </span>
            </div>
            <button
              onClick={() => {
                const template = LANG_OPTIONS.find(l => l.id === lang)?.comment || '';
                if (window.confirm('Na pewno wyczyścić edytor?')) {
                  if (monacoRef.current) monacoRef.current.setValue(template);
                  setCode(template);
                }
              }}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#6b7280', borderRadius: 6, padding: '0.2rem 0.65rem',
                fontSize: '0.73rem', cursor: 'pointer', fontFamily: "'Sora', sans-serif",
                fontWeight: 600,
              }}
            >Wyczyść</button>
          </div>

          {/* Monaco */}
          <div ref={containerRef} style={{ flex: feedback ? '0 0 52%' : 1, minHeight: 180, overflow: 'hidden' }} />

          {/* ── FEEDBACK PANEL ── */}
          {feedback && (
            <div style={{
              flex: 1, overflowY: 'auto',
              background: 'rgba(245,243,255,0.97)',
              borderTop: '2px solid rgba(124,58,237,0.15)',
            }}>
              {feedback.error ? (
                <div style={{ padding: '1.5rem' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)',
                    borderRadius: 12, padding: '0.85rem 1rem',
                  }}>
                    <span style={{ fontSize: '1.1rem' }}>❌</span>
                    <div>
                      <div style={{ color: '#991b1b', fontWeight: 700, fontSize: '0.85rem' }}>Błąd oceniania</div>
                      <div style={{ color: '#6b7280', fontSize: '0.78rem', marginTop: 2 }}>{feedback.message}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '1.1rem 1.4rem 1.5rem' }}>

                  {/* ── Verdict + Score row ── */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {/* Verdict badge */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      background: feedback.verdict === 'ZALICZONO'
                        ? 'rgba(22,163,74,0.08)' : feedback.verdict === 'CZĘŚCIOWO'
                        ? 'rgba(217,119,6,0.08)' : 'rgba(220,38,38,0.08)',
                      border: `1.5px solid ${feedback.verdict === 'ZALICZONO' ? 'rgba(22,163,74,0.28)' : feedback.verdict === 'CZĘŚCIOWO' ? 'rgba(217,119,6,0.28)' : 'rgba(220,38,38,0.28)'}`,
                      borderRadius: 10, padding: '0.5rem 1rem',
                    }}>
                      <span style={{ fontSize: '1.15rem' }}>
                        {feedback.verdict === 'ZALICZONO' ? '✅' : feedback.verdict === 'CZĘŚCIOWO' ? '⚠️' : '❌'}
                      </span>
                      <span style={{
                        fontWeight: 800, fontSize: '0.92rem',
                        color: feedback.verdict === 'ZALICZONO' ? '#166534' : feedback.verdict === 'CZĘŚCIOWO' ? '#92400e' : '#991b1b',
                      }}>{feedback.verdict}</span>
                    </div>

                    {/* Score pill */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                        background: `conic-gradient(${feedback.score >= 75 ? '#16a34a' : feedback.score >= 50 ? '#d97706' : '#dc2626'} ${feedback.score * 3.6}deg, rgba(124,58,237,0.1) 0deg)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%',
                          background: 'rgba(245,243,255,0.97)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.7rem', fontWeight: 900, color: '#3b0764',
                        }}>{feedback.score}</div>
                      </div>
                      <div>
                        <div style={{ color: '#9ca3af', fontSize: '0.68rem', fontWeight: 600 }}>WYNIK</div>
                        <div style={{ color: '#3b0764', fontWeight: 800, fontSize: '0.88rem' }}>{feedback.score}/100</div>
                      </div>
                    </div>

                    {feedback.elapsed !== undefined && (
                      <div style={{
                        marginLeft: 'auto', color: '#9ca3af', fontSize: '0.78rem',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        ⏱ {Math.floor(feedback.elapsed/60)}:{String(feedback.elapsed%60).padStart(2,'0')}
                      </div>
                    )}
                  </div>

                  {/* General comment */}
                  {feedback.general_comment && (
                    <div style={{
                      background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(124,58,237,0.1)',
                      borderRadius: 10, padding: '0.85rem 1rem', marginBottom: '0.9rem',
                      color: '#374151', fontSize: '0.86rem', lineHeight: 1.65,
                      boxShadow: '0 1px 6px rgba(124,58,237,0.05)',
                    }}>
                      {feedback.general_comment}
                    </div>
                  )}

                  {/* Criteria */}
                  {feedback.criteria_results && feedback.criteria_results.length > 0 && (
                    <div style={{ marginBottom: '0.9rem' }}>
                      <div style={{ color: '#6b7280', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                        Kryteria oceny
                      </div>
                      <div style={{
                        background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(124,58,237,0.1)',
                        borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 6px rgba(124,58,237,0.05)',
                      }}>
                        {feedback.criteria_results.map((cr, i) => (
                          <div key={i} style={{
                            display: 'flex', gap: '0.65rem', alignItems: 'flex-start',
                            padding: '0.65rem 1rem',
                            borderBottom: i < feedback.criteria_results.length - 1 ? '1px solid rgba(124,58,237,0.06)' : 'none',
                            background: i % 2 === 0 ? 'transparent' : 'rgba(124,58,237,0.015)',
                          }}>
                            <span style={{
                              width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 2,
                              background: cr.passed ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)',
                              color: cr.passed ? '#16a34a' : '#dc2626',
                              border: `1px solid ${cr.passed ? 'rgba(22,163,74,0.25)' : 'rgba(220,38,38,0.25)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.68rem', fontWeight: 900,
                            }}>{cr.passed ? '✓' : '✗'}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ color: '#1f2937', fontSize: '0.84rem', fontWeight: 600, lineHeight: 1.4 }}>{cr.criterion}</div>
                              {cr.comment && <div style={{ color: '#6b7280', fontSize: '0.78rem', marginTop: 2, lineHeight: 1.4 }}>{cr.comment}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tips */}
                  {feedback.tips && feedback.tips.length > 0 && (
                    <div style={{
                      background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.18)',
                      borderRadius: 12, padding: '0.85rem 1rem', marginBottom: '1rem',
                    }}>
                      <div style={{ color: '#7c3aed', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
                        💡 Wskazówki do poprawy
                      </div>
                      {feedback.tips.map((tip, i) => (
                        <div key={i} style={{
                          color: '#4b5563', fontSize: '0.84rem', marginBottom: i < feedback.tips.length - 1 ? '0.45rem' : 0,
                          paddingLeft: '0.8rem', borderLeft: '2px solid rgba(124,58,237,0.35)',
                          lineHeight: 1.55,
                        }}>
                          {tip}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => { setFeedback(null); timer.resume(); }}
                      style={{
                        padding: '0.6rem 1.2rem',
                        background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(124,58,237,0.2)',
                        borderRadius: 10, color: '#7c3aed', fontWeight: 700, fontSize: '0.85rem',
                        cursor: 'pointer', fontFamily: "'Sora', sans-serif", transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.07)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; }}
                    >✏️ Popraw kod</button>
                    <button
                      onClick={() => onFinish(feedback)}
                      style={{
                        padding: '0.6rem 1.2rem',
                        background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
                        border: 'none', borderRadius: 10,
                        color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                        cursor: 'pointer', fontFamily: "'Sora', sans-serif",
                        boxShadow: '0 2px 12px rgba(124,58,237,0.35)',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 18px rgba(124,58,237,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(124,58,237,0.35)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >Następne zadanie →</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.25); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(124,58,237,0.45); }
      `}</style>
    </div>
  );
}

// ─── SUMMARY SCREEN ───────────────────────────────────────────────────────────
function SummaryScreen({ feedback, onRestart }) {
  const passed = feedback.verdict === 'ZALICZONO';
  const partial = feedback.verdict === 'CZĘŚCIOWO';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#f5f3ff 0%,#ede9fe 45%,#e0e7ff 100%)', fontFamily: "'Sora', sans-serif" }}>
      <Header />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '3rem 1.5rem 6rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '0.5rem', animation: 'pop 0.5s ease' }}>
          {passed ? '🎉' : partial ? '⚠️' : '😓'}
        </div>
        <h1 style={{
          fontSize: 'clamp(2.5rem,8vw,4rem)', fontWeight: 900, letterSpacing: '-2px',
          color: passed ? '#166534' : partial ? '#92400e' : '#991b1b', margin: '0.25rem 0',
        }}>{feedback.score}%</h1>
        <p style={{ color: passed ? '#16a34a' : partial ? '#d97706' : '#dc2626', fontWeight: 700, fontSize: '1rem', marginBottom: '2rem' }}>
          {passed ? '✅ Zaliczono!' : partial ? '⚠️ Częściowo poprawne' : '❌ Nie zaliczono — spróbuj jeszcze raz'}
        </p>

        {/* Criteria summary */}
        {feedback.criteria_results && (
          <div style={{
            background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(124,58,237,0.12)', borderRadius: 20,
            padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'left',
            boxShadow: '0 4px 24px rgba(124,58,237,0.08)',
          }}>
            <div style={{ fontWeight: 700, color: '#374151', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Kryteria</div>
            {feedback.criteria_results.map((cr, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', padding: '0.5rem 0', borderBottom: i < feedback.criteria_results.length - 1 ? '1px solid rgba(124,58,237,0.06)' : 'none' }}>
                <span style={{ color: cr.passed ? '#16a34a' : '#dc2626', fontWeight: 900, flexShrink: 0, marginTop: 2 }}>{cr.passed ? '✓' : '✗'}</span>
                <div style={{ color: '#4b5563', fontSize: '0.85rem' }}>{cr.criterion}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onRestart} style={{
            padding: '0.9rem 2rem', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
            color: '#fff', border: 'none', borderRadius: 14, fontWeight: 800, fontSize: '0.95rem',
            cursor: 'pointer', fontFamily: "'Sora', sans-serif", boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
          }}>Nowe zadanie →</button>
          <Link to="/exam" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '0.9rem 2rem', background: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(124,58,237,0.2)', borderRadius: 14,
              color: '#7c3aed', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
              fontFamily: "'Sora', sans-serif",
            }}>Dashboard</button>
          </Link>
        </div>
      </div>
      <style>{`
        @keyframes pop {
          0%   { transform: scale(0.3) rotate(-15deg); opacity: 0; }
          65%  { transform: scale(1.2) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
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