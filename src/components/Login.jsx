import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const { setIsAuthenticated, setUser } = useContext(Context);
  const navigateTo = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleLogin = async (data) => {
    await axios
      .post("http://localhost:4000/api/v1/user/login", data, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        toast.success(res.data.message);
        setIsAuthenticated(true);
        setUser(res.data.user);
        navigateTo("/");
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  return (
    <div className="py-2.5">
      <form className="w-full" onSubmit={handleSubmit((data) => handleLogin(data))}>
        <h2 className="text-2xl font-semibold mb-2.5 text-slate-800">Welcome Back</h2>
        <p className="text-gray-500 mb-8 text-base">Sign in to continue to your account</p>

        <div className="mb-5 text-left">
          <label htmlFor="email" className="block mb-2 font-medium text-slate-700 text-sm">Email Address</label>
          <div className="relative">
            <i className="far fa-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              required
              {...register("email")}
              className="pl-12 pr-4 py-3 h-[50px] w-full border border-gray-300 rounded-lg text-base transition-all duration-300 bg-gray-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none focus:bg-white"
            />
          </div>
        </div>

        <div className="mb-5 text-left">
          <label htmlFor="password" className="block mb-2 font-medium text-slate-700 text-sm">Password</label>
          <div className="relative">
            <i className="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              required
              {...register("password")}
              className="pl-12 pr-4 py-3 h-[50px] w-full border border-gray-300 rounded-lg text-base transition-all duration-300 bg-gray-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none focus:bg-white"
            />
          </div>
        </div>

        <div className="text-right mb-5 text-sm">
          <Link to={"/password/forgot"} className="text-blue-600 font-medium hover:underline transition-colors hover:text-blue-700">
            Forgot your password?
          </Link>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none rounded-lg text-base cursor-pointer transition-all duration-300 flex justify-center items-center gap-2.5 font-medium mt-2.5 shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <span>Sign In</span>
          <i className="fas fa-arrow-right text-sm"></i>
        </button>

        <div className="mt-6 text-center">
          <p className="relative text-gray-500 my-4 before:content-[''] before:absolute before:top-1/2 before:left-0 before:w-[35%] before:h-px before:bg-gray-300 after:content-[''] after:absolute after:top-1/2 after:right-0 after:w-[35%] after:h-px after:bg-gray-300">
            Or continue with
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-100 transition-all hover:bg-gray-200 hover:-translate-y-1 cursor-pointer">
              <i className="fab fa-google text-xl text-slate-700"></i>
            </div>
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-100 transition-all hover:bg-gray-200 hover:-translate-y-1 cursor-pointer">
              <i className="fab fa-facebook-f text-xl text-slate-700"></i>
            </div>
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-100 transition-all hover:bg-gray-200 hover:-translate-y-1 cursor-pointer">
              <i className="fab fa-github text-xl text-slate-700"></i>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-300 text-gray-500 text-[0.95rem]">
          <p>Don't have an account? <span className="toggle-signup text-blue-600 font-medium cursor-pointer hover:underline">Sign up</span></p>
        </div>
      </form>
    </div>
  );
};

export default Login;