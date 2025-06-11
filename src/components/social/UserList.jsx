import React from "react";
import { Link } from "react-router-dom";
import { getAvatarByRole } from "../../utils/avatarUtils";
import axios from "axios";
import { toast } from "react-toastify";

const UserList = ({
  users,
  title,
  emptyMessage,
  currentUser,
  onFollowChange,
}) => {
  const handleFollow = async (userId, isFollowing) => {
    try {
      const endpoint = isFollowing
        ? `http://localhost:4000/api/v1/user/unfollow/${userId}`
        : `http://localhost:4000/api/v1/user/follow/${userId}`;

      const res = await axios.post(endpoint, {}, { withCredentials: true });

      toast.success(res.data.message);

      if (onFollowChange) {
        onFollowChange(userId, !isFollowing);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  if (!users || users.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
        <h3 className="text-lg font-medium text-gray-800 mb-4">{title}</h3>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <h3 className="text-lg font-medium text-gray-800 p-4 border-b">
        {title}
      </h3>
      <ul className="divide-y divide-gray-200">
        {users.map((user) => {
          const avatar = getAvatarByRole(user);
          const isCurrentUser = user._id === currentUser?._id;
          const isFollowing = currentUser?.following?.includes(user._id);

          return (
            <li
              key={user._id}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <Link to={`/profile/${user._id}`} className="flex items-center">
                  {avatar.imageUrl ? (
                    <img
                      src={avatar.imageUrl}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-white"
                      style={{ backgroundColor: avatar.color }}
                    >
                      {user.name?.charAt(0)}
                    </div>
                  )}
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-800">{user.name}</h4>
                    {user.bio && (
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </Link>

                {!isCurrentUser && (
                  <button
                    onClick={() => handleFollow(user._id, isFollowing)}
                    className={`${
                      isFollowing
                        ? "bg-gray-100 hover:bg-gray-200 text-gray-800"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    } px-3 py-1 rounded-full text-sm transition-colors`}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default UserList;
