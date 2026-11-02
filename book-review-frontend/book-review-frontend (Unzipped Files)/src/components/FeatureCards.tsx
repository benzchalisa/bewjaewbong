'use client';

const features = [
  { title: 'Add books',     desc: 'Add titles with author, cover image, and publish date.', icon: PlusIcon },
  { title: 'Upload covers', desc: 'Drag & drop or paste a URL — covers sync instantly.',   icon: ImageIcon },
  { title: 'Edit anytime',  desc: 'Update any field at any time without losing data.',      icon: PenIcon   },
  { title: 'Rate & review', desc: 'Give star ratings and write detailed reviews.',          icon: StarIcon  },
  { title: 'Search titles', desc: 'Filter your library instantly by title or author.',     icon: SearchIcon },
  { title: 'Remove books',  desc: 'Clean up your library with a confirmation delete.',     icon: TrashIcon },
];

function PlusIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function ImageIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>; }
function PenIcon()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function StarIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }
function SearchIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function TrashIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>; }

export default function FeatureCards() {
  return (
    <div className="feature-grid">
      {features.map(f => (
        <div key={f.title} className="feature-card">
          <div className="feature-icon"><f.icon /></div>
          <p className="feature-name">{f.title}</p>
          <p className="feature-desc">{f.desc}</p>
        </div>
      ))}
    </div>
  );
}
