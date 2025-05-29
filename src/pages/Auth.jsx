import React, { useContext, useState } from "react";
import { Context } from "../main";
import { Navigate, Link } from "react-router-dom";
import Register from "../components/Register";
import Login from "../components/Login";
import LoadingScreen from "../components/LoadingScreen";

const Auth = () => {
  const { isAuthenticated, isAdmin, isAuthLoading } = useContext(Context);
  const [isLogin, setIsLogin] = useState(true);

  if (isAuthenticated && !isAuthLoading) {
    return <Navigate to={isAdmin ? "/admin" : "/chat"} />;
  }

  if (isAuthLoading) return <LoadingScreen />;


  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-float"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-float" style={{ animationDelay: "2s" }}></div>
        <div className="absolute bottom-10 left-1/4 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-float" style={{ animationDelay: "4s" }}></div>
      </div>
      <div className="glass-effect w-full max-w-md rounded-3xl shadow-xl backdrop-blur-xl z-10 overflow-hidden">
        <div className="p-8 md:p-10">
          <div className="flex mb-10 bg-white/10 backdrop-blur-md rounded-xl relative overflow-hidden">
            <button
              className={`w-1/2 py-4 text-base border-none cursor-pointer transition-all duration-300 font-medium z-10 relative ${isLogin ? "text-white" : "text-white/70"}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`w-1/2 py-4 text-base border-none cursor-pointer transition-all duration-300 font-medium z-10 relative ${!isLogin ? "text-white" : "text-white/70"}`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
            <div
              className={`absolute h-full w-1/2 top-0 z-0 transition-all duration-500 ease-out rounded-xl backdrop-blur-md bg-gradient-to-r from-indigo-600/90 to-violet-600/90 shadow-lg ${!isLogin ? "translate-x-full" : "translate-x-0"}`}
            ></div>
          </div>
          {isLogin ? <Login /> : <Register />}
          <div className="mt-8 pt-6 border-t border-white/20 text-center">
            <Link
              to="/admin/auth"
              className="text-white/90 hover:text-white transition-colors text-sm flex items-center justify-center mx-auto group"
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