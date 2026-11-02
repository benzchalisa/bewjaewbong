'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Book, getBook, deleteBook } from '@/lib/api';
import BookFormModal from '@/components/BookFormModal';
import ReviewCard from '@/components/ReviewCard';
import ReviewForm from '@/components/ReviewForm';
import { useToast } from '@/components/ToastProvider';

/* ── Icons ── */
const ArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

/* ── Star display ── */
function Stars({ rating }: { rating: number }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(s => (
        <span key={s} className={`star-icon ${s <= rating ? 'on' : 'off'}`}>★</span>
      ))}
    </div>
  );
}

/* ── Page ── */
export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const [book, setBook]               = useState<Book | null>(null);
  const [loading, setLoading]         = useState(true);
  const [showEdit, setShowEdit]       = useState(false);
  const [showDelete, setShowDelete]   = useState(false);

  async function load() {
    setLoading(true);
    try { setBook(await getBook(Number(id))); }
    catch { showToast('Book not found', 'error'); router.push('/books'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [id]);

  async function handleDelete() {
    if (!book) return;
    try {
      await deleteBook(book.id);
      showToast('Book deleted');
      router.push('/books');
    } catch (e) {
      showToast((e as Error).message || 'Delete failed', 'error');
    }
  }

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!book)   return null;

  const allRatings = book.reviews.map(r => r.rating);
  const avg = allRatings.length
    ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
    : null;

  return (
    <div className="page">
      <Link href="/books" className="back-link"><ArrowLeft /> Back to library</Link>

      <div className="detail-layout">
        {/* ── Cover column ── */}
        <div className="detail-cover-col">
          <div className="detail-cover" style={{ flex: 'none', width: '100%' }}>
            {book.coverUrl
              ? <img src={book.coverUrl} alt={book.title} />
              : <div className="detail-cover-placeholder"><BookIcon /></div>
            }
          </div>
        </div>

        {/* ── Info column ── */}
        <div>
          <h1 className="detail-title">{book.title}</h1>
          <p className="detail-author">{book.author}</p>

          {/* Meta */}
          <div className="detail-meta">
            <div className="meta-row">
              <span className="meta-key">Published</span>
              <span className="meta-val">
                {new Date(book.publishedAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="meta-row">
              <span className="meta-key">Reviews</span>
              <span className="meta-val">{book.reviews.length}</span>
            </div>
            {avg && (
              <div className="meta-row">
                <span className="meta-key">Rating</span>
                <span className="meta-val" style={{ color: 'var(--yellow)' }}>
                  ★ {avg.toFixed(1)} / 5
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="detail-actions">
            <button id="edit-book-btn" className="btn btn-ghost btn-sm"
              onClick={() => setShowEdit(true)}>Edit</button>
            <button id="delete-book-btn" className="btn btn-danger-ghost btn-sm"
              onClick={() => setShowDelete(true)}>Delete</button>
          </div>

          <div className="divider" />

          {/* Avg rating block */}
          {avg && (
            <div className="avg-block">
              <span className="avg-score">{avg.toFixed(1)}</span>
              <div className="avg-sub">
                <Stars rating={Math.round(avg)} />
                <span className="review-count">{book.reviews.length} reviews</span>
              </div>
            </div>
          )}

          {/* Reviews */}
          <p className="section-label">Reviews</p>
          <ReviewForm bookId={book.id} onSuccess={load} />

          {book.reviews.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-3)', paddingTop: 8 }}>
              No reviews yet. Be the first to write one.
            </p>
          ) : (
            book.reviews.map(r => (
              <ReviewCard key={r.id} bookId={book.id} review={r} onChange={load} />
            ))
          )}
        </div>
      </div>

      {/* Edit modal */}
      {showEdit && (
        <BookFormModal mode="edit" book={book} onClose={() => setShowEdit(false)}
          onSuccess={updated => { setBook(updated); setShowEdit(false); }} />
      )}

      {/* Delete confirm */}
      {showDelete && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setShowDelete(false); }}>
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-head">
              <h2 className="modal-title">Delete book</h2>
              <button className="modal-close" onClick={() => setShowDelete(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
                Are you sure you want to delete{' '}
                <strong style={{ color: 'var(--text-1)' }}>&ldquo;{book.title}&rdquo;</strong>?
                All reviews will be removed.
              </p>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setShowDelete(false)}>Cancel</button>
              <button id="confirm-delete-btn" className="btn btn-primary"
                style={{ background: 'var(--red)' }} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
