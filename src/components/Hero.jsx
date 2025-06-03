import React from "react";
import { Link } from "react-router-dom";

// Hero component displays the main landing section with call-to-action buttons
const Hero = () => {

  // Base classes for all buttons to ensure consistent styling and hover effects
  const buttonBaseClass =
    "py-3 px-6 rounded-xl font-medium text-base transition-all flex items-center gap-2 hover:-translate-y-1 hover:shadow-lg";

  return (

    // Main container with gradient background and center alignment
    <div className="min-h-[70vh] flex justify-center items-center flex-col gap-8 w-full text-center p-16 bg-gradient-to-r from-blue-50 to-indigo-50 relative overflow-hidden">

      {/* Decorative radial gradient circle at the top-left */}
      <div className="absolute w-[300px] h-[300px] rounded-full bg-gradient-radial from-blue-200/20 to-blue-100/5 -top-[100px] -left-[100px] z-0"></div>

      {/* Decorative radial gradient circle at the bottom-right */}
      <div className="absolute w-[300px] h-[300px] rounded-full bg-gradient-radial from-indigo-200/20 to-indigo-100/5 -bottom-[100px] -right-[100px] z-0"></div>

      {/* Content container with higher z-index to appear above decorations */}
      <div className="relative z-10">

        {/* Tagline badge */}
        <span className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-5">
          AI-Powered Chat Platform
        </span>

        {/* Main heading with gradient text */}
        <h1 className="text-5xl font-bold mb-5 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
          AI Chat Moderation System
        </h1>

        {/* Description paragraph */}
        <p className="text-xl text-gray-600 max-w-3xl mx-auto text-center leading-relaxed mb-8">
          A powerful platform that uses artificial intelligence to moderate and
          enhance chat experiences, ensuring safe and productive conversations.
        </p>

        {/* Action buttons section */}
        <div className="flex gap-4 justify-center">

          {/* Button to navigate to chat page */}
          <Link
            to="/chat"
            className={`${buttonBaseClass} bg-purple-600 text-white hover:bg-purple-700`}
          >
            <i className="fas fa-comments"></i> Start Chatting
          </Link>

          {/* Button to scroll to features section */}
          <a
            href="#features"
            className={`${buttonBaseClass} bg-blue-600 text-white hover:bg-blue-700`}
          >
            <i className="fas fa-rocket"></i> Explore Features
          </a>

          {/* Button to scroll to technologies section */}
          <a
            href="#technologies"
            className={`${buttonBaseClass} bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white`}
          >
            <i className="fas fa-code"></i> Learn More
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hero;