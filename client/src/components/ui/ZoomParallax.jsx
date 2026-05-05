import React, { useRef } from 'react';
import { useScroll, useTransform, motion, useSpring } from 'framer-motion';

/**
 * ZoomParallax — scroll-driven zoom parallax.
 * Renders children (letter cards) instead of images, each zooming at a different rate.
 *
 * @param {{ items: Array<{ toName: string, message: string, author?: string, emoji?: string }> }} props
 */
export function ZoomParallax({ items = [] }) {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  // Smooth out the scroll progress to prevent jitter
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const scale4 = useTransform(smoothProgress, [0, 1], [1, 4]);
  const scale5 = useTransform(smoothProgress, [0, 1], [1, 5]);
  const scale6 = useTransform(smoothProgress, [0, 1], [1, 6]);
  const scale8 = useTransform(smoothProgress, [0, 1], [1, 8]);
  const scale9 = useTransform(smoothProgress, [0, 1], [1, 9]);

  const scales = [scale4, scale5, scale6, scale5, scale6, scale8, scale9];

  /* Position overrides per index (viewport-relative units) */
  const positionOverrides = {
    0: { height: '28vh', width: '28vw' },
    1: { top: '-30vh', left: '5vw', height: '26vh', width: '32vw' },
    2: { top: '-10vh', left: '-25vw', height: '38vh', width: '22vw' },
    3: { left: '27.5vw', height: '24vh', width: '24vw' },
    4: { top: '27.5vh', left: '5vw', height: '24vh', width: '22vw' },
    5: { top: '27.5vh', left: '-22.5vw', height: '24vh', width: '28vw' },
    6: { top: '22.5vh', left: '25vw', height: '18vh', width: '18vw' },
  };

  /* Slight rotation per card for a scattered feel */
  const rotations = [-2, 3, -1.5, 2, -3, 1.5, -2.5];

  return (
    <div ref={container} style={{ position: 'relative', height: '300vh' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {items.map((item, index) => {
          const scale = scales[index % scales.length];
          const override = positionOverrides[index] || {};
          const rotate = rotations[index % rotations.length];

          return (
            <motion.div
              key={index}
              style={{
                scale,
                position: 'absolute',
                top: 0,
                display: 'flex',
                height: '100%',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                willChange: 'transform', // Optimization
              }}
            >
              <div
                style={{
                  position: 'relative',
                  height: override.height || '25vh',
                  width: override.width || '25vw',
                  minWidth: '200px',
                  ...(override.top != null && { top: override.top }),
                  ...(override.left != null && { left: override.left }),
                  transform: `rotate(${rotate}deg)`,
                }}
              >
                {/* Letter card */}
                <div style={{
                  height: '100%',
                  width: '100%',
                  background: '#FFFBFD',
                  borderRadius: '18px',
                  border: '2px solid rgba(255,181,211,0.35)',
                  boxShadow: '0 8px 32px rgba(232,115,154,0.18), 0 2px 8px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  {/* Pink shimmer stripe */}
                  <div style={{
                    height: '5px',
                    background: 'linear-gradient(90deg, #FFB5D3, #E8739A, #FF6B9D, #FFB5D3)',
                    backgroundSize: '200% 100%',
                    animation: 'stripeShimmer 4s ease infinite',
                    flexShrink: 0,
                  }} />

                  {/* Card body */}
                  <div style={{
                    padding: '1rem 1.2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    flex: 1,
                    overflow: 'hidden',
                  }}>
                    {/* Header */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      paddingBottom: '0.4rem',
                      borderBottom: '1px dashed rgba(232,115,154,0.2)',
                      fontFamily: 'var(--font-ui, Nunito, sans-serif)',
                      fontSize: '0.82rem',
                      color: 'var(--text-muted, #9B8A92)',
                    }}>
                      <span style={{ color: '#E8739A', fontWeight: 700, fontSize: '0.88rem' }}>
                        💌 <strong>{item.toName}</strong>
                      </span>
                      <span style={{ fontSize: '0.72rem', opacity: 0.6, fontStyle: 'italic' }}>
                        {item.emoji || '✨'}
                      </span>
                    </div>

                    {/* Message */}
                    <p style={{
                      fontFamily: "'Caveat', cursive",
                      fontSize: 'clamp(1rem, 1.8vw, 1.4rem)',
                      lineHeight: 1.5,
                      color: '#3D2B35',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      margin: 0,
                    }}>
                      {item.message}
                    </p>

                    {/* Footer */}
                    <div style={{
                      borderTop: '1px dashed rgba(232,115,154,0.2)',
                      paddingTop: '0.5rem',
                      marginTop: 'auto',
                      fontFamily: 'var(--font-ui, Nunito, sans-serif)',
                      fontSize: '0.78rem',
                      color: 'var(--text-muted, #9B8A92)',
                      fontStyle: 'italic',
                    }}>
                      — {item.author || 'Anonymous'}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default ZoomParallax;
