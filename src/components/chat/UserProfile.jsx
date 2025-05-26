import React from "react";
import { generateAvatar, getAvatarByRole } from "../../utils/avatarUtils";

const UserProfile = ({ user, onClose, isAdmin, onBlockUser, onReportUser }) => {
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
                        <img
                            src={user ? getAvatarByRole(user) : "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"}
                            alt={user?.name || "User"}
                            className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback";
                            }}
                        />
                        <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full ${user.status === "online" ? "bg-green-500" :
                            user.status === "blocked" ? "bg-red-500" :
                                user.status === "banned" ? "bg-black" :
                                    "bg-gray-400"
                            } border-2 border-white`}></span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
                    <p className="text-gray-500 mb-2">
                        {user.status === "online" ? "Active now" : user.lastSeen}
                    </p>
                    {(user.status === "blocked" || user.status === "banned") && (
                        <div className={`mb-4 px-3 py-1 rounded-full text-xs font-medium ${user.status === "blocked" ? "bg-red-100 text-red-800" : "bg-black text-white"
                            }`}>
                            {user.status === "blocked" ? "Blocked by admin" : "Banned by admin"}
                        </div>
                    )}
                    {isAdmin && onBlockUser && onReportUser && (
                        <div className="flex gap-2 mb-6">
                            <button
                                onClick={() => onBlockUser(user._id)}
                                className={`py-1.5 px-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${user.status === "blocked"
                                    ? "bg-green-100 text-green-600 hover:bg-green-200"
                                    : "bg-red-100 text-red-600 hover:bg-red-200"
                                    }`}
                            >
                                <i className={`fas ${user.status === "blocked" ? "fa-unlock" : "fa-ban"}`}></i>
                                {user.status === "blocked" ? "Unblock User" : "Block User"}
                            </button>
                            <button
                                onClick={() => onReportUser(user._id)}
                                className={`py-1.5 px-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${user.isReported
                                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    : "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                                    }`}
                            >
                                <i className={`fas ${user.isReported ? "fa-flag-checkered" : "fa-flag"}`}></i>
                                {user.isReported ? "Remove Report" : "Report"}
                            </button>
                        </div>
                    )}
                </div>
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
                {user.adminActions?.length > 0 && (
                    <div className="mb-5 p-3 bg-red-50 rounded-lg">
                        <h4 className="text-xs uppercase text-red-600 font-medium mb-2">Admin Actions</h4>
                        <ul className="space-y-2">
                            {user.adminActions.map((action, idx) => (
                                <li key={idx} className="text-sm border-b border-red-100 pb-1 text-gray-700">
                                    <div className="flex items-center">
                                        <i className={`fas ${action.type === 'block' ? 'fa-ban text-red-500' :
                                            action.type === 'unblock' ? 'fa-unlock text-green-500' :
                                                'fa-exclamation-circle text-yellow-500'
                                            } mr-2`}></i>
                                        <span>{action.description}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">{action.time}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
