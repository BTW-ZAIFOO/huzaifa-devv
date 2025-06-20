import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Context } from "../../main";
import { getAvatarByRole } from "../../utils/avatarUtils";
import axios from "axios";
import { toast } from "react-toastify";

const UserSuggestion = ({ users = [] }) => {
  const { user: currentUser } = useContext(Context);
  const handleFollow = async (userId) => {
    try {
      await axios.post(
        `http://localhost:4000/api/v1/user/follow/${userId}`,
        {},
        { withCredentials: true }
      );

      if (currentUser?.following) {
        currentUser.following.push(userId);
      }

      if (window.io && window.io.connected) {
        try {
          window.io.emit("follow-user", {
            followerId: currentUser?._id,
            followedId: userId,
          });
        } catch (socketErr) {
          console.warn("Socket emit error:", socketErr);
        }
      }

      toast.success("User followed successfully");
    } catch (error) {
      console.error("Failed to follow user:", error);
      toast.error("Failed to follow user");
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No suggestions available</p>
      </div>
    );
  }

  return (
    <div
      className="space-y-4 animate-fade-in"
      style={{ animation: "fadeInUp 0.7s cubic-bezier(.4,0,.2,1)" }}
    >
      {users.map((user) => {
        const avatar = getAvatarByRole(user);
        const isFollowing = currentUser?.following?.includes(user._id);

        return (
          <div key={user._id} className="flex items-center justify-between">
            <Link to={`/profile/${user._id}`} className="flex items-center">
              <div className="mr-3">
                <div
                  className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center text-white text-sm font-semibold"
                  style={{ backgroundColor: avatar?.color || "#4f46e5" }}
                >
                  {avatar?.initials || user.name?.charAt(0) || "?"}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-800 hover:text-blue-600 transition-colors">
                  {user.name}
                </div>
                {user.bio && (
                  <p className="text-xs text-gray-500 truncate max-w-[180px]">
                    {user.bio}
                  </p>
                )}
              </div>
            </Link>
            <button
              onClick={() => handleFollow(user._id)}
              className={`ml-2 px-3 py-1 text-xs rounded-full ${
                isFollowing
                  ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        );
      })}

      <div className="pt-2">
        <Link
          to="/explore/users"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
        >
          See More <i className="fas fa-chevron-right ml-1 text-xs"></i>
        </Link>
      </div>
    </div>
  );
};

export default UserSuggestion;
