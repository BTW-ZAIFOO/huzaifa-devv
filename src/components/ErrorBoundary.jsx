import React from 'react';

// ErrorBoundary is a React component that catches JavaScript errors anywhere in its child component tree,
// logs those errors, and displays a fallback UI instead of the component tree that crashed.
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);

        // Initialize state to track if an error has occurred and store error details.
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    // This lifecycle method is invoked after an error has been thrown by a descendant component.
    componentDidCatch(error, errorInfo) {

        // Update state so the next render shows the fallback UI.
        this.setState({ hasError: true, error, errorInfo });
    }

    render() {

        // If no error has occurred, render children components as usual.
        if (!this.state.hasError) return this.props.children;

        // If an error has occurred, render the fallback UI.
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">

                    {/* Error icon */}
                    <div className="text-5xl text-red-500 mb-4">
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>

                    {/* Error message */}
                    <h1 className="text-2xl font-bold text-gray-700 mb-4">Something went wrong</h1>
                    <p className="text-gray-500 mb-6">
                        The application encountered an error. Please try refreshing the page.
                    </p>

                    {/* Technical details (expandable) */}
                    <details className="mb-4 text-left bg-gray-50 p-4 rounded-lg">
                        <summary className="cursor-pointer text-blue-600 font-medium">View technical details</summary>
                        <pre className="mt-2 whitespace-pre-wrap text-xs text-gray-800 overflow-auto max-h-60">

                            {/* Display error message and component stack trace if available */}
                            {this.state.error && this.state.error.toString()}
                            <br />
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </details>

                    {/* Refresh button to reload the page */}
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
