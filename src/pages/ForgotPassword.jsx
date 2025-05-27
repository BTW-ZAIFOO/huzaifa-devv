import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    await axios
      .post(
        "http://localhost:4000/api/v1/user/password/forgot",
        { email },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        toast.success(res.data.message);
        setIsLoading(false);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
        setIsLoading(false);
      });
  };

  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-600 to-indigo-600 p-5">
        <div className="bg-white/95 p-10 rounded-2xl shadow-xl max-w-md w-full text-center relative overflow-hidden">
          <div className="before:absolute before:top-0 before:left-0 before:w-full before:h-[5px] before:bg-gradient-to-r before:from-blue-600 before:to-purple-600">
            <h2 className="text-2xl font-semibold mb-4 text-slate-800">
              Forgot Password
            </h2>
            <p className="text-base text-gray-500 mb-8 leading-relaxed">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
            <form onSubmit={handleForgotPassword}>
              <div className="relative mb-6">
                <i className="far fa-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-12 pr-4 py-3.5 w-full border border-gray-300 rounded-lg text-base transition-all duration-300 bg-gray-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none focus:bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none rounded-lg text-base cursor-pointer transition-all duration-300 font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fas fa-spinner animate-spin"></i> Sending...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
            <div className="mt-6 text-gray-500 text-[0.95rem]">
              <p>
                Remembered your password?{" "}
                <Link
                  to="/auth"
                  className="text-blue-600 font-medium hover:underline"
                >
                  Back to login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;