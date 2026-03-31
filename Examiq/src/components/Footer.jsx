// components/Footer.jsx

import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';

const LINKS = [
  {
    heading: 'Nauka',
    items: [
      { label: 'Teoria',              to: '/learn/teoria',             icon: 'lucide:book-open' },
      { label: 'Praktyka',            to: '/learn/praktyka',           icon: 'lucide:hammer' },
      { label: 'Egzamin praktyczny',  to: '/learn/egzamin-praktyczny', icon: 'lucide:clipboard-list' },
    ],
  },
  {
    heading: 'Aplikacja',
    items: [
      { label: 'Strona główna', to: '/',      icon: 'lucide:home' },
      { label: 'Panel',         to: '/exam',  icon: 'lucide:layout-dashboard' },
      { label: 'O nas',         to: '/about', icon: 'lucide:info' },
    ],
  },
];

const SOCIALS = [
  { icon: 'lucide:github',       href: 'https://github.com/DragonFireEx/ExamIQ', label: 'GitHub' },
  { icon: 'lucide:mail',         href: '#', label: 'Kontakt' },
  { icon: 'lucide:file-text',    href: '#', label: 'Dokumentacja' },
];

export default function Footer() {
  return (
    <footer style={{ position: 'relative', fontFamily: "'Sora', sans-serif" }}>

      {/* ── WAVE ─────────────────────────────────────────────────────────────── */}
      <div style={{ lineHeight: 0, overflow: 'hidden' }}>
        <svg
          viewBox="0 0 1440 80"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: 80 }}
        >
          <path
            d="M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1380,20 1440,40 L1440,80 L0,80 Z"
            fill="#4c1d95"
          />
        </svg>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(180deg, #4c1d95 0%, #6d28d9 60%, #7c3aed 100%)',
        padding: '0 2rem 0',
      }}>
        <div style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '2.5rem 0 2rem',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: '3rem',
        }}
        className="footer-grid"
        >

          {/* brand column */}
          <div>
            <img
              src="/landscape_jamiq.png"
              alt="ExamIQ"
              style={{ height: 38, marginBottom: '1rem', filter: 'brightness(0) saturate(100%) invert(82%) sepia(36%) saturate(7076%) hue-rotate(209deg) brightness(93%) contrast(112%)' }}
            />
            <p style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: '0.875rem',
              lineHeight: 1.75,
              maxWidth: 300,
              marginBottom: '1.5rem',
            }}>
              Interaktywna platforma do przygotowania na egzamin zawodowy INF04 / EE.09.
            </p>

            {/* socials */}
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {SOCIALS.map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  title={label}
                  style={{
                    width: 38, height: 38,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.7)',
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                    fontSize: '1rem',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(167,139,250,0.25)';
                    e.currentTarget.style.borderColor = 'rgba(167,139,250,0.5)';
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Icon icon={icon} />
                </a>
              ))}
            </div>
          </div>

          {/* link columns */}
          {LINKS.map(({ heading, items }) => (
            <div key={heading}>
              <div style={{
                fontSize: '0.7rem', fontWeight: 700,
                color: '#a78bfa',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                marginBottom: '1rem',
              }}>{heading}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {items.map(({ label, to, icon }) => (
                  <Link
                    key={label}
                    to={to}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                      color: 'rgba(255,255,255,0.55)',
                      textDecoration: 'none',
                      fontSize: '0.875rem', fontWeight: 500,
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                  >
                    <Icon icon={icon} style={{ fontSize: '0.85rem', opacity: 0.7 }} />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── BOTTOM BAR ─────────────────────────────────────────────────────── */}
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '1.25rem 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '0.5rem',
        }}>
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>
            © 2026 ExamIQ. Wszystkie prawa zastrzeżone.
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>
            <span>Zrobione z</span>
            <Icon icon="lucide:heart" style={{ color: '#f87171', fontSize: '0.85rem' }} />
            <span>dla zdających INF04</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </footer>
  );
}