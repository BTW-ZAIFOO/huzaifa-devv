import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { Context } from "../main";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Register = () => {
  const { isAuthenticated } = useContext(Context);
  const navigateTo = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleRegister = async (data) => {
    data.phone = `+92${data.phone}`;
    await axios
      .post("http://localhost:4000/api/v1/user/register", data, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => {
        toast.success(res.data.message);
        navigateTo(`/otp-verification/${data.email}/${data.phone}`);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  return (
    <div className="py-2.5">
      <form
        className="w-full"
        onSubmit={handleSubmit((data) => handleRegister(data))}
      >
        <h2 className="text-2xl font-semibold mb-2.5 text-slate-800">
          Create Account
        </h2>
        <p className="text-gray-500 mb-8 text-base">Sign up to get started</p>

        <div className="mb-5 text-left">
          <label
            htmlFor="name"
            className="block mb-2 font-medium text-slate-700 text-sm"
          >
            Full Name
          </label>
          <div className="relative">
            <i className="far fa-user absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              required
              {...register("name")}
              className="pl-12 pr-4 py-3 h-[50px] w-full border border-gray-300 rounded-lg text-base transition-all duration-300 bg-gray-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none focus:bg-white"
            />
          </div>
        </div>

        <div className="mb-5 text-left">
          <label
            htmlFor="register-email"
            className="block mb-2 font-medium text-slate-700 text-sm"
          >
            Email Address
          </label>
          <div className="relative">
            <i className="far fa-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
            <input
              id="register-email"
              type="email"
              placeholder="Enter your email"
              required
              {...register("email")}
              className="pl-12 pr-4 py-3 h-[50px] w-full border border-gray-300 rounded-lg text-base transition-all duration-300 bg-gray-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none focus:bg-white"
            />
          </div>
        </div>

        <div className="mb-5 text-left">
          <label
            htmlFor="phone"
            className="block mb-2 font-medium text-slate-700 text-sm"
          >
            Phone Number
          </label>
          <div className="relative">
            <span className="absolute left-0 top-0 h-[47px] w-[50px] border-r border-gray-300 text-gray-500 flex justify-center items-center font-medium bg-gray-50/80 rounded-l-lg">
              +92
            </span>
            <input
              id="phone"
              type="number"
              placeholder="Phone number"
              required
              {...register("phone")}
              className="pl-16 pr-4 py-3 h-[50px] w-full border border-gray-300 rounded-lg text-base transition-all duration-300 bg-gray-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none focus:bg-white"
            />
          </div>
        </div>

        <div className="mb-5 text-left">
          <label
            htmlFor="register-password"
            className="block mb-2 font-medium text-slate-700 text-sm"
          >
            Password
          </label>
          <div className="relative">
            <i className="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
            <input
              id="register-password"
              type="password"
              placeholder="Create a password"
              required
              {...register("password")}
              className="pl-12 pr-4 py-3 h-[50px] w-full border border-gray-300 rounded-lg text-base transition-all duration-300 bg-gray-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none focus:bg-white"
            />
          </div>
        </div>

        <div className="mb-5">
          <p className="font-medium text-slate-700 text-left mb-2.5">
            Select Verification Method
          </p>
          <div className="flex gap-8">
            <label className="flex items-center gap-2.5 cursor-pointer my-4 font-medium text-gray-500">
              <input
                type="radio"
                name="verificationMethod"
                value="email"
                {...register("verificationMethod")}
                required
                className="w-[18px] h-[18px] accent-blue-600 mb-0"
              />
              Email
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer my-4 font-medium text-gray-500">
              <input
                type="radio"
                name="verificationMethod"
                value="phone"
                {...register("verificationMethod")}
                required
                className="w-[18px] h-[18px] accent-blue-600 mb-0"
              />
              Phone
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none rounded-lg text-base cursor-pointer transition-all duration-300 font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          Create Account
        </button>
      </form>
    </div>
  );
};

export default Register;