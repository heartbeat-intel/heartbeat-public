import { useEffect, useRef } from 'react';

/**
 * Animated canvas background that renders a pulsing heartbeat network graph.
 * Nodes float, connect with lines, and pulse with the brand orange color.
 */
export default function HeartbeatPulse() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let nodes: Node[] = [];

    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      pulsePhase: number;
      pulseSpeed: number;
      brightness: number;
    }

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    const createNodes = () => {
      const rect = canvas.getBoundingClientRect();
      const count = Math.floor((rect.width * rect.height) / 18000);
      nodes = Array.from({ length: Math.min(count, 60) }, () => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 1,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.02,
        brightness: 0.3 + Math.random() * 0.4,
      }));
    };

    const draw = (time: number) => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const connectionDistance = 150;

      // Update & draw connections
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;
        a.pulsePhase += a.pulseSpeed;

        // Bounce off edges
        if (a.x < 0 || a.x > rect.width) a.vx *= -1;
        if (a.y < 0 || a.y > rect.height) a.vy *= -1;

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const opacity = (1 - dist / connectionDistance) * 0.15;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(251, 76, 2, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        const pulse = Math.sin(node.pulsePhase) * 0.5 + 0.5;
        const glowRadius = node.radius + pulse * 4;
        const alpha = node.brightness * (0.6 + pulse * 0.4);

        // Glow
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, glowRadius * 3
        );
        gradient.addColorStop(0, `rgba(251, 76, 2, ${alpha * 0.3})`);
        gradient.addColorStop(1, 'rgba(251, 76, 2, 0)');
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowRadius * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 76, 2, ${alpha})`;
        ctx.fill();
      }

      // Heartbeat wave across bottom
      const waveY = rect.height * 0.85;
      ctx.beginPath();
      ctx.moveTo(0, waveY);
      for (let x = 0; x < rect.width; x += 2) {
        const progress = x / rect.width;
        const wave = Math.sin(progress * 8 + time * 0.001) * 3;
        const spike = Math.exp(-Math.pow((progress - 0.5 + Math.sin(time * 0.0005) * 0.2) * 8, 2)) * 20;
        ctx.lineTo(x, waveY + wave - spike);
      }
      ctx.strokeStyle = 'rgba(251, 76, 2, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animationId = requestAnimationFrame(draw);
    };

    resize();
    createNodes();
    animationId = requestAnimationFrame(draw);

    const handleResize = () => {
      resize();
      createNodes();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
