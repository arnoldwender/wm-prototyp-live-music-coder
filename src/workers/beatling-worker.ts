/* ──────────────────────────────────────────────────────────
   Web Worker for Beatling ecosystem computation.
   Offloads GoL stepping and neural network updates from the
   main thread to keep the UI responsive during heavy audio
   analysis frames.
   ────────────────────────────────────────────────────────── */

/** Inbound message types from the main thread */
interface WorkerMessage {
  type: 'gol-step' | 'gol-inject' | 'neural-update';
  data: GolStepData | Record<string, unknown>;
}

/** Payload for a GoL step request — flat grid + dimensions */
interface GolStepData {
  grid: Uint8Array;
  width: number;
  height: number;
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, data } = e.data;

  switch (type) {
    case 'gol-step': {
      /* Receive grid as Uint8Array, run one GoL generation (B3/S23),
       * return the new grid via transferable buffer for zero-copy perf */
      const { grid, width, height } = data as GolStepData;
      const buffer = new Uint8Array(width * height);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          let neighbors = 0;

          /* Count 8-connected neighbors with toroidal wrapping */
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = ((x + dx) % width + width) % width;
              const ny = ((y + dy) % height + height) % height;
              neighbors += grid[ny * width + nx];
            }
          }

          /* Standard GoL rules — born with 3, survive with 2 or 3 */
          const alive = grid[idx] === 1;
          buffer[idx] = (alive ? (neighbors === 2 || neighbors === 3) : neighbors === 3) ? 1 : 0;
        }
      }

      /* Transfer buffer ownership back to main thread (zero-copy) */
      self.postMessage(
        { type: 'gol-result', data: { grid: buffer } },
        { transfer: [buffer.buffer] },
      );
      break;
    }

    /* Future: neural network weight updates */
    case 'neural-update': {
      /* Placeholder — neural net computation will be added here */
      self.postMessage({ type: 'neural-result', data: {} });
      break;
    }
  }
};
