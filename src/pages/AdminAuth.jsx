import React, { useContext, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Context } from "../main";
import AdminLogin from "../components/admin/AdminLogin";
import AdminRegister from "../components/admin/AdminRegister";
import LoadingScreen from "../components/LoadingScreen";

const AdminAuth = () => {
    const { isAuthenticated, isAdmin, isAuthLoading } = useContext(Context);
    const [isLogin, setIsLogin] = useState(true);

    if (isAuthenticated && !isAuthLoading) {
        return <Navigate to={isAdmin ? "/admin" : "/chat"} />;
    }

    if (isAuthLoading) return <LoadingScreen />;

    return (
        <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-br from-purple-600 via-violet-500 to-indigo-500 p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-10 right-10 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-float"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-violet-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-float" style={{ animationDelay: "3s" }}></div>
                <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-float" style={{ animationDelay: "5s" }}></div>
            </div>
            <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 backdrop-blur-xl p-5 rounded-full">
                <div className="text-slate-900 text-4xl">
                    <i className="fas fa-shield-alt"></i>
                </div>
            </div>
            <div className="glass-effect w-full max-w-md rounded-3xl shadow-xl z-10 overflow-hidden mt-12">
                <div className="p-8 md:p-10">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-black tracking-wide">Admin Portal</h1>
                        <p className="text-black text-sm mt-2">Secure authentication for administrators</p>
                    </div>
                    <div className="flex mb-8 bg-white/10 backdrop-blur-md rounded-xl relative overflow-hidden">
                        <button
                            className={`w-1/2 py-4 text-base border-none cursor-pointer transition-all duration-300 font-medium z-10 relative ${isLogin ? "text-black" : "text-slate-700"}`}
                            onClick={() => setIsLogin(true)}
                        >
                            Admin Login
                        </button>
                        <button
                            className={`w-1/2 py-4 text-base border-none cursor-pointer transition-all duration-300 font-medium z-10 relative ${!isLogin ? "text-black" : "text-slate-700"}`}
                            onClick={() => setIsLogin(false)}
                        >
                            Admin Register
                        </button>
                        <div
                            className={`absolute h-full w-1/2 top-0 z-0 transition-all duration-500 ease-out rounded-xl backdrop-blur-sm bg-gradient-to-r from-purple-600/90 to-pink-600/90 shadow-lg ${!isLogin ? "translate-x-full" : "translate-x-0"}`}
                        ></div>
                    </div>
                    {isLogin ? <AdminLogin /> : <AdminRegister />}
                    <div className="mt-8 pt-6 border-t border-slate-700 text-center">
                        <Link
                            to="/auth"
                            className="text-black transition-colors text-sm flex items-center justify-center mx-auto group"
                        >
                            <span className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center mr-2 group-hover:bg-white/20 transition-all">
                                <i className="fas fa-user"></i>
                            </span>
                            Regular User Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAuth;
