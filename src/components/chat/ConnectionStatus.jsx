import React, { useState, useEffect } from 'react';

const ConnectionStatus = ({ isConnected, reconnecting = false, attempt = 0 }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (isConnected && !reconnecting) {
            const timer = setTimeout(() => setIsVisible(false), 5000);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(true);
        }
    }, [isConnected, reconnecting]);

    if (!isVisible) return null;

    if (!isConnected && !reconnecting) {
        return (
            <>
                <div className="fixed bottom-4 right-4 z-50 px-4 py-3 bg-red-100 text-red-800 rounded-full shadow-md flex items-center gap-2 text-sm">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                    <span>Disconnected</span>
                    <button
                        onClick={() => window.location.reload()}
                        className="ml-2 bg-red-200 hover:bg-red-300 text-red-800 rounded-full px-2 py-0.5 text-xs transition-colors"
                    >
                        Refresh
                    </button>
                </div>
            </>
        );
    }

    if (reconnecting) {
        return (
            <>
                <div className="fixed bottom-4 right-4 z-50 px-4 py-3 bg-yellow-100 text-yellow-800 rounded-full shadow-md flex items-center gap-2 text-sm">
                    <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span>Reconnecting... (Attempt {attempt}/5)</span>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="fixed bottom-4 right-4 z-50 px-4 py-3 bg-green-100 text-green-800 rounded-full shadow-md flex items-center gap-2 text-sm">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                <span>Connected</span>
            </div>
        </>

    );
};

export default ConnectionStatus;
