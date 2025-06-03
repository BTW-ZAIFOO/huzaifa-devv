import React from "react";
import { getAvatarByRole } from "../../utils/avatarUtils";

// UserProfile component displays user details in a sidebar/profile panel
const UserProfile = ({ user, onClose, isAdmin, onBlockUser, onReportUser }) => {

    // Helper to determine the color of the status indicator based on user status
    const getStatusColor = () => {
        switch (user.status) {
            case "online": return "bg-green-500";
            case "blocked": return "bg-red-500";
            case "banned": return "bg-black";
            default: return "bg-gray-400";
        }
    };

    // Get avatar info (image, initials, color) based on user role
    const avatar = getAvatarByRole(user);

    return (
        <>

            {/* Sidebar container for the user profile */}
            <div className="w-[300px] bg-white border-l border-gray-200 shadow-lg absolute right-0 top-0 bottom-0 z-20 transform transition-transform duration-300 overflow-y-auto">
                <div className="p-5">

                    {/* Header with title and close button */}
                    <div className="flex justify-between items-center mb-5">
                        <h3 className="text-xl font-semibold">Profile</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    {/* User avatar and basic info */}
                    <div className="flex flex-col items-center">
                        <div className="relative mb-4">

                            {/* Show avatar image if available, otherwise show initials with background color */}
                            {avatar.imageUrl ? (
                                <img
                                    src={avatar.imageUrl}
                                    alt={user?.name || "User"}
                                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                                />
                            ) : (
                                <div
                                    className="w-24 h-24 rounded-full border-4 border-blue-100 flex items-center justify-center text-white text-3xl font-bold"
                                    style={{ backgroundColor: avatar.color }}
                                >
                                    {avatar.initials}
                                </div>
                            )}

                            {/* Status indicator dot */}
                            <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full ${getStatusColor()} border-2 border-white`}></span>
                        </div>

                        {/* User name */}
                        <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>

                        {/* Show last seen or 'Active now' if online */}
                        <p className="text-gray-500 mb-2">
                            {user.status === "online" ? "Active now" : user.lastSeen}
                        </p>

                        {/* Show blocked/banned status if applicable */}
                        {(user.status === "blocked" || user.status === "banned") && (
                            <div className={`mb-4 px-3 py-1 rounded-full text-xs font-medium ${user.status === "blocked" ? "bg-red-100 text-red-800" : "bg-black text-white"}`}>
                                {user.status === "blocked" ? "Blocked by admin" : "Banned by admin"}
                            </div>
                        )}

                        {/* Admin controls: block/unblock and report/remove report */}
                        {isAdmin && onBlockUser && onReportUser && (
                            <div className="flex gap-2 mb-6">

                                {/* Block/Unblock button */}
                                <button
                                    onClick={() => onBlockUser(user._id)}
                                    className={`py-1.5 px-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${user.status === "blocked" ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-red-100 text-red-600 hover:bg-red-200"}`}
                                >
                                    <i className={`fas ${user.status === "blocked" ? "fa-unlock" : "fa-ban"}`}></i>
                                    {user.status === "blocked" ? "Unblock User" : "Block User"}
                                </button>

                                {/* Report/Remove Report button */}
                                <button
                                    onClick={() => onReportUser(user._id)}
                                    className={`py-1.5 px-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${user.isReported ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"}`}
                                >
                                    <i className={`fas ${user.isReported ? "fa-flag-checkered" : "fa-flag"}`}></i>
                                    {user.isReported ? "Remove Report" : "Report"}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Recent activity section, if available */}
                    {user.lastActivity && (
                        <div className="mb-5 p-3 bg-gray-50 rounded-lg">
                            <h4 className="text-xs uppercase text-gray-500 font-medium mb-2">Recent Activity</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <i className="fas fa-history text-blue-500"></i>
                                <span>{user.lastActivity}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{user.lastActivityTime || "Recently"}</p>
                        </div>
                    )}

                    {/* Admin actions history, if any */}
                    {user.adminActions?.length > 0 && (
                        <div className="mb-5 p-3 bg-red-50 rounded-lg">
                            <h4 className="text-xs uppercase text-red-600 font-medium mb-2">Admin Actions</h4>
                            <ul className="space-y-2">
                                {user.adminActions.map((action, idx) => {

                                    // Choose icon based on action type
                                    const iconClass = action.type === 'block' ? 'fa-ban text-red-500' :
                                        action.type === 'unblock' ? 'fa-unlock text-green-500' :
                                            'fa-exclamation-circle text-yellow-500';
                                    return (
                                        <li key={idx} className="text-sm border-b border-red-100 pb-1 text-gray-700">
                                            <div className="flex items-center">

                                                {/* Action icon */}
                                                <i className={`fas ${iconClass} mr-2`}></i>

                                                {/* Action description */}
                                                <span>{action.description}</span>
                                            </div>

                                            {/* Action timestamp */}
                                            <span className="text-xs text-gray-500">{action.time}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default UserProfile;
