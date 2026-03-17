// pages/LearnPage.jsx
// Strona nauki z ćwiczeniami
// const ai = new GoogleGenerativeAI({ apiKey: import.meta.env.VITE_GEMINI_KEY, })
import "./LearnPage.css";
// Import pod API
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState } from "react";
import questions from "../data/questions.json";
export default function LearnPage() {
  // Tryb gry
  const [mode, setMode] = useState(null);
  // Aktualne pytanie
  const [count, setCount] = useState(10);
  // Czy zaczęte
  const [started, setStarted] = useState(false);
  // Wybrane pytanie
  const [selected, setSelected] = useState(null);
  // Zdobyte punkty
  const [points, setPoints] = useState(0);
  // Aktualne pytanie
  const [currentQuestion, setCurrentQuestion] = useState(0);
  // Pula potasowanych pytań
  const [pool, setPool] = useState([]);
  // Baza z pytaniami
  const q = pool[currentQuestion];

  if (started && !q) return null;

  // Wybranie odpowiedzi
  const pick = (key) => {
    if (selected) return;
    setSelected(key);
    if (key === q.answer) setPoints((p) => p + 1);
    setTimeout(() => {
      setSelected(null);
      setCurrentQuestion((c) => c + 1);
    }, 3000);
  };
  // Wyświetlenie wyniku
  if (started) {
    if (currentQuestion >= count)
      return (
        <div style={{ padding: "2rem" }}>
          <h1>
            Wynik: {points}/{count}
          </h1>
        </div>
      );
    // Wyświetlenie pytania + weryfikacja odpowiedzi
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#faf9ff" }}>
        <p>
          {currentQuestion}. {q.question}
        </p>

        {q.type === "closed" ? (
          <>
            {Object.entries(q.options).map(([key, val]) => (
              <button key={key} onClick={() => pick(key)}>
                {key}. {val}
              </button>
            ))}
            {selected && (
              <p>{selected === q.answer ? "✅" : `❌ ${q.answer}`}</p>
            )}
          </>
        ) : (
          <>
            {q.snippet && (
              <div dangerouslySetInnerHTML={{ __html: q.snippet }} />
            )}
            <input
              type="text"
              placeholder="Twoja odpowiedź..."
              value={selected || ""}
              onChange={(e) => setSelected(e.target.value)}
            />
            <button onClick={() => pick(selected)}>Sprawdź</button>
          </>
        )}
      </div>
    );
  }
  // Wybór ilości pytań
  if (mode)
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#faf9ff" }}>
        <h1>Ile pytań?</h1>
        <input
          type="range"
          min={1}
          max={40}
          value={count}
          onChange={(e) => setCount(+e.target.value)}
        />
        <p>{count} pytań</p>
        <button
          onClick={() => {
            const shuffled = [...questions]
              .sort(() => Math.random() - 0.5)
              .slice(0, count);
            setPool(shuffled);
            setCurrentQuestion(0);
            setPoints(0);
            setStarted(true);
          }}
        >
          Start
        </button>
      </div>
    );
  // Wybór trybu
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#faf9ff" }}>
      <h1>Wybierz tryb</h1>
      <button onClick={() => setMode("teoria")}>Teoria</button>
      <button onClick={() => setMode("praktyka")}>Praktyka</button>
    </div>
  );
}
