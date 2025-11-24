import { MapPin } from 'lucide-react';

/**
 * LocationDisplay component - Shows the current location with map pin icon
 * @param displayName - Human-readable location name
 */
export const LocationDisplay = ({ displayName }: { displayName?: string }) => {
  if (!displayName) {
    return (
      <div className="w-full flex flex-col items-center justify-center">
        <div className="flex items-center justify-center gap-3">
          <div className="rounded-full p-2">
            <MapPin className="size-5 sm:size-6 md:size-7 lg:size-8" />
          </div>
          <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-muted-foreground text-center">
            ...
          </span>
        </div>
      </div>
    );
  }

  // Split displayName into parts: assuming format "Street, Locality, City, Region, Country"
  const parts = displayName.split(', ');
  const streetLocalityCity = parts.slice(0, 3).filter(Boolean).join(', ') || '';
  const regionCountry = parts.slice(3).filter(Boolean).join(', ') || '';

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="flex items-center justify-center gap-3">
        <div className="rounded-full p-2">
          <MapPin className="size-8 sm:size-10 md:size-12 lg:size-14" />
        </div>
        <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl whitespace-normal text-center">
          <span className="font-bold">{parts[0]}</span>
          {parts.slice(1).filter(Boolean).length > 0
            ? `, ${parts.slice(1).filter(Boolean).join(', ')}`
            : ''}
        </span>
      </div>
      {regionCountry && (
        <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl text-muted-foreground text-center whitespace-normal mt-1">
          {regionCountry}
        </div>
      )}
    </div>
  );
};
