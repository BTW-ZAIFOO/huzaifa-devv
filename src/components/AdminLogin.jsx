import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import { useNavigate } from "react-router-dom";

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
                "http://localhost:4000/api/v1/user/admin/login",
                data,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            setUser({
                ...response.data.user,
                role: "admin"
            });
            setIsAuthenticated(true);
            toast.success("Admin login successful!");

            navigateTo("/admin");
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid admin credentials");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="py-2.5">
            <form className="w-full" onSubmit={handleSubmit(handleAdminLogin)}>
                <h2 className="text-2xl font-semibold mb-2.5 text-slate-800">Admin Login</h2>
                <p className="text-gray-500 mb-8 text-base">Sign in to access admin controls</p>

                <div className="mb-5 text-left">
                    <label htmlFor="admin-email" className="block mb-2 font-medium text-slate-700 text-sm">Admin Email</label>
                    <div className="relative">
                        <i className="far fa-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                        <input
                            id="admin-email"
                            type="email"
                            placeholder="Enter admin email"
                            required
                            {...register("email")}
                            className="pl-12 pr-4 py-3 h-[50px] w-full border border-gray-300 rounded-lg text-base transition-all duration-300 bg-gray-50 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none focus:bg-white"
                        />
                    </div>
                </div>

                <div className="mb-5 text-left">
                    <label htmlFor="admin-password" className="block mb-2 font-medium text-slate-700 text-sm">Admin Password</label>
                    <div className="relative">
                        <i className="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                        <input
                            id="admin-password"
                            type="password"
                            placeholder="Enter admin password"
                            required
                            {...register("password")}
                            className="pl-12 pr-4 py-3 h-[50px] w-full border border-gray-300 rounded-lg text-base transition-all duration-300 bg-gray-50 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none focus:bg-white"
                        />
                    </div>
                </div>

                <div className="text-right mb-5 text-sm">
                    <button type="button" onClick={() => navigateTo("/auth")} className="text-purple-600 font-medium hover:underline transition-colors hover:text-purple-700">
                        Back to regular login
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-none rounded-lg text-base cursor-pointer transition-all duration-300 flex justify-center items-center gap-2.5 font-medium mt-2.5 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                    {isLoading ? (
                        <>
                            <i className="fas fa-spinner animate-spin"></i>
                            <span>Signing in...</span>
                        </>
                    ) : (
                        <>
                            <span>Admin Sign In</span>
                            <i className="fas fa-shield-alt"></i>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default AdminLogin;
