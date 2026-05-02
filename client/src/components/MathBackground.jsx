import { useEffect, useRef } from 'react';

const SYMBOLS = ['∫', '∑', '∂', 'π', '∞', '√', 'Δ', '∇', 'θ', 'λ', 'φ', 'ψ', '⊗', '∈', '∀', '∃'];

export default function MathBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animFrame;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Floating particles
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      size: Math.random() * 14 + 8,
      opacity: Math.random() * 0.06 + 0.02,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      color: Math.random() > 0.7 ? '#58C4DD' : Math.random() > 0.5 ? '#f0c040' : '#9B72CF'
    }));

    // Grid lines
    const gridLines = [];
    const spacing = 80;
    for (let x = 0; x < 2000; x += spacing) gridLines.push({ type: 'v', pos: x });
    for (let y = 0; y < 2000; y += spacing) gridLines.push({ type: 'h', pos: y });

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid
      ctx.strokeStyle = 'rgba(30, 45, 66, 0.4)';
      ctx.lineWidth = 0.5;
      gridLines.forEach(line => {
        ctx.beginPath();
        if (line.type === 'v') {
          ctx.moveTo(line.pos, 0);
          ctx.lineTo(line.pos, canvas.height);
        } else {
          ctx.moveTo(0, line.pos);
          ctx.lineTo(canvas.width, line.pos);
        }
        ctx.stroke();
      });

      // Draw origin dot at center
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(88, 196, 221, 0.2)';
      ctx.fill();

      // Floating math symbols
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -50) p.x = canvas.width + 50;
        if (p.x > canvas.width + 50) p.x = -50;
        if (p.y < -50) p.y = canvas.height + 50;
        if (p.y > canvas.height + 50) p.y = -50;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.font = `${p.size}px DM Serif Display`;
        ctx.fillText(p.symbol, p.x, p.y);
        ctx.restore();
      });

      t += 0.005;
      animFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
}