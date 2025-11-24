/**
 * LoadingScreen component - Shows a loading indicator while app initializes
 */
export const LoadingScreen = () => (
  <main className="bg-background text-foreground h-[100svh] w-screen flex items-center justify-center">
    <div className="font-headline text-2xl animate-pulse">Loading...</div>
  </main>
);
