// pages/ExamPracticePage.jsx
import { useState, useRef } from 'react';
import Header from '../components/Header';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { usePageTitle } from '../hooks/usePageTitle';
import examSheets from '../data/examSheets.json';
import Footer from '../components/Footer';
import { Icon } from '@iconify/react';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const TYPE_COLOR = {
  konsola:      { bg: 'rgba(124,58,237,0.1)',  text: '#7c3aed', border: 'rgba(124,58,237,0.25)'  },
  webowa:       { bg: 'rgba(59,130,246,0.1)',  text: '#2563eb', border: 'rgba(59,130,246,0.25)'  },
  mobilna:      { bg: 'rgba(16,185,129,0.1)',  text: '#059669', border: 'rgba(16,185,129,0.25)'  },
  desktopowa:   { bg: 'rgba(245,158,11,0.1)',  text: '#d97706', border: 'rgba(245,158,11,0.25)'  },
  dokumentacja: { bg: 'rgba(107,114,128,0.1)', text: '#4b5563', border: 'rgba(107,114,128,0.25)' },
};
function typeStyle(type) { return TYPE_COLOR[type] || TYPE_COLOR.dokumentacja; }
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload  = () => resolve(r.result.split(',')[1]);
    r.onerror = () => reject(new Error('Nie można odczytać pliku'));
    r.readAsDataURL(file);
  });
}
function isImageFile(file) { return file.type.startsWith('image/'); }

