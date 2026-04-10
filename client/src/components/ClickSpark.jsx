import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ClickSpark = ({ children, sparkColor = 'var(--accent-color)', sparkCount = 8 }) => {
  const [sparks, setSparks] = useState([]);

  const handleClick = (e) => {
    // Determine the center of the click relative to the viewport
    const x = e.clientX;
    const y = e.clientY;

    const newSparks = Array.from({ length: sparkCount }).map((_, i) => {
      const angle = (i / sparkCount) * Math.PI * 2;
      const velocity = 50 + Math.random() * 50;
      return {
        id: Date.now() + i,
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
      };
    });

    setSparks((prev) => [...prev, ...newSparks]);

    // Clean up sparks after animation
    setTimeout(() => {
      setSparks((prev) => prev.filter((s) => !newSparks.some((ns) => ns.id === s.id)));
    }, 600);
  };

  return (
    <>
      <div onClick={handleClick} style={{ display: 'inline-block' }}>
        {children}
      </div>
      <AnimatePresence>
        {sparks.map((spark) => (
          <motion.div
            key={spark.id}
            initial={{ left: spark.x, top: spark.y, opacity: 1, scale: 1 }}
            animate={{
              left: spark.x + spark.vx,
              top: spark.y + spark.vy,
              opacity: 0,
              scale: 0.2,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: sparkColor,
              pointerEvents: 'none',
              zIndex: 9999,
            }}
          />
        ))}
      </AnimatePresence>
    </>
  );
};

export default ClickSpark;
