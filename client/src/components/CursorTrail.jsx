import React, { useEffect, useRef } from 'react';

const CursorTrail = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    const trail = [];
    const maxLength = 20;

    const handleMove = (e) => {
      trail.push({ x: e.clientX, y: e.clientY, life: 1 });
      if (trail.length > maxLength) trail.shift();
    };
    window.addEventListener('mousemove', handleMove);

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i];
        p.life -= 0.04;
        if (p.life <= 0) { trail.splice(i, 1); continue; }

        const radius = p.life * 4;
        const alpha = p.life * 0.5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 115, 154, ${alpha})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 2 }}
    />
  );
};

export default CursorTrail;