// ─── HINT ACCORDION ───────────────────────────────────────────────────────────
function HintAccordion({ hints }) {
  const [open, setOpen] = useState(null);
  if (!hints?.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {hints.map((hint, i) => {
        const isOpen = open === i;
        return (
          <div key={i} style={{
            borderRadius: 12,
            border: `1px solid ${isOpen ? 'rgba(124,58,237,0.25)' : 'rgba(124,58,237,0.1)'}`,
            background: isOpen ? 'rgba(124,58,237,0.04)' : 'rgba(255,255,255,0.6)',
            overflow: 'hidden', transition: 'border-color 0.15s, background 0.15s',
          }}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', padding: '0.7rem 1rem',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'Sora', sans-serif", gap: '0.5rem',
              }}
            >
              <span style={{
                fontSize: '0.65rem', fontWeight: 800, color: '#a78bfa',
                background: 'rgba(124,58,237,0.1)', padding: '0.15rem 0.5rem',
                borderRadius: 99, letterSpacing: '0.05em',
                display: 'flex', alignItems: 'center', gap: '0.3rem',
              }}>
                <Icon icon="lucide:lightbulb" width={11} /> WSKAZÓWKA {i + 1}
              </span>
              <Icon icon="lucide:chevron-down" width={14} color="#a78bfa" style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>
            {isOpen && (
              <div style={{
                padding: '0.75rem 1rem 0.85rem',
                fontSize: '0.82rem', color: '#374151', lineHeight: 1.75,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                borderTop: '1px solid rgba(124,58,237,0.08)',
                fontFamily: "'Sora', sans-serif",
              }}>{hint}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── IMAGE GALLERY + LIGHTBOX ─────────────────────────────────────────────────
function ImageGallery({ images, captions }) {
  const [lightbox, setLightbox] = useState(null);
  if (!images?.length) return null;
  return (
    <>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {images.map((src, i) => (
          <div key={i} onClick={() => setLightbox(i)} style={{
            cursor: 'zoom-in', borderRadius: 10, overflow: 'hidden',
            border: '1px solid rgba(124,58,237,0.15)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            transition: 'transform 0.15s, box-shadow 0.15s', flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.18)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'; }}
          >
            <img
              src={`/exam-images/${src}`}
              alt={captions?.[i] || `Obraz ${i + 1}`}
              style={{ height: 120, width: 'auto', display: 'block' }}
            />
          </div>
        ))}
      </div>
      {captions?.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
          {captions.map((cap, i) => (
            <div key={i} style={{ fontSize: '0.68rem', color: '#9ca3af', fontStyle: 'italic', maxWidth: 200, lineHeight: 1.4 }}>{cap}</div>
          ))}
        </div>
      )}
      {lightbox !== null && (
        <div onClick={() => setLightbox(null)} style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: '1rem', padding: '2rem', cursor: 'zoom-out',
        }}>
          <img
            src={`/exam-images/${images[lightbox]}`}
            alt={captions?.[lightbox] || ''}
            style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: 12, boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
          />
          {captions?.[lightbox] && (
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', textAlign: 'center', maxWidth: 600 }}>
              {captions[lightbox]}
            </div>
          )}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 8 }}>
              {images.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setLightbox(i); }} style={{
                  width: 8, height: 8, borderRadius: '50%', border: 'none',
                  background: i === lightbox ? '#a78bfa' : 'rgba(255,255,255,0.3)',
                  cursor: 'pointer', padding: 0,
                }} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ─── FILE DROPZONE + AI EVAL ──────────────────────────────────────────────────
function FileDropzone({ task, onResult }) {
  const [file,     setFile]     = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState(null);
  const inputRef = useRef(null);

  function handleFile(f) {
    if (!f) return;
    setFile(f); setResult(null); setError(null);
  }

  async function handleEvaluate() {
    if (!file) return;
    setLoading(true); setError(null);
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const criteriaText = task.criteria.map((c, i) => `${i + 1}. ${c}`).join('\n');
      const systemPrompt = `Jesteś egzaminatorem oceniającym pracę ucznia z egzaminu zawodowego INF.04 (technik programista).
ZADANIE: ${task.title}
TYP: ${task.typeLabel}
TREŚĆ ZADANIA:
${task.fullText}
KRYTERIA OCENY:
${criteriaText}`;
      let parts = [];
      if (isImageFile(file)) {
        const b64 = await fileToBase64(file);
        parts = [
          { inlineData: { mimeType: file.type, data: b64 } },
          { text: `${systemPrompt}\n\nNa powyższym obrazie widoczna jest aplikacja/wynik pracy ucznia. Oceń go wizualnie według kryteriów.\n\nOdpowiedz TYLKO w formacie JSON (bez markdown):\n{"score":<0-100>,"verdict":"<ZALICZONO|CZĘŚCIOWO|NIEZALICZONO>","criteria_results":[{"criterion":"<treść>","passed":<bool>,"comment":"<komentarz>"}],"general_comment":"<2-3 zdania po polsku>","improvements":["<co poprawić>"]}` },
        ];
      } else {
        const text = await file.text();
        parts = [{ text: `${systemPrompt}\n\nKOD/PLIK UCZNIA (${file.name}):\n\`\`\`\n${text.slice(0, 12000)}\n\`\`\`\n\nOceń kod ściśle według kryteriów.\n\nOdpowiedz TYLKO w formacie JSON (bez markdown):\n{"score":<0-100>,"verdict":"<ZALICZONO|CZĘŚCIOWO|NIEZALICZONO>","criteria_results":[{"criterion":"<treść>","passed":<bool>,"comment":"<komentarz>"}],"general_comment":"<2-3 zdania po polsku>","improvements":["<co poprawić>"]}` }];
      }
      const res  = await model.generateContent({ contents: [{ role: 'user', parts }] });
      const raw  = res.response.text().replace(/```json|```/g, '').trim();
      const data = JSON.parse(raw);
      setResult(data);
      onResult?.(data);
    } catch (err) {
      setError(err.message || 'Błąd oceny AI');
    }
    setLoading(false);
  }

  const sc = result ? (result.score >= 75 ? '#16a34a' : result.score >= 50 ? '#d97706' : '#dc2626') : '#7c3aed';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? '#7c3aed' : file ? 'rgba(124,58,237,0.4)' : 'rgba(124,58,237,0.2)'}`,
          borderRadius: 16,
          background: dragging ? 'rgba(124,58,237,0.07)' : file ? 'rgba(124,58,237,0.04)' : 'rgba(255,255,255,0.5)',
          padding: '1.5rem 1rem', textAlign: 'center', cursor: 'pointer',
          transition: 'all 0.15s', minHeight: 110,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        <input ref={inputRef} type="file" style={{ display: 'none' }}
          accept=".py,.java,.cs,.cpp,.c,.js,.jsx,.ts,.tsx,.html,.css,.xml,.kt,.txt,.zip,image/*"
          onChange={e => handleFile(e.target.files[0])} />
        {file ? (
          <>
            {isImageFile(file)
              ? <Icon icon="lucide:image" width={28} color="#7c3aed" />
              : <Icon icon="lucide:file-text" width={28} color="#7c3aed" />}
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#374151' }}>{file.name}</div>
            <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{(file.size / 1024).toFixed(1)} KB · kliknij aby zmienić</div>
          </>
        ) : (
          <>
            <Icon icon="lucide:folder-open" width={32} color="#9ca3af" />
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#6b7280' }}>Przeciągnij plik lub kliknij aby wybrać</div>
            <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Kod (.py .java .cs .cpp .js...) lub zdjęcie (.png .jpg)</div>
          </>
        )}
      </div>

      {file && (
        <button onClick={handleEvaluate} disabled={loading} style={{
          padding: '0.75rem', borderRadius: 12, border: 'none',
          background: loading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg,#7c3aed,#a78bfa)',
          color: '#fff', fontWeight: 800, fontSize: '0.88rem',
          cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Sora', sans-serif",
          boxShadow: loading ? 'none' : '0 4px 16px rgba(124,58,237,0.3)',
          transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          {loading
            ? <><Icon icon="lucide:loader" width={15} style={{ animation: 'spin 1s linear infinite' }} /> AI ocenia plik...</>
            : <><Icon icon="lucide:play" width={15} /> Oceń plik z AI</>}
        </button>
      )}

      {error && (
        <div style={{ padding: '0.85rem 1rem', borderRadius: 10, background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)', fontSize: '0.8rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon icon="lucide:alert-triangle" width={15} /> {error}
        </div>
      )}

      {result && (
        <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 16, border: `1px solid ${sc}40`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: `${sc}12`, borderBottom: `1px solid ${sc}20` }}>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Ocena AI</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: sc }}>{result.verdict}</div>
            </div>
            <div>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: sc, lineHeight: 1 }}>{result.score}</span>
              <span style={{ fontSize: '1rem', color: sc, opacity: 0.5, fontWeight: 600 }}>/100</span>
            </div>
          </div>
          <div style={{ height: 4, background: 'rgba(0,0,0,0.06)' }}>
            <div style={{ height: '100%', width: `${result.score}%`, background: `linear-gradient(90deg,${sc},${sc}99)`, transition: 'width 0.8s ease' }} />
          </div>
          <div style={{ padding: '0.75rem 1.25rem' }}>
            {result.criteria_results?.map((cr, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', padding: '0.45rem 0', borderBottom: i < result.criteria_results.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                {cr.passed
                  ? <Icon icon="lucide:check" width={15} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                  : <Icon icon="lucide:x" width={15} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />}
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#374151', fontWeight: cr.passed ? 400 : 600 }}>{cr.criterion}</div>
                  {cr.comment && <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 2, fontStyle: 'italic' }}>{cr.comment}</div>}
                </div>
              </div>
            ))}
          </div>
          {result.general_comment && (
            <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(124,58,237,0.03)', borderTop: '1px solid rgba(124,58,237,0.08)' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Komentarz</div>
              <div style={{ fontSize: '0.8rem', color: '#4b5563', lineHeight: 1.65 }}>{result.general_comment}</div>
            </div>
          )}
          {result.improvements?.length > 0 && (
            <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid rgba(124,58,237,0.08)' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Co poprawić</div>
              {result.improvements.map((imp, i) => (
                <div key={i} style={{ fontSize: '0.78rem', color: '#4b5563', lineHeight: 1.6, padding: '0.3rem 0 0.3rem 0.75rem', borderLeft: '2px solid rgba(124,58,237,0.3)', marginBottom: i < result.improvements.length - 1 ? 6 : 0 }}>{imp}</div>
              ))}
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── TASK CARD ────────────────────────────────────────────────────────────────
function TaskCard({ task, index }) {
  const [expanded,  setExpanded]  = useState(false);
  const [activeTab, setActiveTab] = useState('tresc');
  const [aiResults, setAiResults] = useState({});
  const tc = typeStyle(task.type);
  const scored = aiResults[task.id];
  return (
    <div style={{
      background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)',
      borderRadius: 20, border: '1px solid rgba(124,58,237,0.1)',
      boxShadow: '0 2px 20px rgba(0,0,0,0.05)', overflow: 'hidden',
      transition: 'box-shadow 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 32px rgba(124,58,237,0.1)'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 20px rgba(0,0,0,0.05)'}
    >
      <button onClick={() => setExpanded(v => !v)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '1.25rem 1.5rem', background: 'none', border: 'none',
        cursor: 'pointer', fontFamily: "'Sora', sans-serif", textAlign: 'left',
      }}>
        <div style={{
          flexShrink: 0, width: 42, height: 42, borderRadius: 12,
          background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: '1rem', color: '#fff',
          boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
        }}>{index + 1}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: 6,
              background: tc.bg, color: tc.text, border: `1px solid ${tc.border}`,
              letterSpacing: '0.05em', textTransform: 'uppercase',
            }}><Icon icon={task.typeIcon}width={14} /> {task.typeLabel}</span>
            {scored && (
              <span style={{
                fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: 6,
                background: scored.score >= 75 ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)',
                color: scored.score >= 75 ? '#16a34a' : '#dc2626',
                border: `1px solid ${scored.score >= 75 ? 'rgba(22,163,74,0.25)' : 'rgba(220,38,38,0.25)'}`,
                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              }}>
                <Icon icon="lucide:check" width={10} /> {scored.score}/100
              </span>
            )}
          </div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1f2937', lineHeight: 1.3 }}>{task.title}</div>
          <div style={{ fontSize: '0.73rem', color: '#9ca3af', marginTop: 2 }}>
            {task.criteria?.length} kryteriów · {task.hints?.length} wskazówek
            {task.images?.length > 0 && ` · ${task.images.length} obraz${task.images.length > 1 ? 'y' : ''}`}
          </div>
        </div>
        <Icon icon="lucide:chevron-down" width={16} color="#a78bfa" style={{ flexShrink: 0, transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }} />
      </button>

      {expanded && (
        <div style={{ borderTop: '1px solid rgba(124,58,237,0.08)' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(124,58,237,0.08)' }}>
            {[
              { id: 'tresc',     label: 'Treść',        icon: 'lucide:clipboard-list' },
              { id: 'wskazowki', label: `Wskazówki (${task.hints?.length || 0})`, icon: 'lucide:lightbulb' },
              { id: 'ocen',      label: 'Oceń plik',    icon: 'lucide:play' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                flex: 1, padding: '0.7rem 0.5rem', background: 'none', border: 'none',
                borderBottom: activeTab === tab.id ? '2.5px solid #7c3aed' : '2.5px solid transparent',
                cursor: 'pointer', fontFamily: "'Sora', sans-serif",
                fontWeight: activeTab === tab.id ? 700 : 500, fontSize: '0.78rem',
                color: activeTab === tab.id ? '#7c3aed' : '#9ca3af', transition: 'all 0.12s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
              }}>
                <Icon icon={tab.icon} width={13} />
                {tab.label}
              </button>
            ))}
          </div>
          <div style={{ padding: '1.25rem 1.5rem' }}>
            {activeTab === 'tresc' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{
                  background: 'rgba(124,58,237,0.03)', borderRadius: 12, padding: '1rem 1.25rem',
                  border: '1px solid rgba(124,58,237,0.08)',
                  fontSize: '0.83rem', color: '#374151', lineHeight: 1.8,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  maxHeight: 420, overflowY: 'auto',
                }}>{task.fullText}</div>
                {task.images?.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>Obrazy poglądowe</div>
                    <ImageGallery images={task.images} captions={task.imagesCaptions} />
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
                    Kryteria oceny ({task.criteria?.length})
                  </div>
                  {task.criteria?.map((c, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: '0.6rem', alignItems: 'flex-start',
                      fontSize: '0.8rem', color: '#4b5563', padding: '0.35rem 0',
                      borderBottom: i < task.criteria.length - 1 ? '1px solid rgba(124,58,237,0.05)' : 'none',
                    }}>
                      <span style={{ color: '#a78bfa', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}.</span>
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'wskazowki' && (
              task.hints?.length
                ? <HintAccordion hints={task.hints} />
                : <div style={{ fontSize: '0.82rem', color: '#9ca3af', textAlign: 'center', padding: '1.5rem' }}>Brak wskazówek</div>
            )}
            {activeTab === 'ocen' && (
              <div>
                <div style={{
                  padding: '0.75rem 1rem', borderRadius: 10, marginBottom: '1rem',
                  background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.12)',
                  fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.65,
                }}>
                  Wgraj plik z rozwiązaniem — kod źródłowy (.py, .java, .cs, .cpp, .js...) lub zrzut ekranu aplikacji (.png, .jpg). AI oceni go według kryteriów tego zadania i wyświetli wynik 0–100 z komentarzem.
                </div>
                <FileDropzone task={task} onResult={res => setAiResults(prev => ({ ...prev, [task.id]: res }))} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SHEET VIEW ───────────────────────────────────────────────────────────────
function SheetView({ sheet, onBack }) {
  return (
    <div>
      <div style={{
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)',
        borderRadius: 20, padding: '1.5rem 2rem', marginBottom: '1.5rem',
        border: '1px solid rgba(124,58,237,0.12)', boxShadow: '0 2px 20px rgba(0,0,0,0.05)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
      }}>
        <div>
          <button onClick={onBack} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: "'Sora', sans-serif", fontSize: '0.8rem',
            color: '#a78bfa', fontWeight: 600, padding: 0, marginBottom: '0.5rem',
            display: 'flex', alignItems: 'center', gap: '0.3rem',
          }}>
            <Icon icon="lucide:arrow-left" width={14} /> Wróć do wyboru arkusza
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '0.25rem 0.7rem', borderRadius: 6, background: 'rgba(124,58,237,0.08)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.2)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Icon icon="lucide:clipboard-list" width={11} /> {sheet.title}
            </span>
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1f2937', margin: '0 0 0.35rem', lineHeight: 1.3 }}>{sheet.subtitle}</h2>
          <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{sheet.description}</p>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
          {sheet.tasks.map(t => {
            const tc = typeStyle(t.type);
            return (
              <div key={t.id} style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.25rem 0.65rem', borderRadius: 7, background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>
                <Icon icon={t.typeIcon} width={14} /> Zad. {t.number}: {t.typeLabel}
              </div>
            );
          })}
        </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: '0.6rem' }}>
            {sheet.tags?.map(tag => (
              <span key={tag} style={{ fontSize: '0.68rem', fontWeight: 600, padding: '0.2rem 0.55rem', borderRadius: 99, background: 'rgba(124,58,237,0.06)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.15)' }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sheet.tasks.map((task, i) => <TaskCard key={task.id} task={task} index={i} />)}
      </div>
    </div>
  );
}

// ─── SHEET SELECTOR ───────────────────────────────────────────────────────────
function SheetSelector({ onSelect }) {
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Dostępne arkusze</div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1f2937', margin: 0 }}>Wybierz arkusz egzaminacyjny</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {examSheets.map((sheet, i) => (
          <button key={sheet.id} onClick={() => onSelect(sheet)} style={{
            display: 'flex', alignItems: 'flex-start', gap: '1.25rem',
            padding: '1.5rem', borderRadius: 20, textAlign: 'left',
            border: '1px solid rgba(124,58,237,0.12)',
            background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)',
            cursor: 'pointer', fontFamily: "'Sora', sans-serif",
            transition: 'all 0.15s', boxShadow: '0 2px 16px rgba(0,0,0,0.04)', width: '100%',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.13)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.12)'; }}
          >
            <div style={{
              flexShrink: 0, width: 52, height: 52, borderRadius: 14,
              background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '1.3rem', color: '#fff',
              boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
            }}>{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>{sheet.title}</div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1f2937', marginBottom: 4, lineHeight: 1.3 }}>{sheet.subtitle}</div>
              <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '0.75rem', lineHeight: 1.5 }}>{sheet.description}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                {sheet.tasks.map(t => {
                  const tc = typeStyle(t.type);
                  return (
                    <span key={t.id} style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 7, background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>
                      <Icon icon={t.typeIcon} width={14} /> {t.typeLabel}
                    </span>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {sheet.tags?.map(tag => (
                  <span key={tag} style={{ fontSize: '0.65rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: 99, background: 'rgba(124,58,237,0.06)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.12)' }}>{tag}</span>
                ))}
              </div>
            </div>
            <Icon icon="lucide:arrow-right" width={18} color="#d1d5db" style={{ alignSelf: 'center', flexShrink: 0 }} />
          </button>
        ))}
      </div>
      <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', borderRadius: 14, background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.12)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <Icon icon="lucide:info" width={18} color="#a78bfa" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.65 }}>
          Każdy arkusz zawiera 3 zadania. Przeczytaj treść, skorzystaj z wskazówek, a następnie wgraj swój plik — AI oceni go według kryteriów i wyświetli wynik 0–100 z komentarzem.
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function ExamPracticePage() {
  usePageTitle('Egzamin');
  const [selectedSheet, setSelectedSheet] = useState(null);
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#f5f3ff 0%,#ede9fe 45%,#e0e7ff 100%)', fontFamily: "'Sora', sans-serif" }}>
      <Header />
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 99, padding: '0.4rem 1.1rem', marginBottom: '1rem' }}>
            <Icon icon="lucide:clipboard-list" width={14} color="#7c3aed" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Egzamin</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem,5vw,2.6rem)', fontWeight: 900, color: '#3b0764', margin: '0 0 0.6rem', letterSpacing: '-1px', lineHeight: 1.15 }}>
            Arkusze egzaminacyjne
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>
            Pełne treści zadań, obrazy poglądowe, wskazówki i ocena Twojego rozwiązania przez AI.
          </p>
        </div>
        {selectedSheet
          ? <SheetView sheet={selectedSheet} onBack={() => setSelectedSheet(null)} />
          : <SheetSelector onSelect={setSelectedSheet} />
        }
      </main>
      <style>{`
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.25); border-radius: 3px; }
      `}</style>
      <Footer />
    </div>
  );
}