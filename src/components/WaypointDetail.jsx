import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import { WAYPOINT_TAGS } from '../types/trail';
import './WaypointDetail.css';

export default function WaypointDetail({ waypoint, onClose }) {
  if (!waypoint) return null;

  const pos = waypoint.position;
  const tagLabels = (waypoint.tags || [])
    .map((t) => WAYPOINT_TAGS[t])
    .filter(Boolean);

  return (
    <div className="wp-overlay" role="dialog" aria-label="Waypoint detail" aria-modal="true">
      <div className="wp-modal">
        {/* Header */}
        <header className="wp-modal__header">
          <h2 className="wp-modal__title">
            {tagLabels.length > 0
              ? tagLabels.map((t) => `${t.icon} ${t.label}`).join(' \u00B7 ')
              : 'Waypoint'}
          </h2>
          <button
            className="wp-modal__close"
            onClick={onClose}
            aria-label="Close waypoint detail"
          >
            {'\u2715'}
          </button>
        </header>

        {/* Map snapshot */}
        <div className="wp-modal__map">
          <MapContainer
            center={[pos.lat, pos.lng]}
            zoom={17}
            zoomControl={false}
            attributionControl={false}
            dragging={false}
            scrollWheelZoom={false}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <CircleMarker
              center={[pos.lat, pos.lng]}
              radius={10}
              fillColor="#e76f51"
              color="#fff"
              weight={3}
              fillOpacity={1}
            />
          </MapContainer>
          <span className="wp-modal__coords">
            {pos.lat.toFixed(4)}, {pos.lng.toFixed(4)}
            {waypoint.createdAt &&
              ` \u00B7 Added ${new Date(waypoint.createdAt).toLocaleDateString()}`}
          </span>
        </div>

        {/* Detail rows */}
        <div className="wp-modal__details">
          {tagLabels.length > 0 && (
            <div className="wp-modal__row">
              <span className="wp-modal__row-icon" aria-hidden="true">{'\u267F'}</span>
              <div>
                <span className="wp-modal__row-label">Tags</span>
                <p className="wp-modal__row-value">
                  {tagLabels.map((t) => `${t.icon} ${t.label}`).join(', ')}
                </p>
              </div>
            </div>
          )}

          {waypoint.note && (
            <div className="wp-modal__row">
              <span className="wp-modal__row-icon" aria-hidden="true">{'\uD83D\uDCDD'}</span>
              <div>
                <span className="wp-modal__row-label">Note</span>
                <p className="wp-modal__row-value">{waypoint.note}</p>
              </div>
            </div>
          )}

          <div className="wp-modal__row">
            <span className="wp-modal__row-icon" aria-hidden="true">{'\uD83D\uDCCF'}</span>
            <div>
              <span className="wp-modal__row-label">Position</span>
              <p className="wp-modal__row-value">
                {pos.lat.toFixed(6)}, {pos.lng.toFixed(6)}
                {pos.altitude ? ` \u00B7 ${Math.round(pos.altitude)}m altitude` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Photo thumbnails */}
        {waypoint.photos && waypoint.photos.length > 0 && (
          <div className="wp-modal__photos">
            {waypoint.photos.map((photo, i) => (
              <div key={i} className="wp-modal__photo-thumb">
                <img src={photo} alt={`Waypoint photo ${i + 1}`} />
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="wp-modal__actions">
          <button className="wp-modal__edit-btn">
            {'\u270F\uFE0F'} Suggest an Edit
          </button>
        </div>
      </div>
    </div>
  );
}
