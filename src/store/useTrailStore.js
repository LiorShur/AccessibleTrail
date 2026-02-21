import { create } from 'zustand';
import {
  createDefaultAccessibility,
  createDefaultMetadata,
} from '../types/trail';

/**
 * Central state for the trail recording session, review flow,
 * browsing, and GPS status.
 */
const useTrailStore = create((set, get) => ({
  // ── GPS ──
  gpsStatus: 'searching', // searching | locked | weak | lost
  currentPosition: null,
  satelliteCount: 0,

  setGps: (status, position, sats) =>
    set({ gpsStatus: status, currentPosition: position, satelliteCount: sats || 0 }),

  // ── Recording ──
  recordingState: 'idle', // idle | recording | paused
  recordingPath: [],
  waypoints: [],
  recordingStartTime: null,
  recordingDistance: 0,
  recordingElevation: 0,
  autoSaveTimer: null,

  startRecording: () =>
    set({
      recordingState: 'recording',
      recordingPath: [],
      waypoints: [],
      recordingStartTime: Date.now(),
      recordingDistance: 0,
      recordingElevation: 0,
    }),

  pauseRecording: () => set({ recordingState: 'paused' }),
  resumeRecording: () => set({ recordingState: 'recording' }),

  stopRecording: () => {
    const state = get();
    return {
      path: state.recordingPath,
      waypoints: state.waypoints,
      distance: state.recordingDistance,
      elevation: state.recordingElevation,
      duration: Date.now() - (state.recordingStartTime || Date.now()),
    };
  },

  resetRecording: () =>
    set({
      recordingState: 'idle',
      recordingPath: [],
      waypoints: [],
      recordingStartTime: null,
      recordingDistance: 0,
      recordingElevation: 0,
    }),

  addPathPoint: (point) =>
    set((state) => {
      const path = [...state.recordingPath, point];
      let distance = state.recordingDistance;
      let elevation = state.recordingElevation;
      if (path.length > 1) {
        const prev = path[path.length - 2];
        distance += haversine(prev.lat, prev.lng, point.lat, point.lng);
        if (point.altitude && prev.altitude && point.altitude > prev.altitude) {
          elevation += point.altitude - prev.altitude;
        }
      }
      return { recordingPath: path, recordingDistance: distance, recordingElevation: elevation };
    }),

  addWaypoint: (waypoint) =>
    set((state) => ({ waypoints: [...state.waypoints, waypoint] })),

  removeWaypoint: (id) =>
    set((state) => ({
      waypoints: state.waypoints.filter((w) => w.id !== id),
    })),

  updateWaypointTags: (id, tags) =>
    set((state) => ({
      waypoints: state.waypoints.map((w) =>
        w.id === id ? { ...w, tags } : w
      ),
    })),

  // ── Review / Save flow ──
  reviewStep: 1, // 1=summary, 2=metadata, 3=accessibility
  trailMetadata: createDefaultMetadata(),
  trailAccessibility: createDefaultAccessibility(),
  recordedData: null, // snapshot from stopRecording

  setReviewStep: (step) => set({ reviewStep: step }),
  setTrailMetadata: (meta) => set({ trailMetadata: meta }),
  setTrailAccessibility: (acc) => set({ trailAccessibility: acc }),
  setRecordedData: (data) => set({ recordedData: data }),

  // ── Browse ──
  browseTrails: [],
  activeFilters: [],
  setBrowseTrails: (trails) => set({ browseTrails: trails }),
  toggleFilter: (filter) =>
    set((state) => {
      const has = state.activeFilters.includes(filter);
      return {
        activeFilters: has
          ? state.activeFilters.filter((f) => f !== filter)
          : [...state.activeFilters, filter],
      };
    }),

  // ── Selected waypoint (for detail modal) ──
  selectedWaypoint: null,
  setSelectedWaypoint: (wp) => set({ selectedWaypoint: wp }),
}));

// ── Helpers ──

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default useTrailStore;
