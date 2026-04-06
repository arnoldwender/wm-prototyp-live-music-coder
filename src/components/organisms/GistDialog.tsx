/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   GistDialog organism — modal for GitHub Gist integration.
   Sections: PAT token management, save project to Gist,
   load project from Gist URL/ID.
   ────────────────────────────────────────────────────────── */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Upload, Download, Trash2 } from 'lucide-react'
import { useAppStore } from '../../lib/store'
import {
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  saveToGist,
  loadFromGist,
  parseGistId,
} from '../../lib/persistence/gist'
import { Button } from '../atoms'
import type { Project } from '../../types/project'

interface GistDialogProps {
  onClose: () => void
}

/** Dialog for GitHub Gist save/load with PAT management */
export function GistDialog({ onClose }: GistDialogProps) {
  const { t } = useTranslation()
  const [token, setToken] = useState(getStoredToken() ?? '')
  const [remember, setRemember] = useState(false)
  const [gistInput, setGistInput] = useState('')
  const [status, setStatus] = useState('')
  const [gistUrl, setGistUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedGists, setSavedGists] = useState<{ id: string; url: string; date: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem('lmc-saved-gists') || '[]') } catch { return [] }
  })

  const hasToken = !!getStoredToken()
  const backdropRef = useRef<HTMLDivElement>(null)

  /* Focus trap — focus first focusable element on mount */
  useEffect(() => {
    const container = backdropRef.current
    if (!container) return
    const focusable = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length > 0) focusable[0].focus()
  }, [])

  /* Focus trap — keep Tab cycling within the dialog */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key !== 'Tab') return
    const container = backdropRef.current
    if (!container) return
    const focusable = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }, [onClose])

  /* --- Token management handlers --- */

  const handleSaveToken = () => {
    setStoredToken(token, remember)
    setStatus(t('gist.tokenSaved'))
  }

  const handleClearToken = () => {
    clearStoredToken()
    setToken('')
    setStatus(t('gist.tokenCleared'))
  }

  /* --- Gist save handler — builds Project from current store state --- */

  const handleSave = async () => {
    setSaving(true)
    setStatus(t('gist.saving'))
    try {
      const store = useAppStore.getState()
      const now = new Date().toISOString()
      const project: Project = {
        id: `project_${Date.now()}`,
        name: 'Live Music Coder Project',
        version: 1,
        created: now,
        updated: now,
        bpm: store.bpm,
        defaultEngine: store.defaultEngine,
        files: store.files,
        graph: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
        layout: store.layout,
      }
      const result = await saveToGist(project)
      const url = `https://gist.github.com/${result.id}`
      setGistUrl(url)
      setStatus('Saved!')
      /* Persist to saved gists history */
      const entry = { id: result.id, url, date: new Date().toISOString() }
      const updated = [entry, ...savedGists.filter(g => g.id !== result.id)].slice(0, 20)
      setSavedGists(updated)
      localStorage.setItem('lmc-saved-gists', JSON.stringify(updated))
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown'}`)
    }
    setSaving(false)
  }

  /* --- Gist load handler — applies loaded project to store --- */

  const handleLoad = async () => {
    const gistId = parseGistId(gistInput)
    if (!gistId) {
      setStatus('Invalid Gist ID or URL')
      return
    }
    setStatus(t('gist.loading'))
    try {
      const project = await loadFromGist(gistId)
      useAppStore.setState({
        bpm: project.bpm,
        defaultEngine: project.defaultEngine,
        files: project.files,
        layout: project.layout,
      })
      setStatus('Loaded successfully!')
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown'}`)
    }
  }

  /* Shared input styles — reusable across both inputs */
  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    fontSize: 'var(--font-size-sm)',
    padding: 'var(--space-3)',
  }

  return (
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-backdrop)' }}
      onKeyDown={handleKeyDown}
    >
      <div
        className="rounded-lg max-w-lg w-full mx-4"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          padding: 'var(--space-6)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
          <h2
            style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text)',
            }}
          >
            {t('toolbar.gist')}
          </h2>
          <Button variant="ghost" onClick={onClose} aria-label="Close">
            <X size={18} />
          </Button>
        </div>

        {/* --- Token management section --- */}
        <section style={{ marginBottom: 'var(--space-4)' }}>
          <label
            className="block"
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--space-2)',
            }}
          >
            GitHub Personal Access Token
          </label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_..."
            aria-label="GitHub Personal Access Token"
            className="w-full rounded"
            style={{ ...inputStyle, marginBottom: 'var(--space-3)' }}
          />
          <div className="flex items-center" style={{ marginBottom: 'var(--space-3)', gap: 'var(--space-2)' }}>
            <label
              className="flex items-center cursor-pointer"
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
                gap: 'var(--space-2)',
              }}
            >
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember token (localStorage)
            </label>
          </div>
          <div className="flex" style={{ gap: 'var(--space-3)' }}>
            <Button variant="secondary" onClick={handleSaveToken}>
              {t('gist.saveToken')}
            </Button>
            {hasToken && (
              <Button variant="ghost" onClick={handleClearToken} className="flex items-center gap-1">
                <Trash2 size={14} /> {t('gist.clear')}
              </Button>
            )}
          </div>
        </section>

        {/* --- Save to Gist section --- */}
        <section style={{ marginBottom: 'var(--space-4)' }}>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!hasToken || saving}
            className="w-full flex items-center justify-center gap-2"
          >
            <Upload size={16} />
            <span>{t('gist.saveToGist')}</span>
          </Button>
        </section>

        {/* --- Load from Gist section --- */}
        <section style={{ marginBottom: 'var(--space-4)' }}>
          <label
            className="block"
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--space-2)',
            }}
          >
            Load from Gist (URL or ID)
          </label>
          <input
            value={gistInput}
            onChange={(e) => setGistInput(e.target.value)}
            placeholder="https://gist.github.com/user/abc123"
            aria-label="Gist URL or ID"
            className="w-full rounded"
            style={{
              ...inputStyle,
              fontFamily: 'var(--font-family-mono)',
              marginBottom: 'var(--space-3)',
            }}
          />
          <Button
            variant="secondary"
            onClick={handleLoad}
            disabled={!hasToken || !gistInput}
            className="w-full flex items-center justify-center gap-2"
          >
            <Download size={16} />
            <span>{t('gist.loadFromGist')}</span>
          </Button>
        </section>

        {/* --- Status + URL --- */}
        {status && (
          <div className="text-center" style={{ marginBottom: 'var(--space-3)' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{status}</p>
            {gistUrl && (
              <a
                href={gistUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: 'var(--space-2)',
                  fontSize: 'var(--font-size-xs)',
                  fontFamily: 'var(--font-family-mono)',
                  color: 'var(--color-primary)',
                  textDecoration: 'underline',
                  wordBreak: 'break-all',
                }}
              >
                {gistUrl}
              </a>
            )}
          </div>
        )}

        {/* --- Saved gists history --- */}
        {savedGists.length > 0 && (
          <section style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
              Saved Gists
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', maxHeight: '120px', overflowY: 'auto' }}>
              {savedGists.map((g) => (
                <div key={g.id} className="flex items-center justify-between" style={{ fontSize: '11px', padding: 'var(--space-1) 0' }}>
                  <a
                    href={g.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-family-mono)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}
                  >
                    {g.id.slice(0, 12)}...
                  </a>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '10px', flexShrink: 0, marginLeft: 'var(--space-2)' }}>
                    {new Date(g.date).toLocaleDateString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setGistInput(g.url); }}
                    title="Load this gist"
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '10px', marginLeft: 'var(--space-2)' }}
                  >
                    Load
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
