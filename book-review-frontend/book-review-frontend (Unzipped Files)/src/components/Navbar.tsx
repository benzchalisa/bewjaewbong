'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const p = usePathname();
  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        <span className="brand-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </span>
        BookShelf
      </Link>
      <div className="nav-links">
        <Link href="/" className={`nav-link${p === '/' ? ' active' : ''}`}>Home</Link>
        <Link href="/books" className={`nav-link${p.startsWith('/books') ? ' active' : ''}`}>Library</Link>
      </div>
    </nav>
  );
}
