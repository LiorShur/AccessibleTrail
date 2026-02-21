import { useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import useTrailStore from '../store/useTrailStore';
import AccessibilityBadges from '../components/AccessibilityBadges';
import WaypointDetail from '../components/WaypointDetail';
import './BrowseScreen.css';

const FILTER_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'wheelchair', label: '\u267F Wheelchair', field: 'wheelchairPassable' },
  { key: 'stroller', label: '\uD83D\uDEBC Stroller', field: 'strollerFriendly' },
  { key: 'guide-dog', label: '\uD83E\uDDAE Guide Dog', field: 'guideDogSuitable' },
  { key: 'easy', label: 'Easy' },
  { key: 'short', label: '\u22642km' },
  { key: 'paved', label: 'Paved' },
];

// Demo trails for browse view
const DEMO_BROWSE_TRAILS = [
  {
    id: '1',
    metadata: { name: 'Newlands Forest Loop', difficulty: 'easy', surfaceType: 'paved' },
    distance: 3.2,
    duration: 45 * 60_000,
    center: [-33.98, 18.44],
    path: [
      [-33.985, 18.435],
      [-33.982, 18.438],
      [-33.978, 18.44],
      [-33.975, 18.445],
      [-33.978, 18.448],
      [-33.982, 18.445],
      [-33.985, 18.435],
    ],
    accessibility: {
      wheelchairPassable: true,
      strollerFriendly: true,
      guideDogSuitable: true,
      restSeating: true,
      accessibleToilet: false,
      shadedSections: true,
    },
  },
  {
    id: '2',
    metadata: { name: 'Signal Hill Path', difficulty: 'moderate', surfaceType: 'gravel' },
    distance: 1.8,
    duration: 30 * 60_000,
    center: [-33.92, 18.4],
    path: [
      [-33.925, 18.395],
      [-33.922, 18.398],
      [-33.918, 18.402],
      [-33.915, 18.405],
    ],
    accessibility: {
      wheelchairPassable: false,
      strollerFriendly: false,
      guideDogSuitable: true,
      restSeating: true,
    },
    warning: 'Steep sections',
  },
  {
    id: '3',
    metadata: { name: 'Kirstenbosch Garden Trail', difficulty: 'easy', surfaceType: 'paved' },
    distance: 2.1,
    duration: 35 * 60_000,
    center: [-33.988, 18.432],
    path: [
      [-33.99, 18.428],
      [-33.988, 18.43],
      [-33.986, 18.433],
      [-33.988, 18.435],
    ],
    accessibility: {
      wheelchairPassable: true,
      strollerFriendly: true,
      restSeating: true,
      shadedSections: true,
      accessibleToilet: true,
    },
  },
];

export default function BrowseScreen() {
  const [activeFilters, setActiveFilters] = useState(['all']);
  const [selectedTrail, setSelectedTrail] = useState(null);
  const { selectedWaypoint, setSelectedWaypoint } = useTrailStore();

  const pinIcon = useMemo(
    () =>
      new L.DivIcon({
        className: 'browse-pin',
        html: '<span>\uD83D\uDCCD</span>',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      }),
    []
  );

  const toggleFilter = useCallback((key) => {
    setActiveFilters((prev) => {
      if (key === 'all') return ['all'];
      const without = prev.filter((f) => f !== 'all');
      const has = without.includes(key);
      const next = has ? without.filter((f) => f !== key) : [...without, key];
      return next.length === 0 ? ['all'] : next;
    });
  }, []);

  // Filter trails
  const filteredTrails = DEMO_BROWSE_TRAILS.filter((trail) => {
    if (activeFilters.includes('all')) return true;
    return activeFilters.every((f) => {
      const opt = FILTER_OPTIONS.find((o) => o.key === f);
      if (opt?.field) return trail.accessibility?.[opt.field];
      if (f === 'easy') return trail.metadata.difficulty === 'easy';
      if (f === 'short') return trail.distance <= 2;
      if (f === 'paved') return trail.metadata.surfaceType === 'paved';
      return true;
    });
  });

  const mapCenter = [-33.96, 18.43];

  return (
    <div className="browse">
      {/* Search */}
      <div className="browse__search-bar">
        <div className="browse__search" role="search">
          <span aria-hidden="true">{'\uD83D\uDD0D'}</span>
          <input
            className="browse__search-input"
            type="search"
            placeholder="Search trails..."
            aria-label="Search trails"
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="browse__filters" role="toolbar" aria-label="Trail filters">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            className={`browse__chip ${activeFilters.includes(opt.key) ? 'browse__chip--active' : ''}`}
            onClick={() => toggleFilter(opt.key)}
            aria-pressed={activeFilters.includes(opt.key)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="browse__map">
        <MapContainer
          center={mapCenter}
          zoom={13}
          zoomControl={false}
          attributionControl={false}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filteredTrails.map((trail) => (
            <Marker
              key={trail.id}
              position={trail.center}
              icon={pinIcon}
              eventHandlers={{
                click: () => setSelectedTrail(trail),
              }}
            />
          ))}
          {filteredTrails.map((trail) => (
            <Polyline
              key={`line-${trail.id}`}
              positions={trail.path}
              color={trail.metadata.difficulty === 'easy' ? '#2d6a4f' : '#e76f51'}
              weight={2.5}
              opacity={0.7}
            />
          ))}
        </MapContainer>
      </div>

      {/* Trail list */}
      <div className="browse__list" aria-label="Trail results">
        {filteredTrails.length === 0 && (
          <div className="browse__empty">
            No trails match your filters. Try broadening your search.
          </div>
        )}
        {filteredTrails.map((trail) => (
          <article
            key={trail.id}
            className="browse__card"
            onClick={() => setSelectedTrail(trail)}
            role="button"
            tabIndex={0}
            aria-label={`${trail.metadata.name}, ${trail.distance} kilometers`}
          >
            <div className="browse__card-top">
              <div>
                <h3 className="browse__card-name">{trail.metadata.name}</h3>
                <p className="browse__card-meta">
                  {trail.distance} km &middot;{' '}
                  {Math.round(trail.duration / 60_000)} min &middot;{' '}
                  {trail.metadata.surfaceType}
                </p>
              </div>
              <span
                className={`browse__diff-badge browse__diff-badge--${trail.metadata.difficulty}`}
              >
                {trail.metadata.difficulty === 'moderate' ? 'Mod' : trail.metadata.difficulty}
              </span>
            </div>
            <div className="browse__card-access">
              <AccessibilityBadges accessibility={trail.accessibility} maxShow={4} />
              {trail.warning && (
                <span className="browse__card-warning">{'\u26A0\uFE0F'} {trail.warning}</span>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Waypoint detail modal */}
      {selectedWaypoint && (
        <WaypointDetail
          waypoint={selectedWaypoint}
          onClose={() => setSelectedWaypoint(null)}
        />
      )}

      <div style={{ height: 'var(--nav-height)' }} />
    </div>
  );
}
