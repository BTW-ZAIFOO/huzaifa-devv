import React, { useContext, useState, useEffect } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import Register from "../components/Register";
import Login from "../components/Login";

const Auth = () => {
  const { isAuthenticated } = useContext(Context);
  const [isLogin, setIsLogin] = useState(true);

  // Add event listener for toggle signup link in the login form
  useEffect(() => {
    const toggleSignup = document.querySelector(".toggle-signup");
    if (toggleSignup) {
      const handleToggle = () => setIsLogin(false);
      toggleSignup.addEventListener("click", handleToggle);

      return () => {
        toggleSignup.removeEventListener("click", handleToggle);
      };
    }
  }, [isLogin]);

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-600 to-indigo-600 p-5">
      <div className="bg-white/95 p-10 rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden">
        <div className="before:absolute before:top-0 before:left-0 before:w-full before:h-[5px] before:bg-gradient-to-r before:from-blue-600 before:to-purple-600">
          <div className="flex mb-8 bg-gray-100 rounded-lg relative overflow-hidden">
            <button
              className={`w-1/2 py-3.5 text-base border-none cursor-pointer transition-all font-medium z-10 relative ${isLogin ? "text-white" : "text-gray-500"
                }`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`w-1/2 py-3.5 text-base border-none cursor-pointer transition-all font-medium z-10 relative ${!isLogin ? "text-white" : "text-gray-500"
                }`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
            <div
              className={`absolute h-full w-1/2 top-0 z-0 transition-all duration-300 ease-in-out bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg ${!isLogin ? "left-1/2" : "left-0"
                }`}
            ></div>
          </div>
          {isLogin ? <Login /> : <Register />}
        </div>
      </div>
    </div>
  );
};

export default Auth;