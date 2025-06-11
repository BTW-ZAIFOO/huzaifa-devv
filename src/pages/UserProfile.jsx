import React, { useContext, useState, useEffect, useRef } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingScreen from "../components/LoadingScreen";
import axios from "axios";
import { formatInterests, logProfileUpdate } from "../utils/moderationUtils";
import { getAvatarByRole } from "../utils/avatarUtils";

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
    if (user?.avatar) {
      setAvatarPreview(user.avatar);
    }
  }, []);

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
    if (user && window.io) {
      socketRef.current = window.io("http://localhost:4000", {
        withCredentials: true,
      });

      socketRef.current.on("connect", () => {
        console.log("Socket connected for profile updates");
      });

      socketRef.current.on("user-profile-updated", (updatedUserData) => {
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
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, PNG, GIF, WEBP)");
        e.target.value = null;
        return;
      }

      if (file.size > 1 * 1024 * 1024) {
        toast.error("Image size should be less than 1MB");
        e.target.value = null;
        return;
      }

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

      if (formData.name && formData.name !== user.name) {
        data.append("name", formData.name);
      }

      if (formData.bio !== user.bio) {
        data.append("bio", formData.bio);
      }

      if (formData.location !== user.location) {
        data.append("location", formData.location);
      }

      if (
        formData.interests !== (user.interests ? user.interests.join(", ") : "")
      ) {
        data.append("interests", formData.interests);
      }

      if (formData.avatar) {
        data.append("avatar", formData.avatar);
      }

      if (activeTab === "security") {
        if (
          !formData.oldPassword ||
          !formData.newPassword ||
          !formData.confirmPassword
        ) {
          toast.error("All password fields are required");
          setLoading(false);
          return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
          toast.error("New passwords don't match");
          setLoading(false);
          return;
        }

        data.append("oldPassword", formData.oldPassword);
        data.append("newPassword", formData.newPassword);
        data.append("confirmPassword", formData.confirmPassword);
      }

      if (data.entries().next().done && activeTab !== "security") {
        toast.info("No changes to update");
        setLoading(false);
        return;
      }

      const endpoint =
        activeTab === "security"
          ? "http://localhost:4000/api/v1/user/update-password"
          : "http://localhost:4000/api/v1/user/update";

      const response = await axios.put(endpoint, data, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (activeTab === "profile") {
        const changes = {};
        if (formData.name !== user.name) changes.name = formData.name;
        if (formData.bio !== user.bio) changes.bio = formData.bio;
        if (formData.location !== user.location)
          changes.location = formData.location;
        if (
          formData.interests !==
          (user.interests ? user.interests.join(", ") : "")
        ) {
          changes.interests = formatInterests(formData.interests);
        }
        if (formData.avatar) changes.avatar = "Updated profile picture";

        logProfileUpdate(user._id, user.name, changes);
      }

      setUser(response.data.user);
      toast.success(response.data.message || "Profile updated successfully!");

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

  const avatar = user ? getAvatarByRole(user) : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 bg-gradient-to-b from-blue-500 to-indigo-600 p-8 text-white">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                {avatarPreview || avatar?.imageUrl ? (
                  <img
                    src={avatarPreview || avatar?.imageUrl}
                    alt={user?.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-3xl font-bold"
                    style={{ backgroundColor: avatar?.color || "#4f46e5" }}
                  >
                    {avatar?.initials || user?.name?.charAt(0) || "?"}
                  </div>
                )}
              </div>
              <h1 className="text-2xl font-bold mb-2">{user?.name}</h1>
              <p className="text-blue-100">{user?.email}</p>

              {user?.bio && (
                <p className="mt-4 text-center text-blue-100 italic">
                  "{user.bio}"
                </p>
              )}

              <div className="mt-6 w-full">
                {user?.interests && user.interests.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm text-blue-200 uppercase tracking-wide mb-2">
                      Interests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {user.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="bg-white/20 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {user?.location && (
                  <div className="flex items-center mt-4">
                    <i className="fas fa-map-marker-alt mr-2"></i>
                    <span className="text-blue-100">{user.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-8 md:w-2/3">
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
                    placeholder="Write something about yourself..."
                    maxLength={200}
                  />
                  <small className="text-gray-500">
                    {formData.bio?.length || 0}/200 characters
                  </small>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Where are you located?"
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
                    placeholder="e.g. Music, Reading, Travel"
                    className="w-full px-4 py-2 border rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Profile Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    name="avatar"
                    onChange={handleAvatarChange}
                    className="w-full px-4 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum size: 2MB. Formats: JPEG, PNG, GIF, WEBP
                  </p>
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
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    "Update Profile"
                  )}
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
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    "Update Password"
                  )}
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
