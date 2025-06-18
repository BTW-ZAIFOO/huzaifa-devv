import React from "react";
import { getAvatarByRole } from "../../utils/avatarUtils";

const GroupProfileSidebar = ({ group, onClose, onViewUserProfile }) => {
  if (!group) {
    return null;
  }
  const participants = group.participants || [];
  if (!Array.isArray(participants)) {
    return null;
  }

  return (
    <div className="w-[300px] bg-white border-l border-gray-200 shadow-lg absolute right-0 top-0 bottom-0 z-20 transform transition-transform duration-300 overflow-y-auto">
      <div className="p-5">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-semibold">Group Info</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl mb-4 shadow-md">
            <i className="fas fa-users"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            {group.groupName || group.name || "Group Chat"}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {group.createdAt
              ? `Created ${new Date(group.createdAt).toLocaleDateString()}`
              : "Group Chat"}
          </p>
        </div>
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Members ({participants.length})
          </h4>
          <div className="space-y-3">
            {participants.length > 0 ? (
              participants.map((member) => {
                const avatar = getAvatarByRole(member);
                const isAdmin =
                  group.groupAdmin &&
                  (group.groupAdmin._id === member._id ||
                    group.groupAdmin === member._id);

                return (
                  <div
                    key={member._id}
                    className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() =>
                      onViewUserProfile && onViewUserProfile(member)
                    }
                  >
                    <div className="relative mr-3">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: avatar?.color || "#4f46e5" }}
                      >
                        {avatar?.initials || member.name?.charAt(0) || "?"}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          member.status === "online"
                            ? "bg-green-500"
                            : member.status === "banned"
                            ? "bg-black"
                            : member.status === "blocked"
                            ? "bg-red-500"
                            : "bg-gray-400"
                        }`}
                      ></span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 flex items-center truncate">
                        {member.name || "Unknown User"}
                        {isAdmin && (
                          <span className="ml-2 shrink-0 bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded-full">
                            Admin
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {member.email || "No email available"}
                      </p>
                    </div>
                    <div className="ml-2 text-blue-500">
                      <i className="fas fa-chevron-right"></i>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>No members found</p>
              </div>
            )}
          </div>
        </div>

        {group.groupAdmin && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
              Group Admin
            </h4>
            <div className="flex items-center bg-purple-50 p-2 rounded-lg">
              {typeof group.groupAdmin === "object" ? (
                <>
                  <div className="mr-3">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white font-medium"
                      style={{
                        backgroundColor:
                          getAvatarByRole(group.groupAdmin)?.color || "#4f46e5",
                      }}
                    >
                      {getAvatarByRole(group.groupAdmin)?.initials ||
                        group.groupAdmin.name?.charAt(0) ||
                        "A"}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {group.groupAdmin.name || "Unknown Admin"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {group.groupAdmin.email || "No email available"}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-600">
                  Admin ID: {group.groupAdmin}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 pt-4 mt-2">
          <button className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
            <i className="fas fa-sign-out-alt"></i>
            Leave Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupProfileSidebar;
