import { describe, it, expect, beforeEach } from 'vitest';
import { GolBrain } from './gol-brain';

describe('GolBrain', () => {
  let gol: GolBrain;

  beforeEach(() => {
    gol = new GolBrain(16, 16);
  });

  it('starts empty', () => {
    expect(gol.getLiveCellCount()).toBe(0);
  });

  it('sets and gets cells', () => {
    gol.setCell(5, 5, true);
    expect(gol.getCell(5, 5)).toBe(true);
    expect(gol.getLiveCellCount()).toBe(1);
  });

  it('applies Game of Life rules — still life (block)', () => {
    gol.setCell(5, 5, true);
    gol.setCell(5, 6, true);
    gol.setCell(6, 5, true);
    gol.setCell(6, 6, true);
    gol.step();
    expect(gol.getCell(5, 5)).toBe(true);
    expect(gol.getLiveCellCount()).toBe(4);
  });

  it('applies Game of Life rules — blinker oscillates', () => {
    gol.setCell(7, 6, true);
    gol.setCell(7, 7, true);
    gol.setCell(7, 8, true);
    gol.step();
    expect(gol.getCell(6, 7)).toBe(true);
    expect(gol.getCell(7, 7)).toBe(true);
    expect(gol.getCell(8, 7)).toBe(true);
  });

  it('injects cells at position', () => {
    gol.injectPulse(8, 8, 3);
    expect(gol.getLiveCellCount()).toBeGreaterThan(0);
  });

  it('injects glider pattern', () => {
    gol.injectGlider(4, 4);
    expect(gol.getLiveCellCount()).toBe(5);
  });

  it('respects max dimension cap', () => {
    const big = new GolBrain(200, 200);
    expect(big.width).toBeLessThanOrEqual(128);
    expect(big.height).toBeLessThanOrEqual(128);
  });

  it('serializes and deserializes', () => {
    gol.setCell(3, 3, true);
    gol.setCell(7, 9, true);
    const data = gol.serialize();
    const restored = GolBrain.deserialize(data);
    expect(restored.getCell(3, 3)).toBe(true);
    expect(restored.getCell(7, 9)).toBe(true);
    expect(restored.getLiveCellCount()).toBe(2);
  });

  it('clears all cells', () => {
    gol.setCell(1, 1, true);
    gol.setCell(2, 2, true);
    gol.clear();
    expect(gol.getLiveCellCount()).toBe(0);
  });
});
