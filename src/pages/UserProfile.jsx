import React, { useContext, useState, useEffect, useRef } from "react";
import { Context } from "../main";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingScreen from "../components/LoadingScreen";
import axios from "axios";
import { formatInterests, logProfileUpdate } from "../utils/moderationUtils";
import { getAvatarByRole } from "../utils/avatarUtils";
import PostCard from "../components/social/PostCard";

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
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const params = useParams();
  const userId = params.userId || user?._id;
  const isOwnProfile = !params.userId || params.userId === user?._id;

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

  useEffect(() => {
    if (userId && isAuthenticated) {
      fetchUserProfile();
      fetchUserPosts();
    }
  }, [userId, isAuthenticated]);

  const fetchUserProfile = async () => {
    try {
      if (isOwnProfile) {
        const [followersRes, followingRes] = await Promise.all([
          axios.get("http://localhost:4000/api/v1/user/followers", {
            withCredentials: true,
          }),
          axios.get("http://localhost:4000/api/v1/user/following", {
            withCredentials: true,
          }),
        ]);

        setFollowers(followersRes.data.followers || []);
        setFollowing(followingRes.data.following || []);
      } else {
        const profileRes = await axios.get(
          `http://localhost:4000/api/v1/user/profile/${userId}`,
          {
            withCredentials: true,
          }
        );

        setFollowers(profileRes.data.user.followers || []);
        setFollowing(profileRes.data.user.following || []);
        setIsFollowing(profileRes.data.isFollowing);
      }
    } catch (error) {
      toast.error("Failed to load profile data");
    }
  };

  const fetchUserPosts = async () => {
    setPostsLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:4000/api/v1/post/user/${userId}`,
        {
          withCredentials: true,
        }
      );
      setUserPosts(res.data.posts || []);
    } catch (error) {
      toast.error("Failed to load posts");
    } finally {
      setPostsLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const endpoint = isFollowing
        ? `http://localhost:4000/api/v1/user/unfollow/${userId}`
        : `http://localhost:4000/api/v1/user/follow/${userId}`;

      const res = await axios.post(endpoint, {}, { withCredentials: true });
      toast.success(res.data.message);

      setIsFollowing(!isFollowing);

      fetchUserProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  const handlePostDelete = (postId) => {
    setUserPosts((prev) => prev.filter((post) => post._id !== postId));
  };

  const handlePostUpdate = (updatedPost) => {
    setUserPosts((prev) =>
      prev.map((post) => (post._id === updatedPost._id ? updatedPost : post))
    );
  };

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
        if (formData.avatar) {
          changes.avatar = "Updated profile picture";
          toast.success("Profile picture updated successfully!");
        }

        logProfileUpdate(user._id, user.name, changes);
      }

      setUser(response.data.user);
      toast.success(response.data.message || "Profile updated successfully!");

      if (formData.avatar && response.data.user.avatar) {
        const timestamp = new Date().getTime();
        const avatarUrl = response.data.user.avatar.includes("?")
          ? `${response.data.user.avatar}&t=${timestamp}`
          : `${response.data.user.avatar}?t=${timestamp}`;
        setAvatarPreview(avatarUrl);
      }

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
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto pb-12">
        <div className="h-56 sm:h-72 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          <div className="absolute bottom-4 right-4">
            <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-2 transition-all duration-200 shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-2xl -mt-24 relative z-10 mx-4 border border-gray-100">
          <div className="px-6 pt-24 pb-8 text-center relative">
            <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
              <div className="relative group">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300 scale-110"></div>
                {avatarPreview || avatar?.imageUrl ? (
                  <img
                    src={avatarPreview || avatar?.imageUrl}
                    alt={user?.name}
                    className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-lg relative"
                  />
                ) : (
                  <div
                    className="w-36 h-36 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-4xl font-bold relative"
                    style={{ backgroundColor: avatar?.color || "#4f46e5" }}
                  >
                    {avatar?.initials || user?.name?.charAt(0) || "?"}
                  </div>
                )}
                <div className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-0 group-hover:translate-y-0 scale-90 group-hover:scale-100">
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 002-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    name="avatar"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold mt-2 text-gray-800 tracking-tight">
              {user?.name}
            </h1>
            <p className="text-gray-500 mt-1">{user?.email}</p>

            {user?.location && (
              <div className="flex items-center justify-center mt-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-500 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-gray-500 text-sm">{user.location}</span>
              </div>
            )}

            <div className="flex justify-center space-x-12 mt-6 pt-5 border-t border-gray-100">
              <div className="text-center group cursor-pointer">
                <div className="text-2xl font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                  27
                </div>
                <div className="text-xs uppercase tracking-wider text-gray-500 group-hover:text-blue-500 transition-colors">
                  Posts
                </div>
              </div>
              <div className="text-center relative group cursor-pointer">
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="text-2xl font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                  142
                </div>
                <div className="text-xs uppercase tracking-wider text-gray-500 group-hover:text-blue-500 transition-colors">
                  Followers
                </div>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="text-2xl font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                  98
                </div>
                <div className="text-xs uppercase tracking-wider text-gray-500 group-hover:text-blue-500 transition-colors">
                  Following
                </div>
              </div>
            </div>
          </div>

          {user?.bio && (
            <div className="px-8 py-4">
              <p className="text-gray-700 leading-relaxed">{user.bio}</p>
            </div>
          )}
          {user?.interests && user.interests.length > 0 && (
            <div className="px-8 py-5 border-t border-gray-100">
              <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">
                Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="bg-blue-50 text-blue-600 text-xs px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    #{interest}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="border-t border-gray-200 mt-4">
            <div className="flex overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex-1 py-4 px-6 font-medium text-sm border-b-2 transition-all duration-200 ${
                  activeTab === "profile"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Edit Profile
                </span>
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`flex-1 py-4 px-6 font-medium text-sm border-b-2 transition-all duration-200 ${
                  activeTab === "security"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Security
                </span>
              </button>
              <button className="flex-1 py-4 px-6 font-medium text-sm border-b-2 border-transparent text-gray-400 cursor-not-allowed">
                <span className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Activity
                </span>
              </button>
            </div>
            <div className="p-8">
              {activeTab === "profile" && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Display Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                        disabled
                      />
                      <p className="text-xs text-gray-500">
                        Email cannot be changed
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-gray-700">
                        Bio
                      </label>
                      <span className="text-xs text-gray-500">
                        {formData.bio?.length || 0}/200
                      </span>
                    </div>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell the world about yourself..."
                      maxLength={200}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="City, Country"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Interests
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400 text-lg">#</span>
                      </div>
                      <input
                        type="text"
                        name="interests"
                        value={formData.interests}
                        onChange={handleInputChange}
                        placeholder="technology, travel, music, design..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Separate interests with commas
                    </p>
                  </div>
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full inline-flex justify-center items-center px-6 py-3.5 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                          Saving Changes...
                        </span>
                      ) : (
                        "Save Profile"
                      )}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "security" && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="oldPassword"
                        value={formData.oldPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full inline-flex justify-center items-center px-6 py-3.5 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                          Updating Password...
                        </span>
                      ) : (
                        "Update Password"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-200">
            {!isOwnProfile && (
              <div className="flex justify-center mb-4">
                <button
                  onClick={handleFollow}
                  className={`px-4 py-2 rounded-full font-semibold transition-all duration-200 flex items-center justify-center ${
                    isFollowing
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12h18m-9-9v18"
                        />
                      </svg>
                      Unfollow
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12h18m-9-9v18"
                        />
                      </svg>
                      Follow
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="flex justify-center space-x-8 mb-4">
              <div className="text-center">
                <span className="block text-2xl font-bold text-gray-800">
                  {followers.length}
                </span>
                <span className="text-sm text-gray-500">Followers</span>
              </div>
              <div className="text-center">
                <span className="block text-2xl font-bold text-gray-800">
                  {following.length}
                </span>
                <span className="text-sm text-gray-500">Following</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Posts
              </h3>
              {postsLoading ? (
                <div className="flex justify-center py-4">
                  <svg
                    className="animate-spin h-5 w-5 text-gray-600"
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
                </div>
              ) : userPosts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userPosts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onDelete={handlePostDelete}
                      onUpdate={handlePostUpdate}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No posts to show
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
