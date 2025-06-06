import React, { useContext, useState } from "react";
import { Context } from "../main";
import { Navigate, Link } from "react-router-dom";
import Register from "../components/Register";
import Login from "../components/Login";
import LoadingScreen from "../components/LoadingScreen";
import axios from "axios";
import { toast } from "react-toastify";

// Auth page component for handling user authentication (login/register)
const Auth = () => {

  // Get authentication state and admin status from context
  const { isAuthenticated, isAdmin, isAuthLoading, setUser, setIsAuthenticated } = useContext(Context);

  // State to toggle between Login and Register forms
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // If user is authenticated and not loading, redirect to appropriate page
  if (isAuthenticated && !isAuthLoading) {
    return <Navigate to={isAdmin ? "/admin" : "/chat"} />;
  }

  // Show loading screen while authentication state is being determined
  if (isAuthLoading) return <LoadingScreen />;

  // Handle user login
  const handleLogin = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/user/login",
        data,
        { withCredentials: true }
      );

      // Set user status to online after successful login
      try {
        await axios.post(
          "http://localhost:4000/api/v1/user/status",
          { status: "online" },
          { withCredentials: true }
        );
      } catch (statusError) {
        console.error("Failed to update status:", statusError);
      }

      setUser(response.data.user);
      setIsAuthenticated(true);
      toast.success(response.data.message);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    }
    setLoading(false);
  };

  // Main UI rendering
  return (

    // Background container with gradient and floating blurred circles for visual effect
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-5 relative overflow-hidden">

      {/* Decorative blurred circles in the background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-float"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-float" style={{ animationDelay: "2s" }}></div>
        <div className="absolute bottom-10 left-1/4 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-float" style={{ animationDelay: "4s" }}></div>
      </div>

      {/* Glassmorphism effect card for the auth form */}
      <div className="glass-effect w-full max-w-md rounded-3xl shadow-xl backdrop-blur-xl z-10 overflow-hidden">
        <div className="p-8 md:p-10">

          {/* Toggle buttons for switching between Login and Register forms */}
          <div className="flex mb-10 bg-white/10 backdrop-blur-md rounded-xl relative overflow-hidden">
            <button
              className={`w-1/2 py-4 text-base border-none cursor-pointer transition-all duration-300 font-medium z-10 relative ${isLogin ? "text-black" : "text-slate-700"}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`w-1/2 py-4 text-base border-none cursor-pointer transition-all duration-300 font-medium z-10 relative ${!isLogin ? "text-black" : "text-slate-700"}`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>

            {/* Animated background indicator for active tab */}
            <div
              className={`absolute h-full w-1/2 top-0 z-0 transition-all duration-500 ease-out rounded-xl backdrop-blur-md bg-gradient-to-r from-indigo-600/90 to-violet-600/90 shadow-lg ${!isLogin ? "translate-x-full" : "translate-x-0"}`}
            ></div>
          </div>

          {/* Render Login or Register component based on state */}
          {isLogin ? <Login onLogin={handleLogin} loading={loading} /> : <Register />}

          {/* Link for administrator access */}
          <div className="mt-8 pt-6 border-t border-slate-700 text-center">
            <Link
              to="/admin/auth"
              className="text-black transition-colors text-sm flex items-center justify-center mx-auto group"
            >
              <span className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center mr-2 group-hover:bg-white/20 transition-all">
                <i className="fas fa-shield-alt"></i>
              </span>
              Administrator Access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;