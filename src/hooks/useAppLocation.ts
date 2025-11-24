import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/context/SettingsContext';
import { trackWeatherLocation } from '@/lib/analytics';
import { API_URLS, TIMEOUTS, CACHE_DURATION, RETRY_CONFIG } from '@/lib/constants';

/**
 * Interface for location data structure
 */
export interface LocationData {
  latitude: number;
  longitude: number;
  displayName: string;
}

interface LocationCache {
  timestamp: number;
  data: LocationData;
}

/**
 * Custom hook to fetch and manage user location data
 * Uses geolocation API with fallback to IP-based location
 * Includes caching to reduce API calls and retry logic for reliability
 *
 * @returns Object with location data, loading state, and error
 *
 * @version 1.10.1 - Enhanced error handling and documentation
 */
export const useAppLocation = (): {
  location: LocationData | null;
  error: string | null;
  loading: boolean;
} => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { refreshInterval } = useSettings();

  /**
   * Fetches human-readable location name from coordinates using reverse geocoding
   * Includes retry logic and input validation
   * @param lat - Latitude
   * @param lon - Longitude
   * @returns Promise resolving to display name string
   */
  const fetchLocationName = useCallback(
    async (lat: number, lon: number): Promise<string> => {
      // Validate coordinates
      if (
        !isFinite(lat) ||
        !isFinite(lon) ||
        lat < -90 ||
        lat > 90 ||
        lon < -180 ||
        lon > 180
      ) {
        throw new Error('Invalid coordinates for reverse geocoding');
      }

      for (let attempt = 1; attempt <= RETRY_CONFIG.MAX_RETRIES; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.REVERSE_GEOCODE);

          const response = await fetch(
            `${API_URLS.REVERSE_GEOCODE_BASE}?latitude=${lat}&longitude=${lon}&localityLanguage=es`,
            { signal: controller.signal }
          );

          clearTimeout(timeoutId);

          if (!response.ok) {
            if (attempt === RETRY_CONFIG.MAX_RETRIES) {
              throw new Error(
                `Reverse geocode response not OK: ${response.status}`
              );
            }
            await new Promise((resolve) =>
              setTimeout(resolve, RETRY_CONFIG.DELAY * attempt)
            );
            continue;
          }

          const data = await response.json();

          if (data) {
            const parts: { [key: string]: string } = {};
            const street = data.localityInfo?.informative?.find(
              (i: any) => i.description === 'street'
            )?.name;
            if (street) parts.street = street;
            if (data.locality) parts.locality = data.locality;
            if (data.city) parts.city = data.city;
            if (data.principalSubdivision)
              parts.subdivision = data.principalSubdivision;
            if (data.countryName) parts.country = data.countryName;

            const finalParts = [
              parts.street,
              parts.locality,
              parts.city,
              parts.subdivision,
              parts.country,
            ].filter(
              (value, index, self) => value && self.indexOf(value) === index
            );

            if (finalParts.length > 0) return finalParts.join(', ');
          }
          throw new Error('No location parts found');
        } catch (error) {
          if (attempt === RETRY_CONFIG.MAX_RETRIES) {
            throw error;
          }
          if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Reverse geocoding request timeout');
          }
          await new Promise((resolve) =>
            setTimeout(resolve, RETRY_CONFIG.DELAY * attempt)
          );
        }
      }
      throw new Error('Failed to fetch location name after retries');
    },
    []
  );

  /**
   * Gets user location using geolocation API, with fallback to IP-based location
   * Uses caching to avoid repeated API calls
   * @param force - Force refresh ignoring cache
   */
  const getLocation = useCallback(
    async (force = false) => {
      setLoading(true);
      setError(null);

      const cacheKey = 'user-location';

      try {
        if (!force) {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const { timestamp, data } = JSON.parse(cached) as LocationCache;
            if (Date.now() - timestamp < CACHE_DURATION.LOCATION) {
              setLocation(data);
              setLoading(false);
              return;
            }
          }
        }

        const getPosition = (): Promise<GeolocationPosition> => {
          return new Promise((resolve, reject) => {
            if (!('geolocation' in navigator))
              return reject(new Error('Geolocation not supported'));
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: TIMEOUTS.GEOLOCATION,
              maximumAge: 0,
            });
          });
        };

        let newLocation: LocationData | undefined;

        try {
          const position = await getPosition();
          const { latitude, longitude } = position.coords;

          // Validate coordinates from geolocation
          if (
            !isFinite(latitude) ||
            !isFinite(longitude) ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
          ) {
            throw new Error('Invalid coordinates from geolocation');
          }

          const displayName = await fetchLocationName(latitude, longitude);
          newLocation = { latitude, longitude, displayName };
          trackWeatherLocation.locationGeolocationSuccess();
        } catch (geoError) {
          console.warn('Geolocation failed, trying IP fallback:', geoError);
          toast({
            title: 'No se pudo usar la geolocalización.',
            description: 'Usando ubicación por IP como alternativa.',
            variant: 'default',
          });

          // IP-based location with retry and timeout
          for (let attempt = 1; attempt <= RETRY_CONFIG.MAX_RETRIES; attempt++) {
            try {
              const ipApiBaseUrl = process.env.NEXT_PUBLIC_IP_API_BASE || API_URLS.IP_API_BASE;
              if (!process.env.NEXT_PUBLIC_IP_API_BASE) {
                console.warn('NEXT_PUBLIC_IP_API_BASE is not set. Using default IP API URL.');
              }

              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.IP_API);

              const response = await fetch(ipApiBaseUrl, {
                signal: controller.signal,
              });
              clearTimeout(timeoutId);

              if (!response.ok) {
                if (attempt === RETRY_CONFIG.MAX_RETRIES) {
                  throw new Error(`IP API response not OK: ${response.status}`);
                }
                await new Promise((resolve) =>
                  setTimeout(resolve, RETRY_CONFIG.DELAY * attempt)
                );
                continue;
              }

              const data = await response.json();
              if (
                !data.latitude ||
                !data.longitude ||
                !isFinite(data.latitude) ||
                !isFinite(data.longitude) ||
                data.latitude < -90 ||
                data.latitude > 90 ||
                data.longitude < -180 ||
                data.longitude > 180
              ) {
                throw new Error('IP API did not return valid coordinates');
              }

              const displayName =
                [data.city, data.region, data.country_name]
                  .filter(Boolean)
                  .join(', ') || 'Ubicación desconocida';
              newLocation = {
                latitude: data.latitude,
                longitude: data.longitude,
                displayName,
              };
              trackWeatherLocation.locationIPFallback();
              break; // Success, exit retry loop
            } catch (ipError) {
              if (attempt === RETRY_CONFIG.MAX_RETRIES) {
                throw ipError;
              }
              if (ipError instanceof Error && ipError.name === 'AbortError') {
                throw new Error('IP location request timeout');
              }
              await new Promise((resolve) =>
                setTimeout(resolve, RETRY_CONFIG.DELAY * attempt)
              );
            }
          }
        }

        if (!newLocation) {
          throw new Error(
            'Failed to obtain location from both geolocation and IP fallback'
          );
        }

        setLocation(newLocation);
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ timestamp: Date.now(), data: newLocation })
        );
      } catch (err) {
        let errorMessage = 'Location N/A';
        if (err instanceof Error) {
          errorMessage = err.message;
          trackWeatherLocation.locationError(errorMessage);
        }
        setError(errorMessage);
        toast({
          title: 'Error al obtener la ubicación',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [toast, fetchLocationName]
  );

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  useEffect(() => {
    if (refreshInterval > 0) {
      const intervalId = setInterval(() => {
        getLocation(true); // Force refresh, ignoring cache
      }, refreshInterval * 60 * 1000);

      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, getLocation]);

  return { location, error, loading };
};
