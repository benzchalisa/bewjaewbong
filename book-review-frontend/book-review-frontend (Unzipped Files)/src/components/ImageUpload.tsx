'use client';
import { useState, useRef } from 'react';
import { uploadCover } from '@/lib/api';
import { useToast } from './ToastProvider';

interface Props { value: string; onChange: (url: string) => void; }

export default function ImageUpload({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const { showToast } = useToast();
  const ref = useRef<HTMLInputElement>(null);

  async function handle(file: File) {
    if (!file.type.startsWith('image/')) {
      showToast('Only image files are allowed', 'error');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadCover(file);
      onChange(url);
      showToast('Cover uploaded');
    } catch (e) {
      showToast((e as Error).message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label
        className={`upload-zone${drag ? ' drag-over' : ''}`}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handle(f); }}
      >
        <input
          ref={ref}
          type="file"
          accept="image/*"
          onChange={e => { const f = e.target.files?.[0]; if (f) handle(f); }}
        />
        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '8px 0' }}>
            <div className="spinner" style={{ width: 20, height: 20 }} />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Uploading…</p>
          </div>
        ) : (
          <>
            <p>
              Drop image here or <span>browse</span>
            </p>
            <p style={{ marginTop: 4, color: 'var(--text-3)', fontSize: '0.75rem' }}>
              JPG, PNG, WebP · max 5 MB
            </p>
          </>
        )}
      </label>

      {value && !uploading && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="upload-preview" />
          <button
            type="button"
            onClick={() => onChange('')}
            style={{
              position: 'absolute', top: 6, right: 6,
              background: 'rgba(0,0,0,0.65)', border: 'none',
              borderRadius: '50%', width: 24, height: 24,
              color: '#fff', cursor: 'pointer', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>
        </div>
      )}

      <input
        type="url"
        className="field-input"
        placeholder="Or paste image URL…"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}
