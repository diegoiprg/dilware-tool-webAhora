'use client';

import { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * Error Boundary Component
 * Catches React rendering errors and displays a fallback UI
 * Prevents the entire app from crashing due to component errors
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('Error caught by boundary:', error, errorInfo);

        // Track error in analytics if available
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'exception', {
                description: error.message,
                fatal: false,
            });
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div className="flex items-center justify-center min-h-screen bg-background">
                        <div className="text-center p-8 max-w-md">
                            <h1 className="text-2xl font-bold mb-4 text-destructive">
                                Algo salió mal
                            </h1>
                            <p className="text-muted-foreground mb-6">
                                Lo sentimos, ha ocurrido un error inesperado. Por favor, recarga la página.
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                            >
                                Recargar página
                            </button>
                        </div>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}
