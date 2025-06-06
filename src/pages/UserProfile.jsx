import React, { useContext, useState, useEffect } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingScreen from "../components/LoadingScreen";

// UserProfile component manages user profile, security, and notifications
const UserProfile = () => {

    // Context and state hooks
    const { isAuthenticated, isAuthLoading, user, setUser } = useContext(Context);
    const [loading, setLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [activeTab, setActiveTab] = useState("profile");

    // Form data for profile and password update
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

    // Populate form data from user context when user changes
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

            // Set avatar preview if user has an avatar
            if (user.avatar) {
                setAvatarPreview(user.avatar);
            }
        }
    }, [user]);

    // Handle input changes for form fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle avatar file input and preview
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, avatar: file }));
            const reader = new FileReader();
            reader.onload = () => setAvatarPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // Handle profile update form submission
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Create form data for avatar upload if available
            const formDataToSend = new FormData();
            if (formData.avatar) {
                formDataToSend.append('avatar', formData.avatar);
            }

            // Add other form fields
            formDataToSend.append('name', formData.name);
            formDataToSend.append('bio', formData.bio);
            formDataToSend.append('location', formData.location);
            formDataToSend.append('interests', formData.interests);

            // Simulate API call with setTimeout
            // In a real application, you would send the formDataToSend to your backend
            setTimeout(() => {
                // Update user state with new information
                setUser(prev => ({
                    ...prev,
                    name: formData.name,
                    bio: formData.bio,
                    location: formData.location,
                    interests: formData.interests ? formData.interests.split(",").map(item => item.trim()) : [],
                    avatar: avatarPreview
                }));

                // Store updated profile in localStorage for persistence
                try {
                    const userData = JSON.parse(localStorage.getItem('user') || '{}');
                    localStorage.setItem('user', JSON.stringify({
                        ...userData,
                        name: formData.name,
                        bio: formData.bio,
                        location: formData.location,
                        interests: formData.interests ? formData.interests.split(",").map(item => item.trim()) : [],
                        avatar: avatarPreview
                    }));
                } catch (storageError) {
                    console.error("Failed to update local storage", storageError);
                }

                console.log("Profile updated successfully");
                toast.success("Profile updated successfully");
                setLoading(false);
            }, 1000);
        }
        catch (error) {
            console.error("Failed to update profile", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
            setLoading(false);
        }
    };

    // Handle password update form submission
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Check if new password and confirm password match
        if (formData.newPassword !== formData.confirmPassword) {
            console.error("New password and confirm password do not match");
            toast.error("New password and confirm password do not match");
            setLoading(false);
            return;
        }

        try {

            // Simulate API call with setTimeout
            setTimeout(() => {
                console.log("Password updated successfully");
                toast.success("Password updated successfully");
                setFormData(prev => ({
                    ...prev,
                    oldPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                }));
                setLoading(false);
            }, 1000);
        }
        catch (error) {
            console.error("Failed to update password");
            toast.error(error.response?.data?.message || "Failed to update password");
            setLoading(false);
        }
    };

    // Show loading screen while authentication state is loading
    if (isAuthLoading) return <LoadingScreen />;

    // Redirect to auth page if not authenticated
    if (!isAuthLoading && !isAuthenticated) {
        return <Navigate to="/auth" />;
    }

    // Render status badge for banned, blocked, or reported users
    const renderStatusBadge = () => {
        if (user?.status === 'banned') {
            return (
                <div className="mt-2">
                    <span className="bg-black text-white text-xs px-2 py-1 rounded-md">Account Banned</span>
                    {user?.bannedReason && <p className="mt-1 text-sm text-red-600">Reason: {user.bannedReason}</p>}
                </div>
            );
        } else if (user?.status === 'blocked') {
            return (
                <div className="mt-2">
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-md">Account Blocked</span>
                    {user?.blockReason && <p className="mt-1 text-sm text-red-600">Reason: {user.blockReason}</p>}
                </div>
            );
        } else if (user?.isReported) {
            return (
                <div className="mt-2">
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-md">Account Reported</span>
                    {user?.reportReason && <p className="mt-1 text-sm text-yellow-600">Reason: {user.reportReason}</p>}
                </div>
            );
        }
        return null;
    };

    // Get notification styles based on notification type
    const getNotificationStyles = (type) => {
        switch (type) {
            case 'report': return { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'bg-yellow-200 text-yellow-700', iconClass: 'fa-flag' };
            case 'ban': return { bg: 'bg-red-50', border: 'border-red-200', icon: 'bg-red-200 text-red-700', iconClass: 'fa-user-slash' };
            case 'block': return { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'bg-orange-200 text-orange-700', iconClass: 'fa-ban' };
            case 'message_deleted': return { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'bg-purple-200 text-purple-700', iconClass: 'fa-trash-alt' };
            default: return { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-200 text-blue-700', iconClass: 'fa-bell' };
        }
    };

    return (
        <>

            {/* Main container */}
            <div className="min-h-screen bg-gray-100">

                {/* Header bar */}
                <div className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <a href="/" className="text-2xl font-semibold text-blue-600">AI Chat Moderation System</a>
                    </div>
                    <div className="flex items-center gap-5">

                        {/* Navigation links */}
                        <a href="/" className="text-gray-600 hover:text-blue-600"><i className="fas fa-home"></i> Home</a>
                        <a href="/chat" className="text-gray-600 hover:text-blue-600"><i className="fas fa-comments"></i> Chat</a>
                        {user?.role === "admin" && (
                            <a href="/admin" className="text-gray-600 hover:text-blue-600"><i className="fas fa-shield-alt"></i> Admin</a>
                        )}

                        {/* User avatar and name */}
                        <div className="flex items-center gap-2 text-blue-600">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden text-white">
                                {avatarPreview ?
                                    <img src={avatarPreview} alt={user?.name} className="w-full h-full object-cover" /> :
                                    <span className="font-medium text-sm">{user?.name?.charAt(0)}</span>
                                }
                            </div>
                            <span>{user?.name}</span>
                        </div>
                    </div>
                </div>

                {/* Profile card */}
                <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-5xl">
                    <div className="bg-white rounded-lg shadow overflow-hidden">

                        {/* Profile banner and avatar */}
                        <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-600">
                            <div className="absolute -bottom-16 left-8">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-blue-600 text-white flex items-center justify-center text-4xl font-bold">
                                        {avatarPreview ?
                                            <img src={avatarPreview} alt={user?.name} className="w-full h-full object-cover" /> :
                                            <span>{user?.name?.charAt(0)}</span>
                                        }
                                    </div>

                                    {/* Avatar upload button */}
                                    <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-gray-900 bg-opacity-80 rounded-full p-2 text-white cursor-pointer hover:bg-opacity-100">
                                        <i className="fas fa-camera"></i>
                                        <input type="file" id="avatar-upload" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Profile details and tabs */}
                        <div className="pt-20 px-8 pb-8">
                            <h1 className="text-2xl font-semibold text-gray-900">{user?.name}</h1>
                            <p className="text-gray-500">
                                {user?.email} {user?.role === "admin" && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full ml-2">Admin</span>}
                            </p>

                            {/* Status badge for banned/blocked/reported */}
                            {renderStatusBadge()}

                            {/* Tabs for profile, security, notifications */}
                            <div className="mt-8 border-b border-gray-200">
                                <div className="flex">
                                    {["profile", "security", "notifications"].map((tab) => (
                                        <button
                                            key={tab}
                                            className={`py-4 px-6 border-b-2 font-medium ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:border-gray-300"
                                                } transition-colors relative`}
                                            onClick={() => setActiveTab(tab)}
                                        >
                                            <i className={`fas ${tab === "profile" ? "fa-user" : tab === "security" ? "fa-lock" : "fa-bell"
                                                } mr-2`}></i>
                                            {tab.charAt(0).toUpperCase() + tab.slice(1)}

                                            {/* Notification badge for unread notifications */}
                                            {tab === "notifications" &&
                                                user?.notifications &&
                                                Array.isArray(user.notifications) &&
                                                user.notifications.filter(n => !n.read).length > 0 && (
                                                    <span className="absolute top-3 right-3 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                                        {user.notifications.filter(n => !n.read).length}
                                                    </span>
                                                )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Profile tab content */}
                            {activeTab === "profile" && (
                                <form onSubmit={handleProfileUpdate} className="mt-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                        {/* Name input */}
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
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

                                        {/* Email input (disabled) */}
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
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

                                        {/* Location input */}
                                        <div>
                                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
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

                                        {/* Bio textarea */}
                                        <div className="md:col-span-2">
                                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
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

                                        {/* Interests input */}
                                        <div className="md:col-span-2">
                                            <label htmlFor="interests" className="block text-sm font-medium text-gray-700">Interests (comma separated)</label>
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

                                        {/* Save changes button */}
                                        <div className="md:col-span-2 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                {loading ? <><i className="fas fa-spinner animate-spin mr-2"></i>Saving...</> : "Save Changes"}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {/* Security tab content */}
                            {activeTab === "security" && (
                                <form onSubmit={handlePasswordUpdate} className="mt-8">
                                    <div className="space-y-6 max-w-md">

                                        {/* Password fields */}
                                        {["oldPassword", "newPassword", "confirmPassword"].map((field) => (
                                            <div key={field}>
                                                <label htmlFor={field} className="block text-sm font-medium text-gray-700">
                                                    {field === "oldPassword" ? "Current Password" : field === "newPassword" ? "New Password" : "Confirm New Password"}
                                                </label>
                                                <div className="mt-1 relative">
                                                    <input
                                                        type="password"
                                                        id={field}
                                                        name={field}
                                                        value={formData[field]}
                                                        onChange={handleChange}
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                        required
                                                    />

                                                    {/* Password visibility icon (not functional) */}
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 cursor-pointer">
                                                        <i className="fas fa-eye-slash"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Update password button */}
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                {loading ? <><i className="fas fa-spinner animate-spin mr-2"></i>Updating...</> : "Update Password"}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {/* Notifications tab content */}
                            {activeTab === "notifications" && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">System Notifications</h3>

                                    {/* Show message if no notifications */}
                                    {(!user?.notifications || !Array.isArray(user.notifications) || user.notifications.length === 0) ? (
                                        <div className="text-center p-8 bg-gray-50 rounded-lg">
                                            <div className="text-gray-400 text-4xl mb-3"><i className="fas fa-bell-slash"></i></div>
                                            <p className="text-gray-600">You don't have any notifications</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">

                                            {/* Render each notification */}
                                            {Array.isArray(user.notifications) && user.notifications.map((notification, index) => {
                                                const styles = getNotificationStyles(notification.type);
                                                return (
                                                    <div
                                                        key={notification.id || index}
                                                        className={`p-4 rounded-lg border ${styles.border} ${styles.bg} ${!notification.read ? 'ring-2 ring-blue-300' : ''}`}
                                                    >
                                                        <div className="flex items-start">

                                                            {/* Notification icon */}
                                                            <div className={`p-2 rounded-full ${styles.icon} mr-4`}>
                                                                <i className={`fas ${styles.iconClass} text-lg`}></i>
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="font-medium text-gray-900">{notification.title}</h4>
                                                                <p className="text-gray-700 mt-1">{notification.message}</p>
                                                                <div className="flex justify-between items-center mt-2 text-sm">
                                                                    <span className="text-gray-500">{new Date(notification.createdAt).toLocaleString()}</span>
                                                                    {notification.adminName && <span className="text-gray-500">Action by: {notification.adminName}</span>}
                                                                </div>

                                                                {/* Mark as read button for unread notifications */}
                                                                {!notification.read && (
                                                                    <button
                                                                        className="mt-2 text-blue-600 text-sm hover:underline"
                                                                        onClick={() => {
                                                                            if (user.notifications) {
                                                                                const updatedNotifications = user.notifications.map(n =>
                                                                                    n.id === notification.id ? { ...n, read: true } : n
                                                                                );
                                                                                setUser({ ...user, notifications: updatedNotifications });
                                                                            }
                                                                        }}
                                                                    >
                                                                        Mark as read
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserProfile;
