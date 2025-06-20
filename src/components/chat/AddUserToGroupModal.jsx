import React, { useState, useEffect } from "react";
import { getAvatarByRole } from "../../utils/avatarUtils";

const AddUserToGroupModal = ({ group, isOpen, onClose, onAddUser }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    if (searchTerm.trim()) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/user/search?q=${encodeURIComponent(
          searchTerm
        )}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        const existingUserIds = group.participants?.map((p) => p._id) || [];
        const filteredUsers = (data.users || []).filter(
          (user) =>
            !existingUserIds.includes(user._id) &&
            user.accountVerified === true &&
            user.status !== "banned" &&
            user.status !== "blocked"
        );
        setSearchResults(filteredUsers);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (user) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.find((u) => u._id === user._id);
      if (isSelected) {
        return prev.filter((u) => u._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleAddUsers = async () => {
    if (selectedUsers.length === 0) return;

    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/chat/group/add-multiple-users`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            chatId: group._id,
            userIds: selectedUsers.map((u) => u._id),
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        onAddUser(result);
        setSelectedUsers([]);
        setSearchTerm("");
        onClose();

        // Show success message
        if (window.toast) {
          window.toast.success(result.message || "Users added successfully");
        }
      } else {
        const error = await response.json();
        if (window.toast) {
          window.toast.error(error.message || "Failed to add users");
        }
      }
    } catch (error) {
      console.error("Error adding users to group:", error);
      if (window.toast) {
        window.toast.error("Failed to add users to group");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-96 max-h-[600px] flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Add Members</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute right-3 top-2.5">
              {loading ? (
                <i className="fas fa-spinner fa-spin text-gray-400"></i>
              ) : (
                <i className="fas fa-search text-gray-400"></i>
              )}
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Selected ({selectedUsers.length})
              </p>
              <div className="space-y-2 max-h-20 overflow-y-auto">
                {selectedUsers.map((user) => {
                  const avatar = getAvatarByRole(user);
                  return (
                    <div
                      key={user._id}
                      className="flex items-center justify-between bg-blue-50 p-2 rounded"
                    >
                      <div className="flex items-center">
                        <div
                          className="h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2"
                          style={{
                            backgroundColor: avatar?.color || "#4f46e5",
                          }}
                        >
                          {avatar?.initials || user.name?.charAt(0) || "?"}
                        </div>
                        <span className="text-sm">{user.name}</span>
                      </div>
                      <button
                        onClick={() => toggleUserSelection(user)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((user) => {
                  const avatar = getAvatarByRole(user);
                  const isSelected = selectedUsers.find(
                    (u) => u._id === user._id
                  );

                  return (
                    <div
                      key={user._id}
                      onClick={() => toggleUserSelection(user)}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-100 border-blue-300"
                          : "hover:bg-gray-50 border-transparent"
                      } border`}
                    >
                      <div className="mr-3">
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium"
                          style={{
                            backgroundColor: avatar?.color || "#4f46e5",
                          }}
                        >
                          {avatar?.initials || user.name?.charAt(0) || "?"}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="text-blue-500">
                          <i className="fas fa-check"></i>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : searchTerm && !loading ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-user-slash text-2xl mb-2"></i>
                <p>No users found</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <i className="fas fa-search text-2xl mb-2"></i>
                <p>Search for users to add to the group</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAddUsers}
            disabled={selectedUsers.length === 0}
            className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserToGroupModal;
