import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminRegister = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const handleAdminRegister = async (data) => {
        setIsLoading(true);
        try {
            const response = await axios.post(
                "http://localhost:4000/api/v1/user/register",
                {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    role: "admin",
                    verificationMethod: "email",
                },
                { withCredentials: true }
            );

            toast.success(response.data.message);
            navigate(`/otp-verification/${data.email}?role=admin`);
        }
        catch (error) {
            console.error("Registration failed");
            toast.error(error.response?.data?.message || "Registration failed");
        }
        finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="py-6 px-4 font-sans max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-black text-center">
                Admin Registration
            </h2>
            <form
                className="w-full border border-white/10"
                onSubmit={handleSubmit(handleAdminRegister)}
            >
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-black"
                        >
                            Full Name
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <i className="far fa-user text-purple-300"></i>
                            </div>
                            <input
                                id="name"
                                type="text"
                                placeholder="Enter your name"
                                {...register("name", {
                                    required: "Name is required",
                                    minLength: {
                                        value: 3,
                                        message: "Name must be at least 3 characters"
                                    }
                                })}
                                className="pl-11 pr-4 py-3 h-12 w-full bg-white border border-white/20 rounded-xl text-black transition-all focus:ring-2 focus:ring-pink-500 focus:border-transparent focus:outline-none font-normal text-base shadow-sm"
                            />
                        </div>
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-black"
                        >
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <i className="far fa-envelope text-purple-300"></i>
                            </div>
                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                                className="pl-11 pr-4 py-3 h-12 w-full bg-white border border-white/20 rounded-xl text-black transition-all focus:ring-2 focus:ring-pink-500 focus:border-transparent focus:outline-none font-normal text-base shadow-sm"
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
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
                                placeholder="Create a password"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters"
                                    }
                                })}
                                className="pl-11 pr-4 py-3 h-12 w-full bg-white border border-white/20 rounded-xl text-black transition-all focus:ring-2 focus:ring-pink-500 focus:border-transparent focus:outline-none font-normal text-base shadow-sm"
                            />
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none rounded-xl text-base font-medium cursor-pointer transition-all duration-300 shadow-lg hover:shadow-pink-500/30 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center"
                    >
                        {isLoading ? (
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
                                Creating Account...
                            </span>
                        ) : (
                            <>
                                <i className="fas fa-user-shield mr-2.5"></i>
                                Create Admin Account
                            </>
                        )}
                    </button>
                </div>
            </form>
            <div className="text-center mt-4 text-black text-sm">
                <p>All fields are required for admin creation</p>
            </div>
        </div>
    );
};

export default AdminRegister;
