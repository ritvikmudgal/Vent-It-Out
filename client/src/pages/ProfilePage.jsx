import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Navbar';
import BounceCards from '../components/BounceCards';
import AvatarPicker from '../components/AvatarPicker';
import { AuthContext } from '../AuthContext';
import { apiFetch } from '../api';
import { getAvatar } from '../avatarPack';

const ProfilePage = () => {
  const { user, login } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [bio, setBio] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) { fetchProfile(); fetchMyPosts(); }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await apiFetch('/auth/profile', { headers: { Authorization: `Bearer ${user.token}` } });
      const data = await res.json();
      if (res.ok) { setProfileData(data); setBio(data.bio || ''); setPronouns(data.pronouns || ''); }
    } catch (err) { console.log(err); }
  };

  const fetchMyPosts = async () => {
    try {
      const res = await apiFetch('/posts/user/posts', { headers: { Authorization: `Bearer ${user.token}` } });
      const data = await res.json();
      if (res.ok) setMyPosts(data);
    } catch (err) { console.log(err); }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await apiFetch('/auth/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ bio, pronouns }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfileData(updated);
        login({ ...user, bio: updated.bio, pronouns: updated.pronouns });
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleAvatarSelect = async ({ avatarId, profilePicture }) => {
    try {
      const res = await apiFetch('/auth/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ avatarId, profilePicture }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfileData(updated);
        login({ ...user, avatarId: updated.avatarId, profilePicture: updated.profilePicture });
      }
    } catch (err) { console.error(err); }
  };

  if (!user) return <div className="container"><Navbar /><p>Please log in.</p></div>;

  const avatar = getAvatar(profileData?.avatarId || user.avatarId);

  return (
    <div className="desk-background">
      <div className="container">
        <Navbar />

        <div style={{ display: 'flex', gap: '2.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          {/* Left — profile info */}
          <div style={{ flex: '1', minWidth: 300 }}>
            {/* Avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem' }}>
              <div
                className="profile-avatar"
                onClick={() => setShowAvatarPicker(true)}
                style={{
                  width: 90, height: 90, borderRadius: '50%',
                  background: profileData?.profilePicture
                    ? `url(${profileData.profilePicture}) center/cover`
                    : `linear-gradient(135deg, ${avatar.color}25, ${avatar.color}45)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2.5rem', border: `3px solid ${avatar.color}`,
                  cursor: 'pointer', overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(232,115,154,0.2)',
                }}>
                {!profileData?.profilePicture && avatar.emoji}
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--text-dark)', margin: 0 }}>
                  {profileData?.username || user.username}
                </h2>
                {pronouns && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{pronouns}</span>}
              </div>
            </div>

            {/* Bio */}
            <div className="profile-card" style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontFamily: 'var(--font-ui)', color: 'var(--primary-color)', marginBottom: '0.8rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                About Me
              </h4>
              <textarea
                className="form-input"
                placeholder="Write a short bio..."
                value={bio}
                onChange={e => setBio(e.target.value)}
                maxLength={300}
                style={{ minHeight: 80, fontSize: '0.95rem', fontFamily: 'var(--font-sans)' }}
              />
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.8rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pronouns:</label>
                {['he/him', 'she/her', 'they/them'].map(p => (
                  <button key={p} className="btn" onClick={() => setPronouns(p)}
                    style={{
                      padding: '0.25rem 0.8rem', fontSize: '0.78rem',
                      background: pronouns === p ? 'var(--primary-color)' : 'transparent',
                      color: pronouns === p ? '#fff' : 'var(--text-muted)',
                      borderColor: pronouns === p ? 'var(--primary-color)' : 'var(--pink-light)',
                    }}>
                    {p}
                  </button>
                ))}
                <input className="form-input" placeholder="Custom" value={!['he/him','she/her','they/them'].includes(pronouns) ? pronouns : ''}
                  onChange={e => setPronouns(e.target.value)}
                  style={{ width: 100, padding: '0.25rem 0.6rem', fontSize: '0.78rem', marginBottom: 0 }}
                />
              </div>
              <button className="btn btn-primary" onClick={saveProfile} disabled={saving} style={{ fontSize: '0.85rem' }}>
                {saving ? 'Saving...' : 'Save Profile ✓'}
              </button>
            </div>

            {/* Stats */}
            <div className="profile-card">
              <h4 style={{ fontFamily: 'var(--font-ui)', color: 'var(--primary-color)', marginBottom: '0.8rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Writing Stats 📊
              </h4>
              {[
                ['Letters Sent', profileData?.totalPosts],
                ['Words Written', profileData?.wordsWritten],
                ['Likes Received', profileData?.likesReceived],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--pink-light)', fontSize: '0.92rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <strong style={{ color: 'var(--primary-color)' }}>{val || 0}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Right — posts */}
          <div style={{ flex: 2, minWidth: 300 }}>
            <h3 style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Past Letters 💌
            </h3>
            {myPosts.length > 0 ? (
              <BounceCards posts={myPosts} />
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>You haven't written any letters yet...</p>
            )}
          </div>
        </div>

        {showAvatarPicker && (
          <AvatarPicker
            currentAvatarId={profileData?.avatarId || user.avatarId}
            currentPfp={profileData?.profilePicture}
            onSelect={handleAvatarSelect}
            onClose={() => setShowAvatarPicker(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
