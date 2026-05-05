import React, { useState, useContext } from 'react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../AuthContext';
import { apiFetch } from '../api';
import { useNavigate } from 'react-router-dom';
import Grainient from '../components/Grainient';

const CreatePostPage = () => {
  const [toName, setToName] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [shareLink, setShareLink] = useState('');
  const [sending, setSending] = useState(false);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { alert('You must be logged in.'); return; }
    setSending(true);

    try {
      const res = await apiFetch('/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ toName, message, isAnonymous, isPublic }),
      });
      const data = await res.json();
      if (res.ok) {
        if (!isPublic && data.shareId) {
          setShareLink(`${window.location.origin}/share/${data.shareId}`);
        } else {
          navigate('/home');
        }
      } else {
        alert(data.message || 'Failed to create post');
      }
    } catch (err) {
      alert('Error connecting to server');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Grainient color1="#FFD6E8" color2="#E8739A" color3="#FFC8DD" />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <Navbar />

        <div className="auth-card" style={{ maxWidth: 560, background: 'rgba(255,251,253,0.92)', backdropFilter: 'blur(20px)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary-color)', fontSize: '1.6rem' }}>
            Write a Letter 💌
          </h2>

          <form onSubmit={handleSubmit}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>To</label>
            <input className="form-input" placeholder="e.g. My best friend, The barista..." value={toName} onChange={e => setToName(e.target.value)} required />

            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>Message</label>
            <textarea className="form-input" placeholder="What do you want to say?" value={message} onChange={e => setMessage(e.target.value)} required
              style={{ minHeight: 140, fontSize: '1.4rem' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0', fontFamily: 'var(--font-ui)', fontSize: '0.88rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)}
                  style={{ accentColor: 'var(--primary-color)' }}
                /> Send Anonymously
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <input type="checkbox" checked={!isPublic} onChange={e => setIsPublic(!e.target.checked)}
                  style={{ accentColor: 'var(--primary-color)' }}
                /> Private (Link Only)
              </label>
            </div>

            {shareLink && (
              <div style={{ padding: '1rem', background: 'var(--pink-light)', borderRadius: 14, marginBottom: '1rem', wordBreak: 'break-all', fontSize: '0.88rem' }}>
                <strong>Private Link:</strong><br />
                <a href={shareLink} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>{shareLink}</a>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', fontSize: '1rem' }} disabled={sending}>
              {sending ? 'Sending...' : 'Seal & Send 💗'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;
