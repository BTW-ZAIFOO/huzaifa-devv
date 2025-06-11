import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const GroupChatModal = ({ isOpen, onClose, onGroupCreated }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchTerm.trim() && isOpen) {
      searchUsers();
    }
  }, [searchTerm, isOpen]);

  const searchUsers = async () => {
    if (!searchTerm.trim()) return;

    try {
      setLoading(true);
      const { data } = await axios.get(
        `http://localhost:4000/api/v1/user/search?q=${searchTerm}`,
        { withCredentials: true }
      );

      const filteredResults = data.users.filter(
        (user) =>
          !selectedUsers.some((selectedUser) => selectedUser._id === user._id)
      );

      setSearchResults(filteredResults);
      setLoading(false);
    } catch (error) {
      toast.error("Error searching for users");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!groupName.trim()) {
      toast.error("Please provide a group name");
      return;
    }

    if (selectedUsers.length < 1) {
      toast.error("Please add at least one user to the group");
      return;
    }

    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/v1/chat/group",
        {
          name: groupName,
          participants: selectedUsers.map((user) => user._id),
        },
        { withCredentials: true }
      );

      toast.success(`Group "${groupName}" created successfully!`);
      onGroupCreated(data.chat);
      setGroupName("");
      setSelectedUsers([]);
      setSearchTerm("");
      setSearchResults([]);
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create group chat"
      );
    }
  };

  const handleAddUser = (user) => {
    setSelectedUsers([...selectedUsers, user]);
    setSearchResults(searchResults.filter((u) => u._id !== user._id));
    setSearchTerm("");
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((user) => user._id !== userId));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6">
          <h3 className="text-xl font-bold">Create Group Chat</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter group name..."
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add Participants
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search users..."
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
            {searchTerm.trim() && searchResults.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-lg max-h-32 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="px-3 py-2 hover:bg-gray-100 flex items-center justify-between cursor-pointer"
                    onClick={() => handleAddUser(user)}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{user.name}</span>
                    </div>
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddUser(user);
                      }}
                    >
                      <i className="fas fa-plus-circle"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {searchTerm.trim() && searchResults.length === 0 && !loading && (
              <div className="mt-2 text-center text-gray-500 py-2">
                No users found
              </div>
            )}

            {loading && (
              <div className="mt-2 text-center text-gray-500 py-2">
                Searching...
              </div>
            )}

            {selectedUsers.length > 0 && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Participants ({selectedUsers.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <div
                      key={user._id}
                      className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm flex items-center"
                    >
                      <span className="mr-1">{user.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveUser(user._id)}
                        className="text-blue-700 hover:text-blue-900"
                      >
                        <i className="fas fa-times-circle"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupChatModal;
