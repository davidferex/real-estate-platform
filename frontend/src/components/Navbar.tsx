import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={{
      background: '#1e3a5f',
      color: 'white',
      padding: '0 24px',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}>
        🏠 EstateHub
      </Link>
      <span style={{ fontSize: 13, opacity: 0.7 }}>Smart Real Estate Platform</span>
    </nav>
  );
}