import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Navbar';
import BounceCards from '../components/BounceCards';
import { AuthContext } from '../AuthContext';
import { apiFetch } from '../api';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [myPosts, setMyPosts] = useState([]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchMyPosts();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await apiFetch(`/auth/profile`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) setProfileData(data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchMyPosts = async () => {
    try {
      const res = await apiFetch(`/posts/user/posts`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) setMyPosts(data);
    } catch (err) {
      console.log(err);
    }
  };

  if (!user) {
    return <div className="container"><Navbar /><p>Please log in to view profile.</p></div>;
  }

  return (
    <div className="desk-background">
      <div className="container">
        <Navbar />

      <div style={{ display: 'flex', gap: '4rem', marginTop: '3rem', flexWrap: 'wrap' }}>
        {/* Left Side: Stats */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h2 className="title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            {profileData?.username || user.username}'s Desk
          </h2>
          
          <div className="postcard" style={{ padding: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-ui)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Writing Stats</h3>
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                <span>Letters Sent</span>
                <strong>{profileData?.totalPosts || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                <span>Words Written</span>
                <strong>{profileData?.wordsWritten || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                <span>Likes Received</span>
                <strong>{profileData?.likesReceived || 0}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Bounce Cards of User's Posts */}
        <div style={{ flex: '2', minWidth: '300px' }}>
          <h3 style={{ fontFamily: 'var(--font-ui)', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Past Letters
          </h3>
          {myPosts.length > 0 ? (
            <BounceCards posts={myPosts} enableHover={true} />
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>You haven't written any letters yet...</p>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default ProfilePage;
