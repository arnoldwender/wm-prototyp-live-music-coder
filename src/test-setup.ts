// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
/* Vitest setup — extends matchers with jest-dom assertions */
import '@testing-library/jest-dom'

/* jsdom does not implement ResizeObserver — mock it so canvas/visualizer
 * components that use it in useEffect do not throw in the test environment. */
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
