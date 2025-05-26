import React, { useContext, useState, useEffect } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const UserProfile = () => {
    const { isAuthenticated, user, setUser } = useContext(Context);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        bio: "",
        location: "",
        interests: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
        avatar: null
    });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [activeTab, setActiveTab] = useState("profile"); // profile, security

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
                avatar: null
            });

            setAvatarPreview(user.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name) + "&background=random");
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                avatar: file
            }));

            const reader = new FileReader();
            reader.onload = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Create form data for multipart/form-data
            const data = new FormData();
            data.append("name", formData.name);
            data.append("bio", formData.bio);
            data.append("location", formData.location);

            // Convert interests string to array
            if (formData.interests) {
                const interestsArray = formData.interests.split(",").map(item => item.trim());
                data.append("interests", JSON.stringify(interestsArray));
            }

            if (formData.avatar) {
                data.append("avatar", formData.avatar);
            }

            // In a real app, this would be a real API call
            // const response = await axios.put("http://localhost:4000/api/v1/user/update-profile", data, {
            //   withCredentials: true
            // });

            // Mock successful response
            setTimeout(() => {
                // Update user context with new data
                setUser(prev => ({
                    ...prev,
                    name: formData.name,
                    bio: formData.bio,
                    location: formData.location,
                    interests: formData.interests ? formData.interests.split(",").map(item => item.trim()) : [],
                    avatar: avatarPreview
                }));

                toast.success("Profile updated successfully");
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Check if passwords match
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("New password and confirm password do not match");
            setLoading(false);
            return;
        }

        try {
            // In a real app, this would be a real API call
            // const response = await axios.put("http://localhost:4000/api/v1/user/change-password", {
            //   oldPassword: formData.oldPassword,
            //   newPassword: formData.newPassword
            // }, {
            //   withCredentials: true
            // });

            // Mock successful response
            setTimeout(() => {
                toast.success("Password updated successfully");
                setFormData(prev => ({
                    ...prev,
                    oldPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                }));
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error("Error updating password:", error);
            toast.error(error.response?.data?.message || "Failed to update password");
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return <Navigate to="/auth" />;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <a href="/" className="text-2xl font-semibold text-blue-600">AI Chat Moderation System</a>
                </div>

                <div className="flex items-center gap-5">
                    <a href="/" className="text-gray-600 hover:text-blue-600">
                        <i className="fas fa-home"></i> Home
                    </a>
                    <a href="/chat" className="text-gray-600 hover:text-blue-600">
                        <i className="fas fa-comments"></i> Chat
                    </a>
                    {user?.role === "admin" && (
                        <a href="/admin" className="text-gray-600 hover:text-blue-600">
                            <i className="fas fa-shield-alt"></i> Admin
                        </a>
                    )}
                    <div className="flex items-center gap-2 text-blue-600">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt={user?.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-medium text-sm">{user?.name?.charAt(0)}</span>
                            )}
                        </div>
                        <span>{user?.name}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-5xl">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Profile header with cover image and avatar */}
                    <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-600">
                        <div className="absolute -bottom-16 left-8">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt={user?.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-4xl font-bold">
                                            {user?.name?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-gray-900 bg-opacity-80 rounded-full p-2 text-white cursor-pointer hover:bg-opacity-100">
                                    <i className="fas fa-camera"></i>
                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="pt-20 px-8 pb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">{user?.name}</h1>
                        <p className="text-gray-500">{user?.email} {user?.role === "admin" && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full ml-2">Admin</span>}</p>

                        {/* Tabs */}
                        <div className="mt-8 border-b border-gray-200">
                            <div className="flex">
                                <button
                                    className={`py-4 px-6 border-b-2 font-medium ${activeTab === "profile"
                                        ? "border-blue-600 text-blue-600"
                                        : "border-transparent text-gray-500 hover:border-gray-300"
                                        } transition-colors`}
                                    onClick={() => setActiveTab("profile")}
                                >
                                    <i className="fas fa-user mr-2"></i> Profile Information
                                </button>
                                <button
                                    className={`py-4 px-6 border-b-2 font-medium ${activeTab === "security"
                                        ? "border-blue-600 text-blue-600"
                                        : "border-transparent text-gray-500 hover:border-gray-300"
                                        } transition-colors`}
                                    onClick={() => setActiveTab("security")}
                                >
                                    <i className="fas fa-lock mr-2"></i> Security
                                </button>
                            </div>
                        </div>

                        {/* Profile Tab Content */}
                        {activeTab === "profile" && (
                            <form onSubmit={handleProfileUpdate} className="mt-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            disabled
                                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                    </div>

                                    <div>
                                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            id="location"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            placeholder="City, Country"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                                            Bio
                                        </label>
                                        <textarea
                                            id="bio"
                                            name="bio"
                                            rows={4}
                                            value={formData.bio}
                                            onChange={handleChange}
                                            placeholder="Tell us about yourself"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
                                            Interests (comma separated)
                                        </label>
                                        <input
                                            type="text"
                                            id="interests"
                                            name="interests"
                                            value={formData.interests}
                                            onChange={handleChange}
                                            placeholder="AI, Machine Learning, Reading, etc."
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="md:col-span-2 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            {loading ? (
                                                <>
                                                    <i className="fas fa-spinner animate-spin mr-2"></i>
                                                    Saving...
                                                </>
                                            ) : (
                                                "Save Changes"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {/* Security Tab Content */}
                        {activeTab === "security" && (
                            <form onSubmit={handlePasswordUpdate} className="mt-8">
                                <div className="space-y-6 max-w-md">
                                    <div>
                                        <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">
                                            Current Password
                                        </label>
                                        <div className="mt-1 relative">
                                            <input
                                                type="password"
                                                id="oldPassword"
                                                name="oldPassword"
                                                value={formData.oldPassword}
                                                onChange={handleChange}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 cursor-pointer">
                                                <i className="fas fa-eye-slash"></i>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                            New Password
                                        </label>
                                        <div className="mt-1 relative">
                                            <input
                                                type="password"
                                                id="newPassword"
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 cursor-pointer">
                                                <i className="fas fa-eye-slash"></i>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                            Confirm New Password
                                        </label>
                                        <div className="mt-1 relative">
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 cursor-pointer">
                                                <i className="fas fa-eye-slash"></i>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            {loading ? (
                                                <>
                                                    <i className="fas fa-spinner animate-spin mr-2"></i>
                                                    Updating...
                                                </>
                                            ) : (
                                                "Update Password"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
