import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Gradient pages → white text/glass style
  const onGradient = ['/home', '/'].includes(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const glassBtn = {
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.28)',
    fontWeight: 600,
  };

  const solidBtn = {
    background: '#fff',
    color: '#5227FF',
    border: 'none',
    fontWeight: 700,
    boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.4rem 0',
      marginBottom: '1.5rem',
    }}>
      {/* Logo */}
      <Link
        to={user ? '/home' : '/'}
        style={{
          fontFamily: 'Caveat, cursive',
          fontSize: '2.8rem',
          fontWeight: 700,
          color: onGradient ? '#fff' : 'var(--primary-color)',
          textShadow: onGradient ? '0 2px 20px rgba(82,39,255,0.35)' : 'none',
          textDecoration: 'none',
          letterSpacing: '-0.01em',
        }}
      >
        VentItOut
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {user ? (
          <>
            <Link to="/home" className="btn" style={onGradient ? glassBtn : {}}>
              Home
            </Link>
            <Link to="/create" className="btn" style={onGradient ? glassBtn : {}}>
              Write ✍️
            </Link>
            <Link to="/chat" className="btn" style={onGradient ? glassBtn : { borderColor: 'var(--primary-color)', color: 'var(--primary-color)', background: 'transparent' }}>
              Chat
            </Link>
            <Link to="/profile" className="btn" style={onGradient ? solidBtn : { background: 'var(--primary-color)', color: '#fff' }}>
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="btn"
              style={onGradient ? { ...glassBtn, borderColor: 'rgba(255,100,100,0.4)' } : { borderColor: 'var(--accent-color)', color: 'var(--accent-color)', background: 'transparent' }}
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/auth" className="btn" style={onGradient ? solidBtn : { background: 'var(--primary-color)', color: '#fff' }}>
            Login / Sign Up
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
