// App.jsx
// Główny komponent aplikacji z routingiem

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
// Placeholder dla innych stron
function LearnPage() { return <h1>Learn Page</h1>; }
function ExamPage() { return <h1>ExamIQ</h1>; }
function AboutPage() { return <h1>About Page</h1>; }

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/exam" element={<ExamPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Router>
  );
}

export default App;
