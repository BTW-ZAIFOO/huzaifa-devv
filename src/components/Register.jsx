import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Register = () => {
  const navigateTo = useNavigate();
  const { register, handleSubmit } = useForm();

  const handleRegister = async (data) => {
    try {
      const response = await axios.post("http://localhost:4000/api/v1/user/register", data, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      toast.success(response.data.message);
      navigateTo(`/otp-verification/${data.email}?role=user`);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <div className="py-4 font-sans">
      <form className="w-full" onSubmit={handleSubmit(handleRegister)}>
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-white">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <i className="far fa-user text-indigo-300"></i>
              </div>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                required
                {...register("name")}
                className="pl-11 pr-4 py-3 h-12 w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white/20 focus:outline-none font-normal text-base shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="register-email" className="block text-sm font-medium text-white">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <i className="far fa-envelope text-indigo-300"></i>
              </div>
              <input
                id="register-email"
                type="email"
                placeholder="Enter your email"
                required
                {...register("email")}
                className="pl-11 pr-4 py-3 h-12 w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white/20 focus:outline-none font-normal text-base shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="register-password" className="block text-sm font-medium text-white">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <i className="fas fa-lock text-indigo-300"></i>
              </div>
              <input
                id="register-password"
                type="password"
                placeholder="Create a password"
                required
                {...register("password")}
                className="pl-11 pr-4 py-3 h-12 w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white/20 focus:outline-none font-normal text-base shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-white">
              Select Verification Method
            </p>
            <div className="mt-2 bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/20">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="verificationMethod"
                  value="email"
                  {...register("verificationMethod")}
                  required
                  className="h-5 w-5 accent-indigo-500"
                />
                <div>
                  <span className="text-white font-medium">Email Verification</span>
                  <p className="text-white/70 text-xs mt-0.5 font-normal">We'll send a verification code to your email</p>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-none rounded-xl text-base font-medium cursor-pointer transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 flex items-center justify-center"
          >
            <i className="fas fa-user-plus mr-2.5"></i>
            Create Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;