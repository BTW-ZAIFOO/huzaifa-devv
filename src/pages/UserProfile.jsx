import React, { useContext, useState, useEffect, useRef } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingScreen from "../components/LoadingScreen";
import axios from "axios";

const UserProfile = () => {
  const { isAuthenticated, isAuthLoading, user, setUser } = useContext(Context);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const socketRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    interests: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    avatar: null,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        location: user.location || "",
        interests: user.interests ? user.interests.join(", ") : "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
        avatar: null,
      });
    }
  }, [user]);

  useEffect(() => {
    // Connect to socket for real-time updates
    if (user && window.io) {
      socketRef.current = window.io("http://localhost:4000", {
        withCredentials: true,
      });

      socketRef.current.on("connect", () => {
        console.log("Socket connected for profile updates");
      });

      socketRef.current.on("user-profile-updated", (updatedUserData) => {
        // If this is our profile that was updated elsewhere, update local state
        if (updatedUserData.userId === user._id) {
          setUser((prevUser) => ({
            ...prevUser,
            name: updatedUserData.name || prevUser.name,
            bio:
              updatedUserData.bio !== undefined
                ? updatedUserData.bio
                : prevUser.bio,
            location:
              updatedUserData.location !== undefined
                ? updatedUserData.location
                : prevUser.location,
            interests: updatedUserData.interests || prevUser.interests,
            avatar: updatedUserData.avatar || prevUser.avatar,
          }));

          toast.info("Your profile was updated from another device");
        }
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user, setUser]);

  if (isAuthLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/auth" />;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, avatar: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      for (const key in formData) {
        if (key !== "avatar" || formData.avatar) {
          data.append(key, formData[key]);
        }
      }

      const response = await axios.put(
        "http://localhost:4000/api/v1/user/update",
        data,
        { withCredentials: true }
      );

      setUser(response.data.user);
      toast.success("Profile updated successfully!");

      // Reset password fields if on security tab
      if (activeTab === "security") {
        setFormData({
          ...formData,
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error(error.response?.data?.message || "Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              User Profile
            </h1>
            <div className="flex space-x-4 mb-6">
              <button
                className={`px-4 py-2 rounded-md ${
                  activeTab === "profile"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setActiveTab("profile")}
              >
                Profile
              </button>
              <button
                className={`px-4 py-2 rounded-md ${
                  activeTab === "security"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setActiveTab("security")}
              >
                Security
              </button>
            </div>

            {activeTab === "profile" && (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-md"
                    disabled
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">
                    Interests (comma separated)
                  </label>
                  <input
                    type="text"
                    name="interests"
                    value={formData.interests}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Avatar</label>
                  <input
                    type="file"
                    name="avatar"
                    onChange={handleAvatarChange}
                    className="w-full px-4 py-2"
                  />
                  {avatarPreview && (
                    <div className="mt-2">
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  {loading ? "Updating..." : "Update Profile"}
                </button>
              </form>
            )}

            {activeTab === "security" && (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-md"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
