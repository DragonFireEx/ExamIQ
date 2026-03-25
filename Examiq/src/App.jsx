// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import HomePage          from './pages/HomePage';
import LearnPage         from './pages/LearnPage';
import PracticePage      from './pages/PracticePage';
import ExamPracticePage  from './pages/ExamPracticePage';
import DashboardPage     from './pages/DashboardPage';
import AboutPage         from './pages/AboutPage';

function AppContent() {
  useEffect(() => {
    document.body.classList.add('pattern-bg');
    return () => document.body.classList.remove('pattern-bg');
  }, []);

  return (
    <Routes>
      <Route path="/"                          element={<HomePage />} />
      <Route path="/learn"                     element={<Navigate to="/learn/teoria" replace />} />
      <Route path="/learn/teoria"              element={<LearnPage />} />
      <Route path="/learn/praktyka"            element={<PracticePage />} />
      <Route path="/learn/egzamin-praktyczny"  element={<ExamPracticePage />} />
      <Route path="/exam"                      element={<DashboardPage />} />
      <Route path="/about"                     element={<AboutPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}