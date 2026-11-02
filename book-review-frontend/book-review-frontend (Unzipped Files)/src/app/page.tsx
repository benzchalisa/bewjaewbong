import Link from 'next/link';
import FeatureCards from '@/components/FeatureCards';

export const metadata = {
  title: 'BookShelf — Book Review Platform',
  description: 'Manage your book collection, write reviews, and track ratings.',
};

export default function Home() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <span className="hero-eyebrow">Book review platform</span>
        <h1 className="hero-title">
          Your personal<br /><span>reading library</span>
        </h1>
        <p className="hero-sub">
          Add books, upload covers, write reviews, and keep track
          of everything you've read — all in one place.
        </p>
        <Link href="/books" id="hero-cta" className="btn btn-primary" style={{ height: 42, padding: '0 24px', fontSize: '0.9rem' }}>
          Open library
        </Link>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '0 24px 80px', maxWidth: 960, margin: '0 auto' }}>
        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: 20, fontWeight: 600 }}>
          What you can do
        </p>
        <FeatureCards />
      </section>
    </>
  );
}
