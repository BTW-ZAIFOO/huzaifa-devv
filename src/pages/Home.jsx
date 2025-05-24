import React, { useContext } from "react";
import Hero from "../components/Hero";
import Instructor from "../components/Instructor";
import Technologies from "../components/Technologies";
import { toast } from "react-toastify";
import axios from "axios";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import Footer from "../layout/Footer";

const Home = () => {
  const { isAuthenticated, setIsAuthenticated, setUser, user } = useContext(Context);

  const logout = async () => {
    await axios
      .get("http://localhost:4000/api/v1/user/logout", {
        withCredentials: true,
      })
      .then((res) => {
        toast.success(res.data.message);
        setUser(null);
        setIsAuthenticated(false);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        console.error(err);
      });
  };

  if (!isAuthenticated) {
    return <Navigate to={"/auth"} />;
  }

  return (
    <div className="relative bg-gray-50">
      <nav className="bg-white shadow-sm py-4 fixed top-0 left-0 w-full z-50">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-5">
          <a href="/" className="text-2xl font-semibold text-blue-600">AI Chat Moderation</a>
          <div className="flex gap-5 items-center">
            <span className="text-slate-700 font-medium">Welcome, {user?.name}</span>
            <button
              onClick={logout}
              className="bg-blue-600 text-white border-none py-2.5 px-5 rounded-lg font-medium cursor-pointer transition-all hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-md flex items-center gap-2"
            >
              <i className="fas fa-sign-out-alt"></i> Logout
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
  );
};

export default Home;