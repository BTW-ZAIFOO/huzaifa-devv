import React, { useState, useEffect } from 'react';

// DebugConsole component displays a floating debug log viewer for console logs, errors, and warnings.
const DebugConsole = () => {

    // State to control whether the debug console is open or closed.
    const [isOpen, setIsOpen] = useState(false);

    // State to store the log entries.
    const [logs, setLogs] = useState([]);

    useEffect(() => {

        // Store original console methods to restore them later.
        const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn
        };

        // Function to intercept console methods and capture logs.
        const interceptConsole = (type) => (...args) => {

            // Add new log entry to logs state.
            setLogs(prev => [...prev, {
                type,
                content: args.map(arg => JSON.stringify(arg)).join(' '),
                timestamp: new Date()
            }]);

            // Call the original console method.
            originalConsole[type](...args);
        };

        // Override console methods to intercept logs.
        console.log = interceptConsole('log');
        console.error = interceptConsole('error');
        console.warn = interceptConsole('warn');

        // Cleanup: restore original console methods when component unmounts.
        return () => {
            console.log = originalConsole.log;
            console.error = originalConsole.error;
            console.warn = originalConsole.warn;
        };
    }, []);

    // Helper function to determine log color based on log type.
    const getLogColor = (type) => {
        return type === 'error' ? 'text-red-400' :
            type === 'warn' ? 'text-yellow-400' : 'text-green-400';
    };

    return (
        <>

            {/* Toggle button for opening/closing the debug console */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 left-4 z-50 bg-gray-900 text-white p-2 rounded-full shadow-lg"
                title="Toggle Debug Console"
            >
                <i className="fas fa-bug"></i>
            </button>

            {/* Debug console panel, shown only when isOpen is true */}
            {isOpen && (
                <div className="fixed bottom-16 left-4 w-96 h-96 bg-gray-900 bg-opacity-90 text-white rounded-lg shadow-2xl z-50 flex flex-col">

                    {/* Header with title and action buttons */}
                    <div className="p-2 border-b border-gray-700 flex justify-between items-center">
                        <h3 className="text-sm font-mono">Debug Console</h3>
                        <div>

                            {/* Button to clear all logs */}
                            <button onClick={() => setLogs([])} className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded mr-2">Clear</button>

                            {/* Button to close the debug console */}
                            <button onClick={() => setIsOpen(false)} className="text-xs bg-red-700 hover:bg-red-600 px-2 py-1 rounded">Close</button>
                        </div>
                    </div>

                    {/* Log display area */}
                    <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
                        {logs.length === 0 ? (

                            // Show message if there are no logs yet
                            <p className="text-gray-500">No logs yet</p>
                        ) : (

                            // Render each log entry with appropriate color and timestamp
                            logs.map((log, idx) => (
                                <div key={idx} className={`mb-1 ${getLogColor(log.type)}`}>
                                    <span className="text-gray-500">[{log.timestamp.toLocaleTimeString()}]</span> {log.content}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default DebugConsole;
