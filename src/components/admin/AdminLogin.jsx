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
                { ...data },
                { withCredentials: true }
            );
            
            if (response.data.user.role === "admin") {
                setUser(response.data.user);
                setIsAuthenticated(true);
                toast.success("Admin login successful!");
                navigateTo("/admin"); // Direct redirect to admin dashboard
            } else {
                toast.error("This account doesn't have admin privileges");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid credentials");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="py-2.5">
            <form className="w-full" onSubmit={handleSubmit(handleAdminLogin)}>
                <div className="space-y-6">
                    <div className="space-y-1.5">
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-white"
                        >
                            Admin Email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i className="far fa-envelope text-purple-300"></i>
                            </div>
                            <input
                                id="email"
                                type="email"
                                placeholder="Enter admin email"
                                required
                                {...register("email")}
                                className="pl-10 pr-4 py-3 h-12 w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white transition-all focus:ring-2 focus:ring-pink-500 focus:border-transparent focus:bg-white/20 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-white"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i className="fas fa-lock text-purple-300"></i>
                            </div>
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter admin password"
                                required
                                {...register("password")}
                                className="pl-10 pr-4 py-3 h-12 w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white transition-all focus:ring-2 focus:ring-pink-500 focus:border-transparent focus:bg-white/20 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="text-right text-sm">
                        <Link
                            to="/password/forgot"
                            className="text-pink-300 hover:text-white transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none rounded-xl text-base font-medium cursor-pointer transition-all duration-300 shadow-lg hover:shadow-pink-500/30 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
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
                            </>
                        ) : (
                            <>
                                <i className="fas fa-shield-alt mr-2"></i>
                                Admin Sign In
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-8 text-white/70 text-center">
                    <p>
                        Don't have an admin account?{" "}
                        <span className="toggle-signup text-pink-300 font-medium cursor-pointer hover:text-white transition-colors">
                            Create one
                        </span>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default AdminLogin;
