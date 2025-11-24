'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useToast } from '@/hooks/use-toast';

const MainContent = dynamic(() => import('@/components/app/MainContent'), {
  ssr: false,
  loading: () => (
    <div className="bg-background text-foreground h-screen w-screen flex items-center justify-center">
      <div className="font-headline text-2xl animate-pulse">Loading...</div>
    </div>
  ),
});

export default function ChronosViewPage() {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Global error handler for unhandled errors
    const handleError = (event: ErrorEvent) => {
      setHasError(true);
      setErrorMessage(
        `Error de JavaScript: ${event.error?.message || 'Error desconocido'}`
      );
      toast({
        title: 'Error en la aplicación',
        description: `Se produjo un error: ${event.error?.message || 'Error desconocido'
          }. Intente recargar la página.`,
        variant: 'destructive',
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setHasError(true);
      setErrorMessage(
        `Error de promesa: ${event.reason?.message || 'Error desconocido'}`
      );
      toast({
        title: 'Error en la aplicación',
        description: `Error de carga: ${event.reason?.message || 'Error desconocido'
          }. Verifique su conexión a internet.`,
        variant: 'destructive',
      });
    };

    // Add global error listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection
      );
    };
  }, [toast]);

  if (hasError) {
    return (
      <div className="bg-background text-foreground h-screen w-screen flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-xl font-bold mb-2">Error de carga</div>
          <div className="text-sm opacity-75 mb-4">{errorMessage}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }

  return <MainContent />;
}
