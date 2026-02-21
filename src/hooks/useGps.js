import { useEffect, useRef } from 'react';
import useTrailStore from '../store/useTrailStore';

/**
 * Watches the device GPS and pushes updates to the store.
 * When recording, each position fix is also appended to the trail path.
 */
export default function useGps() {
  const watchId = useRef(null);
  const { setGps, addPathPoint, recordingState } = useTrailStore();

  useEffect(() => {
    if (!navigator.geolocation) {
      setGps('lost', null, 0);
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, altitude, accuracy } = pos.coords;
        const point = {
          lat: latitude,
          lng: longitude,
          altitude: altitude || 0,
          accuracy,
          timestamp: pos.timestamp,
        };

        // Determine quality
        let status = 'locked';
        if (accuracy > 30) status = 'weak';
        if (accuracy > 100) status = 'lost';

        setGps(status, point, null);

        // Append to recording path if actively recording & accuracy is acceptable
        if (recordingState === 'recording' && accuracy < 50) {
          addPathPoint(point);
        }
      },
      (err) => {
        console.warn('GPS error:', err.message);
        setGps('lost', null, 0);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000,
      }
    );

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [recordingState]);
}
