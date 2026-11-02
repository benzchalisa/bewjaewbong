'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Book, getBooks, deleteBook } from '@/lib/api';
import BookFormModal from '@/components/BookFormModal';
import { useToast } from '@/components/ToastProvider';

/* ── SVG icons ──────────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

/* ── Book Card ──────────────────────────────────────────────────── */
function BookCard({ book, onEdit, onDelete }: {
  book: Book; onEdit: () => void; onDelete: () => void;
}) {
  const router = useRouter();
  const avgRating = book.reviews.length
    ? (book.reviews.reduce((s, r) => s + r.rating, 0) / book.reviews.length).toFixed(1)
    : null;

  return (
    <div className="book-card" onClick={() => router.push(`/books/${book.id}`)}>
      {book.coverUrl
        ? <img src={book.coverUrl} alt={book.title} className="book-thumb" />
        : (
          <div className="book-thumb-placeholder">
            <BookIcon />
          </div>
        )
      }

      <div className="book-body">
        <p className="book-name">{book.title}</p>
        <p className="book-by">{book.author}</p>
        <div className="book-foot">
          {avgRating
            ? <span className="rating-pill">★ {avgRating}</span>
            : <span className="review-count">No reviews</span>
          }
          <span className="review-count">{book.reviews.length} reviews</span>
        </div>
      </div>

      <div className="card-actions" onClick={e => e.stopPropagation()}>
        <button id={`edit-${book.id}`} className="btn btn-ghost btn-sm" style={{ flex: 1 }}
          onClick={onEdit}>Edit</button>
        <button id={`delete-${book.id}`} className="btn btn-danger-ghost btn-sm" style={{ flex: 1 }}
          onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}

/* ── Delete confirm ─────────────────────────────────────────────── */
function DeleteModal({ book, onClose, onConfirm }: { book: Book; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 380 }}>
        <div className="modal-head">
          <h2 className="modal-title">Delete book</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
            Are you sure you want to delete{' '}
            <strong style={{ color: 'var(--text-1)' }}>&ldquo;{book.title}&rdquo;</strong>?
            This will also remove all its reviews and cannot be undone.
          </p>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button id="confirm-delete-btn" className="btn btn-primary"
            style={{ background: 'var(--red)' }} onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */
export default function BooksPage() {
  const { showToast } = useToast();
  const [books, setBooks]           = useState<Book[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editBook, setEditBook]     = useState<Book | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { setBooks(await getBooks()); }
    catch { showToast('Failed to load books', 'error'); }
    finally { setLoading(false); }
  }

  async function handleDelete(book: Book) {
    try {
      await deleteBook(book.id);
      setBooks(p => p.filter(b => b.id !== book.id));
      showToast('Book deleted');
    } catch (e) {
      showToast((e as Error).message || 'Delete failed', 'error');
    } finally {
      setDeleteTarget(null);
    }
  }

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  const totalReviews = books.reduce((s, b) => s + b.reviews.length, 0);
  const allRatings   = books.flatMap(b => b.reviews.map(r => r.rating));
  const avgRating    = allRatings.length
    ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1)
    : null;

  return (
    <div className="page">
      {/* Header */}
      <div className="page-head">
        <h1 className="page-title">Library</h1>
        <p className="page-desc">Manage your book collection</p>
      </div>

      {/* Stats */}
      <div className="chip-row">
        <span className="chip"><span className="chip-val">{books.length}</span> books</span>
        <span className="chip"><span className="chip-val">{totalReviews}</span> reviews</span>
        {avgRating && <span className="chip">★ <span className="chip-val">{avgRating}</span> avg</span>}
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-wrap">
          <SearchIcon />
          <input
            id="search-books"
            type="text"
            placeholder="Search by title or author…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button id="add-book-btn" className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <PlusIcon /> Add book
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <BookIcon />
          <p className="empty-title">{search ? 'No results found' : 'No books yet'}</p>
          <p className="empty-desc">
            {search ? `Nothing matched "${search}"` : 'Get started by adding your first book.'}
          </p>
          {!search && (
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              <PlusIcon /> Add book
            </button>
          )}
        </div>
      ) : (
        <div className="grid">
          {filtered.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onEdit={() => setEditBook(book)}
              onDelete={() => setDeleteTarget(book)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <BookFormModal mode="create" onClose={() => setShowCreate(false)}
          onSuccess={b => { setBooks(p => [...p, b]); setShowCreate(false); }} />
      )}
      {editBook && (
        <BookFormModal mode="edit" book={editBook} onClose={() => setEditBook(null)}
          onSuccess={updated => { setBooks(p => p.map(b => b.id === updated.id ? updated : b)); setEditBook(null); }} />
      )}
      {deleteTarget && (
        <DeleteModal book={deleteTarget} onClose={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget)} />
      )}
    </div>
  );
}
