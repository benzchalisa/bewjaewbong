const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Review {
  id: number;
  rating: number;
  content: string;
  bookId: number;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  publishedAt: string;
  coverUrl: string | null;
  reviews: Review[];
}

export interface CreateBookDto {
  title: string;
  author: string;
  publishedAt?: string;
  coverUrl?: string;
}

export interface UpdateBookDto {
  title?: string;
  author?: string;
  publishedAt?: string;
  coverUrl?: string;
}

export interface CreateReviewDto {
  rating: number;
  content: string;
}

export interface UpdateReviewDto {
  rating?: number;
  content?: string;
}

// ─── Books ────────────────────────────────────────────────────────────────────

export async function getBooks(): Promise<Book[]> {
  const res = await fetch(`${API_BASE}/books`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch books');
  return res.json();
}

export async function getBook(id: number): Promise<Book> {
  const res = await fetch(`${API_BASE}/books/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Book not found');
  return res.json();
}

export async function createBook(dto: CreateBookDto): Promise<Book> {
  const res = await fetch(`${API_BASE}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create book');
  }
  return res.json();
}

export async function updateBook(id: number, dto: UpdateBookDto): Promise<Book> {
  const res = await fetch(`${API_BASE}/books/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update book');
  }
  return res.json();
}

export async function deleteBook(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/books/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete book');
}

// ─── File Upload ──────────────────────────────────────────────────────────────

export async function uploadCover(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/books/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to upload image');
  }
  const data = await res.json();
  if (typeof data.url !== 'string') {
    throw new Error('Upload response did not include an image URL');
  }
  return new URL(data.url, API_BASE).toString();
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function getReviews(bookId: number): Promise<Review[]> {
  const res = await fetch(`${API_BASE}/books/${bookId}/reviews`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
}

export async function createReview(bookId: number, dto: CreateReviewDto): Promise<Review> {
  const res = await fetch(`${API_BASE}/books/${bookId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create review');
  }
  return res.json();
}

export async function updateReview(
  bookId: number,
  reviewId: number,
  dto: UpdateReviewDto,
): Promise<Review> {
  const res = await fetch(`${API_BASE}/books/${bookId}/reviews/${reviewId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update review');
  }
  return res.json();
}

export async function deleteReview(bookId: number, reviewId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/books/${bookId}/reviews/${reviewId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete review');
}
