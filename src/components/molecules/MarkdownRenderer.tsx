/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   MarkdownRenderer — lightweight markdown-to-JSX renderer.
   Zero dependencies — line-by-line state machine parser.
   Supports headings, paragraphs, bold, italic, inline code,
   code blocks, unordered/ordered lists, and links.
   ────────────────────────────────────────────────────────── */

import { useMemo } from 'react';
import type { ReactNode, CSSProperties } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/* ── Inline formatting parser ─────────────────────────────── */

/** Parse inline markdown tokens: bold, italic, code, links */
function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  /* Regex matches inline code, bold, italic, and links in priority order */
  const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    /* Push plain text before the match */
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `inline-${match.index}`;

    if (match[1]) {
      /* Inline code — strip backticks */
      nodes.push(
        <code key={key} style={styles.inlineCode}>
          {token.slice(1, -1)}
        </code>
      );
    } else if (match[2]) {
      /* Bold — strip ** */
      nodes.push(
        <strong key={key} style={styles.bold}>
          {token.slice(2, -2)}
        </strong>
      );
    } else if (match[3]) {
      /* Italic — strip * */
      nodes.push(
        <em key={key} style={styles.italic}>
          {token.slice(1, -1)}
        </em>
      );
    } else if (match[4]) {
      /* Link — extract [text](url) */
      const linkMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(token);
      if (linkMatch) {
        nodes.push(
          <a
            key={key}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
          >
            {linkMatch[1]}
          </a>
        );
      }
    }

    lastIndex = match.index + token.length;
  }

  /* Push remaining plain text */
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

/* ── Block-level state machine ────────────────────────────── */

interface Block {
  type: 'heading' | 'paragraph' | 'code' | 'ul' | 'ol';
  level?: number;       /* heading level (2 or 3) */
  lang?: string;        /* code block language hint */
  content: string[];    /* raw text lines */
}

/** Parse markdown string into an array of typed blocks */
function parseBlocks(source: string): Block[] {
  const lines = source.split('\n');
  const blocks: Block[] = [];
  let current: Block | null = null;
  let inCode = false;

  const flushCurrent = () => {
    if (current) {
      blocks.push(current);
      current = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    /* ── Code fence toggle ─────────────────────────────── */
    if (line.trimStart().startsWith('```')) {
      if (!inCode) {
        /* Opening fence — start code block */
        flushCurrent();
        const lang = line.trimStart().slice(3).trim();
        current = { type: 'code', lang: lang || undefined, content: [] };
        inCode = true;
      } else {
        /* Closing fence — finish code block */
        inCode = false;
        flushCurrent();
      }
      continue;
    }

    /* Inside a code block — collect raw lines */
    if (inCode && current) {
      current.content.push(line);
      continue;
    }

    /* ── Heading (## or ###) ───────────────────────────── */
    const headingMatch = /^(#{2,3})\s+(.+)/.exec(line);
    if (headingMatch) {
      flushCurrent();
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        content: [headingMatch[2]],
      });
      continue;
    }

    /* ── Unordered list item (- item) ──────────────────── */
    const ulMatch = /^-\s+(.+)/.exec(line);
    if (ulMatch) {
      if (!current || current.type !== 'ul') {
        flushCurrent();
        current = { type: 'ul', content: [] };
      }
      current.content.push(ulMatch[1]);
      continue;
    }

    /* ── Ordered list item (1. item) ───────────────────── */
    const olMatch = /^\d+\.\s+(.+)/.exec(line);
    if (olMatch) {
      if (!current || current.type !== 'ol') {
        flushCurrent();
        current = { type: 'ol', content: [] };
      }
      current.content.push(olMatch[1]);
      continue;
    }

    /* ── Blank line — flush current block ──────────────── */
    if (line.trim() === '') {
      flushCurrent();
      continue;
    }

    /* ── Paragraph text ────────────────────────────────── */
    if (!current || current.type !== 'paragraph') {
      flushCurrent();
      current = { type: 'paragraph', content: [] };
    }
    current.content.push(line);
  }

  /* Flush any remaining block (handles unclosed code fences) */
  if (current) {
    blocks.push(current);
  }

  return blocks;
}

/* ── Block renderer ───────────────────────────────────────── */

