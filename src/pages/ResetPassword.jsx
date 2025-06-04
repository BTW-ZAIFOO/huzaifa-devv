import React, { useContext, useState } from "react";
import axios from "axios";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main";

// ResetPassword component handles the password reset process
const ResetPassword = () => {

  // Access authentication state and user context
  const { isAuthenticated, setIsAuthenticated, user, setUser } = useContext(Context);

  // Get the reset token from the URL parameters
  const { token } = useParams();

  // State for new password and confirmation fields
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State to manage loading indicator during API call
  const [isLoading, setIsLoading] = useState(false);

  // Handles the password reset form submission
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {

      // Send PUT request to reset password endpoint with new password data
      const res = await axios.put(
        `https://huzaifa-devv-production.up.railway.app/api/v1/user/password/reset/${token}`,
        { password, confirmPassword },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      // Show success message and update authentication state
      toast.success(res.data.message);
      setIsAuthenticated(true);
      setUser(res.data.user);

      // Redirect user based on their role after successful reset
      window.location.href = res.data.user.role === "admin" ? "/admin" : "/chat";
    }
    catch (error) {

      // Show error message if reset fails
      toast.error(error.response.data.message);
    }
    finally {
      setIsLoading(false);
    }
  };

  // If already authenticated, redirect user to appropriate dashboard
  if (isAuthenticated) {
    return <Navigate to={user?.role === "admin" ? "/admin" : "/chat"} />;
  }

  // Render the password reset form UI
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-600 to-indigo-600 p-5 font-sans">
      <div className="bg-white/95 p-10 rounded-2xl shadow-xl max-w-md w-full text-center relative overflow-hidden">

        {/* Decorative gradient bar at the top */}
        <div className="before:absolute before:top-0 before:left-0 before:w-full before:h-[5px] before:bg-gradient-to-r before:from-blue-600 before:to-purple-600">
          <h2 className="text-2xl font-semibold mb-4 text-slate-800">
            Reset Password
          </h2>
          <p className="text-base text-gray-600 mb-8 font-normal">
            Enter your new password below.
          </p>

          {/* Password reset form */}
          <form onSubmit={handleResetPassword}>

            {/* New password input */}
            <div className="relative mb-5">
              <i className="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-12 pr-4 py-3.5 w-full border border-gray-300 rounded-lg text-black transition-all duration-300 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none font-normal shadow-sm"
              />
            </div>

            {/* Confirm new password input */}
            <div className="relative mb-7">
              <i className="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pl-12 pr-4 py-3.5 w-full border border-gray-300 rounded-lg text-black transition-all duration-300 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none font-normal shadow-sm"
              />
            </div>

            {/* Submit button with loading indicator */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none rounded-lg text-base cursor-pointer transition-all duration-300 font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-spinner animate-spin"></i> Resetting...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;