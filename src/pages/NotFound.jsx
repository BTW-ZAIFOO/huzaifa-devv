import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 md:p-10 rounded-xl shadow-md max-w-md w-full text-center">
        <div className="text-7xl text-indigo-500 mb-6">
          <i className="fas fa-map-signs"></i>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-4">
          <Link
            to="/chat"
            className="block w-full py-3 px-6 text-lg text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition duration-200"
          >
            Go to Chat
          </Link>
          <Link
            to="/"
            className="block w-full py-3 px-6 text-lg text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition duration-200"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
