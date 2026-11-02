'use client';
import { useState } from 'react';
import { createReview } from '@/lib/api';
import { useToast } from './ToastProvider';

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div className="star-input">
        {[1, 2, 3, 4, 5].map(s => (
          <button
            key={s}
            type="button"
            className={`star-btn${(hovered || value) >= s ? ' on' : ''}`}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(s)}
          >★</button>
        ))}
      </div>
      {value > 0 && (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{value} / 5</span>
      )}
    </div>
  );
}

export default function ReviewForm({ bookId, onSuccess }: { bookId: number; onSuccess: () => void }) {
  const { showToast } = useToast();
  const [open, setOpen]       = useState(false);
  const [rating, setRating]   = useState(0);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating)         { showToast('Please select a rating', 'error'); return; }
    if (!content.trim()) { showToast('Review cannot be empty', 'error'); return; }
    setLoading(true);
    try {
      await createReview(bookId, { rating, content: content.trim() });
      showToast('Review added');
      setRating(0); setContent(''); setOpen(false);
      onSuccess();
    } catch (e) {
      showToast((e as Error).message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button id="write-review-btn" className="btn btn-ghost btn-sm"
        style={{ marginBottom: 12 }} onClick={() => setOpen(true)}>
        Write a review
      </button>
    );
  }

  return (
    <div style={{
      background: 'var(--bg-subtle)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px',
      marginBottom: '12px',
    }}>
      <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-1)' }}>
        Write a review
      </p>
      <form onSubmit={submit}>
        <div className="field">
          <label className="field-label">Rating</label>
          <StarInput value={rating} onChange={setRating} />
        </div>
        <div className="field">
          <label className="field-label">Review</label>
          <textarea
            id="review-content"
            className="field-textarea"
            placeholder="Share your thoughts about this book…"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost btn-sm"
            onClick={() => setOpen(false)}>Cancel</button>
          <button id="submit-review-btn" type="submit"
            className="btn btn-primary btn-sm" disabled={loading}>
            {loading ? 'Posting…' : 'Post review'}
          </button>
        </div>
      </form>
    </div>
  );
}
