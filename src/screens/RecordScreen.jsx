import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap } from 'react-leaflet';
import useTrailStore from '../store/useTrailStore';
import useGps from '../hooks/useGps';
import useAutoSave from '../hooks/useAutoSave';
import { WAYPOINT_TAGS } from '../types/trail';
import GpsIndicator from '../components/GpsIndicator';
import './RecordScreen.css';

function MapFollower({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], map.getZoom(), { animate: true });
    }
  }, [position, map]);
  return null;
}

export default function RecordScreen() {
  const navigate = useNavigate();
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [waypointNote, setWaypointNote] = useState('');
  const [showWaypointPanel, setShowWaypointPanel] = useState(false);
  const stopHoldTimer = useRef(null);

  useGps();
  useAutoSave();

  const {
    recordingState,
    recordingPath,
    waypoints,
    recordingStartTime,
    recordingDistance,
    recordingElevation,
    currentPosition,
    gpsStatus,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
    addWaypoint,
    setRecordedData,
  } = useTrailStore();

  // Start recording on mount if idle
  useEffect(() => {
    if (recordingState === 'idle') {
      startRecording();
    }
  }, []);

  const elapsed = recordingStartTime ? Date.now() - recordingStartTime : 0;
  const minutes = Math.floor(elapsed / 60_000);
  const distanceKm = recordingDistance.toFixed(1);
  const elevationM = Math.round(recordingElevation);

  const handlePauseResume = useCallback(() => {
    if (recordingState === 'recording') {
      pauseRecording();
    } else {
      resumeRecording();
    }
  }, [recordingState, pauseRecording, resumeRecording]);

  const handleAddWaypoint = useCallback(() => {
    setShowWaypointPanel(true);
    setSelectedTags([]);
    setWaypointNote('');
  }, []);

  const handleConfirmWaypoint = useCallback(() => {
    if (!currentPosition) return;
    const wp = {
      id: `wp_${Date.now()}`,
      position: { ...currentPosition },
      tags: selectedTags,
      note: waypointNote,
      photos: [],
      createdAt: Date.now(),
    };
    addWaypoint(wp);
    setShowWaypointPanel(false);
    setSelectedTags([]);
    setWaypointNote('');
  }, [currentPosition, selectedTags, waypointNote, addWaypoint]);

  const toggleTag = useCallback((tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleStop = useCallback(() => {
    setShowStopConfirm(true);
  }, []);

  const confirmStop = useCallback(() => {
    const data = stopRecording();
    setRecordedData(data);
    resetRecording();
    navigate('/review');
  }, [stopRecording, setRecordedData, resetRecording, navigate]);

  // Default map center
  const center = currentPosition
    ? [currentPosition.lat, currentPosition.lng]
    : [-33.96, 18.47]; // Cape Town default

  const pathPositions = recordingPath.map((p) => [p.lat, p.lng]);

  return (
    <div className="record">
      {/* Map */}
      <div className="record__map">
        <MapContainer
          center={center}
          zoom={16}
          zoomControl={false}
          attributionControl={false}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          <MapFollower position={currentPosition} />

          {/* Trail line */}
          {pathPositions.length > 1 && (
            <Polyline
              positions={pathPositions}
              color="#e76f51"
              weight={4}
              opacity={recordingState === 'paused' ? 0.5 : 1}
            />
          )}

          {/* Waypoints */}
          {waypoints.map((wp) => (
            <CircleMarker
              key={wp.id}
              center={[wp.position.lat, wp.position.lng]}
              radius={6}
              fillColor="#2d6a4f"
              color="#fff"
              weight={2}
              fillOpacity={1}
            />
          ))}

          {/* Current position */}
          {currentPosition && (
            <CircleMarker
              center={[currentPosition.lat, currentPosition.lng]}
              radius={8}
              fillColor="#e76f51"
              color="#fff"
              weight={3}
              fillOpacity={1}
            />
          )}
        </MapContainer>
      </div>

      {/* Status bar */}
      <div
        className={`record__status ${recordingState === 'paused' ? 'record__status--paused' : ''}`}
        role="status"
        aria-live="polite"
      >
        <div className="record__stat">
          <span className="record__stat-val">{distanceKm}<small>km</small></span>
          <span className="record__stat-lbl">Distance</span>
        </div>
        <div className="record__stat">
          {recordingState === 'paused' ? (
            <span className="record__stat-val record__stat-val--warn">PAUSED</span>
          ) : (
            <span className="record__stat-val">{minutes}<small>min</small></span>
          )}
          <span className="record__stat-lbl">
            {recordingState === 'paused' ? 'Status' : 'Duration'}
          </span>
        </div>
        <div className="record__stat">
          <span className="record__stat-val">+{elevationM}<small>m</small></span>
          <span className="record__stat-lbl">Elevation</span>
        </div>
        <GpsIndicator compact />
      </div>

      {/* Controls */}
      <div className="record__controls">
        {recordingState === 'paused' ? (
          /* Paused controls */
          <>
            <div className="record__btn-row">
              <button
                className="record__btn record__btn--primary"
                onClick={handlePauseResume}
                aria-label="Resume recording"
              >
                <span className="record__btn-icon" aria-hidden="true">{'\u25B6'}</span>
                <span>RESUME</span>
              </button>
              <button
                className="record__btn record__btn--danger"
                onClick={handleStop}
                aria-label="Stop and save recording"
              >
                <span className="record__btn-icon" aria-hidden="true">{'\u23F9'}</span>
                <span>STOP & SAVE</span>
              </button>
            </div>
            <div className="record__autosave" aria-live="polite">
              {'\u2713'} Auto-saving every 30s — no data loss
            </div>
          </>
        ) : (
          /* Active recording controls */
          <>
            <div className="record__btn-row">
              <button
                className="record__btn record__btn--pause"
                onClick={handlePauseResume}
                aria-label="Pause recording"
              >
                <span className="record__btn-icon" aria-hidden="true">{'\u23F8'}</span>
                <span>PAUSE</span>
              </button>
              <button
                className="record__btn record__btn--primary"
                onClick={handleAddWaypoint}
                aria-label="Add waypoint"
              >
                <span className="record__btn-icon" aria-hidden="true">{'\uD83D\uDCCD'}</span>
                <span>ADD POINT</span>
              </button>
              <button
                className="record__btn record__btn--danger"
                onClick={handleStop}
                aria-label="Stop recording"
              >
                <span className="record__btn-icon" aria-hidden="true">{'\u23F9'}</span>
                <span>STOP</span>
              </button>
            </div>

            {/* Waypoint tag panel */}
            {showWaypointPanel && (
              <div className="record__wp-panel" role="dialog" aria-label="Tag waypoint">
                <div className="record__wp-head">Quick Tag Waypoint</div>
                <div className="record__wp-tags">
                  {Object.entries(WAYPOINT_TAGS).map(([key, { label, icon }]) => (
                    <button
                      key={key}
                      className={`record__wp-tag ${selectedTags.includes(key) ? 'record__wp-tag--selected' : ''}`}
                      onClick={() => toggleTag(key)}
                      aria-pressed={selectedTags.includes(key)}
                    >
                      <span aria-hidden="true">{icon}</span> {label}
                    </button>
                  ))}
                </div>
                <input
                  className="record__wp-note"
                  type="text"
                  placeholder="Add a note (optional)..."
                  value={waypointNote}
                  onChange={(e) => setWaypointNote(e.target.value)}
                  aria-label="Waypoint note"
                />
                <div className="record__wp-actions">
                  <button
                    className="record__wp-cancel"
                    onClick={() => setShowWaypointPanel(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="record__wp-save"
                    onClick={handleConfirmWaypoint}
                    disabled={selectedTags.length === 0}
                  >
                    Save Waypoint
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Stop confirmation */}
      {showStopConfirm && (
        <div className="record__overlay" role="alertdialog" aria-label="Stop recording confirmation">
          <div className="record__confirm">
            <p className="record__confirm-text">
              Stop recording? You've recorded {distanceKm}km over {minutes} minutes.
            </p>
            <div className="record__confirm-actions">
              <button
                className="record__confirm-cancel"
                onClick={() => setShowStopConfirm(false)}
              >
                Keep Recording
              </button>
              <button className="record__confirm-stop" onClick={confirmStop}>
                Stop & Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
