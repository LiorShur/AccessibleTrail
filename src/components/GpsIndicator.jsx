import useTrailStore from '../store/useTrailStore';
import './GpsIndicator.css';

export default function GpsIndicator({ compact = false }) {
  const { gpsStatus, satelliteCount } = useTrailStore();

  const statusConfig = {
    searching: { color: '#fbbf24', label: 'Searching...', dot: 'gps-dot--searching' },
    locked: { color: '#4ade80', label: 'GPS Ready', dot: 'gps-dot--locked' },
    weak: { color: '#fb923c', label: 'Weak Signal', dot: 'gps-dot--weak' },
    lost: { color: '#ef4444', label: 'No GPS', dot: 'gps-dot--lost' },
  };

  const config = statusConfig[gpsStatus] || statusConfig.searching;

  return (
    <div
      className={`gps-indicator ${compact ? 'gps-indicator--compact' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={`GPS status: ${config.label}`}
    >
      <span className={`gps-dot ${config.dot}`} aria-hidden="true" />
      {!compact && <span className="gps-label">{config.label}</span>}
      {!compact && satelliteCount > 0 && (
        <span className="gps-sats">{satelliteCount} sats</span>
      )}
    </div>
  );
}
