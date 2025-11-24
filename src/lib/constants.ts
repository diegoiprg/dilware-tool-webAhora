/**
 * Application Constants
 */

export const API_URLS = {
  WEATHER_API_BASE: 'https://api.weatherapi.com/v1/forecast.json',
  OPEN_METEO_BASE: 'https://api.open-meteo.com/v1/forecast',
  REVERSE_GEOCODE_BASE: 'https://api.bigdatacloud.net/data/reverse-geocode-client',
  IP_API_BASE: 'https://ipapi.co/json/',
};

export const TIMEOUTS = {
  WEATHER_API: 10000, // 10 seconds
  REVERSE_GEOCODE: 8000, // 8 seconds
  IP_API: 5000, // 5 seconds
  GEOLOCATION: 15000, // 15 seconds
};

export const CACHE_DURATION = {
  LOCATION: 10 * 60 * 1000, // 10 minutes
};

export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  DELAY: 1000, // 1 second
};
