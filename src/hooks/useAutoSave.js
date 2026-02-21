import { useEffect, useRef } from 'react';
import useTrailStore from '../store/useTrailStore';

const AUTOSAVE_KEY = 'accessibletrail_autosave';
const INTERVAL_MS = 30_000; // 30 seconds

/**
 * Periodically saves the current recording state to localStorage
 * so a crash or accidental close doesn't lose data.
 */
export default function useAutoSave() {
  const timerRef = useRef(null);

  useEffect(() => {
    const save = () => {
      const state = useTrailStore.getState();
      if (state.recordingState === 'idle') return;
      const snapshot = {
        recordingPath: state.recordingPath,
        waypoints: state.waypoints,
        recordingStartTime: state.recordingStartTime,
        recordingDistance: state.recordingDistance,
        recordingElevation: state.recordingElevation,
        recordingState: state.recordingState,
        savedAt: Date.now(),
      };
      try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(snapshot));
      } catch {
        // Storage full — silently fail
      }
    };

    timerRef.current = setInterval(save, INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, []);
}

export function loadAutoSave() {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAutoSave() {
  localStorage.removeItem(AUTOSAVE_KEY);
}
