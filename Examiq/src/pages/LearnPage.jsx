// pages/LearnPage.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import questions from '../data/questions.json';
import { useUserSession } from '../hooks/useUserSession';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { usePageTitle } from '../hooks/usePageTitle';
import { Icon } from '@iconify/react';
import './LearnPage.css'
import Footer from '../components/Footer';

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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#f5f3ff 0%,#ede9fe 45%,#e0e7ff 100%)', fontFamily: "'Sora', sans-serif" }}>
      <Header />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 99, padding: '0.4rem 1.1rem', marginBottom: '1.2rem',
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              <Icon icon="lucide:book-open" style={{ verticalAlign: 'middle', marginRight: 4 }} /> Teoria
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,2.8rem)', fontWeight: 900, color: '#3b0764', margin: 0, letterSpacing: '-1px', lineHeight: 1.1 }}>
            Skonfiguruj quiz
          </h1>
          <p style={{ color: '#6b7280', marginTop: '0.75rem', fontSize: '0.95rem' }}>
            Dostępnych pytań: <strong style={{ color: '#7c3aed' }}>{available}</strong>
          </p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(124,58,237,0.12)',
          borderRadius: 24, padding: '2rem',
          boxShadow: '0 4px 32px rgba(124,58,237,0.08)',
          display: 'flex', flexDirection: 'column', gap: '2rem',
        }}>

          {/* Liczba pytań */}
          <div>
            <label style={{ display: 'block', color: '#374151', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>
              Liczba pytań: <span style={{ color: '#7c3aed', fontSize: '1.1rem' }}>{Math.min(count, maxCount)}</span>
            </label>
            <input
              type="range" min={1} max={maxCount} value={Math.min(count, maxCount)}
              onChange={e => setCount(+e.target.value)}
              style={{ width: '100%', accentColor: '#7c3aed', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.78rem' }}>1</span>
              <span style={{ color: '#9ca3af', fontSize: '0.78rem' }}>{maxCount}</span>
            </div>
          </div>

          {/* Czas */}
          <div>
            <label style={{ display: 'block', color: '#374151', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Czas na pytanie</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {[
                { val: 'none', label: 'lucide:infinity', text: '∞',  sub: 'bez limitu' },
                { val: '15',   label: null, text: '15s',              sub: 'szybki' },
                { val: '30',   label: null, text: '30s',              sub: 'normalny' },
                { val: '60',   label: null, text: '60s',              sub: 'spokojny' },
              ].map(opt => (
                <button key={opt.val} onClick={() => setTimeMode(opt.val)} style={{
                  padding: '0.75rem 0.5rem', borderRadius: 12, textAlign: 'center',
                  border: timeMode === opt.val ? '1.5px solid #7c3aed' : '1.5px solid rgba(124,58,237,0.12)',
                  background: timeMode === opt.val ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Sora', sans-serif",
                }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: timeMode === opt.val ? '#7c3aed' : '#9ca3af', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {opt.label ? <Icon icon={opt.label} /> : opt.text}
                  </div>
                  <div style={{ fontSize: '0.68rem', marginTop: 2, color: timeMode === opt.val ? '#a78bfa' : '#c4b5fd' }}>{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Typ */}
          <div>
            <label style={{ display: 'block', color: '#374151', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Typ pytań</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[
                { val: 'both',   label: 'Oba typy',   icon: 'lucide:shuffle' },
                { val: 'closed', label: 'Zamknięte',  icon: 'lucide:circle-dot' },
                { val: 'open',   label: 'Otwarte',    icon: 'lucide:pencil' },
              ].map(opt => (
                <button key={opt.val} onClick={() => setTypeMode(opt.val)} style={{
                  padding: '0.75rem 0.5rem', borderRadius: 12, fontWeight: 600, fontSize: '0.85rem',
                  border: typeMode === opt.val ? '1.5px solid #7c3aed' : '1.5px solid rgba(124,58,237,0.12)',
                  background: typeMode === opt.val ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.6)',
                  color: typeMode === opt.val ? '#7c3aed' : '#6b7280',
                  cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Sora', sans-serif",
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <Icon icon={opt.icon} style={{ fontSize: '0.9rem' }} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onStart({ count: Math.min(count, maxCount), timeLimit: timeMode === 'none' ? null : +timeMode, typeMode })}
            style={{
              width: '100%', padding: '1rem',
              background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
              color: '#fff', border: 'none', borderRadius: 14,
              fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer',
              fontFamily: "'Sora', sans-serif",
              boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
              transition: 'transform 0.15s, box-shadow 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,58,237,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';   e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.3)'; }}
          >
            Rozpocznij quiz
            <Icon icon="lucide:arrow-right" />
          </button>
        </div>
      </div>
      <Footer></Footer>
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
      const prompt = `Jesteś weryfikatorem odpowiedzi na pytania egzaminacyjne z IT (egzamin INF04).\n\nPytanie: ${question}\nWzorcowa odpowiedź: ${correctAnswer}\nOdpowiedź ucznia: ${userAnswer}\n\nOceń czy odpowiedź ucznia jest merytorycznie poprawna. Nie wymagaj identycznego brzmienia — liczy się sens i kluczowe pojęcia techniczne. Odpowiedz TYLKO jednym słowem: TAK lub NIE.`;
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
  }, [idx, config.timeLimit, revealed, handleReveal]);

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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#f5f3ff 0%,#ede9fe 45%,#e0e7ff 100%)', fontFamily: "'Sora', sans-serif" }}>

      {/* PROGRESS BAR */}
      <div style={{ position: 'relative', height: 5, background: 'rgba(124,58,237,0.1)', marginTop: -5, zIndex: 1001 }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${progress * 100}%`,
          background: 'linear-gradient(90deg,#7c3aed,#a78bfa)',
          transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '0 0 10px rgba(124,58,237,0.4)',
        }} />
        <div style={{
          position: 'absolute', top: -3, left: `${progress * 100}%`, transform: 'translateX(-50%)',
          width: 11, height: 11, borderRadius: '50%',
          background: '#7c3aed', boxShadow: '0 0 8px rgba(124,58,237,0.6)',
          transition: 'left 0.5s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>

      <Header />

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>

        {/* TOPBAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
          <span style={{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: 600 }}>
            Pytanie <span style={{ color: '#7c3aed', fontWeight: 800 }}>{idx + 1}</span> / {pool.length}
          </span>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: showFlame ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.7)',
              border: showFlame ? '1px solid rgba(245,158,11,0.35)' : '1px solid rgba(124,58,237,0.12)',
              borderRadius: 99, padding: '0.3rem 0.8rem', transition: 'all 0.3s',
            }}>
              <Icon
                icon="lucide:flame"
                style={{
                  fontSize: '1rem',
                  color: showFlame ? '#f59e0b' : '#c4b5fd',
                  filter: showFlame ? 'none' : 'opacity(0.3)',
                  animation: showFlame ? 'flameDance 0.5s ease' : 'none',
                  transition: 'color 0.3s',
                }}
              />
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: showFlame ? '#d97706' : '#c4b5fd', transition: 'color 0.3s' }}>{streak}</span>
            </div>
            {config.timeLimit && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: timerPct > 0.5 ? 'rgba(22,163,74,0.08)' : timerPct > 0.25 ? 'rgba(217,119,6,0.08)' : 'rgba(220,38,38,0.08)',
                border: `1px solid ${timerPct > 0.5 ? 'rgba(22,163,74,0.25)' : timerPct > 0.25 ? 'rgba(217,119,6,0.25)' : 'rgba(220,38,38,0.25)'}`,
                borderRadius: 99, padding: '0.3rem 0.8rem', transition: 'all 0.3s',
                animation: timerPulse && !revealed ? 'timerBlink 0.5s infinite' : 'none',
              }}>
                <Icon icon="lucide:timer" style={{ fontSize: '0.85rem', color: timerColor }} />
                <span style={{ fontWeight: 900, fontSize: '1rem', color: timerColor, minWidth: 24, textAlign: 'center' }}>{timeLeft}</span>
              </div>
            )}
          </div>
        </div>

        {/* PYTANIE */}
        <div style={{
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(124,58,237,0.1)',
          borderRadius: 20, padding: '1.75rem', marginBottom: '1.25rem',
          boxShadow: '0 2px 16px rgba(124,58,237,0.06)',
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>
            {q.category}
          </div>
          <p style={{ color: '#1f2937', fontWeight: 600, fontSize: '1.05rem', lineHeight: 1.7, margin: 0 }}>{q.question}</p>
          {q.snippet && <div dangerouslySetInnerHTML={{ __html: q.snippet }} style={{ marginTop: '1rem' }} />}
        </div>

        {/* ZAMKNIĘTE */}
        {q.type === 'closed' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: '1.25rem' }}>
            {Object.entries(q.options).map(([key, val]) => {
              const isRight  = revealed && key === q.answer;
              const isWrong  = revealed && key === selected && key !== q.answer;
              const isDimmed = revealed && key !== q.answer && key !== selected;
              return (
                <button key={key} onClick={() => { if (!revealed) { setSelected(key); handleReveal(key === q.answer); } }}
                  disabled={revealed} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '0.9rem 1.1rem', borderRadius: 14, textAlign: 'left',
                  fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: '0.9rem',
                  cursor: revealed ? 'default' : 'pointer', transition: 'all 0.15s',
                  background: isRight  ? 'rgba(22,163,74,0.1)'
                            : isWrong  ? 'rgba(220,38,38,0.1)'
                            : isDimmed ? 'rgba(255,255,255,0.4)'
                            : 'rgba(255,255,255,0.85)',
                  border: isRight  ? '1.5px solid rgba(22,163,74,0.5)'
                        : isWrong  ? '1.5px solid rgba(220,38,38,0.5)'
                        : isDimmed ? '1px solid rgba(124,58,237,0.06)'
                        : '1px solid rgba(124,58,237,0.12)',
                  color: isRight  ? '#166534'
                       : isWrong  ? '#991b1b'
                       : isDimmed ? '#c4b5fd'
                       : '#374151',
                  boxShadow: revealed ? 'none' : '0 1px 4px rgba(124,58,237,0.06)',
                }}
                onMouseEnter={e => { if (!revealed) { e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.35)'; e.currentTarget.style.transform = 'translateX(5px)'; } }}
                onMouseLeave={e => { if (!revealed) { e.currentTarget.style.background = 'rgba(255,255,255,0.85)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.12)'; e.currentTarget.style.transform = 'translateX(0)'; } }}
                >
                  <span style={{
                    minWidth: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: '0.8rem',
                    background: isRight ? 'rgba(22,163,74,0.15)' : isWrong ? 'rgba(220,38,38,0.15)' : 'rgba(124,58,237,0.08)',
                    color: isRight ? '#166534' : isWrong ? '#991b1b' : '#7c3aed',
                  }}>{key}</span>
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
              style={{
                width: '100%', padding: '1rem', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)',
                border: revealed
                  ? (isCorrect ? '1.5px solid rgba(22,163,74,0.5)' : '1.5px solid rgba(220,38,38,0.5)')
                  : '1.5px solid rgba(124,58,237,0.2)',
                borderRadius: 14, color: '#1f2937',
                fontFamily: "'Sora', sans-serif", fontSize: '0.95rem',
                resize: 'vertical', outline: 'none', transition: 'border-color 0.2s',
                opacity: isChecking ? 0.7 : 1,
              }}
            />
            {!revealed && (
              <button onClick={handleOpenSubmit}
                disabled={!openAnswer.trim() || isChecking} style={{
                marginTop: 8, padding: '0.65rem 1.5rem',
                background: openAnswer.trim() && !isChecking ? 'linear-gradient(135deg,#7c3aed,#a78bfa)' : 'rgba(124,58,237,0.08)',
                border: 'none', borderRadius: 10,
                color: openAnswer.trim() && !isChecking ? '#fff' : '#c4b5fd',
                fontWeight: 700, fontSize: '0.85rem',
                cursor: openAnswer.trim() && !isChecking ? 'pointer' : 'default',
                fontFamily: "'Sora', sans-serif", transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                {isChecking ? (
                  <>
                    <Icon icon="lucide:loader-2" style={{ animation: 'spin 0.8s linear infinite', fontSize: '0.9rem' }} />
                    Weryfikuje Gemini...
                  </>
                ) : 'Sprawdź'}
              </button>
            )}
          </div>
        )}

        {/* FEEDBACK */}
        {revealed && (
          <div style={{
            borderRadius: 20, overflow: 'hidden', marginBottom: '1.25rem',
            border: isCorrect ? '1px solid rgba(22,163,74,0.3)' : '1px solid rgba(220,38,38,0.3)',
            background: isCorrect ? 'rgba(22,163,74,0.06)' : 'rgba(220,38,38,0.06)',
            boxShadow: isCorrect ? '0 4px 20px rgba(22,163,74,0.1)' : '0 4px 20px rgba(220,38,38,0.1)',
            animation: 'slideUp 0.3s ease',
          }}>
            <div style={{ display: 'flex', gap: '1rem', padding: '1.25rem', alignItems: 'flex-start' }}>
              <img src={isCorrect ? JAMIQ_HAPPY : JAMIQ_SAD} alt="Jamiq"
                style={{ width: 68, height: 68, objectFit: 'contain', flexShrink: 0, animation: 'jamiqPop 0.5s ease' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: isCorrect ? '#166534' : '#991b1b', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isCorrect ? (
                    streak >= 2 ? (
                      <>
                        <Icon icon="lucide:flame" style={{ color: '#f59e0b' }} />
                        Streak ×{streak}! Świetnie!
                      </>
                    ) : (
                      <>
                        <Icon icon="lucide:check-circle-2" />
                        Poprawna odpowiedź!
                      </>
                    )
                  ) : (
                    <>
                      <Icon icon="lucide:x-circle" />
                      Błąd{q.type === 'closed' ? ` — poprawna: ${q.answer}` : ''}
                    </>
                  )}
                </div>
                {q.type === 'open' && !isCorrect && (
                  <div style={{ color: '#7c3aed', fontSize: '0.83rem', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Wzorcowa odpowiedź: {q.answer}
                  </div>
                )}
                <p style={{ color: isCorrect ? '#166534' : '#7f1d1d', fontSize: '0.87rem', lineHeight: 1.65, margin: 0, opacity: 0.85 }}>
                  {q.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* NASTĘPNE */}
        {revealed && (
          <button onClick={handleNext} style={{
            width: '100%', padding: '1rem',
            background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
            color: '#fff', border: 'none', borderRadius: 14,
            fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
            fontFamily: "'Sora', sans-serif",
            boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
            animation: 'slideUp 0.3s ease',
            transition: 'transform 0.15s, box-shadow 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,58,237,0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';   e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.3)'; }}
          >
            {idx + 1 >= pool.length ? 'Zobacz wyniki' : 'Następne pytanie'}
            <Icon icon="lucide:arrow-right" />
          </button>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes jamiqPop {
          0%  { transform: scale(0.5) rotate(-10deg); opacity: 0; }
          65% { transform: scale(1.15) rotate(4deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes flameDance {
          0%   { transform: scale(1); }
          35%  { transform: scale(1.6) rotate(-12deg); }
          70%  { transform: scale(1.2) rotate(6deg); }
          100% { transform: scale(1); }
        }
        @keyframes timerBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#f5f3ff 0%,#ede9fe 45%,#e0e7ff 100%)', fontFamily: "'Sora', sans-serif" }}>
      <Header />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem', animation: 'riseIn 0.5s ease' }}>
          <img
            src={pct >= 75 ? JAMIQ_HAPPY : pct >= 50 ? JAMIQ_SAD : JAMIQ_ANGRY}
            alt="Jamiq"
            style={{ width: 110, height: 110, objectFit: 'contain', animation: 'jamiqPop 0.6s ease' }}
          />
          {/* stars */}
          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: 4 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Icon
                key={i}
                icon={i < stars ? 'lucide:star' : 'lucide:star'}
                style={{ fontSize: '1.6rem', color: i < stars ? '#f59e0b' : '#e5e7eb', fill: i < stars ? '#f59e0b' : 'none' }}
              />
            ))}
          </div>
          <h1 style={{
            fontSize: 'clamp(2.5rem,8vw,4rem)', fontWeight: 900,
            color: passed ? '#166534' : '#991b1b',
            margin: '0.4rem 0 0', letterSpacing: '-2px', lineHeight: 1,
          }}>{pct}%</h1>
          <p style={{ color: passed ? '#16a34a' : '#dc2626', margin: '0.4rem 0 0', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {passed ? (
              <><Icon icon="lucide:party-popper" /> Zaliczono! Próg 75% osiągnięty.</>
            ) : (
              <><Icon icon="lucide:frown" /> Nie zaliczono — próg to 75%</>
            )}
          </p>
          <p style={{ color: '#9ca3af', margin: '0.2rem 0 0', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Icon icon="lucide:save" style={{ fontSize: '0.8rem' }} />
            Wynik zapisano w historii
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: '1.5rem', animation: 'riseIn 0.6s ease' }}>
          {[
            { label: 'Poprawne',   val: correct,        color: '#166534', bg: 'rgba(22,163,74,0.08)',   border: 'rgba(22,163,74,0.2)',   icon: 'lucide:check-circle-2' },
            { label: 'Błędne',     val: total - correct, color: '#991b1b', bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.2)',   icon: 'lucide:x-circle' },
            { label: 'Wszystkich', val: total,           color: '#5b21b6', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)',  icon: 'lucide:list' },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg, border: `1px solid ${s.border}`,
              borderRadius: 16, padding: '1.2rem', textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <Icon icon={s.icon} style={{ fontSize: '1.1rem', color: s.color, marginBottom: 4 }} />
              <div style={{ fontSize: '2rem', fontWeight: 900, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(124,58,237,0.1)', borderRadius: 16, padding: '1.5rem',
          marginBottom: '1.5rem', boxShadow: '0 2px 12px rgba(124,58,237,0.06)',
          animation: 'riseIn 0.7s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#6b7280', fontSize: '0.82rem', fontWeight: 600 }}>Wynik końcowy</span>
            <span style={{ color: '#7c3aed', fontSize: '0.82rem', fontWeight: 700 }}>próg 75%</span>
          </div>
          <div style={{ background: 'rgba(124,58,237,0.08)', borderRadius: 99, height: 12, position: 'relative', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${pct}%`, borderRadius: 99,
              background: passed ? 'linear-gradient(90deg,#16a34a,#4ade80)' : 'linear-gradient(90deg,#dc2626,#f87171)',
              transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
              boxShadow: passed ? '0 0 10px rgba(22,163,74,0.4)' : '0 0 10px rgba(220,38,38,0.4)',
            }} />
            <div style={{
              position: 'absolute', top: -2, left: '75%', transform: 'translateX(-50%)',
              width: 2, height: 16, background: '#7c3aed', borderRadius: 1,
            }} />
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(124,58,237,0.1)', borderRadius: 16, padding: '1.5rem',
          marginBottom: '1.5rem', maxHeight: 300, overflowY: 'auto',
          boxShadow: '0 2px 12px rgba(124,58,237,0.06)',
          animation: 'riseIn 0.8s ease',
        }}>
          <h3 style={{ color: '#374151', fontWeight: 700, margin: '0 0 1rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Przegląd odpowiedzi
          </h3>
          {results.map((r, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              padding: '0.65rem 0',
              borderBottom: i < results.length - 1 ? '1px solid rgba(124,58,237,0.06)' : 'none',
            }}>
              <span style={{
                minWidth: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 2,
                background: r.correct ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.12)',
                color: r.correct ? '#166534' : '#991b1b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.72rem', fontWeight: 900,
              }}>
                <Icon icon={r.correct ? 'lucide:check' : 'lucide:x'} style={{ fontSize: '0.75rem' }} />
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ color: r.correct ? '#9ca3af' : '#374151', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>
                  {r.q.question.slice(0, 90)}{r.q.question.length > 90 ? '…' : ''}
                </p>
                {!r.correct && (
                  <p style={{ color: '#7c3aed', fontSize: '0.75rem', margin: '2px 0 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon icon="lucide:check" style={{ fontSize: '0.7rem' }} />
                    {r.q.answer}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, animation: 'riseIn 0.9s ease' }}>
          <button onClick={onRestart} style={{
            flex: 1, padding: '1rem',
            background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
            color: '#fff', border: 'none', borderRadius: 14,
            fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
            fontFamily: "'Sora', sans-serif",
            boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
            transition: 'transform 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Icon icon="lucide:refresh-cw" />
            Zagraj ponownie
          </button>
          <Link to="/exam" style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{
              width: '100%', padding: '1rem',
              background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(124,58,237,0.2)',
              color: '#7c3aed', borderRadius: 14,
              fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
              fontFamily: "'Sora', sans-serif", transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.85)'; }}
            >
              Dashboard
              <Icon icon="lucide:arrow-right" />
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
  usePageTitle('Teoria')
  const [phase,   setPhase]   = useState('setup');
  const [config,  setConfig]  = useState(null);
  const [results, setResults] = useState([]);

  if (phase === 'setup')
    return <SetupScreen onStart={cfg => { setConfig(cfg); setPhase('quiz'); }} />;
  if (phase === 'quiz')
    return <QuizScreen config={config} onFinish={res => { setResults(res); setPhase('results'); }} />;
  return <ResultsScreen results={results} onRestart={() => setPhase('setup')} />;
}