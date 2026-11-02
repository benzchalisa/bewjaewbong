'use client';
import { useState } from 'react';
import { Review, deleteReview, updateReview } from '@/lib/api';
import { useToast } from './ToastProvider';

interface Props {
  bookId: number;
  review: Review;
  onChange: () => void;
}

export default function ReviewCard({ bookId, review, onChange }: Props) {
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(review.rating);
  const [content, setContent] = useState(review.content);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!content.trim()) {
      showToast('Review cannot be empty', 'error');
      return;
    }

    setSaving(true);
    try {
      await updateReview(bookId, review.id, { rating, content: content.trim() });
      showToast('Review updated');
      setEditing(false);
      onChange();
    } catch (error) {
      showToast((error as Error).message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm('Delete this review?')) return;

    setSaving(true);
    try {
      await deleteReview(bookId, review.id);
      showToast('Review deleted');
      onChange();
    } catch (error) {
      showToast((error as Error).message || 'Delete failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="review-card">
      {editing ? (
        <>
          <div className="field">
            <label className="field-label" htmlFor={`review-rating-${review.id}`}>Rating</label>
            <select
              id={`review-rating-${review.id}`}
              className="field-input"
              value={rating}
              onChange={event => setRating(Number(event.target.value))}
            >
              {[1, 2, 3, 4, 5].map(value => (
                <option key={value} value={value}>{value} / 5</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor={`review-content-${review.id}`}>Review</label>
            <textarea
              id={`review-content-${review.id}`}
              className="field-textarea"
              rows={3}
              value={content}
              onChange={event => setContent(event.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save review'}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="review-top">
            <div className="stars">
              {[1, 2, 3, 4, 5].map(value => (
                <span key={value} className={`star-icon ${value <= review.rating ? 'on' : 'off'}`}>★</span>
              ))}
            </div>
            <span className="review-id">#{review.id}</span>
          </div>
          <p className="review-text">{review.content}</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)} disabled={saving}>
              Edit
            </button>
            <button className="btn btn-danger-ghost btn-sm" onClick={remove} disabled={saving}>
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
