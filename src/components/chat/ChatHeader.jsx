import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { getAvatarByRole } from "../../utils/avatarUtils";
import { Context } from "../../main";

const ChatHeader = ({ user, toggleSidebar, sidebarOpen, notifications = [] }) => {
    const avatarUrl = user ? getAvatarByRole(user) : null;
    const { user: currentUser } = useContext(Context);

    const incomingNotifications = currentUser ?
        notifications.filter(n => n.sender?._id !== currentUser._id) :
        [];

    return (
        <>
            <div className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleSidebar}
                        className="text-gray-600 hover:text-blue-600 lg:hidden"
                    >
                        <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
                    </button>
                    <Link to="/" className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                        AI Chat Moderation
                    </Link>
                </div>
                <div className="flex items-center gap-5">
                    <Link to="/chat" className="text-gray-600 hover:text-blue-600 relative">
                        <i className="fas fa-comments text-xl"></i>
                        <span className="hidden md:inline ml-2">Chat</span>
                        {incomingNotifications.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {incomingNotifications.length > 9 ? '9+' : incomingNotifications.length}
                            </span>
                        )}
                    </Link>
                    <Link to="/" className="text-gray-600 hover:text-blue-600 relative">
                        <i className="fas fa-home text-xl"></i>
                        <span className="hidden md:inline ml-2">Home</span>
                    </Link>
                    <Link to="/profile" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white overflow-hidden shadow-sm relative">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={user?.name || "User"} className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-medium text-sm">{user?.name?.charAt(0) || "?"}</span>
                            )}
                        </div>
                        <span className="hidden md:inline">{user?.name || "User"}</span>
                    </Link>
                </div>
            </div>
        </>
    );
};

export default ChatHeader;
