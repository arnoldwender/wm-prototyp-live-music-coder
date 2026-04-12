/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ────────────────────────────────────────────────────────── */
import { useRef, useEffect, useCallback } from 'react';

interface CanvasVisualizerProps {
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => void;
  className?: string;
  ariaLabel?: string;
}

/** Reusable canvas component with auto-resize and animation loop.
 * The draw function is called every frame via requestAnimationFrame. */
export function CanvasVisualizer({ draw, className = '', ariaLabel }: CanvasVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  /* Stable ref to the latest draw callback — updated every render without
   * triggering the RAF effect, preventing loop teardown on prop changes. */
  const drawRef = useRef(draw);
  useEffect(() => { drawRef.current = draw; }, [draw]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  /* RAF loop — only restarts when resizeCanvas identity changes (stable).
   * Reads drawRef.current each frame so the latest draw fn is always used
   * without making draw a dep (which would restart the loop every re-render). */
  useEffect(() => {
    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    const parent = canvasRef.current?.parentElement;
    if (parent) observer.observe(parent);

    const animate = (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      drawRef.current(ctx, width, height, time);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      observer.disconnect();
    };
  }, [resizeCanvas]);

  return <canvas ref={canvasRef} className={`block ${className}`} role="img" aria-label={ariaLabel ?? 'Audio visualizer'} />;
}
