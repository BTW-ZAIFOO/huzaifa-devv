import React, { useContext, useState, useEffect } from "react";
import { Context } from "../main";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingScreen from "./LoadingScreen";
import axios from "axios";
import { formatInterests, logProfileUpdate } from "../utils/moderationUtils";
import { getAvatarByRole } from "../utils/avatarUtils";
import PostCard from "./social/PostCard";

const UserProfile = ({
  user: propUser = null,
  onClose = null,
  isAdmin = false,
  onBlockUser = null,
  onReportUser = null,
  isModal = false,
}) => {
  const {
    isAuthenticated,
    isAuthLoading,
    user: currentUser,
    setUser,
  } = useContext(Context);
  const [loading, setLoading] = useState(false);
  const [setAvatarPreview] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
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
  const navigate = useNavigate();

  const userId = isModal ? propUser?._id : params?.userId || currentUser?._id;
  const isOwnProfile =
    !isModal && (!params?.userId || params?.userId === currentUser?._id);

  const [profileData, setProfileData] = useState(
    isModal ? propUser : currentUser
  );
  const displayedUser = isModal
    ? propUser
    : isOwnProfile
    ? currentUser
    : profileData;

  useEffect(() => {
    if (isModal) {
      setProfileData(propUser);
    }
  }, [propUser, isModal]);

  useEffect(() => {
    if (displayedUser?.avatar) {
      setAvatarPreview(displayedUser.avatar);
    } else {
      setAvatarPreview(null);
    }
  }, [displayedUser]);

  useEffect(() => {
    if (displayedUser?.name) {
      setAvatarPreview(null);
    }
  }, [displayedUser]);

  useEffect(() => {
    if (displayedUser) {
      setFormData({
        name: displayedUser.name || "",
        email: displayedUser.email || "",
        bio: displayedUser.bio || "",
        location: displayedUser.location || "",
        interests: displayedUser.interests
          ? Array.isArray(displayedUser.interests)
            ? displayedUser.interests.join(", ")
            : displayedUser.interests
          : "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
        avatar: null,
      });
    }
  }, [displayedUser]);

  useEffect(() => {
    const handleProfileUpdate = (updatedUserData) => {
      if (updatedUserData.userId === userId) {
        setProfileData((prev) => ({
          ...prev,
          name: updatedUserData.name || prev.name,
          bio:
            updatedUserData.bio !== undefined ? updatedUserData.bio : prev.bio,
          location:
            updatedUserData.location !== undefined
              ? updatedUserData.location
              : prev.location,
          interests: updatedUserData.interests || prev.interests,
          avatar: updatedUserData.avatar || prev.avatar,
        }));

        if (updatedUserData.userId === currentUser?._id) {
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
      }
    };

    if (window.socket) {
      window.socket.on("user-profile-updated", handleProfileUpdate);
    }

    return () => {
      if (window.socket) {
        window.socket.off("user-profile-updated", handleProfileUpdate);
      }
    };
  }, [userId, currentUser?._id, setUser]);

  useEffect(() => {
    if (
      userId &&
      typeof userId === "string" &&
      userId !== "undefined" &&
      !isModal &&
      isAuthenticated
    ) {
      fetchUserProfile();
      fetchUserPosts();
    }
  }, [userId, isAuthenticated, isModal]);

  const getStatusColor = () => {
    switch (displayedUser?.status) {
      case "online":
        return "bg-green-500";
      case "blocked":
        return "bg-red-500";
      case "banned":
        return "bg-black";
      default:
        return "bg-gray-400";
    }
  };

  const fetchUserProfile = async () => {
    if (!userId || userId === "undefined") return; 
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

        setProfileData(profileRes.data.user);
        setFollowers(profileRes.data.user.followers || []);
        setFollowing(profileRes.data.user.following || []);
        setIsFollowing(profileRes.data.isFollowing);
      }
    } catch (error) {
      toast.error("Failed to load profile data");
    }
  };

  const fetchUserPosts = async () => {
    if (isModal || !userId || userId === "undefined") return;

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();

      if (formData.name && formData.name !== displayedUser.name) {
        data.append("name", formData.name);
      }

      if (formData.bio !== displayedUser.bio) {
        data.append("bio", formData.bio);
      }

      if (formData.location !== displayedUser.location) {
        data.append("location", formData.location);
      }

      if (
        formData.interests !==
        (displayedUser.interests ? displayedUser.interests.join(", ") : "")
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
        if (formData.name !== displayedUser.name) changes.name = formData.name;
        if (formData.bio !== displayedUser.bio) changes.bio = formData.bio;
        if (formData.location !== displayedUser.location)
          changes.location = formData.location;
        if (
          formData.interests !==
          (displayedUser.interests ? displayedUser.interests.join(", ") : "")
        ) {
          changes.interests = formatInterests(formData.interests);
        }
        if (formData.avatar) {
          changes.avatar = "Updated profile picture";
          toast.success("Profile picture updated successfully!");
        }

        logProfileUpdate(displayedUser._id, displayedUser.name, changes);
      }

      setUser(response.data.user);

      try {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      } catch (err) {}

      setAvatarPreview(null);

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

  useEffect(() => {
    if (!isModal && !currentUser && typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setProfileData(JSON.parse(storedUser));
      }
    }
  }, []);

  if (isModal) {
    return (
      <div className="w-[300px] bg-white border-l border-gray-200 shadow-lg absolute right-0 top-0 bottom-0 z-20 transform transition-transform duration-300 overflow-y-auto">
        <div className="p-5">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-semibold">Profile</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div
                className="w-24 h-24 rounded-full border-4 border-blue-100 flex items-center justify-center text-white text-3xl font-bold"
                style={{
                  backgroundColor:
                    getAvatarByRole(displayedUser)?.color || "#4f46e5",
                }}
              >
                {getAvatarByRole(displayedUser)?.initials ||
                  displayedUser?.name?.charAt(0) ||
                  "?"}
              </div>
              <span
                className={`absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full ${getStatusColor()} border-2 border-white`}
              ></span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              {displayedUser?.name}
            </h2>
            {displayedUser?.email && (
              <p className="text-gray-600 mt-1 mb-2 text-sm flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                <i className="far fa-envelope mr-2"></i> {displayedUser.email}
              </p>
            )}
            {!displayedUser?.email && (
              <p className="text-gray-400 mt-1 mb-2 text-sm flex items-center italic">
                <i className="far fa-envelope mr-2"></i> No email available
              </p>
            )}
            {displayedUser?.bio && (
              <p className="text-gray-600 text-center mt-2 text-sm">
                {displayedUser.bio}
              </p>
            )}
            {displayedUser?.location && (
              <p className="text-gray-500 mt-1 flex items-center text-sm">
                <i className="fas fa-map-marker-alt mr-1"></i>{" "}
                {displayedUser.location}
              </p>
            )}
            {(displayedUser?.status === "blocked" ||
              displayedUser?.status === "banned") && (
              <div
                className={`mb-4 px-3 py-1 rounded-full text-xs font-medium ${
                  displayedUser.status === "blocked"
                    ? "bg-red-100 text-red-800"
                    : "bg-black text-white"
                }`}
              >
                {displayedUser.status === "blocked"
                  ? "Blocked by admin"
                  : "Banned by admin"}
              </div>
            )}

            {isAdmin && onBlockUser && onReportUser && (
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => onBlockUser(propUser._id)}
                  className={`py-1.5 px-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    propUser.status === "blocked"
                      ? "bg-green-100 text-green-600 hover:bg-green-200"
                      : "bg-red-100 text-red-600 hover:bg-red-200"
                  }`}
                >
                  <i
                    className={`fas ${
                      propUser.status === "blocked" ? "fa-unlock" : "fa-ban"
                    }`}
                  ></i>
                  {propUser.status === "blocked"
                    ? "Unblock User"
                    : "Block User"}
                </button>
                <button
                  onClick={() => onReportUser(propUser._id)}
                  className={`py-1.5 px-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    propUser.isReported
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      : "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                  }`}
                >
                  <i
                    className={`fas ${
                      propUser.isReported ? "fa-flag-checkered" : "fa-flag"
                    }`}
                  ></i>
                  {propUser.isReported ? "Remove Report" : "Report"}
                </button>
              </div>
            )}
          </div>

          {displayedUser?.interests && displayedUser.interests.length > 0 && (
            <div className="mb-5 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-xs uppercase text-gray-500 font-medium mb-2">
                Interests
              </h4>
              <div className="flex flex-wrap gap-1">
                {Array.isArray(displayedUser.interests)
                  ? displayedUser.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
                      >
                        {interest}
                      </span>
                    ))
                  : displayedUser.interests
                      .split(",")
                      .map((interest, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
                        >
                          {interest.trim()}
                        </span>
                      ))}
              </div>
            </div>
          )}

          {propUser?.lastActivity && (
            <div className="mb-5 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-xs uppercase text-gray-500 font-medium mb-2">
                Recent Activity
              </h4>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <i className="fas fa-history text-blue-500"></i>
                <span>{propUser.lastActivity}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {propUser.lastActivityTime || "Recently"}
              </p>
            </div>
          )}
          {propUser?.adminActions?.length > 0 && (
            <div className="mb-5 p-3 bg-red-50 rounded-lg">
              <h4 className="text-xs uppercase text-red-600 font-medium mb-2">
                Admin Actions
              </h4>
              <ul className="space-y-2">
                {propUser.adminActions.map((action, idx) => {
                  const iconClass =
                    action.type === "block"
                      ? "fa-ban text-red-500"
                      : action.type === "unblock"
                      ? "fa-unlock text-green-500"
                      : "fa-exclamation-circle text-yellow-500";
                  return (
                    <li
                      key={idx}
                      className="text-sm border-b border-red-100 pb-1 text-gray-700"
                    >
                      <div className="flex items-center">
                        <i className={`fas ${iconClass} mr-2`}></i>
                        <span>{action.description}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {action.time}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isAuthLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/auth" />;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto pb-12">
        {isOwnProfile && (
          <div className="pt-6 px-4 flex items-center justify-center">
            <button
              onClick={() => {
                if (window.history.length > 2) {
                  navigate(-1);
                } else {
                  navigate("/chat");
                }
              }}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg font-medium mb-4 shadow-sm transition-all"
            >
              <i className="fas fa-arrow-left"></i>
              Back to Chat
            </button>
            <button
              onClick={() => navigate("/feed")}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg font-medium mb-4 shadow-sm transition-all ml-3"
            >
              <i className="fas fa-home"></i>
              Back to Feed
            </button>
          </div>
        )}
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
                <div
                  className="w-36 h-36 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-4xl font-bold relative"
                  style={{
                    backgroundColor:
                      getAvatarByRole(displayedUser)?.color || "#4f46e5",
                  }}
                >
                  {getAvatarByRole(displayedUser)?.initials ||
                    displayedUser?.name?.charAt(0) ||
                    "?"}
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold mt-2 text-gray-800 tracking-tight">
              {displayedUser?.name}
            </h1>
            <p className="text-gray-500 mt-1">{displayedUser?.email}</p>

            {displayedUser?.location && (
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
                <span className="text-gray-500 text-sm">
                  {displayedUser.location}
                </span>
              </div>
            )}

            <div className="flex justify-center space-x-12 mt-6 pt-5 border-t border-gray-100">
              <div className="text-center group cursor-pointer">
                <div className="text-2xl font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                  {userPosts.length}
                </div>
                <div className="text-xs uppercase tracking-wider text-gray-500 group-hover:text-blue-500 transition-colors">
                  Posts
                </div>
              </div>
              <div className="text-center relative group cursor-pointer">
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="text-2xl font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                  {followers.length}
                </div>
                <div className="text-xs uppercase tracking-wider text-gray-500 group-hover:text-blue-500 transition-colors">
                  Followers
                </div>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="text-2xl font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                  {following.length}
                </div>
                <div className="text-xs uppercase tracking-wider text-gray-500 group-hover:text-blue-500 transition-colors">
                  Following
                </div>
              </div>
            </div>
          </div>

          {displayedUser?.bio && (
            <div className="px-8 py-4">
              <p className="text-gray-700 leading-relaxed">
                {displayedUser.bio}
              </p>
            </div>
          )}
          {displayedUser?.interests && displayedUser.interests.length > 0 && (
            <div className="px-8 py-5 border-t border-gray-100">
              <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">
                Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {displayedUser.interests.map((interest, index) => (
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

          {isOwnProfile && (
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
          )}

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
                <div className="grid grid-cols-1 gap-6">
                  {userPosts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onDelete={handlePostDelete}
                      onUpdate={handlePostUpdate}
                      isAdmin={isAdmin}
                      showActions={true}
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
