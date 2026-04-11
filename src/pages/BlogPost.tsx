/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Individual blog post — /blog/:slug.
   Detail page mirrors SessionPiece pattern.
   ────────────────────────────────────────────────────────── */

import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SiteNav } from '../components/organisms/SiteNav'
import { MarkdownRenderer } from '../components/molecules/MarkdownRenderer'
import { Badge } from '../components/atoms'
import { NotFound } from '../components/atoms'
import { getBlogPostBySlug } from '../data/blog-library'
import { usePageMeta } from '../lib/usePageMeta'
import { useScrollablePage } from '../lib/useScrollablePage'

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const { t } = useTranslation()
  useScrollablePage()

  const post = slug ? getBlogPostBySlug(slug) : undefined

  usePageMeta({
    title: post ? `${post.title} — Live Music Coder` : 'Blog — Live Music Coder',
    description: post?.summary ?? '',
    path: `/blog/${slug ?? ''}`,
  })

  if (!post) return <NotFound />

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <SiteNav />

      <article style={{ maxWidth: '760px', margin: '0 auto', padding: 'var(--space-6)' }}>
        {/* Back link */}
        <Link
          to="/blog"
          style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', textDecoration: 'none', display: 'inline-block', marginBottom: 'var(--space-4)' }}
        >
          {t('blog.backToList')}
        </Link>

        {/* Meta */}
        <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 'var(--space-3)' }}>
          <time style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-mono)' }}>
            {post.date}
          </time>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            {t('blog.readingTime', { min: post.readingTimeMin })}
          </span>
          {post.tags.map((tag) => (
            <Badge key={tag}>
              {t(`blog.${tag}`)}
            </Badge>
          ))}
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, lineHeight: 1.2, marginBottom: 'var(--space-3)' }}>
          {post.title}
        </h1>

        {/* Author */}
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
          {t('blog.writtenBy')}{' '}
          {post.author.url ? (
            <a href={post.author.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
              {post.author.name}
            </a>
          ) : (
            post.author.name
          )}
        </p>

        {/* Body */}
        <MarkdownRenderer content={post.body} />
      </article>
    </main>
  )
}
