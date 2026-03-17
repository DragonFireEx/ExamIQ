// App.jsx
// Główny komponent aplikacji z routingiem

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import HomePage from './pages/HomePage';
import LearnPage from './pages/LearnPage';
import DashboardPage from './pages/DashboardPage';

function AboutPage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#faf9ff',
      padding: '2rem'
    }}>
      <h1 style={{
        color: '#8A63D2',
        textAlign: 'center',
        fontSize: '2.5rem',
        marginBottom: '2rem'
      }}>O ExamIQ</h1>
      <p style={{
        textAlign: 'center',
        color: '#7B52C5',
        fontSize: '1.125rem'
      }}>Aplikacja do przygotowania do egzaminu zawodowego INF04.</p>
    </div>
  );
}

function AppContent() {
  useEffect(() => {
    document.body.classList.add('pattern-bg');
  }, []);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/learn" element={<LearnPage />} />
      <Route path="/exam" element={<DashboardPage />} />
      <Route path="/about" element={<AboutPage />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
