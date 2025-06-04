import React, { useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { Context } from "../main";
import { Link, Navigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import { getAvatarByRole } from "../utils/avatarUtils";

// Home component: Main landing page after authentication
const Home = () => {

  // Destructure context values for authentication and user info
  const { isAuthenticated, setIsAuthenticated, setUser, user, isAdmin, isAuthLoading } = useContext(Context);

  // Logout function: Calls backend to logout, updates context, and shows toast
  const logout = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/v1/user/logout", {
        withCredentials: true,
      });
      toast.success(res.data.message); // Show success message
      setUser(null); // Clear user info
      setIsAuthenticated(false); // Set authentication to false
    }
    catch (err) {
      toast.error(err.response.data.message); // Show error message
    }
  };

  // Show loading screen while authentication status is being determined
  if (isAuthLoading) return <LoadingScreen />;

  // Redirect to auth page if not authenticated
  if (!isAuthLoading && !isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  // Main UI rendering
  return (
    <>

      {/* Background wrapper */}
      <div className="relative bg-gray-50">

        {/* Navigation bar */}
        <nav className="bg-white shadow-md py-4 fixed top-0 left-0 w-full z-50">
          <div className="flex justify-between items-center max-w-7xl mx-auto px-5">

            {/* Logo/Brand */}
            <Link to="/" className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              AI Chat Moderation System
            </Link>

            {/* Navigation links and user info */}
            <div className="flex gap-5 items-center">

              {/* Chat link */}
              <Link to="/chat" className="text-slate-700 font-medium hover:text-blue-600 transition-colors flex items-center">
                <i className="fas fa-comments mr-1.5"></i> <span className="hidden md:inline">Chat</span>
              </Link>

              {/* Admin link (visible only to admins) */}
              {isAdmin && (
                <Link to="/admin" className="text-purple-600 font-medium hover:text-purple-700 transition-colors flex items-center bg-purple-50 py-1 px-2 rounded-md border border-purple-200">
                  <i className="fas fa-shield-alt mr-1.5"></i> <span className="md:inline">Admin</span>
                </Link>
              )}

              {/* Profile link */}
              <Link to="/profile" className="text-slate-700 font-medium hover:text-blue-600 transition-colors flex items-center">
                <i className="fas fa-user-circle mr-1.5"></i> <span className="hidden md:inline">Profile</span>
              </Link>

              {/* User avatar and welcome message (visible on md+ screens) */}
              <div className="hidden md:block border-l pl-4 ml-2 border-gray-200">
                <div className="flex items-center">

                  {/* Display avatar based on user role */}
                  {(() => {
                    const avatar = getAvatarByRole(user);
                    return avatar?.imageUrl ? (

                      // If avatar image exists, show image
                      <img
                        src={avatar.imageUrl}
                        alt={user?.name}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                    ) : (

                      // Otherwise, show colored initials
                      <div
                        className="w-8 h-8 rounded-full mr-2 flex items-center justify-center text-white text-sm"
                        style={{ backgroundColor: avatar?.color || "#4f46e5" }}
                      >
                        {avatar?.initials || user?.name?.charAt(0) || "?"}
                      </div>
                    );
                  })}

                  {/* Welcome message with user name */}
                  <span className="text-slate-700 font-medium">Welcome, {user?.name}</span>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none py-2 px-4 md:px-5 rounded-lg font-medium cursor-pointer transition-all hover:shadow-md flex items-center gap-2"
              >
                <i className="fas fa-sign-out-alt"></i> <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Home;