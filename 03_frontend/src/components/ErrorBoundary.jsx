 
import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="max-w-md w-full text-center">
                        <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                            <ExclamationTriangleIcon className="w-10 h-10 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
                        <p className="text-gray-600 mb-6">
                            We're sorry, but something unexpected happened. Please try refreshing the page.
                        </p>
                        <div className="space-x-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="btn-primary"
                            >
                                Refresh Page
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="btn-secondary"
                            >
                                Go Home
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-8 text-left">
                                <details className="bg-gray-50 rounded-lg p-4">
                                    <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                                        Error Details
                                    </summary>
                                    <pre className="mt-4 text-xs text-red-600 overflow-auto">
                                        {this.state.error && this.state.error.toString()}
                                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                                    </pre>
                                </details>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;