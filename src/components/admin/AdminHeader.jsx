import React from "react";
import { Link } from "react-router-dom";
import { getAvatarUrl } from "../../utils/avatarUtils";

const AdminHeader = ({ user, onLogout }) => {
  const avatarUrl = getAvatarUrl(user);

  return (
    <div className="bg-purple-900 text-white shadow-md py-4 px-6 flex justify-between items-center">
      <Link to="/admin" className="text-xl font-bold flex items-center">
        <i className="fas fa-shield-alt mr-2"></i> Admin Dashboard
      </Link>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={user?.name || "Admin"}
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://ui-avatars.com/api/?name=" + (user?.name || "Admin");
              }}
            />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm bg-gray-400">
              {user?.name?.charAt(0) || "A"}
            </div>
          )}
          <span>{user?.name || "Admin"}</span>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="bg-purple-800 hover:bg-purple-700 px-3 py-1 rounded text-sm"
          >
            <i className="fas fa-sign-out-alt mr-1"></i> Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminHeader;
