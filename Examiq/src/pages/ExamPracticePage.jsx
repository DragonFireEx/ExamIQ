// pages/ExamPracticePage.jsx
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Icon } from "@iconify/react";
import { useMemo, useRef, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import examSheets from "../data/examSheets.json";
import { usePageTitle } from "../hooks/usePageTitle";
import "./ExamPracticePage.css";

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const TYPE_COLOR = {
  konsola: {
    bg: "var(--accent-bg)",
    text: "var(--accent)",
    border: "var(--accent-border)",
  },
  webowa: {
    bg: "rgba(59,130,246,0.1)",
    text: "var(--blue-500)",
    border: "rgba(59,130,246,0.25)",
  },
  mobilna: {
    bg: "rgba(16,185,129,0.1)",
    text: "var(--green-500)",
    border: "rgba(16,185,129,0.25)",
  },
  desktopowa: {
    bg: "rgba(245,158,11,0.1)",
    text: "var(--orange-500)",
    border: "rgba(245,158,11,0.25)",
  },
  dokumentacja: {
    bg: "rgba(107,114,128,0.1)",
    text: "var(--gray-500)",
    border: "rgba(107,114,128,0.25)",
  },
};
function typeStyle(type) {
  return TYPE_COLOR[type] || TYPE_COLOR.dokumentacja;
}
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(",")[1]);
    r.onerror = () => reject(new Error("Nie można odczytać pliku"));
    r.readAsDataURL(file);
  });
}
function isImageFile(file) {
  return file.type.startsWith("image/");
}

