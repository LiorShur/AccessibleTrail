import { useState, useEffect } from 'react';
import './SettingsScreen.css';

export default function SettingsScreen() {
  const [highContrast, setHighContrast] = useState(
    () => document.documentElement.getAttribute('data-high-contrast') === 'true'
  );
  const [offlineMode, setOfflineMode] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-high-contrast',
      highContrast ? 'true' : 'false'
    );
  }, [highContrast]);

  return (
    <div className="settings">
      <header className="settings__header">
        <h1 className="settings__title">Settings</h1>
      </header>

      <div className="settings__group">
        <h2 className="settings__group-title">Accessibility</h2>

        <div className="settings__item">
          <div>
            <span className="settings__item-label">High Contrast Mode</span>
            <span className="settings__item-desc">Increases contrast for outdoor visibility</span>
          </div>
          <button
            className={`settings__toggle ${highContrast ? 'settings__toggle--on' : ''}`}
            role="switch"
            aria-checked={highContrast}
            onClick={() => setHighContrast(!highContrast)}
            aria-label="Toggle high contrast mode"
          >
            <span className="settings__toggle-knob" />
          </button>
        </div>

        <div className="settings__item">
          <div>
            <span className="settings__item-label">System Font Size</span>
            <span className="settings__item-desc">Respects your device font size settings</span>
          </div>
          <span className="settings__item-value">System</span>
        </div>
      </div>

      <div className="settings__group">
        <h2 className="settings__group-title">Data & Offline</h2>

        <div className="settings__item">
          <div>
            <span className="settings__item-label">Offline Mode</span>
            <span className="settings__item-desc">Download map tiles for areas with poor signal</span>
          </div>
          <button
            className={`settings__toggle ${offlineMode ? 'settings__toggle--on' : ''}`}
            role="switch"
            aria-checked={offlineMode}
            onClick={() => setOfflineMode(!offlineMode)}
            aria-label="Toggle offline mode"
          >
            <span className="settings__toggle-knob" />
          </button>
        </div>

        <div className="settings__item">
          <div>
            <span className="settings__item-label">Auto-Save Interval</span>
            <span className="settings__item-desc">Frequency of background saves during recording</span>
          </div>
          <span className="settings__item-value">30s</span>
        </div>
      </div>

      <div className="settings__group">
        <h2 className="settings__group-title">Recording</h2>

        <div className="settings__item">
          <div>
            <span className="settings__item-label">GPS Accuracy Threshold</span>
            <span className="settings__item-desc">Minimum accuracy before recording path points</span>
          </div>
          <span className="settings__item-value">50m</span>
        </div>

        <div className="settings__item">
          <div>
            <span className="settings__item-label">Require GPS Lock</span>
            <span className="settings__item-desc">Must have GPS lock before recording starts</span>
          </div>
          <span className="settings__item-value">On</span>
        </div>
      </div>

      <div className="settings__group">
        <h2 className="settings__group-title">About</h2>
        <div className="settings__item">
          <div>
            <span className="settings__item-label">AccessibleTrail</span>
            <span className="settings__item-desc">Version 1.0.0 &middot; Map accessible nature trails</span>
          </div>
        </div>
      </div>

      <div style={{ height: 'var(--nav-height)' }} />
    </div>
  );
}
