import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../../main";
import { useNavigate, Link } from "react-router-dom";

const AdminLogin = () => {
  const { setIsAuthenticated, setUser } = useContext(Context);
  const navigateTo = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const handleAdminLogin = async (data) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/user/login",
        data,
        { withCredentials: true }
      );
      if (response.data.user.role === "admin") {
        setUser(response.data.user);
        setIsAuthenticated(true);
        state;
        console.log("Admin login successfull:", response.data.user);
        toast.success("Admin login successfull!");
        navigateTo("/admin");
        dashboard;
      } else {
        console.error("This account doesn't have admin privileges");
        toast.error("This account doesn't have admin privileges");
      }
    } catch (error) {
      console.error("Invalid credentials:", error);
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const LoadingSpinner = () => (
    <span className="flex items-center justify-center gap-2.5">
      <svg
        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
      Authenticating...
    </span>
  );

  return (
    <div className="py-6 px-4 font-sans max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-black text-center">
        Admin Login
      </h2>
      <form
        className="w-full border border-white/10"
        onSubmit={handleSubmit(handleAdminLogin)}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-black"
            >
              Admin Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <i className="far fa-envelope text-purple-300"></i>
              </div>
              <input
                id="email"
                type="email"
                placeholder="Enter admin email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className="pl-11 pr-4 py-3 h-12 w-full bg-white border border-white/20 rounded-xl text-black transition-all focus:ring-2 focus:ring-pink-500 focus:border-transparent focus:outline-none font-normal text-base shadow-sm"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
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
                <i className="fas fa-lock text-purple-300"></i>
              </div>
              <input
                id="password"
                type="password"
                placeholder="Enter admin password"
                {...register("password", { required: "Password is required" })}
                className="pl-11 pr-4 py-3 h-12 w-full bg-white border border-white/20 rounded-xl text-black transition-all focus:ring-2 focus:ring-pink-500 focus:border-transparent focus:outline-none font-normal text-base shadow-sm"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="text-right text-sm">
            <Link
              to="/password/forgot"
              className="text-pink-300 hover:text-black transition-colors font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none rounded-xl text-base font-medium cursor-pointer transition-all duration-300 shadow-lg hover:shadow-pink-500/30 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center"
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <i className="fas fa-shield-alt mr-2.5"></i>
                Admin Sign In
              </>
            )}
          </button>
        </div>
        <div className="mt-6 text-black text-center">
          <p className="font-normal text-sm">
            Admin access only. For moderation and system management.
            <br />
            <span className="text-xs mt-1.5 block opacity-80">
              With full message moderation and user ban capabilities
            </span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default AdminLogin;
