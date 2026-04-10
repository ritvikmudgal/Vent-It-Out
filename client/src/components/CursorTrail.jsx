import React, { useEffect, useRef } from 'react';

const CursorTrail = () => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -100, y: -100 });
  const trail = useRef([]);

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

    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationFrame;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Interpolate or add point directly
      trail.current.push({ x: mouse.current.x, y: mouse.current.y, age: 0 });

      ctx.beginPath();
      for (let i = 0; i < trail.current.length; i++) {
        const p = trail.current[i];
        p.age += 1;
        
        ctx.globalAlpha = Math.max(0, 1 - p.age / 40);
        ctx.fillStyle = '#D64550'; // Using the primary accent red from the vintage envelope
        ctx.beginPath();
        const size = Math.max(0, 4 - (p.age / 10));
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      trail.current = trail.current.filter(p => p.age < 40);

      animationFrame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999 }} />;
};

export default CursorTrail;
