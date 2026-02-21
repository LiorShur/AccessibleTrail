import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, CircleMarker } from 'react-leaflet';
import useTrailStore from '../store/useTrailStore';
import SegmentedControl from '../components/SegmentedControl';
import {
  DIFFICULTY_OPTIONS,
  SURFACE_OPTIONS,
  WIDTH_OPTIONS,
  MOBILITY_OPTIONS,
  ACCESSIBILITY_FIELDS,
} from '../types/trail';
import { saveTrail } from '../firebase';
import { clearAutoSave } from '../hooks/useAutoSave';
import './ReviewScreen.css';

export default function ReviewScreen() {
  const navigate = useNavigate();
  const {
    reviewStep,
    setReviewStep,
    recordedData,
    trailMetadata,
    setTrailMetadata,
    trailAccessibility,
    setTrailAccessibility,
  } = useTrailStore();

  const updateMeta = useCallback(
    (field, value) => {
      setTrailMetadata({ ...trailMetadata, [field]: value });
    },
    [trailMetadata, setTrailMetadata]
  );

  const toggleAccess = useCallback(
    (key) => {
      setTrailAccessibility({ ...trailAccessibility, [key]: !trailAccessibility[key] });
    },
    [trailAccessibility, setTrailAccessibility]
  );

  const handlePublish = useCallback(async () => {
    if (!recordedData) return;
    try {
      const trail = {
        metadata: trailMetadata,
        accessibility: trailAccessibility,
        path: recordedData.path,
        waypoints: recordedData.waypoints,
        distance: recordedData.distance,
        elevationGain: recordedData.elevation,
        duration: recordedData.duration,
        published: true,
      };
      await saveTrail(trail);
      clearAutoSave();
      navigate('/');
    } catch (err) {
      console.error('Failed to publish trail:', err);
      // In production: show user-facing error toast
      alert('Failed to save trail. Please try again.');
    }
  }, [recordedData, trailMetadata, trailAccessibility, navigate]);

  // Fallback data for display
  const distance = recordedData?.distance?.toFixed(1) || '0.0';
  const elevation = Math.round(recordedData?.elevation || 0);
  const durationMin = Math.round((recordedData?.duration || 0) / 60_000);
  const waypointCount = recordedData?.waypoints?.length || 0;
  const path = recordedData?.path || [];
  const pathPositions = path.map((p) => [p.lat, p.lng]);
  const center =
    path.length > 0
      ? [path[Math.floor(path.length / 2)].lat, path[Math.floor(path.length / 2)].lng]
      : [-33.96, 18.47];

  return (
    <div className="review">
      {/* Header */}
      <header className="review__header">
        <div>
          <h1 className="review__title">
            {reviewStep === 1 && 'Review Trail'}
            {reviewStep === 2 && 'Trail Details'}
            {reviewStep === 3 && 'Accessibility'}
          </h1>
          <p className="review__step">Step {reviewStep} of 3</p>
        </div>
        {reviewStep < 3 && (
          <button
            className="review__skip"
            onClick={() => setReviewStep(reviewStep + 1)}
            aria-label="Skip to next step"
          >
            Skip {'\u2192'}
          </button>
        )}
      </header>

      <div className="review__content">
        {/* ── Step 1: Route Summary ── */}
        {reviewStep === 1 && (
          <>
            <div className="review__map">
              <MapContainer
                center={center}
                zoom={14}
                zoomControl={false}
                attributionControl={false}
                style={{ width: '100%', height: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {pathPositions.length > 1 && (
                  <Polyline positions={pathPositions} color="#e76f51" weight={3} />
                )}
                {(recordedData?.waypoints || []).map((wp) => (
                  <CircleMarker
                    key={wp.id}
                    center={[wp.position.lat, wp.position.lng]}
                    radius={5}
                    fillColor="#2d6a4f"
                    color="#fff"
                    weight={2}
                    fillOpacity={1}
                  />
                ))}
              </MapContainer>
            </div>

            {/* Elevation chart placeholder */}
            <div className="review__elev" aria-label="Elevation profile">
              <span className="review__elev-label">Elevation Profile</span>
              <svg viewBox="0 0 220 28" className="review__elev-svg" aria-hidden="true">
                <polyline
                  points="0,24 30,18 60,12 90,16 120,6 150,10 180,16 220,12"
                  stroke="var(--color-accent)"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
                <polyline
                  points="0,24 30,18 60,12 90,16 120,6 150,10 180,16 220,12 220,28 0,28"
                  fill="rgba(45,106,79,0.1)"
                  stroke="none"
                />
              </svg>
            </div>

            {/* Stats summary */}
            <div className="review__stats">
              <div className="review__stat-item">
                <span className="review__stat-val">{distance}<small>km</small></span>
                <span className="review__stat-lbl">Distance</span>
              </div>
              <div className="review__stat-item">
                <span className="review__stat-val">+{elevation}<small>m</small></span>
                <span className="review__stat-lbl">Elevation</span>
              </div>
              <div className="review__stat-item">
                <span className="review__stat-val">{durationMin}<small>min</small></span>
                <span className="review__stat-lbl">Duration</span>
              </div>
            </div>

            <div className="review__waypoint-summary">
              <strong>Waypoints recorded:</strong> {waypointCount}
            </div>

            <button className="review__next-btn" onClick={() => setReviewStep(2)}>
              Continue {'\u2192'} Add Details
            </button>
          </>
        )}

        {/* ── Step 2: Metadata ── */}
        {reviewStep === 2 && (
          <>
            <div className="review__field">
              <label className="review__field-label" htmlFor="trail-name">Trail Name</label>
              <input
                id="trail-name"
                className="review__input"
                type="text"
                value={trailMetadata.name}
                onChange={(e) => updateMeta('name', e.target.value)}
                placeholder="Enter trail name..."
              />
            </div>

            <div className="review__field">
              <span className="review__field-label">Difficulty</span>
              <SegmentedControl
                options={DIFFICULTY_OPTIONS}
                value={trailMetadata.difficulty}
                onChange={(v) => updateMeta('difficulty', v)}
                ariaLabel="Trail difficulty"
              />
            </div>

            <div className="review__field">
              <span className="review__field-label">Surface Type</span>
              <SegmentedControl
                options={SURFACE_OPTIONS}
                value={trailMetadata.surfaceType}
                onChange={(v) => updateMeta('surfaceType', v)}
                ariaLabel="Surface type"
              />
            </div>

            <div className="review__field">
              <span className="review__field-label">Typical Path Width</span>
              <SegmentedControl
                options={WIDTH_OPTIONS}
                value={trailMetadata.pathWidth}
                onChange={(v) => updateMeta('pathWidth', v)}
                ariaLabel="Path width"
              />
            </div>

            <div className="review__field">
              <label className="review__field-label" htmlFor="trail-notes">Notes (optional)</label>
              <textarea
                id="trail-notes"
                className="review__textarea"
                value={trailMetadata.notes}
                onChange={(e) => updateMeta('notes', e.target.value)}
                placeholder="Describe this trail..."
                rows={3}
              />
            </div>

            <div className="review__nav-row">
              <button className="review__back-btn" onClick={() => setReviewStep(1)}>
                {'\u2190'} Back
              </button>
              <button className="review__next-btn" onClick={() => setReviewStep(3)}>
                Continue {'\u2192'} Accessibility
              </button>
            </div>
          </>
        )}

        {/* ── Step 3: Accessibility ── */}
        {reviewStep === 3 && (
          <>
            <p className="review__access-intro">
              These details help users with specific needs decide if this trail is right for them.
            </p>

            <div className="review__checklist" role="group" aria-label="Accessibility checklist">
              {ACCESSIBILITY_FIELDS.map(({ key, label }) => (
                <button
                  key={key}
                  className="review__check-item"
                  onClick={() => toggleAccess(key)}
                  role="checkbox"
                  aria-checked={trailAccessibility[key]}
                >
                  <span
                    className={`review__checkbox ${trailAccessibility[key] ? 'review__checkbox--checked' : ''}`}
                    aria-hidden="true"
                  >
                    {trailAccessibility[key] ? '\u2713' : ''}
                  </span>
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <div className="review__field">
              <span className="review__field-label">Mobility Rating</span>
              <SegmentedControl
                options={MOBILITY_OPTIONS.map((m) => ({
                  value: m,
                  label: m === 'full' ? 'Full Access' : m === 'partial' ? 'Partial' : 'Limited',
                }))}
                value={trailAccessibility.mobilityRating}
                onChange={(v) =>
                  setTrailAccessibility({ ...trailAccessibility, mobilityRating: v })
                }
                ariaLabel="Mobility rating"
              />
            </div>

            <div className="review__nav-row">
              <button className="review__back-btn" onClick={() => setReviewStep(2)}>
                {'\u2190'} Back
              </button>
              <button className="review__publish-btn" onClick={handlePublish}>
                {'\u2713'} Publish Trail
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
