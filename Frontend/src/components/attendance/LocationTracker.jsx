import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/services/api';

/**
 * LocationTracker handles periodic GPS pings after an employee has checked in.
 * It ensures personnel remain within the designated office radius throughout the shift.
 */
const LocationTracker = () => {
  const { isEmployee, user } = useAuth();
  const intervalRef = useRef(null);

  useEffect(() => {
    // Only track if the user is an employee
    if (!isEmployee || !user) return;

    const trackLocation = async () => {
      if (!navigator.geolocation) {
        console.warn('Geolocation not supported by this browser.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Send periodic ping to backend
            await apiFetch('/attendance/location-log', {
              method: 'POST',
              body: JSON.stringify({ latitude, longitude })
            });
            
            console.log(`[LocationTracker] Ping successful: ${latitude}, ${longitude}`);
          } catch (err) {
            // Silently handle tracking failures (e.g. not checked in yet)
            console.debug('[LocationTracker] Ping skipped or failed:', err.message);
          }
        },
        (error) => {
          console.warn('[LocationTracker] Permission or GPS error:', error.message);
        },
        { enableHighAccuracy: true }
      );
    };

    // Initial check and then every 15 minutes (900000 ms)
    trackLocation();
    intervalRef.current = setInterval(trackLocation, 900000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isEmployee, user]);

  return null; // Invisible utility component
};

export default LocationTracker;
