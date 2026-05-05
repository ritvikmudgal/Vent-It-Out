import React from 'react';
import { Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import CreatePostPage from './pages/CreatePostPage';
import ChatPage from './pages/ChatPage';
import { AuthContext } from './AuthContext';
import AmbientDust from './components/AmbientDust';
import CursorTrail from './components/CursorTrail';
import HeartPop from './components/HeartPop';
import { getApiUrl } from './api';

// Google OAuth callback handler
const AuthCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = React.useContext(AuthContext);

  React.useEffect(() => {
    const token = params.get('token');
    const userStr = params.get('user');
    if (token && userStr) {
      try {
        const userData = { ...JSON.parse(userStr), token };
        login(userData);
        navigate('/home');
      } catch (e) {
        console.error('OAuth callback error', e);
        navigate('/auth');
      }
    } else {
      navigate('/auth');
    }
  }, []);

  return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Logging in...</div>;
};

function App() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // ── Keep backend alive (Render/Vercel free tier) ──
    const pingBackend = () => {
      fetch(`${getApiUrl()}/ping`).catch(() => {}); 
    };
    
    // Initial ping
    pingBackend();
    
    // Ping every 2 minutes
    const interval = setInterval(pingBackend, 120000);
    return () => clearInterval(interval);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <div className="app-wrapper">
        <AmbientDust />
        <CursorTrail />
        <HeartPop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/user/:username" element={<PublicProfilePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/create" element={<CreatePostPage />} />
        </Routes>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
