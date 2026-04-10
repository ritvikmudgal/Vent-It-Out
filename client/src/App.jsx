import React from 'react';
import { Routes, Route } from 'react-router-dom';
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

function App() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
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
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
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
