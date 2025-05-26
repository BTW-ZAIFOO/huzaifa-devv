import React, { useContext } from "react";
import { Context } from "../main";
import { Link } from "react-router-dom";

const Hero = () => {
  const { user } = useContext(Context);

  return (
    <div className="min-h-[70vh] flex justify-center items-center flex-col gap-8 w-full text-center p-16 bg-gradient-to-r from-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute w-[300px] h-[300px] rounded-full bg-gradient-radial from-blue-200/20 to-blue-100/5 -top-[100px] -left-[100px] z-0"></div>
      <div className="absolute w-[300px] h-[300px] rounded-full bg-gradient-radial from-indigo-200/20 to-indigo-100/5 -bottom-[100px] -right-[100px] z-0"></div>
      <div className="relative z-10">
        <span className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-5">
          AI-Powered Chat Platform
        </span>
        <h1 className="text-5xl font-bold mb-5 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
          AI Chat Moderation System
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto text-center leading-relaxed mb-8">
          A powerful platform that uses artificial intelligence to moderate
          and enhance chat experiences, ensuring safe and productive conversations.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/chat"
            className="py-3 px-6 rounded-xl font-medium text-base transition-all flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700 hover:-translate-y-1 hover:shadow-lg"
          >
            <i className="fas fa-comments"></i> Start Chatting
          </Link>
          <a
            href="#features"
            className="py-3 px-6 rounded-xl font-medium text-base transition-all flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg"
          >
            <i className="fas fa-rocket"></i> Explore Features
          </a>
          <a
            href="#technologies"
            className="py-3 px-6 rounded-xl font-medium text-base transition-all flex items-center gap-2 bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white hover:-translate-y-1 hover:shadow-lg"
          >
            <i className="fas fa-code"></i> Learn More
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hero;