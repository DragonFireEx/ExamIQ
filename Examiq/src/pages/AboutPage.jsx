// pages/AboutPage.jsx

import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { usePageTitle } from '../hooks/usePageTitle';
import { Icon } from '@iconify/react';
import Footer from '../components/Footer';
import './AboutPage.css';

const AUTHORS = [
  { name: 'Marcel Turwanicki', role: 'FullStack / DevOps',           github: 'DragonFireEx' },
  { name: 'Filip Czepiel',     role: 'FullStack / DevOps',           github: 'filekk' },
  { name: 'Piotr Lipiński',    role: 'Design & UX / DevOps / Docs', github: 'PIotrr23' },
  { name: 'Bartosz Wryszcz',   role: 'FullStack / DevOps',           github: 'BartoszBartoszewski' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Tryb teorii',
    desc: 'Wybierz liczbę pytań i tryb — teoria lub praktyka. Pytania są losowane z bazy INF04 oraz naszej autorskiej bazy pytań, po czym natychmiastowo weryfikowane.',
    icon: 'lucide:book-open',
  },
  {
    step: '02',
    title: 'Tryb algorytmów',
    desc: 'Wybierz zadanie lub wylosuj po ustalonych kryteriach zadanie z wykonania algorytmu, użyj jakiego języka chcesz - droga wolna.',
    icon: 'lucide:file-text',
  },
  {
    step: '03',
    title: 'Dashboard & postępy',
    desc: 'Twoje wyniki zapisywane są lokalnie w przeglądarce. Dashboard pokazuje historię sesji, postęp per kategoria, serię dni nauki i statystyki ogólne.',
    icon: 'lucide:bar-chart-2',
  },
  {
    step: '04',
    title: 'Technologia',
    desc: 'Aplikacja zbudowana w React + Vite, bez backendu. Sesja użytkownika przechowywana jest w ciasteczkach (nick, streak), a historia egzaminów w localStorage. Do weryfikacji odpowiedzi utylizujemy Gemini.',
    icon: 'lucide:cpu',
  },
];

const TECH = ['React 18', 'Vite', 'React Router', 'JavaScript ES2023', 'CSS-in-JS', 'LocalStorage API', 'Cookie API', 'Monaco Editor', 'Google Gemini', "Iconify"];

export default function AboutPage() {
  usePageTitle('O nas');
  return (
    <div className="about-container">
      <Header />

      <main className="about-main">

        {/* HERO */}
        <div className="about-hero">
          <div className="about-badge">
            <Icon icon='lucide:users' width={14} /> O nas
          </div>
          <h1 className="about-title">
            O projekcie<br />
            <span className="about-title-gradient">ExamIQ</span>
          </h1>
          <p className="about-description">
            ExamIQ to interaktywna platforma do nauki i samodzielnego przygotowania
            się do egzaminu zawodowego <strong style={{ color: '#7c3aed' }}>INF04</strong> — kwalifikacji
            z zakresu programowania, baz danych i administracji systemami.
          </p>
        </div>

        {/* CEL PROJEKTU */}
        <div className="about-info-card">
          <div className="about-card-header">
            <Icon icon="lucide:target" style={{ fontSize: '1.5rem', color: '#7c3aed' }} />
            <h2 className="about-card-title">Cel projektu</h2>
          </div>
          <p className="about-card-content">
            Projekt powstał jako zaliczenie przedmiotu z zakresu tworzenia aplikacji webowych.
            Celem było stworzenie użytecznego narzędzia edukacyjnego, które pomoże uczniom
            technikum informatycznego w systematycznej nauce do egzaminu INF04.
            Aplikacja łączy gamifikację (serie dni, statystyki, progi zaliczenia) z praktycznym
            zestawem pytań egzaminacyjnych podzielonych na kategorie tematyczne.
          </p>
        </div>

        {/* JAK DZIAŁA */}
        <h2 className="about-section-heading">Jak działa aplikacja?</h2>

        <div className="about-how-it-works-grid">
          {HOW_IT_WORKS.map(({ step, title, desc, icon }) => (
            <div key={step} className="about-step-card">
              <div className="about-step-icon-wrapper">
                <Icon icon={icon} className="about-step-icon" />
              </div>
              <div className="about-step-content">
                <div className="about-step-header">
                  <span className="about-step-number">{step}</span>
                  <h3 className="about-step-title">{title}</h3>
                </div>
                <p className="about-step-description">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* TECHNOLOGIE */}
        <div className="about-info-card-compact">
          <div className="about-card-header-compact">
            <Icon icon="lucide:wrench" style={{ fontSize: '1.4rem', color: '#7c3aed' }} />
            <h2 className="about-card-title">Stack technologiczny</h2>
          </div>
          <div className="about-tech-container">
            {TECH.map(t => (
              <span key={t} className="about-tech-badge">{t}</span>
            ))}
          </div>
        </div>

        {/* AUTORZY */}
        <h2 className="about-section-heading">Autorzy</h2>

        <div className="about-authors-grid">
          {AUTHORS.map(({ name, role, github }) => (
            <div key={name} className="about-author-card">
              <img
                src={`https://avatars.githubusercontent.com/${github}`}
                alt={name}
                className="about-author-avatar"
              />

              <div className="about-author-info">
                <div className="about-author-name">{name}</div>
                <div className="about-author-role">{role}</div>
              </div>

              <a
                href={`https://github.com/${github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="about-author-github-link"
              >
                <Icon icon="lucide:github" style={{ fontSize: '1rem' }} />
                GitHub
              </a>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="about-cta-card">
          <h3 className="about-cta-heading">
            Gotowy żeby zacząć?
          </h3>
          <p className="about-cta-description">
            Przetestuj swoją wiedzę z INF04 już teraz.
          </p>
          <div className="about-cta-buttons">
            <Link to="/learn">
              <button className="about-cta-primary-btn">
                <Icon icon="lucide:book-open" />
                Tryb nauki
              </button>
            </Link>
            <Link to="/exam">
              <button className="about-cta-secondary-btn">
                <Icon icon="lucide:bar-chart-2" />
                Panel użytkownika
              </button>
            </Link>
          </div>
        </div>

      </main>
      <Footer></Footer>
    </div>
  );
}
