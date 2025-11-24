import React from 'react';
import { Clock } from '@/components/app/Clock';
import { Header } from '@/components/app/Header';
import { DateDisplay } from '@/components/app/DateDisplay';
import { WeatherDisplay } from '@/components/app/WeatherDisplay';
import { WeatherData } from '@/hooks/useWeather';
import { DynamicBackground } from '@/components/app/DynamicBackground';

interface DashboardLayoutProps {
    containerRef: React.RefObject<HTMLDivElement>;
    currentTime: Date;
    appVersion: string;
    location: { displayName?: string } | null;
    weather: WeatherData | null;
    weatherLoading: boolean;
    weatherError: string | null;
    locationError: string | null;
    onFullscreen: () => void;
    onRetryWeather: () => void;
    isFullscreenSupported: boolean;
    isAndroid: boolean;
    isOldAndroid: boolean;
    isIOS: boolean;
}

export function DashboardLayout({
    containerRef,
    currentTime,
    appVersion,
    location,
    weather,
    weatherLoading,
    weatherError,
    locationError,
    onFullscreen,
    onRetryWeather,
    isFullscreenSupported,
    isAndroid,
    isOldAndroid,
    isIOS,
}: DashboardLayoutProps) {
    return (
        // Main container with fullscreen dimensions and background
        <div
            ref={containerRef}
            className={`relative bg-background text-foreground select-none overflow-hidden pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] ${isIOS
                ? 'h-screen w-screen'
                : 'h-screen w-screen min-h-screen min-w-screen'
                }`}
        >
            {/* Dynamic Background */}
            <DynamicBackground currentTime={currentTime} />

            {/* Fliqlo-style layout: minimal header, maximized clock, compact footer */}
            <div className="relative z-10 h-full w-full flex flex-col">
                {/* Top section - minimal height: Menu and date (menu aligned right) */}
                <div
                    className={`flex-shrink-0 flex items-center justify-between px-2 py-1 min-h-[50px] ${isOldAndroid ? 'bg-background' : 'bg-background/80 backdrop-blur-sm'
                        }`}
                >
                    <DateDisplay date={currentTime} />
                    <Header appVersion={appVersion} />
                </div>

                {/* Main section - optimized height: Clock with better vertical distribution */}
                <div
                    className="flex-[3] flex items-center justify-center min-h-0 relative px-2"
                >
                    <Clock
                        time={currentTime}
                        onClick={onFullscreen}
                        isFullscreenSupported={isFullscreenSupported}
                        isOldAndroid={isOldAndroid}
                        isIOS={isIOS}
                    />
                </div>

                {/* Bottom section - optimized height: Weather with better spacing */}
                <div
                    className={`flex-1 flex flex-col items-center justify-center px-2 py-1 min-h-[60px] ${isOldAndroid
                        ? 'bg-background'
                        : 'bg-background/80 backdrop-blur-sm'
                        }`}
                >
                    <div className="flex items-center justify-center gap-6 flex-wrap landscape:flex-row">
                        {(weather || weatherLoading) && (
                            <WeatherDisplay
                                weather={weather}
                                loading={weatherLoading}
                                error={weatherError || locationError}
                                onRetry={onRetryWeather}
                                location={location}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
