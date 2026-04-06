# Sample Library

This directory is reserved for custom-created or CC0-licensed audio samples.

Currently, the app loads samples from the Strudel CDN (Dirt-Samples repository).
Custom local samples can be added here in the future.

## Sample Sources
- Default samples: [Dirt-Samples](https://github.com/tidalcycles/Dirt-Samples) (GPL-3.0)
- Custom samples: Add CC0 or custom-created samples here

## Adding Custom Samples
1. Place WAV files in subdirectories by category (e.g., `drums/`, `bass/`, `fx/`)
2. Create a `strudel.json` mapping file
3. Load via `samples('./samples/strudel.json')` in the editor
