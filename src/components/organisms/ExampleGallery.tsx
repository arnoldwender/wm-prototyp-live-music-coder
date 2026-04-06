/* eslint-disable @typescript-eslint/no-explicit-any */
/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Example gallery — cards with inline play button.
 * Click play icon to hear the pattern instantly.
 * Click card body to open in editor. */

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Play, Square } from 'lucide-react'
import { motion } from 'framer-motion'
import { STARTER_TEMPLATES, getCategories, getTemplatesByCategory } from '../../data/templates'
import { encodeToUrl } from '../../lib/persistence/url'
import { Icon } from '../atoms'

const ENGINE_DOT_COLORS: Record<string, string> = {
  strudel: 'var(--color-strudel)',
  tonejs: 'var(--color-tonejs)',
  webaudio: 'var(--color-webaudio)',
  midi: 'var(--color-midi)',
}

export function ExampleGallery() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const categories = getCategories()
  const [activeCategory, setActiveCategory] = useState(categories[0])
  const [playingId, setPlayingId] = useState<string | null>(null)
  const replRef = useRef<any>(null)

  const handleTryExample = (template: (typeof STARTER_TEMPLATES)[0]) => {
    /* Stop any playing pattern first */
    stopPlaying()
    const hash = encodeToUrl({ code: template.code, bpm: 120, engine: template.engine })
    navigate(`/editor#code=${hash}&autoplay=1`)
  }

  const stopPlaying = async () => {
    /* Stop Strudel */
    try { replRef.current?.stop() } catch { /* ok */ }
    /* Stop Tone.js transport */
    try {
      const Tone = await import('tone')
      Tone.getTransport().stop()
      Tone.getTransport().cancel()
    } catch { /* ok */ }
    /* Stop WebAudio — disconnect masterGain to silence everything */
    try {
      const { getSharedContext, getMasterGain, getMasterAnalyser } = await import('../../lib/audio/context')
      const mg = getMasterGain()
      const an = getMasterAnalyser()
      mg.disconnect()
      mg.connect(an)
      an.connect(getSharedContext().destination)
    } catch { /* ok */ }
    setPlayingId(null)
  }

  /* Stop all audio when component unmounts (navigating away) */
  useEffect(() => {
    return () => { stopPlaying() }
  }, [])

  const handlePlay = async (e: React.MouseEvent, template: (typeof STARTER_TEMPLATES)[0]) => {
    e.stopPropagation()

    /* If already playing this one, stop it */
    if (playingId === template.id) {
      await stopPlaying()
      return
    }

    /* Stop previous before starting new */
    await stopPlaying()

    try {
      if (template.engine === 'strudel') {
        /* Lazy-init Strudel REPL */
        if (!replRef.current) {
          const { initStrudel } = await import('@strudel/web')
          replRef.current = await initStrudel()
          try {
            await replRef.current.evaluate(`samples('github:tidalcycles/Dirt-Samples/master')`, false)
          } catch { /* samples may fail */ }
        }
        try {
          const { getAudioContext } = await import('@strudel/webaudio')
          const ctx = getAudioContext()
          if (ctx?.state === 'suspended') await ctx.resume()
        } catch { /* ok */ }
        await replRef.current.evaluate(template.code, true)

      } else if (template.engine === 'tonejs') {
        /* Lazy-init Tone.js */
        const Tone = await import('tone')
        const toneCtx = Tone.getContext().rawContext as AudioContext
        if (toneCtx?.state === 'suspended') await (toneCtx as AudioContext).resume()
        Tone.getTransport().stop()
        Tone.getTransport().cancel()
        await Function('Tone', `"use strict"; return (async () => { ${template.code} })()`)(Tone)

      } else if (template.engine === 'webaudio') {
        /* WebAudio — use shared context */
        const { getSharedContext, getMasterGain, resumeContext } = await import('../../lib/audio/context')
        await resumeContext()
        const ctx = getSharedContext()
        const mg = getMasterGain()
        const ctxProxy = new Proxy(ctx, {
          get(target: any, prop: string) {
            if (prop === 'destination') return mg
            const val = target[prop]
            return typeof val === 'function' ? val.bind(target) : val
          }
        })
        await Function('ctx', `"use strict"; return (async () => { ${template.code} })()`)(ctxProxy)
      }

      setPlayingId(template.id)
    } catch (err) {
      console.error('[ExampleGallery] Play failed:', err)
      setPlayingId(null)
    }
  }

  const templates = getTemplatesByCategory(activeCategory)

  return (
    <section id="examples" className="px-4 py-16 max-w-5xl mx-auto">
      <motion.h2
        className="text-2xl font-bold text-center mb-8"
        style={{ color: 'var(--color-text)' }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {t('landing.examples')}
      </motion.h2>

      {/* Category tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="px-3 py-1.5 rounded-full text-sm transition-all cursor-pointer"
            style={{
              backgroundColor: activeCategory === cat ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
              color: activeCategory === cat ? 'var(--color-bg)' : 'var(--color-text-secondary)',
              border: `1px solid ${activeCategory === cat ? 'var(--color-primary)' : 'var(--color-border)'}`,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {templates.map((tmpl) => {
          const isPlaying = playingId === tmpl.id
          return (
            <article
              key={tmpl.id}
              className="p-4 rounded-lg flex flex-col gap-2 transition-all cursor-pointer group"
              style={{
                backgroundColor: 'var(--color-bg-elevated)',
                border: `1px solid ${isPlaying ? ENGINE_DOT_COLORS[tmpl.engine] : 'var(--color-border)'}`,
                boxShadow: isPlaying ? `0 0 12px ${ENGINE_DOT_COLORS[tmpl.engine]}22` : 'none',
              }}
              onClick={() => handleTryExample(tmpl)}
              onMouseEnter={(e) => {
                if (!isPlaying) e.currentTarget.style.borderColor = ENGINE_DOT_COLORS[tmpl.engine] ?? 'var(--color-border)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                if (!isPlaying) e.currentTarget.style.borderColor = 'var(--color-border)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {/* Header: engine dot + name + play/stop button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="shrink-0"
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: ENGINE_DOT_COLORS[tmpl.engine] ?? 'var(--color-text-muted)',
                    }}
                  />
                  <h3 className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                    {tmpl.name}
                  </h3>
                </div>
                {/* Play/Stop button — always visible, stops propagation */}
                <button
                  type="button"
                  onClick={(e) => handlePlay(e, tmpl)}
                  aria-label={isPlaying ? 'Stop' : 'Play'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    backgroundColor: isPlaying ? ENGINE_DOT_COLORS[tmpl.engine] : 'var(--color-bg)',
                    color: isPlaying ? 'var(--color-bg)' : 'var(--color-primary)',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                    flexShrink: 0,
                  }}
                >
                  <Icon icon={isPlaying ? Square : Play} size={12} />
                </button>
              </div>

              {/* Description */}
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {tmpl.description}
              </p>

              {/* Code preview */}
              <pre
                className="text-xs leading-relaxed overflow-hidden rounded p-2"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-family-mono)',
                  maxHeight: '60px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {tmpl.code.slice(0, 80)}{tmpl.code.length > 80 ? '...' : ''}
              </pre>
            </article>
          )
        })}
      </div>

      {/* Now playing indicator */}
      {playingId && (
        <div className="fixed bottom-4 right-4 z-50" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-4)',
          backgroundColor: 'rgba(9, 9, 11, 0.95)',
          border: '1px solid var(--color-primary)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 0 12px rgba(168,85,247,0.2)',
          fontSize: '11px',
          color: 'var(--color-text)',
        }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-success)' }} />
          Playing
          <button
            type="button"
            onClick={stopPlaying}
            style={{
              background: 'none',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              fontSize: '10px',
              padding: '1px var(--space-2)',
              marginLeft: 'var(--space-2)',
            }}
          >
            Stop
          </button>
        </div>
      )}
    </section>
  )
}
