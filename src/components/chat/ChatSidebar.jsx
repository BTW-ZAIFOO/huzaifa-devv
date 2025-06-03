import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Context } from "../../main";
import { generateAvatar, generateAdminAvatar } from "../../utils/avatarUtils";

// ChatSidebar component handles the sidebar UI for chat users/admins
const ChatSidebar = ({
    users,
    selectedUser,
    onSelectUser,
    isAdmin,
    onBlockUser,
    onReportUser,
    loading,
    showAdminChat,
    notifications = []
}) => {

    // State for search input, online filter, and search results
    const [searchTerm, setSearchTerm] = useState("");
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const { user: currentUser } = useContext(Context);

    // Effect: fetch users matching search term from backend
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setSearchResults([]);
            return;
        }

        const fetchSearch = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:4000/api/v1/user/search?q=${encodeURIComponent(searchTerm)}`,
                    { withCredentials: true }
                );

                // Only include verified users whose name matches search
                setSearchResults(res.data.users.filter(u =>
                    u.accountVerified &&
                    u.name &&
                    u.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
                ));
            } catch {
                setSearchResults([]);
            }
        };
        fetchSearch();
    }, [searchTerm]);

    // Filter users based on online status and admin/user context
    const filterUsers = (users) => {
        return users.filter(user => {
            const userId = user._id?.toString() || user.id?.toString();
            const currentId = currentUser?._id?.toString() || currentUser?.id?.toString();
            const matchesOnline = showOnlineOnly ? user.status === "online" : true;

            if (isAdmin) return matchesOnline; // Admin sees all except filtered by online

            // Users don't see themselves
            return userId !== currentId && matchesOnline;
        });
    };

    // Use search results if searching, otherwise show all verified users
    const baseUsers = searchTerm.trim() ? searchResults : users.filter(u => u.accountVerified);

    // Final list of users to display
    let displayUsers = filterUsers(baseUsers);

    // If admin chat is enabled, prepend admin support to the list
    if (showAdminChat) {
        displayUsers = [{
            _id: 'admin',
            name: "Admin Support",
            avatar: null,
            status: "online",
            role: "admin",
            lastSeen: "Always Available",
        }, ...displayUsers];
    }

    return (
        <>
            <div className="w-[280px] lg:w-[320px] bg-white/95 border-r border-gray-200 flex flex-col h-full">

                {/* Sidebar header with title and search */}
                <div className="p-4 lg:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-200 ">
                    <h2 className="text-xl font-bold text-blue-700 mb-4 tracking-wide">
                        {isAdmin ? "User Management" : "Chats"}
                    </h2>
                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full py-2 lg:py-3 pl-12 pr-4 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors shadow"
                        />
                        <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>

                    {/* Online only filter and reset button */}
                    <div className="flex items-center mt-2 justify-between">
                        <label className="flex items-center text-sm text-gray-600 cursor-pointer hover:text-indigo-600 transition-colors group">
                            <input
                                type="checkbox"
                                checked={showOnlineOnly}
                                onChange={() => setShowOnlineOnly(!showOnlineOnly)}
                                className="mr-2 h-4 w-4 accent-indigo-600 rounded"
                            />
                            <span className="group-hover:font-medium transition-all">Show online only</span>
                            <span className={`ml-2 w-2 h-2 rounded-full bg-green-500 ${showOnlineOnly ? 'opacity-100' : 'opacity-30'}`}></span>
                        </label>
                        <button
                            type="button"
                            onClick={() => { setSearchTerm(""); setShowOnlineOnly(false); }}
                            className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium"
                        >
                            View Users
                        </button>
                    </div>
                </div>

                {/* Loading spinner or user list */}
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                            <p className="mt-3 text-gray-500">Loading users...</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto bg-white/90">
                        <div className="p-2">
                            <h3 className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 tracking-wider">
                                {isAdmin ? "Manage Users" : "Recent Chats"}
                            </h3>

                            {/* Show message if no users found */}
                            {displayUsers.length === 0 ? (
                                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg m-2">
                                    <i className="fas fa-user-slash text-gray-400 text-2xl mb-2"></i>
                                    <p>No users found</p>
                                </div>
                            ) : (
                                <ul>

                                    {/* Render each user in the sidebar */}
                                    {displayUsers.map((user) => {
                                        const userId = user._id?.toString() || user.id?.toString();
                                        const selectedId = selectedUser?._id?.toString() || selectedUser?.id?.toString();

                                        // Notifications for this user
                                        const userNotifications = notifications.filter(n => n.sender?._id === userId);

                                        // Generate avatar (admin or user)
                                        const avatar = user.role === "admin" ? generateAdminAvatar(user) : generateAvatar(user);

                                        // Highlight if selected
                                        const isSelected = selectedId === userId;

                                        // Border color for reported/blocked/banned users
                                        let borderClass = "";
                                        if (user.isReported) borderClass = "border-l-4 border-yellow-500";
                                        else if (user.status === "blocked") borderClass = "border-l-4 border-red-400";
                                        else if (user.status === "banned") borderClass = "border-l-4 border-black";

                                        return (
                                            <li key={userId} className="mb-1">
                                                <button
                                                    className={`w-full flex items-center px-3 py-2.5 rounded-xl ${isSelected ? "bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm" : "hover:bg-gray-50"
                                                        } transition-all ${borderClass}`}
                                                    onClick={() => onSelectUser(user)}
                                                >
                                                    <div className="relative">

                                                        {/* Show avatar image or fallback initials */}
                                                        {avatar.imageUrl ? (
                                                            <img
                                                                src={avatar.imageUrl}
                                                                alt={user.name || "User"}
                                                                className={`w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm ${user.status === "blocked" ? "opacity-75" :
                                                                    user.status === "banned" ? "opacity-60 grayscale" : ""
                                                                    }`}
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback";
                                                                }}
                                                            />
                                                        ) : (
                                                            <div
                                                                className={`w-12 h-12 rounded-full border border-gray-200 shadow-sm flex items-center justify-center text-white font-medium text-lg ${user.status === "blocked" ? "opacity-75" :
                                                                    user.status === "banned" ? "opacity-60 grayscale" : ""
                                                                    }`}
                                                                style={{ backgroundColor: avatar.color }}
                                                            >
                                                                {avatar.initials}
                                                            </div>
                                                        )}

                                                        {/* Notification badge for unread messages */}
                                                        {userNotifications.length > 0 && (
                                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                                                                {userNotifications.length > 9 ? '9+' : userNotifications.length}
                                                            </span>
                                                        )}

                                                        {/* Status indicator dot */}
                                                        <span
                                                            className={`absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full ${user.status === "online" ? "bg-green-500" :
                                                                user.status === "blocked" ? "bg-red-500" :
                                                                    user.status === "banned" ? "bg-black" : "bg-gray-400"
                                                                } border-2 border-white`}
                                                        ></span>
                                                    </div>
                                                    <div className="ml-3 flex-1 text-left">
                                                        <div className="flex justify-between items-center">
                                                            <h3 className="font-medium text-gray-800">
                                                                {user.name}

                                                                {/* Show admin, blocked, or banned badges */}
                                                                {user.role === "admin" && (
                                                                    <span className="ml-1.5 bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded-full">
                                                                        Admin
                                                                    </span>
                                                                )}
                                                                {user.status === "blocked" && !isAdmin && (
                                                                    <span className="ml-1.5 bg-red-100 text-red-800 text-xs px-1.5 py-0.5 rounded-full">
                                                                        Blocked
                                                                    </span>
                                                                )}
                                                                {user.status === "banned" && !isAdmin && (
                                                                    <span className="ml-1.5 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded-full">
                                                                        Banned
                                                                    </span>
                                                                )}
                                                            </h3>

                                                            {/* Admin controls: block, ban, report */}
                                                            {isAdmin && (
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        className="text-gray-400 hover:text-red-500"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onBlockUser(user.id, "block");
                                                                        }}
                                                                        title={user.status === "blocked" ? "Unblock User" : "Block User"}
                                                                    >
                                                                        <i className={`fas ${user.status === "blocked" ? "fa-unlock" : "fa-ban"} text-xs`}></i>
                                                                    </button>
                                                                    <button
                                                                        className="text-gray-400 hover:text-black"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onBlockUser(user.id, "ban");
                                                                        }}
                                                                        title={user.status === "banned" ? "Unban User" : "Ban User"}
                                                                    >
                                                                        <i className={`fas ${user.status === "banned" ? "fa-user-check" : "fa-user-slash"} text-xs`}></i>
                                                                    </button>
                                                                    <button
                                                                        className="text-gray-400 hover:text-yellow-500"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onReportUser(user.id);
                                                                        }}
                                                                        title="Report User"
                                                                    >
                                                                        <i className="fas fa-flag text-xs"></i>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Show last seen or status */}
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            {user.status === "banned" ? "Banned by admin" :
                                                                user.status === "blocked" ? "Blocked by admin" :
                                                                    user.lastSeen}
                                                        </p>

                                                        {/* Admin: show last activity */}
                                                        {isAdmin && user.lastActivity && (
                                                            <p className="text-xs text-blue-600 mt-1">
                                                                <i className="fas fa-history mr-1"></i>
                                                                {user.lastActivity}
                                                            </p>
                                                        )}

                                                        {/* Admin: show flagged words count */}
                                                        {isAdmin && user.flaggedWords && user.flaggedWords.length > 0 && (
                                                            <div className="flex mt-1 gap-1">
                                                                <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                                                                    <i className="fas fa-exclamation-circle mr-1"></i>
                                                                    {user.flaggedWords.length} flagged
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>
                )}

                {/* Logout button at the bottom */}
                <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <button
                        onClick={async () => {
                            try {
                                await axios.get('http://localhost:4000/api/v1/user/logout', { withCredentials: true });
                                window.location.href = '/login';
                            } catch (error) {
                                console.error('Logout failed:', error);
                            }
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-xl border border-gray-200 shadow-sm transition-colors"
                    >
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default ChatSidebar;
