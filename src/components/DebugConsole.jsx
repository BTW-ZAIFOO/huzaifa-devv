import React, { useState, useEffect } from 'react';

const DebugConsole = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn
        };

        const interceptConsole = (type) => (...args) => {
            setLogs(prev => [...prev, {
                type,
                content: args.map(arg => JSON.stringify(arg)).join(' '),
                timestamp: new Date()
            }]);
            originalConsole[type](...args);
        };

        console.log = interceptConsole('log');
        console.error = interceptConsole('error');
        console.warn = interceptConsole('warn');

        return () => {
            console.log = originalConsole.log;
            console.error = originalConsole.error;
            console.warn = originalConsole.warn;
        };
    }, []);

    const getLogColor = (type) => {
        return type === 'error' ? 'text-red-400' :
            type === 'warn' ? 'text-yellow-400' : 'text-green-400';
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 left-4 z-50 bg-gray-900 text-white p-2 rounded-full shadow-lg"
                title="Toggle Debug Console"
            >
                <i className="fas fa-bug"></i>
            </button>
            {isOpen && (
                <div className="fixed bottom-16 left-4 w-96 h-96 bg-gray-900 bg-opacity-90 text-white rounded-lg shadow-2xl z-50 flex flex-col">
                    <div className="p-2 border-b border-gray-700 flex justify-between items-center">
                        <h3 className="text-sm font-mono">Debug Console</h3>
                        <div>
                            <button onClick={() => setLogs([])} className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded mr-2">Clear</button>
                            <button onClick={() => setIsOpen(false)} className="text-xs bg-red-700 hover:bg-red-600 px-2 py-1 rounded">Close</button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
                        {logs.length === 0 ? (
                            <p className="text-gray-500">No logs yet</p>
                        ) : (
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
