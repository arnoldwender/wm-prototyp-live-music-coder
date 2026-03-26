/* Integration test — verifies BeatlingWorld neural brain doesn't crash.
 * Canvas draw is skipped (jsdom doesn't support getContext). */
import { describe, it, expect } from 'vitest';
import { BeatlingWorld } from './index';

describe('BeatlingWorld with neural brain', () => {
  it('creates a world without errors', () => {
    const world = new BeatlingWorld(16, 16);
    expect(world).toBeDefined();
    world.dispose();
  });

  it('seeds dormant eggs without audio (ambient mode)', () => {
    const world = new BeatlingWorld(16, 16);

    /* Run enough frames for all 6 eggs to be seeded */
    for (let i = 0; i < 700; i++) {
      world.update(false);
    }

    /* Eggs should appear as dormant seeds — at least 1, up to 6 */
    const creatures = world.getCreatures();
    expect(creatures.length).toBeGreaterThan(0);
    expect(creatures.length).toBeLessThanOrEqual(6);

    /* All should be in egg stage (dormant, not hatched) */
    for (const c of creatures) {
      expect(c.stage).toBe('egg');
    }

    world.dispose();
  });

  it('creatures spawn and brain updates with simulated audio', () => {
    const world = new BeatlingWorld(16, 16);
    let frameCount = 0;

    /* Inject fake audio bridge to simulate live audio features */
    (world as any).bridge = {
      getFeatures: () => ({
        rms: 0.5,
        peak: 0.7,
        hasBeat: frameCount % 10 === 0,
        dominantFreq: 440,
        complexity: 0.6,
        isTyping: false,
      }),
    };

    /* Run 200 frames with simulated audio */
    for (let i = 0; i < 200; i++) {
      frameCount = i;
      world.update(false);
    }

    /* Creatures should have spawned with audio active */
    const creatures = world.getCreatures();
    expect(creatures.length).toBeGreaterThan(0);

    /* All creatures should have brain, consciousness, and dreams */
    for (const creature of creatures) {
      expect((creature as any).brain).toBeDefined();
      expect((creature as any).brain.neurons.size).toBeGreaterThan(0);
      expect((creature as any).consciousness).toBeDefined();
      expect((creature as any).dreams).toBeDefined();
      /* Should not be permanently sleeping (audio is active) */
      expect((creature as any).isSleeping).toBe(false);
    }

    world.dispose();
  });

  it('creatures do NOT immediately sleep with normal RMS levels', () => {
    const world = new BeatlingWorld(16, 16);

    /* Simulate moderate audio — RMS 0.3 is typical during playback */
    (world as any).bridge = {
      getFeatures: () => ({
        rms: 0.3,
        peak: 0.5,
        hasBeat: true,
        dominantFreq: 220,
        complexity: 0.4,
        isTyping: false,
      }),
    };

    /* Run enough frames for creatures to spawn and brains to update */
    for (let i = 0; i < 300; i++) {
      world.update(false);
    }

    const creatures = world.getCreatures();
    expect(creatures.length).toBeGreaterThan(0);

    /* None should be sleeping — sleepPressure builds very slowly */
    const sleeping = creatures.filter((c: any) => (c as any).isSleeping);
    expect(sleeping.length).toBe(0);

    world.dispose();
  });
});