/** Convert a parsed Block into a React element */
function renderBlock(block: Block, index: number): ReactNode {
  const key = `block-${index}`;

  switch (block.type) {
    case 'heading': {
      const Tag = block.level === 3 ? 'h3' : 'h2';
      const style = block.level === 3 ? styles.h3 : styles.h2;
      return (
        <Tag key={key} style={style}>
          {parseInline(block.content[0])}
        </Tag>
      );
    }

    case 'paragraph':
      return (
        <p key={key} style={styles.paragraph}>
          {parseInline(block.content.join(' '))}
        </p>
      );

    case 'code':
      return (
        <pre key={key} style={styles.codeBlock}>
          {block.lang && (
            <span style={styles.codeLang}>{block.lang}</span>
          )}
          <code style={styles.codeContent}>
            {block.content.join('\n')}
          </code>
        </pre>
      );

    case 'ul':
      return (
        <ul key={key} style={styles.list}>
          {block.content.map((item, i) => (
            <li key={`${key}-li-${i}`} style={styles.listItem}>
              {parseInline(item)}
            </li>
          ))}
        </ul>
      );

    case 'ol':
      return (
        <ol key={key} style={styles.orderedList}>
          {block.content.map((item, i) => (
            <li key={`${key}-li-${i}`} style={styles.listItem}>
              {parseInline(item)}
            </li>
          ))}
        </ol>
      );

    default:
      return null;
  }
}

/* ── Styles (all via design tokens) ───────────────────────── */

const styles: Record<string, CSSProperties> = {
  wrapper: {
    color: 'var(--color-text)',
    fontFamily: 'var(--font-family-body, var(--font-family-mono))',
    fontSize: 'var(--font-size-sm)',
    lineHeight: 'var(--line-height-base)',
  },
  h2: {
    color: 'var(--color-text)',
    fontSize: 'var(--font-size-lg)',
    fontWeight: 'var(--font-weight-bold)' as CSSProperties['fontWeight'],
    margin: 'var(--space-lg) 0 var(--space-sm)',
    lineHeight: 'var(--line-height-tight)',
  },
  h3: {
    color: 'var(--color-text)',
    fontSize: 'var(--font-size-base)',
    fontWeight: 'var(--font-weight-bold)' as CSSProperties['fontWeight'],
    margin: 'var(--space-md) 0 var(--space-xs)',
    lineHeight: 'var(--line-height-tight)',
  },
  paragraph: {
    color: 'var(--color-text-secondary, var(--color-text))',
    margin: '0 0 var(--space-sm)',
  },
  bold: {
    color: 'var(--color-text)',
    fontWeight: 'var(--font-weight-bold)' as CSSProperties['fontWeight'],
  },
  italic: {
    fontStyle: 'italic',
    color: 'var(--color-text-secondary, var(--color-text))',
  },
  inlineCode: {
    fontFamily: 'var(--font-family-mono)',
    fontSize: '0.9em',
    backgroundColor: 'color-mix(in srgb, var(--color-text) 10%, transparent)',
    padding: '1px var(--space-xs)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-primary)',
  },
  link: {
    color: 'var(--color-primary)',
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
    transition: 'var(--transition-fast)',
  },
  codeBlock: {
    backgroundColor: 'color-mix(in srgb, var(--color-bg) 80%, black)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-family-mono)',
    fontSize: 'var(--font-size-xs)',
    lineHeight: 'var(--line-height-loose)',
    margin: '0 0 var(--space-sm)',
    overflow: 'auto',
    padding: 'var(--space-sm) var(--space-md)',
    position: 'relative',
  },
  codeLang: {
    position: 'absolute',
    top: 'var(--space-xs)',
    right: 'var(--space-sm)',
    fontSize: '10px',
    color: 'var(--color-text-muted, var(--color-text-secondary))',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    userSelect: 'none',
    opacity: 0.6,
  },
  codeContent: {
    fontFamily: 'inherit',
    whiteSpace: 'pre',
    color: 'var(--color-text)',
  },
  list: {
    margin: '0 0 var(--space-sm)',
    paddingLeft: 'var(--space-lg)',
    listStyleType: 'disc',
  },
  orderedList: {
    margin: '0 0 var(--space-sm)',
    paddingLeft: 'var(--space-lg)',
    listStyleType: 'decimal',
  },
  listItem: {
    color: 'var(--color-text-secondary, var(--color-text))',
    marginBottom: 'var(--space-xs)',
  },
};

/* ── Component ────────────────────────────────────────────── */

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  /* Memoize parsing so we only re-parse when content changes */
  const blocks = useMemo(() => parseBlocks(content), [content]);

  return (
    <div className={className} style={styles.wrapper}>
      {blocks.map(renderBlock)}
    </div>
  );
}
