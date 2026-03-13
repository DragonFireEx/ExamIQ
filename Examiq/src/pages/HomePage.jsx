// pages/HomePage.jsx
// Strona główna aplikacji z komponentami Header, HeroSection i Footer

import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import Footer from '../components/Footer';

function HomePage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d1117' }}>
      <Header />
      <HeroSection />
      <Footer />
    </div>
  );
}

export default HomePage;