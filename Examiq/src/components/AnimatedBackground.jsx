// components/AnimatedBackground.jsx
// Statyczne tło — cs_pattern_rotated.svg na cały ekran
export default function AnimatedBackground() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundImage: 'url(/cs_pattern_rotated.svg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      zIndex: 0,
      pointerEvents: 'none',
    }} />
  );
}