import React from "react";
import { Link } from "react-router-dom";
import { getAvatarUrl } from "../../utils/avatarUtils";

const UserProfileSidebar = ({ user }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-20">
      <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
      <div className="px-5 pb-5 relative">
        <div className="absolute -top-10">
          {getAvatarUrl(user) ? (
            <img
              src={getAvatarUrl(user)}
              alt={user?.name}
              className="w-20 h-20 rounded-full border-4 border-white object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://ui-avatars.com/api/?name=" + (user?.name || "User");
              }}
            />
          ) : (
            <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center text-white text-2xl bg-gray-400">
              {user?.name?.charAt(0) || "?"}
            </div>
          )}
        </div>
        <div className="pt-12">
          <h2 className="font-bold text-xl text-gray-800">{user?.name}</h2>
          <p className="text-gray-600 text-sm">{user?.email}</p>

          {user?.bio && <p className="mt-2 text-gray-700">{user.bio}</p>}
          <div className="flex justify-between mt-4 pt-3 border-t">
            <Link to="/profile/followers" className="text-center">
              <div className="font-bold text-gray-800">
                {user?.followers?.length || 0}
              </div>
              <div className="text-xs text-gray-500">Followers</div>
            </Link>
            <Link to="/profile/following" className="text-center">
              <div className="font-bold text-gray-800">
                {user?.following?.length || 0}
              </div>
              <div className="text-xs text-gray-500">Following</div>
            </Link>
            <Link to={`/profile/${user?._id}/posts`} className="text-center">
              <div className="font-bold text-gray-800">
                {user?.postCount || 0}
              </div>
              <div className="text-xs text-gray-500">Posts</div>
            </Link>
          </div>
          <div className="mt-4 flex flex-col space-y-2">
            <Link
              to="/profile"
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-lg text-center transition-colors"
            >
              <i className="far fa-user-circle mr-2"></i> View Profile
            </Link>
            <Link
              to="/profile/edit"
              className="bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-center transition-colors"
            >
              <i className="far fa-edit mr-2"></i> Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileSidebar;
