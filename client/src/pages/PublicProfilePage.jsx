import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BounceCards from '../components/BounceCards';
import { apiFetch } from '../api';

const PublicProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch Profile
        const resProfile = await apiFetch(`/auth/profile/${username}`);
        if(resProfile.ok) setProfile(await resProfile.json());

        // Fetch user's public posts
        const allPublic = await apiFetch(`/posts/public`);
        if(allPublic.ok) {
          const publicData = await allPublic.json();
          setPosts(publicData.filter(p => !p.isAnonymous && p.userId?.username === username));
        }

      } catch (err) {
        console.error(err);
      }
    };
    fetchProfileData();
  }, [username]);

  return (
    <div className="desk-background">
      <div className="container">
        <Navbar />

        {profile ? (
          <div style={{ display: 'flex', gap: '4rem', marginTop: '3rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '300px' }}>
              <h2 className="title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                {profile.username}
              </h2>
              
              <div className="postcard" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ fontFamily: 'var(--font-ui)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Public Stats</h3>
                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                    <span>Letters Sent</span>
                    <strong>{profile.totalPosts || 0}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                    <span>Likes Received</span>
                    <strong>{profile.likesReceived || 0}</strong>
                  </div>
                </div>
              </div>

              {/* Chat Button */}
              <button 
                onClick={() => navigate(`/chat?user=${profile._id}`)} 
                className="btn btn-primary" 
                style={{ width: '100%', fontSize: '1.2rem', padding: '1rem' }}
              >
                Send a Private Chat
              </button>

            </div>

            <div style={{ flex: '2', minWidth: '300px' }}>
              <h3 style={{ fontFamily: 'var(--font-ui)', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Public Letters by {profile.username}
              </h3>
              {posts.length > 0 ? (
                <BounceCards posts={posts} enableHover={true} />
              ) : (
                <p style={{ color: 'DarkGoldenRod' }}>This user hasn't sent any public, non-anonymous letters.</p>
              )}
            </div>
          </div>
        ) : (
          <p style={{ textAlign: 'center', marginTop: '4rem' }}>Loading or User not found...</p>
        )}
      </div>
    </div>
  );
};

export default PublicProfilePage;
