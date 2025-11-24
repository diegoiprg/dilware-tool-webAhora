import {
  Droplets,
  Sun,
  Thermometer,
  Cloud,
  SunDim,
  CloudSun,
  CloudRain,
  Snowflake,
  Zap,
  CloudFog,
  CloudDrizzle,
  ArrowUp,
  ArrowDown,
  CloudRainWind,
  Leaf,
  Wind,
  MapPin,
} from 'lucide-react';
import type { WeatherData } from '@/hooks/useWeather';
import { useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { WeatherSkeleton } from './WeatherSkeleton';
import { trackWeatherLocation } from '@/lib/analytics';
import { useTranslation } from '@/lib/i18n/translations';

/**
 * Returns the appropriate weather icon based on the weather code
 * @param weatherCode - The weather code from the API
 * @param large - Whether to use the large icon size
 * @returns React node with the weather icon
 */
const getWeatherIcon = (
  weatherCode: number,
  large = false
): React.ReactNode => {
  const iconSize = large
    ? 'size-8 sm:size-10 md:size-12 lg:size-14'
    : 'size-4 sm:size-5 md:size-6 lg:size-7';
  switch (weatherCode) {
    case 0:
      return <Sun className={iconSize} />;
    case 1:
      return <SunDim className={iconSize} />;
    case 2:
      return <CloudSun className={iconSize} />;
    case 3:
      return <Cloud className={iconSize} />;
    case 45:
    case 48:
      return <CloudFog className={iconSize} />;
    case 51:
    case 53:
    case 55:
      return <CloudDrizzle className={iconSize} />;
    case 56:
    case 57:
      return <CloudDrizzle className={iconSize} />;
    case 61:
    case 63:
    case 65:
      return <CloudRain className={iconSize} />;
    case 66:
    case 67:
      return <CloudRain className={iconSize} />;
    case 71:
    case 73:
    case 75:
      return <Snowflake className={iconSize} />;
    case 77:
      return <Snowflake className={iconSize} />;
    case 80:
    case 81:
    case 82:
      return <CloudRain className={iconSize} />;
    case 85:
    case 86:
      return <Snowflake className={iconSize} />;
    case 95:
    case 96:
    case 99:
      return <Zap className={iconSize} />;
    default:
      return <Thermometer className={iconSize} />;
  }
};

/**
 * Returns air quality description and color based on EPA index
 * @param aqi - Air Quality Index (1-6, EPA scale)
 * @param t - Translation object
 * @returns Object with description and color
 */
const getAirQualityInfo = (aqi: number, t: any) => {
  switch (aqi) {
    case 1:
      return { description: t.weather.aqi_good, color: 'text-green-500' };
    case 2:
      return { description: t.weather.aqi_moderate, color: 'text-yellow-500' };
    case 3:
      return { description: t.weather.aqi_unhealthy_sensitive, color: 'text-orange-500' };
    case 4:
      return { description: t.weather.aqi_unhealthy, color: 'text-red-500' };
    case 5:
      return { description: t.weather.aqi_very_unhealthy, color: 'text-purple-500' };
    case 6:
      return { description: t.weather.aqi_hazardous, color: 'text-red-700' };
    default:
      return { description: t.weather.aqi_unknown, color: 'text-gray-500' };
  }
};

/**
 * Returns UV index description and color based on UV value
 * @param uvIndex - UV Index value
 * @param t - Translation object
 * @returns Object with description and color
 */
const getUVIndexInfo = (uvIndex: number, t: any) => {
  if (uvIndex <= 2) {
    return { description: t.weather.uv_low, color: 'text-green-500' };
  } else if (uvIndex <= 5) {
    return { description: t.weather.uv_moderate, color: 'text-yellow-500' };
  } else if (uvIndex <= 7) {
    return { description: t.weather.uv_high, color: 'text-orange-500' };
  } else if (uvIndex <= 10) {
    return { description: t.weather.uv_very_high, color: 'text-red-500' };
  } else {
    return { description: t.weather.uv_extreme, color: 'text-purple-500' };
  }
};

/**
 * Formats temperature value with the specified unit
 * @param temp - Temperature value in Celsius
 * @param unit - Temperature unit ('C' or 'F')
 * @returns Formatted temperature string with degree symbol and unit
 */
const formatTemp = (temp: number, unit: 'C' | 'F'): string => {
  if (unit === 'F') {
    return `${Math.round(temp * 1.8 + 32)}°F`;
  }
  return `${Math.round(temp)}°C`;
};

interface Props {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  location?: { displayName?: string } | null;
}

/**
 * WeatherDisplay component - Shows current weather information with integrated location
 * Displays temperature, weather icon, location icon (commented), and location text
 * Location section has been moved here from separate component
 * @param weather - Current weather data
 * @param loading - Whether weather data is loading
 * @param error - Error message if weather fetch failed
 * @param location - Location data to display alongside weather
 *
 * @version 1.13.2 - Fixed GitHub Actions workflow to use --legacy-peer-deps for deployment
 */
export const WeatherDisplay = ({
  weather,
  loading,
  error,
  onRetry,
  location,
}: Props) => {
  const { tempUnit } = useSettings();
  const t = useTranslation();

  // Track successful weather data load
  useEffect(() => {
    if (weather && !loading && !error) {
      trackWeatherLocation.weatherDataLoad(true);
    }
  }, [weather, loading, error]);

  if (loading && !weather)
    return <WeatherSkeleton error={error} onRetry={onRetry} />;
  if (!weather) return <WeatherSkeleton error={error} onRetry={onRetry} />;

  const largeWeatherIcon = getWeatherIcon(weather.weatherCode, true);
  const uvInfo = getUVIndexInfo(weather.uvIndex, t);
  const aqiInfo = getAirQualityInfo(weather.airQuality, t);

  return (
    <div className="w-full text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-10xl overflow-hidden">
      <div className="flex flex-col items-center gap-1 sm:gap-2 md:gap-3 text-center">
        {/* Line 1: Location + weather icon + temperature */}
        <div className="flex items-center justify-center gap-3 font-bold">
          {location?.displayName && (
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl">
              {location.displayName.split(',')[0]}
            </span>
          )}
          <div className="bg-white/20 dark:bg-transparent rounded-full p-1 dark:p-0">
            {largeWeatherIcon}
          </div>
          <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl">
            {formatTemp(weather.temperature, tempUnit)}
          </span>
        </div>

        {/* Consolidated weather metrics in single line: MIN, MAX, humidity, precipitation */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-1" aria-label={`Min: ${formatTemp(weather.minTemperature, tempUnit)}`}>
            <ArrowDown className="size-6 sm:size-7 md:size-8 lg:size-9 xl:size-10 2xl:size-11" aria-hidden="true" />
            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl">
              {formatTemp(weather.minTemperature, tempUnit)}
            </span>
          </div>
          <div className="flex items-center gap-1" aria-label={`Max: ${formatTemp(weather.maxTemperature, tempUnit)}`}>
            <ArrowUp className="size-6 sm:size-7 md:size-8 lg:size-9 xl:size-10 2xl:size-11" aria-hidden="true" />
            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl">
              {formatTemp(weather.maxTemperature, tempUnit)}
            </span>
          </div>
          <div className="flex items-center gap-1" aria-label={`${t.weather.humidity}: ${Math.round(weather.humidity)}%`}>
            <Droplets className="size-6 sm:size-7 md:size-8 lg:size-9 xl:size-10 2xl:size-11" aria-hidden="true" />
            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl">
              {Math.round(weather.humidity)}%
            </span>
          </div>
          <div className="flex items-center gap-1" aria-label={`Rain: ${Math.round(weather.rainProbability)}%`}>
            <CloudRainWind className="size-6 sm:size-7 md:size-8 lg:size-9 xl:size-10 2xl:size-11" aria-hidden="true" />
            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl">
              {Math.round(weather.rainProbability)}%
            </span>
          </div>
        </div>

        {/* Line 3: UV index and air quality */}
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-1" aria-label={`${t.weather.uv}: ${Math.round(weather.uvIndex)} - ${uvInfo.description}`}>
            <Sun
              className={`size-6 sm:size-7 md:size-8 lg:size-9 xl:size-10 ${uvInfo.color}`}
              aria-hidden="true"
            />
            <span
              className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-semibold ${uvInfo.color}`}
            >
              UV {Math.round(weather.uvIndex)} -{' '}
              {uvInfo.description.toLowerCase()}
            </span>
          </div>
          <div className="flex items-center gap-1" aria-label={`${t.weather.aqi}: ${aqiInfo.description}`}>
            <Leaf
              className={`size-6 sm:size-7 md:size-8 lg:size-9 xl:size-10 ${aqiInfo.color}`}
              aria-hidden="true"
            />
            <span
              className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-semibold ${aqiInfo.color}`}
            >
              {aqiInfo.description}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
