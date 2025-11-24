import { LocationDisplay } from './LocationDisplay';
import { WeatherDisplay } from './WeatherDisplay';
import type { WeatherData } from '@/hooks/useWeather';

interface Props {
  locationDisplayName?: string;
  weather: WeatherData | null;
  weatherLoading: boolean;
  weatherError: string | null;
  locationError: string | null;
}

export const AppFooter = ({ locationDisplayName, weather, weatherLoading, weatherError, locationError }: Props) => (
  <footer className="w-full flex flex-col landscape:flex-row justify-between items-center gap-4 landscape:gap-8">
    <LocationDisplay displayName={locationDisplayName} />
    <WeatherDisplay weather={weather} loading={weatherLoading} error={weatherError || locationError} />
  </footer>
);
