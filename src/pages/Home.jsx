import React, { useContext } from "react";
import Hero from "../components/Hero";
import Instructor from "../components/Instructor";
import Technologies from "../components/Technologies";
import { toast } from "react-toastify";
import axios from "axios";
import { Context } from "../main";
import { Link, Navigate } from "react-router-dom";
import Footer from "../layout/Footer";

const Home = () => {
  const { isAuthenticated, setIsAuthenticated, setUser, user, isAdmin } = useContext(Context);

  const logout = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/v1/user/logout", {
        withCredentials: true,
      });
      toast.success(res.data.message);
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      toast.error(err.response.data.message);
      console.error(err);
    }
  };

  if (!isAuthenticated) return <Navigate to="/auth" />;

  return (
    <>
      <div className="relative bg-gray-50">
        <nav className="bg-white shadow-md py-4 fixed top-0 left-0 w-full z-50">
          <div className="flex justify-between items-center max-w-7xl mx-auto px-5">
            <Link to="/" className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              AI Chat Moderation System
            </Link>
            <div className="flex gap-5 items-center">
              <Link to="/chat" className="text-slate-700 font-medium hover:text-blue-600 transition-colors flex items-center">
                <i className="fas fa-comments mr-1.5"></i> <span className="hidden md:inline">Chat</span>
              </Link>

              {isAdmin && (
                <Link to="/admin" className="text-purple-600 font-medium hover:text-purple-700 transition-colors flex items-center bg-purple-50 py-1 px-2 rounded-md border border-purple-200">
                  <i className="fas fa-shield-alt mr-1.5"></i> <span className="md:inline">Admin</span>
                </Link>
              )}
              <Link to="/profile" className="text-slate-700 font-medium hover:text-blue-600 transition-colors flex items-center">
                <i className="fas fa-user-circle mr-1.5"></i> <span className="hidden md:inline">Profile</span>
              </Link>
              <div className="hidden md:block border-l pl-4 ml-2 border-gray-200">
                <span className="text-slate-700 font-medium">Welcome, {user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none py-2 px-4 md:px-5 rounded-lg font-medium cursor-pointer transition-all hover:shadow-md flex items-center gap-2"
              >
                <i className="fas fa-sign-out-alt"></i> <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </nav>
        <div className="pt-20">
          <Hero />
          <Instructor />
          <Technologies />
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Home;