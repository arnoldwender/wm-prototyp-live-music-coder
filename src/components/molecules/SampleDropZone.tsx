/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   SampleDropZone — drag-and-drop area for importing local
   audio files into the Strudel sample registry.
   ────────────────────────────────────────────────────────── */

import { useState, useCallback, useRef } from 'react';
import { Upload } from 'lucide-react';
import { importSampleFiles } from '../../lib/audio/sample-import';

interface SampleDropZoneProps {
  /** Called with imported sample names after successful import */
  onImport?: (names: string[]) => void;
}

export function SampleDropZone({ onImport }: SampleDropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [lastImported, setLastImported] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (!e.dataTransfer.files.length) return;
    setImporting(true);
    try {
      const names = await importSampleFiles(e.dataTransfer.files);
      setLastImported(names);
      onImport?.(names);
    } finally {
      setImporting(false);
    }
  }, [onImport]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setImporting(true);
    try {
      const names = await importSampleFiles(e.target.files);
      setLastImported(names);
      onImport?.(names);
    } finally {
      setImporting(false);
      /* Reset input so same file can be re-selected */
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [onImport]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    /* Check if any file is audio */
    if (e.dataTransfer.items) {
      for (const item of Array.from(e.dataTransfer.items)) {
        if (item.kind === 'file') {
          setDragging(true);
          return;
        }
      }
    }
  }, []);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={() => setDragging(true)}
      onDragLeave={() => setDragging(false)}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Drop audio files here or click to import"
      style={{
        padding: 'var(--space-4)',
        border: `2px dashed ${dragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-md)',
        backgroundColor: dragging ? 'rgba(168, 85, 247, 0.08)' : 'var(--color-bg-alt)',
        cursor: 'pointer',
        transition: 'var(--transition-fast)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-2)',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".wav,.mp3,.ogg,.flac,.aac,.m4a,.webm"
        multiple
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />

      <Upload
        size={20}
        style={{ color: dragging ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
      />

      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
        {importing
          ? 'Importing...'
          : dragging
            ? 'Drop to import'
            : 'Drop audio files or click to browse'}
      </span>

      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', opacity: 0.6 }}>
        WAV, MP3, OGG, FLAC, AAC, M4A
      </span>

      {/* Show last imported samples */}
      {lastImported.length > 0 && (
        <div style={{ fontSize: '10px', color: 'var(--color-success)', marginTop: 'var(--space-1)' }}>
          Imported: {lastImported.map((n) => `s("${n}")`).join(', ')}
        </div>
      )}
    </div>
  );
}