// ─── HINT ACCORDION ───────────────────────────────────────────────────────────
function HintAccordion({ hints }) {
  const [open, setOpen] = useState(null);
  if (!hints?.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {hints.map((hint, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className="accordion-item"
            style={{
              border: `1px solid ${isOpen ? "rgba(124,58,237,0.25)" : "rgba(124,58,237,0.1)"}`,
              background: isOpen
                ? "rgba(124,58,237,0.04)"
                : "rgba(255,255,255,0.6)",
            }}
          >
            <button
              className="accordion-trigger"
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span className="hint-label">
                <Icon icon="lucide:lightbulb" width={11} /> WSKAZÓWKA {i + 1}
              </span>
              <Icon
                icon="lucide:chevron-down"
                width={14}
                color="var(--purple-400)"
                style={{
                  flexShrink: 0,
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              />
            </button>
            {isOpen && <div className="accordion-body">{hint}</div>}
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
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {images.map((src, i) => (
          <div key={i} className="gallery__thumb" onClick={() => setLightbox(i)}>
            <img
              src={`/exam-images/${src}`}
              alt={captions?.[i] || `Obraz ${i + 1}`}
              style={{ height: 120, width: "auto", display: "block" }}
            />
          </div>
        ))}
      </div>
      {captions?.length > 0 && (
        <div
          style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}
        >
          {captions.map((cap, i) => (
            <div
              key={i}
              style={{
                fontSize: "0.68rem",
                color: "var(--gray-400)",
                fontStyle: "italic",
                maxWidth: 200,
                lineHeight: 1.4,
              }}
            >
              {cap}
            </div>
          ))}
        </div>
      )}
      {lightbox !== null && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <img
            src={`/exam-images/${images[lightbox]}`}
            alt={captions?.[lightbox] || ""}
            style={{
              maxWidth: "90vw",
              maxHeight: "80vh",
              borderRadius: 12,
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            }}
          />
          {captions?.[lightbox] && (
            <div
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: "0.85rem",
                textAlign: "center",
                maxWidth: 600,
              }}
            >
              {captions[lightbox]}
            </div>
          )}
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 8 }}>
              {images.map((_, i) => (
                <button
                  key={i}
                  className="lightbox-dot"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightbox(i);
                  }}
                  style={{
                    background:
                      i === lightbox ? "var(--accent-light)" : "rgba(255,255,255,0.3)",
                  }}
                />
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
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const geminiClient = useMemo(() => {
    const key = import.meta.env.VITE_GEMINI_KEY;
    if (!key) return null;
    try {
      return new GoogleGenerativeAI(key);
    } catch {
      return null;
    }
  }, []);

  function handleFile(f) {
    if (!f) return;
    setFile(f);
    setResult(null);
    setError(null);
  }

  async function handleEvaluate() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      if (!geminiClient) {
        throw new Error("Brak klucza API Gemini. Skonfiguruj VITE_GEMINI_KEY.");
      }
      const model = geminiClient.getGenerativeModel({ model: "gemini-2.5-flash" });
      const criteriaText = task.criteria
        .map((c, i) => `${i + 1}. ${c}`)
        .join("\n");
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
          {
            text: `${systemPrompt}\n\nNa powyższym obrazie widoczna jest aplikacja/wynik pracy ucznia. Oceń go wizualnie według kryteriów.\n\nOdpowiedz TYLKO w formacie JSON (bez markdown):\n{"score":<0-100>,"verdict":"<ZALICZONO|CZĘŚCIOWO|NIEZALICZONO>","criteria_results":[{"criterion":"<treść>","passed":<bool>,"comment":"<komentarz>"}],"general_comment":"<2-3 zdania po polsku>","improvements":["<co poprawić>"]}`,
          },
        ];
      } else {
        const text = await file.text();
        parts = [
          {
            text: `${systemPrompt}\n\nKOD/PLIK UCZNIA (${file.name}):\n\`\`\`\n${text.slice(0, 12000)}\n\`\`\`\n\nOceń kod ściśle według kryteriów.\n\nOdpowiedz TYLKO w formacie JSON (bez markdown):\n{"score":<0-100>,"verdict":"<ZALICZONO|CZĘŚCIOWO|NIEZALICZONO>","criteria_results":[{"criterion":"<treść>","passed":<bool>,"comment":"<komentarz>"}],"general_comment":"<2-3 zdania po polsku>","improvements":["<co poprawić>"]}`,
          },
        ];
      }
      const res = await model.generateContent({
        contents: [{ role: "user", parts }],
      });
      const raw = res.response
        .text()
        .replace(/```json|```/g, "")
        .trim();
      const data = JSON.parse(raw);
      setResult(data);
      onResult?.(data);
    } catch (err) {
      setError(err.message || "Błąd oceny AI");
    }
    setLoading(false);
  }

  const sc = result
    ? result.score >= 75
      ? "var(--success)"
      : result.score >= 50
        ? "var(--warning)"
        : "var(--danger)"
    : "var(--accent)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        className="dropzone"
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? "var(--accent)" : file ? "var(--accent-border)" : "var(--accent-border-light)"}`,
          background: dragging
            ? "var(--accent-bg)"
            : file
              ? "rgba(124,58,237,0.04)"
              : "rgba(255,255,255,0.5)",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          style={{ display: "none" }}
          accept=".py,.java,.cs,.cpp,.c,.js,.jsx,.ts,.tsx,.html,.css,.xml,.kt,.txt,.zip,image/*"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {file ? (
          <>
            {isImageFile(file) ? (
              <Icon icon="lucide:image" width={28} color="var(--accent)" />
            ) : (
              <Icon icon="lucide:file-text" width={28} color="var(--accent)" />
            )}
            <div
              style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--gray-700)" }}
            >
              {file.name}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--gray-400)" }}>
              {(file.size / 1024).toFixed(1)} KB · kliknij aby zmienić
            </div>
          </>
        ) : (
          <>
            <Icon icon="lucide:folder-open" width={32} color="var(--gray-400)" />
            <div
              style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--gray-500)" }}
            >
              Przeciągnij plik lub kliknij aby wybrać
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--gray-400)" }}>
              Kod (.py .java .cs .cpp .js...) lub zdjęcie (.png .jpg)
            </div>
          </>
        )}
      </div>

      {file && (
        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="btn btn--solid btn--block"
        >
          {loading ? (
            <>
              <Icon
                icon="lucide:loader"
                width={15}
                style={{ animation: "spin 1s linear infinite" }}
              />{" "}
              AI ocenia plik...
            </>
          ) : (
            <>
              <Icon icon="lucide:play" width={15} /> Oceń plik z AI
            </>
          )}
        </button>
      )}

      {error && (
        <div className="alert alert--error">
          <Icon icon="lucide:alert-triangle" width={15} /> {error}
        </div>
      )}

      {result && (
        <div className="ai-result" style={{ border: `1px solid ${sc}40` }}>
          <div
            className="ai-result__header"
            style={{
              background:
                result.score >= 75
                  ? "var(--success-bg)"
                  : result.score >= 50
                  ? "var(--warning-bg)"
                  : "var(--danger-bg)",
              borderBottom: `1px solid ${
                result.score >= 75
                  ? "var(--success-border)"
                  : result.score >= 50
                  ? "var(--warning-border)"
                  : "var(--danger-border)"
              }`,
            }}
          >
            <div>
              <div className="ai-result__verdict">Ocena AI</div>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: sc }}>
                {result.verdict}
              </div>
            </div>
            <div>
              <span className="ai-result__score" style={{ color: sc }}>
                {result.score}
              </span>
              <span
                style={{
                  fontSize: "1rem",
                  color: sc,
                  opacity: 0.5,
                  fontWeight: 600,
                }}
              >
                /100
              </span>
            </div>
          </div>

          <div className="ai-result__bar-track">
            <div
              className="ai-result__bar-fill"
              style={{
                width: `${result.score}%`,
                background: `linear-gradient(90deg,${sc},${sc}99)`,
              }}
            />
          </div>

          <div className="ai-result__criteria">
            {result.criteria_results?.map((cr, i) => (
              <div
                key={i}
                className="ai-result__criterion"
                style={{
                  borderBottom:
                    i < result.criteria_results.length - 1
                      ? "1px solid rgba(0,0,0,0.04)"
                      : "none",
                }}
              >
                {cr.passed ? (
                  <Icon
                    icon="lucide:check"
                    width={15}
                    color="var(--success)"
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                ) : (
                  <Icon
                    icon="lucide:x"
                    width={15}
                    color="var(--danger)"
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                )}
                <div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--gray-700)",
                      fontWeight: cr.passed ? 400 : 600,
                    }}
                  >
                    {cr.criterion}
                  </div>
                  {cr.comment && (
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--gray-400)",
                        marginTop: 2,
                        fontStyle: "italic",
                      }}
                    >
                      {cr.comment}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {result.general_comment && (
            <div className="ai-result__comment">
              <div className="ai-result__section-label">Komentarz</div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--gray-600)",
                  lineHeight: 1.65,
                }}
              >
                {result.general_comment}
              </div>
            </div>
          )}

          {result.improvements?.length > 0 && (
            <div className="ai-result__improvements">
              <div className="ai-result__section-label">Co poprawić</div>
              {result.improvements.map((imp, i) => (
                <div
                  key={i}
                  className="ai-result__improvement-item"
                  style={{
                    marginBottom: i < result.improvements.length - 1 ? 6 : 0,
                  }}
                >
                  {imp}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TASK CARD ────────────────────────────────────────────────────────────────
function TaskCard({ task, index }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("tresc");
  const [aiResults, setAiResults] = useState({});
  const tc = typeStyle(task.type);
  const scored = aiResults[task.id];

  return (
    <div className="task-card">
      <button
        className="task-card__trigger"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="task-index">{index + 1}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              marginBottom: 4,
              flexWrap: "wrap",
            }}
          >
            <span
              className="task-type-badge"
              style={{
                background: tc.bg,
                color: tc.text,
                border: `1px solid ${tc.border}`,
              }}
            >
              <Icon icon={task.typeIcon} width={14} /> {task.typeLabel}
            </span>
            {scored && (
              <span
                className={`task-score-badge task-score-badge--${scored.score >= 75 ? "pass" : "fail"}`}
              >
                <Icon icon="lucide:check" width={10} /> {scored.score}/100
              </span>
            )}
          </div>
          <div
            style={{
              fontWeight: 800,
              fontSize: "0.95rem",
              color: "var(--gray-800)",
              lineHeight: 1.3,
            }}
          >
            {task.title}
          </div>
          <div style={{ fontSize: "0.73rem", color: "var(--gray-400)", marginTop: 2 }}>
            {task.criteria?.length} kryteriów · {task.hints?.length} wskazówek
            {task.images?.length > 0 &&
              ` · ${task.images.length} obraz${task.images.length > 1 ? "y" : ""}`}
          </div>
        </div>
        <Icon
          icon="lucide:chevron-down"
          width={16}
          color="var(--purple-400)"
          style={{
            flexShrink: 0,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s",
          }}
        />
      </button>

      {expanded && (
        <div style={{ borderTop: "1px solid rgba(124,58,237,0.08)" }}>
          <div className="tabs">
            {[
              { id: "tresc", label: "Treść", icon: "lucide:clipboard-list" },
              {
                id: "wskazowki",
                label: `Wskazówki (${task.hints?.length || 0})`,
                icon: "lucide:lightbulb",
              },
              { id: "ocen", label: "Oceń plik", icon: "lucide:play" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab${activeTab === tab.id ? " tab--active" : ""}`}
              >
                <Icon icon={tab.icon} width={13} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="task-content">
            {activeTab === "tresc" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
              >
                <div className="task-text-block">{task.fullText}</div>
                {task.images?.length > 0 && (
                  <div>
                    <div className="task-section-label">Obrazy poglądowe</div>
                    <ImageGallery
                      images={task.images}
                      captions={task.imagesCaptions}
                    />
                  </div>
                )}
                <div>
                  <div className="task-section-label">
                    Kryteria oceny ({task.criteria?.length})
                  </div>
                  {task.criteria?.map((c, i) => (
                    <div
                      key={i}
                      className="task-criteria-item"
                      style={{
                        borderBottom:
                          i < task.criteria.length - 1
                            ? "1px solid var(--accent-border-light)"
                            : "none",
                      }}
                    >
                      <span className="task-criteria-num">{i + 1}.</span>
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "wskazowki" &&
              (task.hints?.length ? (
                <HintAccordion hints={task.hints} />
              ) : (
                <div
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--gray-400)",
                    textAlign: "center",
                    padding: "1.5rem",
                  }}
                >
                  Brak wskazówek
                </div>
              ))}

            {activeTab === "ocen" && (
              <div>
                <div className="exam-upload-hint">
                  Wgraj plik z rozwiązaniem — kod źródłowy (.py, .java, .cs,
                  .cpp, .js...) lub zrzut ekranu aplikacji (.png, .jpg). AI
                  oceni go według kryteriów tego zadania i wyświetli wynik 0–100
                  z komentarzem.
                </div>
                <FileDropzone
                  task={task}
                  onResult={(res) =>
                    setAiResults((prev) => ({ ...prev, [task.id]: res }))
                  }
                />
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
      <div className="sheet-view-header">
        <button className="sheet-back-btn" onClick={onBack}>
          <Icon icon="lucide:arrow-left" width={14} /> Wróć do wyboru arkusza
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: "0.5rem",
          }}
        >
          <span className="badge badge--primary">
            <Icon icon="lucide:clipboard-list" width={11} /> {sheet.title}
          </span>
        </div>
        <h2
          style={{
            fontSize: "1.2rem",
            fontWeight: 900,
            color: "var(--gray-800)",
            margin: "0 0 0.35rem",
            lineHeight: 1.3,
          }}
        >
          {sheet.subtitle}
        </h2>
        <p
          style={{
            fontSize: "0.82rem",
            color: "var(--gray-500)",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {sheet.description}
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 6,
            alignItems: "flex-end",
            flexShrink: 0,
            marginTop: "0.75rem",
          }}
        >
          {sheet.tasks.map((t) => {
            const tc = typeStyle(t.type);
            return (
              <div
                key={t.id}
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  padding: "0.25rem 0.65rem",
                  borderRadius: 7,
                  background: tc.bg,
                  color: tc.text,
                  border: `1px solid ${tc.border}`,
                }}
              >
                <Icon icon={t.typeIcon} width={14} /> Zad. {t.number}:{" "}
                {t.typeLabel}
              </div>
            );
          })}
        </div>
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginTop: "0.6rem",
          }}
        >
          {sheet.tags?.map((tag) => (
            <span key={tag} className="tech-badge">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {sheet.tasks.map((task, i) => (
          <TaskCard key={task.id} task={task} index={i} />
        ))}
      </div>
    </div>
  );
}

// ─── SHEET SELECTOR ───────────────────────────────────────────────────────────
function SheetSelector({ onSelect }) {
  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "var(--accent-light)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "0.4rem",
          }}
        >
          Dostępne arkusze
        </div>
        <h2
          style={{
            fontSize: "1.3rem",
            fontWeight: 900,
            color: "var(--gray-800)",
            margin: 0,
          }}
        >
          Wybierz arkusz egzaminacyjny
        </h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {examSheets.map((sheet, i) => (
          <button
            key={sheet.id}
            onClick={() => onSelect(sheet)}
            className="sheet-btn"
          >
            <div className="icon-box">{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  color: "var(--accent-light)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 5,
                }}
              >
                {sheet.title}
              </div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "1rem",
                  color: "var(--gray-800)",
                  marginBottom: 4,
                  lineHeight: 1.3,
                }}
              >
                {sheet.subtitle}
              </div>
              <div
                style={{
                  fontSize: "0.78rem",
                  color: "var(--gray-500)",
                  marginBottom: "0.75rem",
                  lineHeight: 1.5,
                }}
              >
                {sheet.description}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  marginBottom: "0.5rem",
                }}
              >
                {sheet.tasks.map((t) => {
                  const tc = typeStyle(t.type);
                  return (
                    <span
                      key={t.id}
                      className="task-type-badge"
                      style={{
                        background: tc.bg,
                        color: tc.text,
                        border: `1px solid ${tc.border}`,
                      }}
                    >
                      <Icon icon={t.typeIcon} width={14} /> {t.typeLabel}
                    </span>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {sheet.tags?.map((tag) => (
                  <span key={tag} className="tech-badge">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <Icon
              icon="lucide:arrow-right"
              width={18}
              color="var(--gray-300)"
              style={{ alignSelf: "center", flexShrink: 0 }}
            />
          </button>
        ))}
      </div>
      <div className="sheet-info-note">
        <Icon
          icon="lucide:info"
          width={18}
          color="var(--purple-400)"
          style={{ flexShrink: 0, marginTop: 1 }}
        />
        Każdy arkusz zawiera 3 zadania. Przeczytaj treść, skorzystaj z
        wskazówek, a następnie wgraj swój plik — AI oceni go według kryteriów i
        wyświetli wynik 0–100 z komentarzem.
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function ExamPracticePage() {
  usePageTitle("Egzamin");
  const [selectedSheet, setSelectedSheet] = useState(null);
  return (
    <div className="page-root">
      <Header />
      <main
        style={{ maxWidth: 860, margin: "0 auto", padding: "3rem 1.5rem 6rem" }}
      >
        <div className="exam-page-header">
          <div className="badge badge--primary" style={{ marginBottom: "1rem" }}>
            <Icon icon="lucide:clipboard-list" width={14} />
            Egzamin
          </div>
          <h1 className="exam-page-title">Arkusze egzaminacyjne</h1>
          <p className="exam-page-subtitle">
            Pełne treści zadań, obrazy poglądowe, wskazówki i ocena Twojego
            rozwiązania przez AI.
          </p>
        </div>
        {selectedSheet ? (
          <SheetView
            sheet={selectedSheet}
            onBack={() => setSelectedSheet(null)}
          />
        ) : (
          <SheetSelector onSelect={setSelectedSheet} />
        )}
      </main>
      <Footer />
    </div>
  );
}
