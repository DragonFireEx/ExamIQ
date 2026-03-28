// pages/LearnPage.jsx
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Icon } from "@iconify/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import questions from "../data/questions.json";
import { usePageTitle } from "../hooks/usePageTitle";
import { useUserSession } from "../hooks/useUserSession";
import "./LearnPage.css";

const JAMIQ_HAPPY = "/happy_jamiq.png";
const JAMIQ_SAD = "/sad_jamiq.png";
const JAMIQ_ANGRY = "/angry_jamiq.png";

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ─── SETUP ────────────────────────────────────────────────────────────────────
function SetupScreen({ onStart }) {
  const [count, setCount] = useState(10);
  const [timeMode, setTimeMode] = useState("none");
  const [typeMode, setTypeMode] = useState("both");

  const available = questions.filter((q) =>
    typeMode === "both" ? true : q.type === typeMode,
  ).length;
  const maxCount = Math.min(available, 40);

  return (
    <div className="learn-root">
      <Header />
      <div className="learn-container learn-container--setup">
        <div className="setup-hero">
          <div className="setup-badge">
            <Icon icon="lucide:book-open" />
            Teoria
          </div>
          <h1 className="setup-title">Skonfiguruj quiz</h1>
          <p className="setup-subtitle">
            Dostępnych pytań: <strong>{available}</strong>
          </p>
        </div>

        <div className="learn-card setup-card">
          {/* Liczba pytań */}
          <div className="setup-section">
            <label className="setup-label">
              Liczba pytań:{" "}
              <span className="setup-label__value">
                {Math.min(count, maxCount)}
              </span>
            </label>
            <input
              type="range"
              min={1}
              max={maxCount}
              value={Math.min(count, maxCount)}
              onChange={(e) => setCount(+e.target.value)}
              className="setup-range"
            />
            <div className="setup-range-labels">
              <span>1</span>
              <span>{maxCount}</span>
            </div>
          </div>

          {/* Czas */}
          <div className="setup-section">
            <label className="setup-label">Czas na pytanie</label>
            <div className="setup-grid setup-grid--4">
              {[
                {
                  val: "none",
                  icon: "lucide:infinity",
                  text: null,
                  sub: "bez limitu",
                },
                { val: "15", icon: null, text: "15s", sub: "szybki" },
                { val: "30", icon: null, text: "30s", sub: "normalny" },
                { val: "60", icon: null, text: "60s", sub: "spokojny" },
              ].map((opt) => (
                <button
                  key={opt.val}
                  className="setup-chip"
                  data-active={timeMode === opt.val}
                  onClick={() => setTimeMode(opt.val)}
                >
                  <span className="setup-chip__main">
                    {opt.icon ? <Icon icon={opt.icon} /> : opt.text}
                  </span>
                  <span className="setup-chip__sub">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Typ */}
          <div className="setup-section">
            <label className="setup-label">Typ pytań</label>
            <div className="setup-grid setup-grid--3">
              {[
                { val: "both", label: "Oba typy", icon: "lucide:shuffle" },
                {
                  val: "closed",
                  label: "Zamknięte",
                  icon: "lucide:circle-dot",
                },
                { val: "open", label: "Otwarte", icon: "lucide:pencil" },
              ].map((opt) => (
                <button
                  key={opt.val}
                  className="setup-chip setup-chip--type"
                  data-active={typeMode === opt.val}
                  onClick={() => setTypeMode(opt.val)}
                >
                  <Icon icon={opt.icon} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={() =>
              onStart({
                count: Math.min(count, maxCount),
                timeLimit: timeMode === "none" ? null : +timeMode,
                typeMode,
              })
            }
          >
            Rozpocznij quiz
            <Icon icon="lucide:arrow-right" />
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─── QUIZ ─────────────────────────────────────────────────────────────────────
function QuizScreen({ config, onFinish }) {
  const [pool] = useState(() => {
    const filtered = questions.filter((q) =>
      config.typeMode === "both" ? true : q.type === config.typeMode,
    );
    return shuffle(filtered).slice(0, config.count);
  });

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [openAnswer, setOpenAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [results, setResults] = useState([]);
  const [streak, setStreak] = useState(0);
  const [showFlame, setShowFlame] = useState(false);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit);
  const [timerPulse, setTimerPulse] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const timerRef = useRef(null);

  const checkWithGemini = async (question, correctAnswer, userAnswer) => {
    try {
      const ai = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);
      const model = ai.getGenerativeModel({ model: "gemini-flash-latest" });
      const prompt = `Jesteś weryfikatorem odpowiedzi na pytania egzaminacyjne z IT (egzamin INF04).\n\nPytanie: ${question}\nWzorcowa odpowiedź: ${correctAnswer}\nOdpowiedź ucznia: ${userAnswer}\n\nOceń czy odpowiedź ucznia jest merytorycznie poprawna. Nie wymagaj identycznego brzmienia — liczy się sens i kluczowe pojęcia techniczne. Odpowiedz TYLKO jednym słowem: TAK lub NIE.`;
      const result = await model.generateContent(prompt);
      return result.response.text().trim().toUpperCase().startsWith("TAK");
    } catch (err) {
      console.error("Gemini error:", err);
      return userAnswer
        .trim()
        .toLowerCase()
        .includes(correctAnswer.trim().toLowerCase());
    }
  };

  const q = pool[idx];
  const progress = idx / pool.length;

  const handleReveal = useCallback(
    (correct) => {
      clearInterval(timerRef.current);
      setRevealed(true);
      setIsCorrect(correct);
      if (correct) {
        setStreak((prev) => {
          const n = prev + 1;
          if (n >= 2) setShowFlame(true);
          return n;
        });
      } else {
        setStreak(0);
        setShowFlame(false);
      }
      setResults((prev) => [...prev, { q, correct }]);
    },
    [q],
  );

  useEffect(() => {
    if (!config.timeLimit || revealed) return;
    setTimeLeft(config.timeLimit);
    setTimerPulse(false);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleReveal(false);
          return 0;
        }
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
    if (idx + 1 >= pool.length) {
      onFinish(results);
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
    setOpenAnswer("");
    setRevealed(false);
    setIsCorrect(null);
  };

  if (!q) return null;

  const timerPct = config.timeLimit ? timeLeft / config.timeLimit : 1;
  const timerState =
    timerPct > 0.5 ? "ok" : timerPct > 0.25 ? "warn" : "danger";

  return (
    <div className="learn-root">
      {/* PROGRESS BAR */}
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${progress * 100}%` }}
        />
        <div className="progress-dot" style={{ left: `${progress * 100}%` }} />
      </div>

      <Header />

      <div className="learn-container learn-container--quiz">
        {/* TOPBAR */}
        <div className="quiz-topbar">
          <span className="quiz-counter">
            Pytanie <strong>{idx + 1}</strong> / {pool.length}
          </span>
          <div className="quiz-badges">
            <div className="badge-pill" data-flame={showFlame}>
              <Icon
                icon="lucide:flame"
                className="flame-icon"
                data-active={showFlame}
              />
              <span className="badge-pill__val" data-flame={showFlame}>
                {streak}
              </span>
            </div>
            {config.timeLimit && (
              <div
                className="badge-pill badge-pill--timer"
                data-state={timerState}
                data-pulse={timerPulse && !revealed}
              >
                <Icon icon="lucide:timer" />
                <span className="timer-val">{timeLeft}</span>
              </div>
            )}
          </div>
        </div>

        {/* PYTANIE */}
        <div className="learn-card quiz-question">
          <div className="question-category">{q.category}</div>
          <p className="question-text">{q.question}</p>
          {q.snippet && (
            <div
              dangerouslySetInnerHTML={{ __html: q.snippet }}
              className="question-snippet"
            />
          )}
        </div>

        {/* ZAMKNIĘTE */}
        {q.type === "closed" && (
          <div className="options-list">
            {Object.entries(q.options).map(([key, val]) => {
              const state = !revealed
                ? "idle"
                : key === q.answer
                  ? "right"
                  : key === selected
                    ? "wrong"
                    : "dimmed";
              return (
                <button
                  key={key}
                  className="option-btn"
                  data-state={state}
                  disabled={revealed}
                  onClick={() => {
                    if (!revealed) {
                      setSelected(key);
                      handleReveal(key === q.answer);
                    }
                  }}
                >
                  <span className="option-key">{key}</span>
                  {val}
                </button>
              );
            })}
          </div>
        )}

        {/* OTWARTE */}
        {q.type === "open" && (
          <div className="open-wrap">
            <textarea
              className="open-textarea"
              value={openAnswer}
              onChange={(e) => setOpenAnswer(e.target.value)}
              disabled={revealed || isChecking}
              rows={3}
              placeholder="Wpisz odpowiedź... (Ctrl+Enter aby sprawdzić)"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) handleOpenSubmit();
              }}
              data-state={revealed ? (isCorrect ? "correct" : "wrong") : "idle"}
              data-checking={isChecking}
            />
            {!revealed && (
              <button
                className="btn-check"
                onClick={handleOpenSubmit}
                disabled={!openAnswer.trim() || isChecking}
                data-active={!!(openAnswer.trim() && !isChecking)}
              >
                {isChecking ? (
                  <>
                    <Icon icon="lucide:loader-2" className="spin" />
                    Weryfikuje Gemini...
                  </>
                ) : (
                  "Sprawdź"
                )}
              </button>
            )}
          </div>
        )}

        {/* FEEDBACK */}
        {revealed && (
          <div className="feedback" data-correct={isCorrect}>
            <div className="feedback-inner">
              <img
                src={isCorrect ? JAMIQ_HAPPY : JAMIQ_SAD}
                alt="Jamiq"
                className="feedback-jamiq"
              />
              <div className="feedback-body">
                <div className="feedback-title" data-correct={isCorrect}>
                  {isCorrect ? (
                    streak >= 2 ? (
                      <>
                        <Icon
                          icon="lucide:flame"
                          style={{ color: "#f59e0b" }}
                        />{" "}
                        Streak ×{streak}! Świetnie!
                      </>
                    ) : (
                      <>
                        <Icon icon="lucide:check-circle-2" /> Poprawna
                        odpowiedź!
                      </>
                    )
                  ) : (
                    <>
                      <Icon icon="lucide:x-circle" /> Błąd
                      {q.type === "closed" ? ` — poprawna: ${q.answer}` : ""}
                    </>
                  )}
                </div>
                {q.type === "open" && !isCorrect && (
                  <div className="feedback-model-answer">
                    Wzorcowa odpowiedź: {q.answer}
                  </div>
                )}
                <p className="feedback-explanation" data-correct={isCorrect}>
                  {q.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        {revealed && (
          <button className="btn-primary" onClick={handleNext}>
            {idx + 1 >= pool.length ? "Zobacz wyniki" : "Następne pytanie"}
            <Icon icon="lucide:arrow-right" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── WYNIKI ───────────────────────────────────────────────────────────────────
function ResultsScreen({ results, onRestart }) {
  const { saveExamResult } = useUserSession();
  const saved = useRef(false);

  const total = results.length;
  const correct = results.filter((r) => r.correct).length;
  const pct = Math.round((correct / total) * 100);
  const passed = pct >= 75;
  const stars = pct >= 90 ? 3 : pct >= 75 ? 2 : pct >= 50 ? 1 : 0;

  useEffect(() => {
    if (saved.current) return;
    saved.current = true;
    saveExamResult({
      score: correct,
      total,
      duration: 0,
      category: "Nauka",
      questions: results.map((r) => ({
        categoryName: r.q.category,
        wasCorrect: r.correct,
      })),
    });
  }, []);

  const STATS = [
    {
      label: "Poprawne",
      val: correct,
      mod: "green",
      icon: "lucide:check-circle-2",
    },
    {
      label: "Błędne",
      val: total - correct,
      mod: "red",
      icon: "lucide:x-circle",
    },
    { label: "Wszystkich", val: total, mod: "purple", icon: "lucide:list" },
  ];

  return (
    <div className="learn-root">
      <Header />
      <div className="learn-container learn-container--results">
        <div className="results-hero">
          <img
            src={pct >= 75 ? JAMIQ_HAPPY : pct >= 50 ? JAMIQ_SAD : JAMIQ_ANGRY}
            alt="Jamiq"
            className="results-jamiq"
          />
          <div className="results-stars">
            {Array.from({ length: 3 }).map((_, i) => (
              <Icon
                key={i}
                icon="lucide:star"
                className="star-icon"
                data-active={i < stars}
              />
            ))}
          </div>
          <h1 className="results-pct" data-passed={passed}>
            {pct}%
          </h1>
          <p className="results-verdict" data-passed={passed}>
            {passed ? (
              <>
                <Icon icon="lucide:party-popper" /> Zaliczono! Próg 75%
                osiągnięty.
              </>
            ) : (
              <>
                <Icon icon="lucide:frown" /> Nie zaliczono — próg to 75%
              </>
            )}
          </p>
          <p className="results-saved">
            <Icon icon="lucide:save" />
            Wynik zapisano w historii
          </p>
        </div>

        <div className="stat-grid">
          {STATS.map((s) => (
            <div key={s.label} className="stat-card" data-mod={s.mod}>
              <Icon icon={s.icon} className="stat-icon" />
              <div className="stat-val">{s.val}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="learn-card learn-card--sm score-bar-card">
          <div className="score-bar-header">
            <span>Wynik końcowy</span>
            <span>próg 75%</span>
          </div>
          <div className="score-bar-track">
            <div
              className="score-bar-fill"
              data-passed={passed}
              style={{ width: `${pct}%` }}
            />
            <div className="score-bar-threshold" />
          </div>
        </div>

        <div className="learn-card learn-card--sm review-card">
          <h3 className="review-title">Przegląd odpowiedzi</h3>
          {results.map((r, i) => (
            <div
              key={i}
              className="review-row"
              data-last={i === results.length - 1}
            >
              <span className="review-icon" data-correct={r.correct}>
                <Icon icon={r.correct ? "lucide:check" : "lucide:x"} />
              </span>
              <div className="review-content">
                <p className="review-question" data-correct={r.correct}>
                  {r.q.question.slice(0, 90)}
                  {r.q.question.length > 90 ? "…" : ""}
                </p>
                {!r.correct && (
                  <p className="review-answer">
                    <Icon icon="lucide:check" />
                    {r.q.answer}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="results-actions">
          <button
            className="btn-primary"
            onClick={onRestart}
            style={{ flex: 1 }}
          >
            <Icon icon="lucide:refresh-cw" />
            Zagraj ponownie
          </button>
          <Link to="/exam" style={{ flex: 1, textDecoration: "none" }}>
            <button className="btn-secondary" style={{ width: "100%" }}>
              Dashboard
              <Icon icon="lucide:arrow-right" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function LearnPage() {
  usePageTitle("Teoria");
  const [phase, setPhase] = useState("setup");
  const [config, setConfig] = useState(null);
  const [results, setResults] = useState([]);

  if (phase === "setup")
    return (
      <SetupScreen
        onStart={(cfg) => {
          setConfig(cfg);
          setPhase("quiz");
        }}
      />
    );
  if (phase === "quiz")
    return (
      <QuizScreen
        config={config}
        onFinish={(res) => {
          setResults(res);
          setPhase("results");
        }}
      />
    );
  return (
    <ResultsScreen results={results} onRestart={() => setPhase("setup")} />
  );
}
