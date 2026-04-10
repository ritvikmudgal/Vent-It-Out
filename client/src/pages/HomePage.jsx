import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Navbar';
import MasonryLayout from '../components/MasonryLayout';
import Grainient from '../components/Grainient';
import { AuthContext } from '../AuthContext';
import { apiFetch } from '../api';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (query = '') => {
    const endpoint = query ? `/posts/search?name=${query}` : `/posts/public`;
    try {
      const res = await apiFetch(endpoint);
      const data = await res.json();
      if (res.ok) setPosts(data);
    } catch (err) {
      console.log('Error fetching posts', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts(search);
  };

  const handleDeletePost = (deletedId) => {
    setPosts(posts.filter(p => p._id !== deletedId));
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Same animated Grainient gradient as landing page */}
      <Grainient
        color1="#FF9FFC"
        color2="#5227FF"
        color3="#B19EEF"
        timeSpeed={0.25}
        warpStrength={1}
        warpFrequency={5}
        warpSpeed={2}
        noiseScale={2}
        grainAmount={0.2}
        contrast={1.5}
      />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <Navbar />

        {/* Search bar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
          <form
            onSubmit={handleSearch}
            style={{
              display: 'flex',
              gap: '0.75rem',
              width: '100%',
              maxWidth: '520px',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '50px',
              padding: '0.4rem 0.4rem 0.4rem 1.4rem',
              boxShadow: '0 4px 24px rgba(82,39,255,0.15)',
            }}
          >
            <input
              type="text"
              placeholder="Search by 'To Name'…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.95rem',
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.55rem 1.6rem', borderRadius: '50px', fontSize: '0.9rem' }}>
              Search
            </button>
          </form>
        </div>

        {/* Section heading */}
        <h2 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '1.6rem',
          color: 'rgba(255,255,255,0.9)',
          marginBottom: '1.5rem',
          textAlign: 'center',
          textShadow: '0 2px 12px rgba(0,0,0,0.2)',
          letterSpacing: '0.03em',
        }}>
          Letters from the World ✉️
        </h2>

        {/* Glass panel holding the cards */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.2)',
          padding: '2rem',
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
        }}>
          <MasonryLayout posts={posts} onDelete={handleDeletePost} />
          {posts.length === 0 && (
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif', padding: '2rem 0' }}>
              No letters yet… be the first to write one 📝
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
