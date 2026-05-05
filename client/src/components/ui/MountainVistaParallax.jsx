import React, { useMemo } from 'react';

const layersData = [
  { className: 'layer-6', speed: '120s', size: '222px', zIndex: 1, image: '6' },
  { className: 'layer-5', speed: '95s',  size: '311px', zIndex: 1, image: '5' },
  { className: 'layer-4', speed: '75s',  size: '468px', zIndex: 1, image: '4' },
  { className: 'bike-1',  speed: '10s',  size: '75px',  zIndex: 2, image: 'bike', animation: 'parallax_bike', bottom: '100px', noRepeat: true },
  { className: 'bike-2',  speed: '15s',  size: '75px',  zIndex: 2, image: 'bike', animation: 'parallax_bike', bottom: '100px', noRepeat: true },
  { className: 'layer-3', speed: '55s',  size: '158px', zIndex: 3, image: '3' },
  { className: 'layer-2', speed: '30s',  size: '145px', zIndex: 4, image: '2' },
  { className: 'layer-1', speed: '20s',  size: '136px', zIndex: 5, image: '1' },
];

const MountainVistaParallax = ({ title = '', subtitle = '', children }) => {
  const dynamicStyles = useMemo(() => {
    return layersData
      .map(layer => {
        const url = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/24650/${layer.image}.png`;
        return `
          .mountain-vista .${layer.className} {
            background-image: url(${url});
            animation-duration: ${layer.speed};
            background-size: auto ${layer.size};
            z-index: ${layer.zIndex};
            ${layer.animation ? `animation-name: ${layer.animation};` : `animation-name: parallax_fg;`}
            ${layer.bottom ? `bottom: ${layer.bottom};` : ''}
            ${layer.noRepeat ? 'background-repeat: no-repeat;' : ''}
          }
        `;
      })
      .join('\n');
  }, []);

  const staticCSS = `
    .mountain-vista {
      position: relative;
      width: 100%;
      min-height: 100vh;
      overflow: hidden;
      background: linear-gradient(180deg, #1a0a2e 0%, #2d1b4e 20%, #4a2c6e 40%, #6b3f8e 55%, #e8739a 75%, #ffb5d3 90%, #ffd6e8 100%);
    }

    .mountain-vista .parallax-layer {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 100%;
      background-position: 0 100%;
      background-repeat: repeat-x;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }

    .mountain-vista .hero-content {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 2rem;
    }

    .mountain-vista .hero-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2.5rem, 6vw, 5rem);
      font-weight: 900;
      color: #fff;
      text-shadow: 0 4px 28px rgba(0,0,0,0.3);
      line-height: 1.15;
      margin-bottom: 1rem;
    }

    .mountain-vista .hero-subtitle {
      font-family: var(--font-sans, 'Nunito', sans-serif);
      font-size: clamp(1rem, 2vw, 1.3rem);
      color: rgba(255,255,255,0.8);
      max-width: 500px;
      line-height: 1.6;
    }

    @keyframes parallax_fg {
      0%   { background-position: 2765px 100%; }
      100% { background-position: 550px 100%; }
    }

    @keyframes parallax_bike {
      0%   { background-position: -300px 100%; }
      100% { background-position: 2000px 100%; }
    }
  `;

  return (
    <section className="mountain-vista" aria-label="Animated parallax mountain landscape">
      <style>{staticCSS}</style>
      <style>{dynamicStyles}</style>

      {layersData.map(layer => (
        <div key={layer.className} className={`parallax-layer ${layer.className}`} />
      ))}

      <div className="hero-content">
        {title && <h1 className="hero-title">{title}</h1>}
        {subtitle && <p className="hero-subtitle">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
};

export default React.memo(MountainVistaParallax);
