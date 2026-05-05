import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BounceCards from '../components/BounceCards';
import { apiFetch } from '../api';
import { getAvatar } from '../avatarPack';
import { AuthContext } from '../AuthContext';

const PublicProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const resP = await apiFetch(`/auth/profile/${username}`);
        if (resP.ok) setProfile(await resP.json());

        const resAll = await apiFetch('/posts/public');
        if (resAll.ok) {
          const all = await resAll.json();
          setPosts(all.filter(p => !p.isAnonymous && p.userId?.username === username));
        }
      } catch (err) { console.error(err); }
    };
    fetch();
  }, [username]);

  const avatar = profile ? getAvatar(profile.avatarId) : null;

  return (
    <div className="desk-background">
      <div className="container">
        <Navbar />

        {profile ? (
          <div style={{ display: 'flex', gap: '2.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 300 }}>
              {/* Avatar + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: profile.profilePicture
                    ? `url(${profile.profilePicture}) center/cover`
                    : `linear-gradient(135deg, ${avatar.color}25, ${avatar.color}45)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2.2rem', border: `3px solid ${avatar.color}`,
                  overflow: 'hidden',
                }}>
                  {!profile.profilePicture && avatar.emoji}
                </div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', margin: 0 }}>{profile.username}</h2>
                  {profile.pronouns && <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{profile.pronouns}</span>}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="profile-card" style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-dark)', lineHeight: 1.6, fontStyle: 'italic' }}>
                    "{profile.bio}"
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className="profile-card" style={{ marginBottom: '1.5rem' }}>
                {[['Letters', profile.totalPosts], ['Likes', profile.likesReceived]].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--pink-light)', fontSize: '0.92rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                    <strong style={{ color: 'var(--primary-color)' }}>{v || 0}</strong>
                  </div>
                ))}
              </div>

              {user && (
                <button onClick={() => navigate(`/chat?user=${profile._id}`)} className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
                  Send a Chat 💬
                </button>
              )}
            </div>

            <div style={{ flex: 2, minWidth: 300 }}>
              <h3 style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Public Letters by {profile.username} 💗
              </h3>
              {posts.length > 0 ? <BounceCards posts={posts} /> : (
                <p style={{ color: 'var(--text-muted)' }}>No public non-anonymous letters yet.</p>
              )}
            </div>
          </div>
        ) : (
          <p style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-muted)' }}>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default PublicProfilePage;
