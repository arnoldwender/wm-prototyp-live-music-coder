/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ────────────────────────────────────────────────────────── */
import { describe, it, expect, vi } from 'vitest';
import { drawWaveform } from './waveform';

/* Mock gradient object returned by createLinearGradient */
const mockGradient = { addColorStop: vi.fn() };

function createMockCtx(): CanvasRenderingContext2D {
  return {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    closePath: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    arc: vi.fn(),
    createLinearGradient: vi.fn(() => mockGradient),
    save: vi.fn(),
    restore: vi.fn(),
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 0,
    lineJoin: 'round',
    lineCap: 'round',
    globalAlpha: 1,
    font: '',
    textAlign: 'start' as CanvasTextAlign,
    setLineDash: vi.fn(),
    shadowColor: '',
    shadowBlur: 0,
  } as unknown as CanvasRenderingContext2D;
}

describe('drawWaveform', () => {
  it('clears the canvas', () => {
    const ctx = createMockCtx();
    const data = new Float32Array(128).fill(0);
    drawWaveform(ctx, 400, 200, data);
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 400, 200);
  });

  it('draws a path for waveform data', () => {
    const ctx = createMockCtx();
    const data = new Float32Array(128);
    for (let i = 0; i < 128; i++) data[i] = Math.sin(i / 10);
    drawWaveform(ctx, 400, 200, data);
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });

  it('handles empty data gracefully', () => {
    const ctx = createMockCtx();
    const data = new Float32Array(0);
    expect(() => drawWaveform(ctx, 400, 200, data)).not.toThrow();
  });
});
