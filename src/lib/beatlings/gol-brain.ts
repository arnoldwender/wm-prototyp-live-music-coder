/* ============================================
   GOL BRAIN — Conway's Game of Life grid
   Serves as the emergent visual substrate for
   Beatlings. Audio events inject cells; the GoL
   rules create evolving patterns. Double-buffered
   Uint8Array with toroidal wrapping.
   Max dimension capped at 128x128.
   ============================================ */

const MAX_DIMENSION = 128;

/** Conway's Game of Life grid with audio-reactive cell injection.
 * Capped at 128x128 to prevent unbounded growth. */
export class GolBrain {
  readonly width: number;
  readonly height: number;
  private grid: Uint8Array;
  private buffer: Uint8Array;

  constructor(width: number, height: number) {
    this.width = Math.min(width, MAX_DIMENSION);
    this.height = Math.min(height, MAX_DIMENSION);
    const size = this.width * this.height;
    this.grid = new Uint8Array(size);
    this.buffer = new Uint8Array(size);
  }

  /* Convert (x, y) to flat index with toroidal wrapping */
  private idx(x: number, y: number): number {
    return ((y % this.height + this.height) % this.height) * this.width +
           ((x % this.width + this.width) % this.width);
  }

  getCell(x: number, y: number): boolean {
    return this.grid[this.idx(x, y)] === 1;
  }

  setCell(x: number, y: number, alive: boolean): void {
    this.grid[this.idx(x, y)] = alive ? 1 : 0;
  }

  getLiveCellCount(): number {
    let count = 0;
    for (let i = 0; i < this.grid.length; i++) {
      count += this.grid[i];
    }
    return count;
  }

  /** Advance one generation using standard GoL rules (B3/S23) */
  step(): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const neighbors = this.countNeighbors(x, y);
        const alive = this.grid[this.idx(x, y)] === 1;
        /* Born with 3 neighbors, survives with 2 or 3 */
        this.buffer[this.idx(x, y)] = (alive ? (neighbors === 2 || neighbors === 3) : neighbors === 3) ? 1 : 0;
      }
    }
    /* Swap grids (double-buffering) */
    [this.grid, this.buffer] = [this.buffer, this.grid];
  }

  /* Count live neighbors using 8-connectivity with toroidal wrapping */
  private countNeighbors(x: number, y: number): number {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        count += this.grid[this.idx(x + dx, y + dy)];
      }
    }
    return count;
  }

  /** Inject a burst of random cells within a circular radius */
  injectPulse(cx: number, cy: number, radius: number): void {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radius * radius && Math.random() > 0.4) {
          this.setCell(cx + dx, cy + dy, true);
        }
      }
    }
  }

  /** Inject a glider pattern (5 cells) at position */
  injectGlider(x: number, y: number): void {
    const pattern: [number, number][] = [[0, 0], [1, 0], [2, 0], [2, 1], [1, 2]];
    for (const [dx, dy] of pattern) this.setCell(x + dx, y + dy, true);
  }

  /** Inject an oscillator (blinker, 3 cells) at position */
  injectOscillator(x: number, y: number): void {
    this.setCell(x, y, true);
    this.setCell(x + 1, y, true);
    this.setCell(x + 2, y, true);
  }

  /** Get the grid as a flat array for rendering */
  getGrid(): Uint8Array {
    return this.grid;
  }

  /** Clear all cells */
  clear(): void {
    this.grid.fill(0);
  }

  /** Serialize to sparse liveCells format for persistence */
  serialize(): { width: number; height: number; liveCells: [number, number][] } {
    const liveCells: [number, number][] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.grid[this.idx(x, y)] === 1) liveCells.push([x, y]);
      }
    }
    return { width: this.width, height: this.height, liveCells };
  }

  /** Restore from serialized data */
  static deserialize(data: { width: number; height: number; liveCells: [number, number][] }): GolBrain {
    const gol = new GolBrain(data.width, data.height);
    for (const [x, y] of data.liveCells) gol.setCell(x, y, true);
    return gol;
  }
}
