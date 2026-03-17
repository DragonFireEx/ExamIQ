// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import HomePage from './pages/HomePage';
import LearnPage from './pages/LearnPage';
import DashboardPage from './pages/DashboardPage';
import AboutPage from './pages/AboutPage';

function AppContent() {
  useEffect(() => {
    document.body.classList.add('pattern-bg');
    return () => document.body.classList.remove('pattern-bg');
  }, []);

  return (
    <Routes>
      <Route path="/"      element={<HomePage />} />
      <Route path="/learn" element={<LearnPage />} />
      <Route path="/exam"  element={<DashboardPage />} />
      <Route path="/about" element={<AboutPage />} />
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