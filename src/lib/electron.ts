// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

export const isElectron = typeof window !== 'undefined' && !!window.electronAPI
export const electronAPI = isElectron ? window.electronAPI! : null
