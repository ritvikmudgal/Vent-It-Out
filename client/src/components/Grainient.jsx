import React from 'react';

const Grainient = ({
  color1 = '#FFB5D3',
  color2 = '#E8739A',
  color3 = '#FFC8DD',
}) => {
  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: -1,
      background: `linear-gradient(45deg, ${color1}, ${color2}, ${color3})`,
      backgroundSize: '300% 300%',
      animation: 'gradientBG 14s ease infinite',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        opacity: 0.12,
        mixBlendMode: 'overlay',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
      }} />

      <div style={{
        position: 'absolute', top: '-15%', left: '-10%', width: '55%', height: '55%',
        background: `radial-gradient(circle, ${color1} 0%, transparent 70%)`,
        opacity: 0.5, mixBlendMode: 'screen',
        animation: 'orbFloat 22s infinite alternate ease-in-out',
        filter: 'blur(60px)'
      }} />

      <div style={{
        position: 'absolute', bottom: '-15%', right: '-10%', width: '65%', height: '65%',
        background: `radial-gradient(circle, ${color3} 0%, transparent 60%)`,
        opacity: 0.5, mixBlendMode: 'screen',
        animation: 'orbFloat2 28s infinite alternate ease-in-out',
        filter: 'blur(80px)'
      }} />

      <style>{`
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes orbFloat {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(20%, 30%) scale(1.2); }
        }
        @keyframes orbFloat2 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-30%, -20%) scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default Grainient;
