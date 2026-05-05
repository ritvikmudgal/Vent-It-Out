import React, { useEffect, useRef } from 'react';

const AmbientDust = () => {
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

    const count = 60;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 0.6,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -(Math.random() * 0.4 + 0.1),
      opacity: Math.random() * 0.5 + 0.15,
      opacityDir: Math.random() > 0.5 ? 1 : -1,
      swing: Math.random() * Math.PI * 2,
      swingSpeed: 0.004 + Math.random() * 0.012,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.swing += p.swingSpeed;
        p.x += p.speedX + Math.sin(p.swing) * 0.4;
        p.y += p.speedY;

        p.opacity += p.opacityDir * 0.003;
        if (p.opacity >= 0.7 || p.opacity <= 0.08) p.opacityDir *= -1;

        if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Pink glowing mote
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        grad.addColorStop(0, `rgba(232, 115, 154, ${p.opacity})`);
        grad.addColorStop(0.5, `rgba(255, 181, 211, ${p.opacity * 0.4})`);
        grad.addColorStop(1, `rgba(255, 107, 157, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 228, 238, ${p.opacity})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}
    />
  );
};

export default AmbientDust;
