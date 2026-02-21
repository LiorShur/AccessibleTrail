import { useNavigate } from 'react-router-dom';
import useTrailStore from '../store/useTrailStore';
import GpsIndicator from '../components/GpsIndicator';
import AccessibilityBadges from '../components/AccessibilityBadges';
import './HomeScreen.css';

// Demo data for nearby trails — in production this comes from Firebase
const DEMO_TRAILS = [
  {
    id: '1',
    metadata: { name: 'Newlands Forest Loop', difficulty: 'easy', surfaceType: 'paved' },
    distance: 3.2,
    duration: 45 * 60_000,
    accessibility: {
      wheelchairPassable: true,
      strollerFriendly: true,
      guideDogSuitable: true,
      restSeating: true,
    },
    updatedAgo: '2h ago',
    verified: false,
  },
  {
    id: '2',
    metadata: { name: 'Signal Hill Path', difficulty: 'moderate', surfaceType: 'gravel' },
    distance: 1.8,
    duration: 30 * 60_000,
    accessibility: {
      strollerFriendly: true,
      restSeating: true,
    },
    updatedAgo: '1d ago',
    verified: true,
    warning: 'Steep sections',
  },
  {
    id: '3',
    metadata: { name: 'Kirstenbosch Garden Trail', difficulty: 'easy', surfaceType: 'paved' },
    distance: 2.1,
    duration: 35 * 60_000,
    accessibility: {
      wheelchairPassable: true,
      strollerFriendly: true,
      restSeating: true,
      shadedSections: true,
      accessibleToilet: true,
    },
    updatedAgo: '5h ago',
    verified: true,
  },
];

export default function HomeScreen() {
  const navigate = useNavigate();
  const { gpsStatus } = useTrailStore();

  const canRecord = gpsStatus === 'locked' || gpsStatus === 'weak';

  return (
    <div className="home">
      {/* Top bar */}
      <header className="home__topbar">
        <h1 className="home__logo">AccessibleTrail</h1>
        <button className="home__profile" aria-label="Profile">
          <span aria-hidden="true">{'\uD83D\uDC64'}</span>
        </button>
      </header>

      {/* Weather / conditions strip */}
      <div className="home__conditions" aria-label="Current conditions">
        <span>{'\uD83D\uDCCD'} Cape Town &middot; 22&deg;C &middot; Clear</span>
        <span>Good conditions {'\u2713'}</span>
      </div>

      {/* Main CTA */}
      <section className="home__cta-section">
        <p className="home__cta-label" id="record-label">Ready to record?</p>
        <button
          className="home__cta"
          onClick={() => navigate('/record')}
          aria-describedby="record-label"
          disabled={!canRecord && gpsStatus !== 'searching'}
        >
          <div className="home__cta-text">
            <span className="home__cta-title">Start Recording</span>
            <span className="home__cta-sub">
              <GpsIndicator compact />
            </span>
          </div>
          <span className="home__cta-icon" aria-hidden="true">{'\u25B6'}</span>
        </button>
      </section>

      {/* Nearby trails */}
      <section className="home__trails">
        <div className="home__section-head">
          <h2 className="home__section-title">Nearby Trails</h2>
          <button
            className="home__see-all"
            onClick={() => navigate('/browse')}
            aria-label="See all nearby trails"
          >
            See all {'\u2192'}
          </button>
        </div>

        {DEMO_TRAILS.map((trail) => (
          <article
            key={trail.id}
            className="trail-card"
            onClick={() => navigate(`/browse`)}
            role="button"
            tabIndex={0}
            aria-label={`${trail.metadata.name}, ${trail.distance} kilometers, ${trail.metadata.difficulty}`}
          >
            <div className="trail-card__map">
              <div className="trail-card__path" />
            </div>
            <div className="trail-card__info">
              <div className="trail-card__details">
                <h3 className="trail-card__name">{trail.metadata.name}</h3>
                <p className="trail-card__meta">
                  {trail.distance} km &middot;{' '}
                  <span className="trail-card__difficulty" data-diff={trail.metadata.difficulty}>
                    {trail.metadata.difficulty}
                  </span>
                  {trail.verified && ' \u00B7 Verified'}
                  {trail.updatedAgo && ` \u00B7 ${trail.updatedAgo}`}
                </p>
              </div>
              <div className="trail-card__badges">
                <AccessibilityBadges accessibility={trail.accessibility} maxShow={3} />
                {trail.warning && (
                  <span className="trail-card__warning">{'\u26A0\uFE0F'} {trail.warning}</span>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Spacer for bottom nav */}
      <div style={{ height: 'var(--nav-height)' }} />
    </div>
  );
}
