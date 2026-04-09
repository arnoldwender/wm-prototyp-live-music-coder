// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

/**
 * Encode float32 PCM samples into a standard 16-bit PCM WAV file.
 * Returns a Node.js Buffer containing the complete WAV file.
 */
export function encodeWav(
  samples: ArrayBuffer,
  sampleRate: number,
  channels: number
): Buffer {
  const float32 = new Float32Array(samples)
  const numSamples = float32.length
  const bytesPerSample = 2 // 16-bit PCM
  const dataLength = numSamples * bytesPerSample
  const headerLength = 44
  const totalLength = headerLength + dataLength

  const buffer = Buffer.alloc(totalLength)

  // --- RIFF header (12 bytes) ---
  buffer.write('RIFF', 0, 'ascii')
  buffer.writeUInt32LE(totalLength - 8, 4) // File size minus RIFF header
  buffer.write('WAVE', 8, 'ascii')

  // --- fmt sub-chunk (24 bytes) ---
  buffer.write('fmt ', 12, 'ascii')
  buffer.writeUInt32LE(16, 16) // Sub-chunk size (PCM = 16)
  buffer.writeUInt16LE(1, 20) // Audio format (1 = PCM)
  buffer.writeUInt16LE(channels, 22) // Number of channels
  buffer.writeUInt32LE(sampleRate, 24) // Sample rate
  buffer.writeUInt32LE(sampleRate * channels * bytesPerSample, 28) // Byte rate
  buffer.writeUInt16LE(channels * bytesPerSample, 32) // Block align
  buffer.writeUInt16LE(16, 34) // Bits per sample

  // --- data sub-chunk header (8 bytes) ---
  buffer.write('data', 36, 'ascii')
  buffer.writeUInt32LE(dataLength, 40)

  // --- Convert float32 [-1, 1] to int16 [-32768, 32767] ---
  let offset = headerLength
  for (let i = 0; i < numSamples; i++) {
    // Clamp to [-1, 1] range
    const clamped = Math.max(-1, Math.min(1, float32[i]))
    // Scale to int16 range
    const int16 = clamped < 0 ? clamped * 32768 : clamped * 32767
    buffer.writeInt16LE(Math.round(int16), offset)
    offset += bytesPerSample
  }

  return buffer
}
