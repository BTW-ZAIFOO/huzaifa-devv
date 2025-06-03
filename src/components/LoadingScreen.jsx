import React from 'react';

// LoadingScreen component displays a full-screen loading indicator with a spinner and message
const LoadingScreen = () => {
    return (

        // Outer container: centers content both vertically and horizontally, with a gradient background
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">

            {/* Inner card: semi-transparent, blurred background, rounded corners, and shadow */}
            <div className="text-center p-8 max-w-sm w-full bg-white/30 backdrop-blur-md rounded-xl shadow-xl">

                {/* Spinner container: centers the spinner horizontally */}
                <div className="flex justify-center">

                    {/* Spinner: animated spinning circle using Tailwind CSS classes */}
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
                </div>

                {/* Loading title */}
                <h2 className="mt-6 text-xl font-semibold text-white">Loading...</h2>

                {/* Loading description */}
                <p className="mt-2 text-white/80">Please wait while we set things up</p>
            </div>
        </div>
    );
};

export default LoadingScreen;
