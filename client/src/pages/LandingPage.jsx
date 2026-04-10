import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Grainient from '../components/Grainient';
import MasonryLayout from '../components/MasonryLayout';

const samplePosts = [
  { _id: '1', toName: 'Old Friend', message: 'I never told you, but you were the reason I kept going through the hardest year of my life.', isAnonymous: true, createdAt: new Date().toISOString(), likes: [1,2,3] },
  { _id: '2', toName: 'My past self', message: 'It gets better. All those sleepless nights studying actually pay off. I promise.', isAnonymous: false, userId: { username: 'JaneDoe' }, createdAt: new Date().toISOString(), likes: [1] },
  { _id: '3', toName: 'The Barista', message: 'Your smile every morning made my commute bearable. Thank you.', isAnonymous: true, createdAt: new Date().toISOString(), likes: [] },
  { _id: '4', toName: 'Sarah', message: 'I am sorry for how things ended. I should have been more understanding.', isAnonymous: true, createdAt: new Date().toISOString(), likes: [1,2] },
  { _id: '5', toName: 'Dad', message: 'I wish I had said I love you more. Every single day.', isAnonymous: true, createdAt: new Date().toISOString(), likes: [1,2,3,4] },
  { _id: '6', toName: 'Stranger on the train', message: 'You gave me your seat without being asked. That kindness stayed with me.', isAnonymous: true, createdAt: new Date().toISOString(), likes: [] },
];

const LandingPage = () => {
  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
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

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Navbar */}
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0', marginBottom: '0' }}>
          <span style={{ fontFamily: 'Caveat, cursive', fontSize: '2.6rem', fontWeight: 700, color: '#fff', textShadow: '0 2px 16px rgba(82,39,255,0.4)' }}>
            VentItOut
          </span>
          <Link to="/auth" className="btn" style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)', fontWeight: 600 }}>
            Login / Sign Up
          </Link>
        </nav>

        {/* Hero Section */}
        <div style={{ textAlign: 'center', margin: '5rem 0 4rem' }}>
          <motion.h1
            style={{ fontFamily: 'Playfair Display, serif', color: '#fff', fontSize: 'clamp(3rem, 7vw, 6rem)', fontWeight: 900, lineHeight: 1.1, textShadow: '0 4px 32px rgba(0,0,0,0.25)', marginBottom: '1.5rem' }}
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            Say what you<br />
            <em style={{ fontStyle: 'italic', color: '#FFD6FE' }}>never could.</em>
          </motion.h1>

          <motion.p
            style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.82)', maxWidth: '500px', margin: '0 auto 2.5rem', fontFamily: 'Inter, sans-serif', lineHeight: 1.7 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Write anonymous letters to anyone in the world. Share the feelings you've kept locked inside.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link
              to="/auth"
              className="btn btn-primary"
              style={{ fontSize: '1.1rem', padding: '0.85rem 2.5rem', background: '#fff', color: '#5227FF', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.25)', fontWeight: 700 }}
            >
              Start Writing ✍️
            </Link>
            <a
              href="#letters"
              className="btn"
              style={{ fontSize: '1.1rem', padding: '0.85rem 2.5rem', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              Read Letters ↓
            </a>
          </motion.div>
        </div>

        {/* Letter preview section */}
        <div id="letters" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)', padding: '2.5rem 2rem', boxShadow: '0 8px 40px rgba(0,0,0,0.15)', marginBottom: '4rem' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '2rem', fontFamily: 'Caveat, cursive', fontSize: '2rem', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.2)', fontWeight: 600 }}>
            Letters from the community 💌
          </h3>
          <MasonryLayout posts={samplePosts} />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

