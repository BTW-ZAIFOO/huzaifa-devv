import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Error caught by ErrorBoundary:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
                    <div className="text-5xl text-red-500 mb-4">
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-700 mb-4">Something went wrong</h1>
                    <p className="text-gray-500 mb-6">
                        The application encountered an error. Please try refreshing the page.
                    </p>
                    <details className="mb-4 text-left bg-gray-50 p-4 rounded-lg">
                        <summary className="cursor-pointer text-blue-600 font-medium">View technical details</summary>
                        <pre className="mt-2 whitespace-pre-wrap text-xs text-gray-800 overflow-auto max-h-60">
                            {this.state.error && this.state.error.toString()}
                            <br />
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        );
    }
}

export default ErrorBoundary;
