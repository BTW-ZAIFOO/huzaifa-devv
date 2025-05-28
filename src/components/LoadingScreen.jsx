import React from 'react';

const LoadingScreen = () => {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
            <div className="text-center p-8 max-w-sm w-full bg-white/30 backdrop-blur-md rounded-xl shadow-xl">
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
                </div>
                <h2 className="mt-6 text-xl font-semibold text-white">Loading...</h2>
                <p className="mt-2 text-white/80">Please wait while we set things up</p>
            </div>
        </div>
    );
};

export default LoadingScreen;
