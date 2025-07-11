import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const { setIsAuthenticated, setUser } = useContext(Context);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit } = useForm();
  const navigateTo = useNavigate();

  const handleLogin = async (data) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/user/login",
        data,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      try {
        await axios.post(
          "http://localhost:4000/api/v1/user/status",
          { status: "online" },
          { withCredentials: true }
        );
      } catch (statusErr) {
        console.error("Failed to update status", statusErr);
      }
      setUser(response.data.user);
      setIsAuthenticated(true);
      try {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      } catch (err) {}
      console.log("Login successful");
      toast.success("Login successful!");
      navigateTo(response.data.user?.role === "admin" ? "/admin" : "/chat");
    } catch (error) {
      console.error("Login failed");
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-6 px-4 font-sans max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-black text-center">
        Welcome Back
      </h2>
      <form
        className="w-full bg-none border border-white/10"
        onSubmit={handleSubmit(handleLogin)}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-black"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <i className="far fa-envelope text-indigo-300"></i>
              </div>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                required
                {...register("email")}
                className="pl-11 pr-4 py-3 h-12 w-full bg-white border border-white/20 rounded-xl text-black transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none font-normal text-base shadow-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-black"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <i className="fas fa-lock text-indigo-300"></i>
              </div>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                required
                {...register("password")}
                className="pl-11 pr-4 py-3 h-12 w-full bg-white border border-white/20 rounded-xl text-black transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none font-normal text-base shadow-sm"
              />
            </div>
          </div>
          <div className="text-right text-sm">
            <Link
              to="/password/forgot"
              className="text-indigo-300 hover:text-black transition-colors font-medium"
            >
              Forgot your password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-none rounded-xl text-base font-medium cursor-pointer transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2.5 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <i className="fas fa-arrow-right text-sm ml-2.5"></i>
              </>
            )}
          </button>
        </div>
        <div className="mt-6 text-white/80 text-center font-normal">
          <p className="text-sm text-black">
            Don't have an account?{" "}
            <span className="toggle-signup text-indigo-300 font-medium cursor-pointer hover:text-black">
              Sign up
            </span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
