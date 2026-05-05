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

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async (query = '') => {
    const endpoint = query ? `/posts/search?name=${query}` : `/posts/public`;
    try {
      const res = await apiFetch(endpoint);
      const data = await res.json();
      if (res.ok) setPosts(data);
    } catch (err) { console.log(err); }
  };

  const handleSearch = (e) => { e.preventDefault(); fetchPosts(search); };
  const handleDeletePost = (deletedId) => { setPosts(posts.filter(p => p._id !== deletedId)); };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Grainient color1="#FFD6E8" color2="#E8739A" color3="#FFC8DD" />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <Navbar />

        {/* Search */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <form onSubmit={handleSearch} style={{
            display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '500px',
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,255,255,0.35)', borderRadius: 50,
            padding: '0.35rem 0.35rem 0.35rem 1.2rem',
          }}>
            <input type="text" placeholder="Search by name…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontFamily: 'var(--font-sans)', fontSize: '0.92rem' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.4rem', borderRadius: 50, fontSize: '0.85rem' }}>Search</button>
          </form>
        </div>

        <h2 style={{ fontFamily: 'Caveat, cursive', fontSize: '1.6rem', color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: '1.2rem', textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          Letters from the World 💌
        </h2>

        <div style={{
          background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(18px)',
          borderRadius: 24, border: '1px solid rgba(255,255,255,0.2)',
          padding: '2rem', boxShadow: '0 8px 36px rgba(0,0,0,0.08)',
        }}>
          <MasonryLayout posts={posts} onDelete={handleDeletePost} />
          {posts.length === 0 && (
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', padding: '2rem 0' }}>
              No letters yet… be the first to write one 📝
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
