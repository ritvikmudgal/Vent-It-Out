import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Lenis from '@studio-freight/lenis';
import MountainVistaParallax from '../components/ui/MountainVistaParallax';
import { ZoomParallax } from '../components/ui/ZoomParallax';

/* Sample letters — the same data that was in the community section */
const sampleLetters = [
  {
    toName: 'Old Friend',
    message: 'You were the reason I kept going through the hardest year of my life.',
    author: 'Anonymous',
    emoji: '💫',
  },
  {
    toName: 'My Past Self',
    message: 'It gets better. All those sleepless nights actually pay off. I promise.',
    author: 'JaneDoe',
    emoji: '🌙',
  },
  {
    toName: 'Dad',
    message: 'I wish I said I love you more. Every single day.',
    author: 'Anonymous',
    emoji: '❤️',
  },
  {
    toName: 'Sarah',
    message: 'I am sorry for how things ended. I should have been more understanding.',
    author: 'Anonymous',
    emoji: '🥀',
  },
  {
    toName: 'Future Me',
    message: 'I hope you found the peace you were looking for. Keep going, you deserve it.',
    author: 'hopeful_soul',
    emoji: '🌸',
  },
  {
    toName: 'Mom',
    message: 'Thank you for everything. I never say it enough, but you are my whole world.',
    author: 'Anonymous',
    emoji: '💗',
  },
  {
    toName: 'The One That Got Away',
    message: 'Some days I still think about what could have been. But I am learning to let go.',
    author: 'Anonymous',
    emoji: '🦋',
  },
];

const LandingPage = () => {
  /* Lenis smooth-scroll */
  React.useEffect(() => {
    const lenis = new Lenis();
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      {/* ── Hero with Mountain Vista background ── */}
      <MountainVistaParallax>
        {/* Nav overlay */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.2rem 2rem',
          background: 'rgba(26,10,46,0.25)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <span style={{
            fontFamily: 'Caveat, cursive', fontSize: '2.4rem', fontWeight: 700,
            color: '#fff', textShadow: '0 2px 12px rgba(232,115,154,0.4)',
          }}>
            VentItOut
          </span>
          <Link to="/auth" style={{
            display: 'inline-block', padding: '0.55rem 1.5rem',
            borderRadius: 50, background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)', color: '#fff',
            border: '1px solid rgba(255,255,255,0.3)',
            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '0.9rem',
            transition: 'all 0.3s ease', textDecoration: 'none',
          }}>
            Login / Sign Up
          </Link>
        </nav>

        {/* Hero text */}
        <motion.div
          style={{ textAlign: 'center', maxWidth: '600px', padding: '0 1.5rem' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          <h1 style={{
            fontFamily: 'Playfair Display, serif', color: '#fff',
            fontSize: 'clamp(2.8rem, 6vw, 5rem)', fontWeight: 900,
            lineHeight: 1.15, marginBottom: '1.5rem',
            textShadow: '0 4px 28px rgba(0,0,0,0.25)',
          }}>
            Say what you<br />
            <em style={{ fontStyle: 'italic', color: '#FFF0F5' }}>never could 💌</em>
          </h1>

          <p style={{
            fontSize: '1.15rem', color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.7, marginBottom: '2.5rem',
            fontFamily: 'var(--font-sans)',
          }}>
            Write anonymous letters to anyone in the world.<br />
            Share the feelings you've kept locked inside.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/auth" className="btn" style={{
              fontSize: '1.05rem', padding: '0.85rem 2.2rem',
              background: '#fff', color: '#E8739A',
              fontWeight: 800, boxShadow: '0 8px 28px rgba(0,0,0,0.2)',
              borderRadius: 50,
            }}>
              Start Writing ✍️
            </Link>
            <a href="#letters-parallax" className="btn" style={{
              fontSize: '1.05rem', padding: '0.85rem 2.2rem',
              background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
              color: '#fff', border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 50,
            }}>
              Read Letters ↓
            </a>
          </div>
        </motion.div>
      </MountainVistaParallax>

      {/* ── Zoom Parallax Letters Section ── */}
      <section id="letters-parallax" style={{
        position: 'relative',
        background: 'linear-gradient(180deg, #ffd6e8 0%, #FFF5F8 15%, #FFF5F8 85%, #FFE4EE 100%)',
      }}>
        {/* Section intro */}
        <motion.div
          style={{
            textAlign: 'center',
            padding: '4rem 1rem 1rem',
            position: 'relative',
            zIndex: 2,
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 style={{
            fontFamily: 'Caveat, cursive',
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            color: '#E8739A',
            fontWeight: 700,
            marginBottom: '0.5rem',
          }}>
            Every letter carries a world inside 🌸
          </h2>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1rem',
            color: 'var(--text-muted)',
            maxWidth: '480px',
            margin: '0 auto',
          }}>
            Scroll to feel the stories unfold
          </p>
        </motion.div>

        <ZoomParallax items={sampleLetters} />
      </section>

      {/* ── Bottom CTA ── */}
      <motion.div
        style={{
          textAlign: 'center',
          padding: '5rem 2rem',
          background: 'linear-gradient(180deg, #FFE4EE 0%, #FFF5F8 100%)',
        }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          color: '#3D2B35',
          fontWeight: 800,
          marginBottom: '1rem',
        }}>
          Ready to share your story?
        </h2>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '1.05rem',
          color: 'var(--text-muted)',
          marginBottom: '2rem',
          maxWidth: '440px',
          margin: '0 auto 2rem',
          lineHeight: 1.7,
        }}>
          Your words can heal, inspire, and connect with someone across the world.
        </p>
        <Link to="/auth" className="btn btn-primary" style={{
          fontSize: '1.1rem', padding: '0.9rem 2.5rem',
        }}>
          Write a Letter 💌
        </Link>
      </motion.div>
    </div>
  );
};

export default LandingPage;
