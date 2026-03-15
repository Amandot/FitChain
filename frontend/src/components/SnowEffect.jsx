import { useEffect, useRef } from 'react';
import './SnowEffect.css';

const SnowEffect = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const snowflakesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COUNT = 160;
    const flakes = [];

    for (let i = 0; i < COUNT; i++) {
      flakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 3 + 0.5,
        speed: Math.random() * 0.8 + 0.2,
        wind: Math.random() * 0.4 - 0.2,
        opacity: Math.random() * 0.6 + 0.2,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.02 + 0.005,
      });
    }
    snowflakesRef.current = flakes;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const f of flakes) {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 230, 255, ${f.opacity})`;
        ctx.shadowBlur = f.r * 3;
        ctx.shadowColor = 'rgba(180, 220, 255, 0.8)';
        ctx.fill();

        f.y += f.speed;
        f.x += f.wind + Math.sin(f.wobble) * 0.3;
        f.wobble += f.wobbleSpeed;

        if (f.y > canvas.height + 10) {
          f.y = -10;
          f.x = Math.random() * canvas.width;
        }
        if (f.x > canvas.width + 10) f.x = -10;
        if (f.x < -10) f.x = canvas.width + 10;
      }
      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="snow-canvas" />;
};

export default SnowEffect;
