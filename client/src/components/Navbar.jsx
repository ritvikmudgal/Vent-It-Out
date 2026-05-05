import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { getAvatar } from '../avatarPack';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const onGradient = ['/', '/home'].includes(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const glass = {
    background: 'rgba(255,255,255,0.18)',
    backdropFilter: 'blur(12px)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.3)',
  };

  const avatar = user ? getAvatar(user.avatarId) : null;

  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '1.2rem 0', marginBottom: '1rem',
    }}>
      <Link to={user ? '/home' : '/'} style={{
        fontFamily: 'Caveat, cursive', fontSize: '2.6rem', fontWeight: 700,
        color: onGradient ? '#fff' : 'var(--primary-color)',
        textShadow: onGradient ? '0 2px 16px rgba(232,115,154,0.4)' : 'none',
        textDecoration: 'none',
      }}>
        VentItOut
      </Link>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {user ? (
          <>
            <Link to="/home" className="btn" style={onGradient ? glass : { fontSize: '0.85rem' }}>Home</Link>
            <Link to="/create" className="btn" style={onGradient ? glass : { fontSize: '0.85rem' }}>Write ✍️</Link>
            <Link to="/chat" className="btn" style={onGradient ? glass : { fontSize: '0.85rem', borderColor: 'var(--secondary-color)', color: 'var(--primary-color)' }}>Chat</Link>
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: user.profilePicture
                  ? `url(${user.profilePicture}) center/cover`
                  : `linear-gradient(135deg, ${avatar?.color}30, ${avatar?.color}50)`,
                border: `2px solid ${onGradient ? 'rgba(255,255,255,0.5)' : (avatar?.color || '#E8739A')}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', overflow: 'hidden',
              }}>
                {!user.profilePicture && (avatar?.emoji || '📮')}
              </div>
            </Link>
            <button onClick={handleLogout} className="btn" style={onGradient ? { ...glass, borderColor: 'rgba(255,180,180,0.4)' } : { fontSize: '0.85rem', borderColor: 'var(--accent-color)', color: 'var(--accent-color)', background: 'transparent' }}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/auth" className="btn btn-primary" style={onGradient ? { background: '#fff', color: 'var(--primary-color)' } : {}}>
            Login / Sign Up
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
