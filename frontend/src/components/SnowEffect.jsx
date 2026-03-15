import { useEffect, useRef } from 'react';
import './SnowEffect.css';

const PARTICLE_COUNT_DESKTOP = 80;
const PARTICLE_COUNT_MOBILE = 40;
const CONNECTION_DISTANCE = 140;
const MOUSE_REPULSE_RADIUS = 110;

const SnowEffect = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Set canvas pixel dimensions — never use CSS width/height on a canvas
    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      const count = window.innerWidth < 768 ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
      particlesRef.current = Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.6 + 0.8; // 0.8 – 1.4 px/frame, always visible
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          baseVx: Math.cos(angle) * speed, // permanent base velocity
          baseVy: Math.sin(angle) * speed,
          pushX: 0,                         // temporary mouse push, decays to 0
          pushY: 0,
          r: Math.random() * 2 + 1.5,
          opacity: Math.random() * 0.5 + 0.4,
        };
      });
    };

    setSize();
    initParticles();

    const onResize = () => { setSize(); }; // just resize, don't reinit particles
    window.addEventListener('resize', onResize);

    const onMouseMove = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onMouseLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      for (const p of particles) {
        // Mouse repulsion — adds a temporary push
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_REPULSE_RADIUS && dist > 0) {
          const force = (1 - dist / MOUSE_REPULSE_RADIUS) * 2.0;
          p.pushX += (dx / dist) * force;
          p.pushY += (dy / dist) * force;
        }

        // Push decays — particle always returns to its base velocity
        p.pushX *= 0.85;
        p.pushY *= 0.85;

        // Move: base velocity is always active, push is on top
        p.x += p.baseVx + p.pushX;
        p.y += p.baseVy + p.pushY;

        // Wrap around screen edges
        if (p.x < 0)             p.x = canvas.width;
        if (p.x > canvas.width)  p.x = 0;
        if (p.y < 0)             p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(120, 200, 255, ${p.opacity})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(100, 180, 255, 0.7)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw connecting lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE) {
            const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.4;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(100, 180, 255, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="snow-canvas" />;
};

export default SnowEffect;
