/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   GistDialog organism — modal for GitHub Gist integration.
   Sections: PAT token management, save project to Gist,
   load project from Gist URL/ID.
   ────────────────────────────────────────────────────────── */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Upload, Download, Trash2, ShieldCheck } from 'lucide-react'
import { useAppStore } from '../../lib/store'
import {
  hasStoredToken,
  getStoredToken,
  setStoredToken,
  importDesktopTokenFromClipboard,
  clearStoredToken,
  clearEphemeralWebToken,
  saveToGist,
  loadFromGist,
  parseGistId,
} from '../../lib/persistence/gist'
import { getOrchestrator } from '../../lib/orchestrator'
import { safeJsonParse } from '../../lib/persistence/local'
import { isElectron } from '../../lib/platform'
import { Button } from '../atoms'
import type { Project } from '../../types/project'
import { FOCUSABLE_SELECTOR } from '../../lib/focusable'

interface GistDialogProps {
  onClose: () => void
}

/** Dialog for GitHub Gist save/load with isolated PAT management */
export function GistDialog({ onClose }: GistDialogProps) {
  const { t } = useTranslation()
  const [token, setToken] = useState('')
  const [hasToken, setHasToken] = useState(false)
  const [gistInput, setGistInput] = useState('')
  const [status, setStatus] = useState('')
  const [gistUrl, setGistUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingGist, setLoadingGist] = useState(false)
  /* Secret by default. The GitHub API fixes visibility at creation time, so this
     applies to NEW gists only — it is not an editable property afterwards. */
  const [isPublic, setIsPublic] = useState(false)
  const [savedGists, setSavedGists] = useState<{ id: string; url: string; date: string }[]>(() => {
    try {
      const raw = localStorage.getItem('lmc-saved-gists') || '[]'
      return safeJsonParse(raw, [])
    } catch {
      return []
    }
  })

  const backdropRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  /* Check token presence on mount; on web stop active playback so patterns cannot poll the dialog, wipe ephemeral web token + restore focus on unmount */
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null

    if (!isElectron) {
      getOrchestrator().stop()
      if (typeof window.__strudelRepl?.stop === 'function') {
        try { window.__strudelRepl.stop() } catch { /* ignore */ }
      }
      useAppStore.getState().stop()
    }

    void Promise.all([hasStoredToken(), getStoredToken()]).then(([configured, webTok]) => {
      setHasToken(configured)
      if (!isElectron && webTok) setToken(webTok)
    })

    return () => {
      if (!isElectron) {
        clearEphemeralWebToken()
      }
      previousFocusRef.current?.focus?.()
    }
  }, [])

  /* Focus first focusable element inside the modal on mount */
  useEffect(() => {
    const container = backdropRef.current
    if (!container) return
    const focusable = container.querySelectorAll<HTMLElement>(
      FOCUSABLE_SELECTOR
    )
    if (focusable.length > 0) focusable[0].focus()
  }, [])

  /* Keep Tab cycling inside the dialog and allow Escape to close */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key !== 'Tab') return
    const container = backdropRef.current
    if (!container) return
    const focusable = container.querySelectorAll<HTMLElement>(
      FOCUSABLE_SELECTOR
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

  const handleSaveToken = async () => {
    try {
      await setStoredToken(token)
      const configured = await hasStoredToken()
      setHasToken(configured)
      setStatus(configured ? t('gist.tokenSaved') : t('gist.tokenCleared'))
    } catch (err) {
      setStatus(t('gist.errorPrefix', { message: err instanceof Error ? err.message : 'Unknown' }))
    }
  }

  const handleImportClipboardToken = async () => {
    try {
      const res = await importDesktopTokenFromClipboard()
      if (res.ok) {
        const configured = await hasStoredToken()
        setHasToken(configured)
        setStatus(t('gist.tokenSaved'))
        return
      }
      const key =
        res.reason === 'empty'
          ? 'gist.clipboardEmpty'
          : res.reason === 'invalid'
            ? 'gist.clipboardInvalid'
            : res.reason === 'cancelled'
              ? 'gist.clipboardCancelled'
              : 'gist.clipboardUnavailable'
      setStatus(t(key))
    } catch (err) {
      setStatus(t('gist.errorPrefix', { message: err instanceof Error ? err.message : 'Unknown' }))
    }
  }

  const handleClearToken = () => {
    clearStoredToken()
    setToken('')
    setHasToken(false)
    setStatus(t('gist.tokenCleared'))
  }

  /* --- Gist save handler — builds Project from current store state --- */

  const handleSave = async () => {
    setSaving(true)
    setStatus(t('gist.saving'))
    try {
      /* On web, if user typed a token without clicking Save Token first, apply it now */
      if (!isElectron && token.trim() && !hasToken) {
        await setStoredToken(token)
        setHasToken(true)
      }
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
      const result = await saveToGist(project, undefined, isPublic)
      const url = result.url || `https://gist.github.com/${result.id}`
      setGistUrl(url)
      setStatus(t('gist.savedStatus'))
      const entry = { id: result.id, url, date: new Date().toISOString() }
      const updated = [entry, ...savedGists.filter(g => g.id !== result.id)].slice(0, 20)
      setSavedGists(updated)
      try {
        localStorage.setItem('lmc-saved-gists', JSON.stringify(updated))
      } catch { /* ignore storage quota errors */ }
    } catch (err) {
      setStatus(t('gist.errorPrefix', { message: err instanceof Error ? err.message : 'Unknown' }))
    }
    setSaving(false)
  }

  /* --- Gist load handler — public & secret Gists load without requiring a PAT --- */

  const handleLoad = async () => {
    const gistId = parseGistId(gistInput)
    if (!gistId) {
      setStatus(t('gist.invalidGist'))
      return
    }
    setLoadingGist(true)
    setStatus(t('gist.loading'))
    try {
      const project = await loadFromGist(gistId)
      const store = useAppStore.getState()
      store.loadProject({
        bpm: project.bpm,
        defaultEngine: project.defaultEngine,
        files: project.files,
        layout: project.layout,
      })
      /* External Gist code is untrusted — activate security gate and close modal */
      store.setUntrustedCodePending(true)
      setStatus(t('gist.loadedStatus'))
      setLoadingGist(false)
      onClose()
      return
    } catch (err) {
      setStatus(t('gist.errorPrefix', { message: err instanceof Error ? err.message : 'Unknown' }))
    }
    setLoadingGist(false)
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    fontSize: 'var(--font-size-sm)',
    padding: 'var(--space-3)',
  }

  const canSave = (hasToken || (!isElectron && Boolean(token.trim()))) && !saving

  return (
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gist-dialog-title"
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
            id="gist-dialog-title"
            style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text)',
            }}
          >
            {t('toolbar.gist')}
          </h2>
          <Button variant="ghost" onClick={onClose} aria-label={t('common.close')}>
            <X size={18} />
          </Button>
        </div>

        {/* --- Token management section --- */}
        <section style={{ marginBottom: 'var(--space-4)' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-2)' }}>
            <label
              htmlFor={isElectron ? undefined : 'gist-pat-input'}
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {t('gist.patLabel')}
            </label>
            {hasToken && (
              <span
                className="inline-flex items-center gap-1"
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-primary)',
                }}
              >
                <ShieldCheck size={14} aria-hidden="true" />
                {t('gist.tokenConfigured')}
              </span>
            )}
          </div>
          {!isElectron && (
            <input
              id="gist-pat-input"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_..."
              aria-label={t('gist.patLabel')}
              autoComplete="off"
              className="w-full rounded"
              style={{ ...inputStyle, marginBottom: 'var(--space-2)' }}
            />
          )}
          <p
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              lineHeight: 'var(--line-height-base)',
              marginBottom: 'var(--space-3)',
            }}
          >
            {isElectron ? t('gist.desktopKeychainNotice') : t('gist.webMemoryNotice')}
          </p>
          <div className="flex" style={{ gap: 'var(--space-3)' }}>
            {isElectron ? (
              <Button variant="secondary" onClick={handleImportClipboardToken}>
                {t('gist.pasteFromClipboard')}
              </Button>
            ) : (
              <Button variant="secondary" onClick={handleSaveToken}>
                {t('gist.saveToken')}
              </Button>
            )}
            {hasToken && (
              <Button variant="ghost" onClick={handleClearToken} className="flex items-center gap-1">
                <Trash2 size={14} aria-hidden="true" /> {t('gist.clear')}
              </Button>
            )}
          </div>
        </section>

        {/* --- Save to Gist section --- */}
        <section style={{ marginBottom: 'var(--space-4)' }}>
          <label
            className="flex items-center gap-2"
            style={{
              marginBottom: 'var(--space-2)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              minHeight: 'var(--size-touch, 44px)',
            }}
          >
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={saving}
            />
            <span>{t('gist.makePublic')}</span>
          </label>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!canSave}
            className="w-full flex items-center justify-center gap-2"
          >
            <Upload size={16} aria-hidden="true" />
            <span>{t('gist.saveToGist')}</span>
          </Button>
        </section>

        {/* --- Load from Gist section --- */}
        <section style={{ marginBottom: 'var(--space-4)' }}>
          <label
            htmlFor="gist-load-input"
            className="block"
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--space-2)',
            }}
          >
            {t('gist.loadLabel')}
          </label>
          <input
            id="gist-load-input"
            value={gistInput}
            onChange={(e) => setGistInput(e.target.value)}
            placeholder="https://gist.github.com/user/abc123"
            aria-label={t('gist.gistInputAria')}
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
            disabled={!gistInput.trim() || loadingGist}
            className="w-full flex items-center justify-center gap-2"
          >
            <Download size={16} aria-hidden="true" />
            <span>{t('gist.loadFromGist')}</span>
          </Button>
        </section>

        {/* --- Status + URL --- */}
        {status && (
          <div role="status" aria-live="polite" className="text-center" style={{ marginBottom: 'var(--space-3)' }}>
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
            <div style={{ fontSize: 'var(--font-size-2xs)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-legend)', marginBottom: 'var(--space-2)' }}>
              {t('gist.savedGistsTitle')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', maxHeight: '120px', overflowY: 'auto' }}>
              {savedGists.map((g) => (
                <div key={g.id} className="flex items-center justify-between" style={{ fontSize: 'var(--font-size-ui)', padding: 'var(--space-1) 0' }}>
                  <a
                    href={g.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-family-mono)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}
                  >
                    {g.id.slice(0, 12)}...
                  </a>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-2xs)', flexShrink: 0, marginLeft: 'var(--space-2)' }}>
                    {new Date(g.date).toLocaleDateString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setGistInput(g.url) }}
                    title={t('gist.loadThisGist')}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 'var(--font-size-2xs)', marginLeft: 'var(--space-2)', padding: 'var(--space-1) var(--space-2)' }}
                  >
                    {t('gist.selectGist')}
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
