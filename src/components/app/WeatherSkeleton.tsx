/**
 * WeatherSkeleton component - Shows loading or error state for weather data
 * @param error - Error message to display, or loading text if none
 * @param onRetry - Callback function to retry loading weather data
 */
export const WeatherSkeleton = ({
  error,
  onRetry,
}: {
  error?: string | null;
  onRetry?: () => void;
}) => (
  <div className="animate-pulse text-center landscape:text-right">
    {error ? (
      <div className="space-y-2">
        <div>{error}</div>
        {onRetry && (
          <button
            onClick={() => {
              onRetry();
              // Track retry attempt
              import('@/lib/analytics').then(({ trackWeatherLocation }) => {
                trackWeatherLocation.weatherDataLoad(false);
              });
            }}
            className="px-3 py-1 bg-white/20 rounded-md text-sm hover:bg-white/30 transition-colors"
            aria-label="Reintentar cargar clima"
          >
            Reintentar
          </button>
        )}
      </div>
    ) : (
      'Clima no disponible'
    )}
  </div>
);
