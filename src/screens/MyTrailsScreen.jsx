import { useState } from 'react';
import AccessibilityBadges from '../components/AccessibilityBadges';
import './MyTrailsScreen.css';

// Demo data — in production this comes from Firebase, filtered by user
const MY_DEMO_TRAILS = [
  {
    id: '1',
    metadata: { name: 'Newlands Forest Loop', difficulty: 'easy', surfaceType: 'paved' },
    distance: 3.2,
    duration: 42 * 60_000,
    createdAt: Date.now() - 2 * 24 * 60 * 60_000,
    published: true,
    accessibility: {
      wheelchairPassable: true,
      strollerFriendly: true,
      restSeating: true,
    },
  },
  {
    id: '2',
    metadata: { name: 'Signal Hill Sunset', difficulty: 'moderate', surfaceType: 'gravel' },
    distance: 1.8,
    duration: 28 * 60_000,
    createdAt: Date.now() - 7 * 24 * 60 * 60_000,
    published: true,
    accessibility: {
      restSeating: true,
      guideDogSuitable: true,
    },
  },
  {
    id: '3',
    metadata: { name: 'Morning Walk (Draft)', difficulty: 'easy', surfaceType: 'paved' },
    distance: 0.8,
    duration: 12 * 60_000,
    createdAt: Date.now() - 1 * 24 * 60 * 60_000,
    published: false,
    accessibility: {},
  },
];

export default function MyTrailsScreen() {
  const [filter, setFilter] = useState('all'); // all | published | draft

  const filtered = MY_DEMO_TRAILS.filter((t) => {
    if (filter === 'published') return t.published;
    if (filter === 'draft') return !t.published;
    return true;
  });

  return (
    <div className="my-trails">
      <header className="my-trails__header">
        <h1 className="my-trails__title">My Trails</h1>
        <p className="my-trails__count">{MY_DEMO_TRAILS.length} trails recorded</p>
      </header>

      <div className="my-trails__filters">
        {['all', 'published', 'draft'].map((f) => (
          <button
            key={f}
            className={`my-trails__filter ${filter === f ? 'my-trails__filter--active' : ''}`}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
          >
            {f === 'all' ? 'All' : f === 'published' ? 'Published' : 'Drafts'}
          </button>
        ))}
      </div>

      <div className="my-trails__list">
        {filtered.length === 0 && (
          <div className="my-trails__empty">
            No trails here yet. Start recording to see your trails!
          </div>
        )}
        {filtered.map((trail) => (
          <article key={trail.id} className="my-trails__card" tabIndex={0}>
            <div className="my-trails__card-top">
              <div>
                <h3 className="my-trails__card-name">{trail.metadata.name}</h3>
                <p className="my-trails__card-meta">
                  {trail.distance} km &middot;{' '}
                  {Math.round(trail.duration / 60_000)} min &middot;{' '}
                  {new Date(trail.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`my-trails__status ${trail.published ? 'my-trails__status--pub' : 'my-trails__status--draft'}`}
              >
                {trail.published ? 'Published' : 'Draft'}
              </span>
            </div>
            <div className="my-trails__card-access">
              <AccessibilityBadges accessibility={trail.accessibility} maxShow={3} />
            </div>
          </article>
        ))}
      </div>

      <div style={{ height: 'var(--nav-height)' }} />
    </div>
  );
}
