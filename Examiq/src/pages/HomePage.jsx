// pages/HomePage.jsx
// Strona główna aplikacji z wszystkimi sekcjami

import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import CallToActionSection from '../components/CallToActionSection';
import Footer from '../components/Footer';

function HomePage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#faf9ff' }}>
      <Header />
      <HeroSection />
      <FeaturesSection />
      <CallToActionSection />
      <Footer />
    </div>
  );
}

export default HomePage;