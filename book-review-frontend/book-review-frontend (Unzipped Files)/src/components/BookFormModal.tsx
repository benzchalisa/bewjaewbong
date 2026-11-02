'use client';
import { useState } from 'react';
import { Book, CreateBookDto, UpdateBookDto, createBook, updateBook } from '@/lib/api';
import ImageUpload from './ImageUpload';
import { useToast } from './ToastProvider';

interface Props {
  mode: 'create' | 'edit';
  book?: Book;
  onClose: () => void;
  onSuccess: (b: Book) => void;
}

export default function BookFormModal({ mode, book, onClose, onSuccess }: Props) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title:       book?.title       ?? '',
    author:      book?.author      ?? '',
    publishedAt: book?.publishedAt ? book.publishedAt.substring(0, 10) : '',
    coverUrl:    book?.coverUrl    ?? '',
  });

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim()) {
      showToast('Title and author are required', 'error');
      return;
    }
    setLoading(true);
    try {
      const dto: CreateBookDto | UpdateBookDto = {
        title:  form.title.trim(),
        author: form.author.trim(),
        ...(form.publishedAt && { publishedAt: new Date(form.publishedAt).toISOString() }),
        ...(form.coverUrl    && { coverUrl: form.coverUrl }),
      };
      const result = mode === 'create'
        ? await createBook(dto as CreateBookDto)
        : await updateBook(book!.id, dto);
      showToast(mode === 'create' ? 'Book added' : 'Changes saved');
      onSuccess(result);
    } catch (e) {
      showToast((e as Error).message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-head">
          <h2 className="modal-title">{mode === 'create' ? 'Add book' : 'Edit book'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="field">
              <label className="field-label">Title *</label>
              <input id="book-title" className="field-input" placeholder="Book title"
                value={form.title} onChange={e => set('title', e.target.value)} required />
            </div>
            <div className="field">
              <label className="field-label">Author *</label>
              <input id="book-author" className="field-input" placeholder="Author name"
                value={form.author} onChange={e => set('author', e.target.value)} required />
            </div>
            <div className="field">
              <label className="field-label">Published date</label>
              <input id="book-date" type="date" className="field-input"
                value={form.publishedAt} onChange={e => set('publishedAt', e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label">Cover image</label>
              <ImageUpload value={form.coverUrl} onChange={v => set('coverUrl', v)} />
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button id="book-submit-btn" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : mode === 'create' ? 'Add book' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
