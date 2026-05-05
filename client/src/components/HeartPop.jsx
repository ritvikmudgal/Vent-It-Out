import React, { useEffect, useState } from 'react';

const HeartPop = () => {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    const handleClick = (e) => {
      // Don't fire on interactive elements
      const tag = e.target.tagName.toLowerCase();
      const isInteractive = ['a', 'button', 'input', 'textarea', 'select', 'label'].includes(tag);
      const isCard = e.target.closest('.letter-card, .postcard, .chat-bubble, .btn, .avatar-option, .chat-user-item, .auth-tab, .form-input, .avatar-modal, .modal-card');
      if (isInteractive || isCard) return;

      const id = Date.now() + Math.random();
      const heart = {
        id,
        x: e.clientX,
        y: e.clientY,
        size: 18 + Math.random() * 16,
        rotation: -20 + Math.random() * 40,
      };
      setHearts(prev => [...prev, heart]);

      // Auto remove after animation
      setTimeout(() => {
        setHearts(prev => prev.filter(h => h.id !== id));
      }, 800);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999 }}>
      {hearts.map(h => (
        <span
          key={h.id}
          style={{
            position: 'fixed',
            left: h.x - h.size / 2,
            top: h.y - h.size / 2,
            fontSize: `${h.size}px`,
            animation: 'heartFloat 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
            transform: `rotate(${h.rotation}deg)`,
            filter: 'drop-shadow(0 2px 4px rgba(232,115,154,0.4))',
          }}
        >
          💗
        </span>
      ))}
    </div>
  );
};

export default HeartPop;
