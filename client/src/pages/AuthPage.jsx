import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { apiFetch, getApiUrl } from '../api';
import Grainient from '../components/Grainient';

const AuthPage = () => {
  const [tab, setTab] = useState('password'); // 'password' | 'otp' | 'google'
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isNewOtpUser, setIsNewOtpUser] = useState(false);
  const [otpUsername, setOtpUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handlePasswordAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const endpoint = `/auth/${isLogin ? 'login' : 'register'}`;
    const payload = isLogin ? { email, password } : { username, email, password };
    try {
      const res = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) { login(data); navigate('/home'); }
      else setError(data.message);
    } catch (err) {
      setError('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/auth/email/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setIsNewOtpUser(data.isNewUser);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/auth/email/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, username: isNewOtpUser ? otpUsername : undefined }),
      });
      const data = await res.json();
      if (res.ok) { login(data); navigate('/home'); }
      else setError(data.message);
    } catch (err) {
      setError('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const baseUrl = getApiUrl().replace('/api', '');
    window.location.href = `${baseUrl}/auth/google`;
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Grainient color1="#FFD6E8" color2="#E8739A" color3="#FFC8DD" />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', paddingTop: '2.5rem' }}>
          <span style={{ fontFamily: 'Caveat, cursive', fontSize: '2.8rem', color: '#fff', fontWeight: 700, textShadow: '0 2px 16px rgba(232,115,154,0.4)' }}>
            VentItOut
          </span>
        </div>

        <div className="auth-card" style={{ background: 'rgba(255,251,253,0.92)', backdropFilter: 'blur(20px)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', textAlign: 'center', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>
            Welcome 💌
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            Say what you never could
          </p>

          {/* Tabs */}
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'password' ? 'active' : ''}`} onClick={() => { setTab('password'); setError(''); }}>
              🔑 Password
            </button>
            <button className={`auth-tab ${tab === 'otp' ? 'active' : ''}`} onClick={() => { setTab('otp'); setError(''); setOtpSent(false); }}>
              📧 Email OTP
            </button>
            <button className={`auth-tab ${tab === 'google' ? 'active' : ''}`} onClick={() => { setTab('google'); setError(''); }}>
              🔵 Google
            </button>
          </div>

          {error && (
            <div style={{ background: 'rgba(255,107,157,0.1)', border: '1px solid rgba(255,107,157,0.3)', borderRadius: 12, padding: '0.6rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#D64550' }}>
              {error}
            </div>
          )}

          {/* ── Password Tab ── */}
          {tab === 'password' && (
            <form onSubmit={handlePasswordAuth}>
              {!isLogin && (
                <input className="form-input" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
              )}
              <input type="email" className="form-input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
              <input type="password" className="form-input" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
                {loading ? '...' : isLogin ? 'Login' : 'Sign Up'}
              </button>
              <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {isLogin ? "Don't have an account? " : "Already have one? "}
                <span onClick={() => setIsLogin(!isLogin)} style={{ color: 'var(--primary-color)', fontWeight: 700, cursor: 'pointer' }}>
                  {isLogin ? 'Sign Up' : 'Login'}
                </span>
              </p>
            </form>
          )}

          {/* ── OTP Tab ── */}
          {tab === 'otp' && !otpSent && (
            <form onSubmit={handleSendOtp}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                We'll send a 6-digit code to your email
              </p>
              <input type="email" className="form-input" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} required />
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Sending...' : 'Send Code 📧'}
              </button>
            </form>
          )}

          {tab === 'otp' && otpSent && (
            <form onSubmit={handleVerifyOtp}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Enter the 6-digit code sent to <strong>{email}</strong>
              </p>
              <input className="form-input" placeholder="Enter 6-digit code" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px', fontWeight: 800 }}
              />
              {isNewOtpUser && (
                <input className="form-input" placeholder="Choose a username" value={otpUsername} onChange={e => setOtpUsername(e.target.value)} required />
              )}
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Login ✓'}
              </button>
              <p style={{ textAlign: 'center', marginTop: '0.8rem', fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => { setOtpSent(false); setOtp(''); }}>
                ← Use different email
              </p>
            </form>
          )}

          {/* ── Google Tab ── */}
          {tab === 'google' && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Sign in instantly with your Google account
              </p>
              <button onClick={handleGoogleLogin} className="btn" style={{
                width: '100%', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                fontSize: '1rem', fontWeight: 700, border: '2px solid var(--pink-light)',
              }}>
                <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                Continue with Google
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
