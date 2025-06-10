import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { getAvatarByRole } from "../../utils/avatarUtils";
import { Context } from "../../main";

const ChatHeader = ({
  user,
  toggleSidebar,
  sidebarOpen,
  notifications = [],
}) => {
  const avatar = user ? getAvatarByRole(user) : null;
  const { user: currentUser } = useContext(Context);
  const [showNotifications, setShowNotifications] = useState(false);
  const incomingNotifications = currentUser
    ? notifications.filter((n) => n.sender?._id !== currentUser._id)
    : [];
  const systemNotifications = currentUser?.notifications || [];
  const unreadSystemNotifications = systemNotifications.filter((n) => !n.read);
  const hasNotifications =
    incomingNotifications.length > 0 || unreadSystemNotifications.length > 0;
  const markNotificationsAsRead = () => {
    if (!currentUser || !currentUser.notifications) return;

    currentUser.notifications = currentUser.notifications.map((n) => ({
      ...n,
      read: true,
    }));
  };

  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "report":
        return "fa-flag";
      case "ban":
        return "fa-user-slash";
      case "block":
        return "fa-ban";
      case "message_deleted":
        return "fa-trash-alt";
      case "warning":
        return "fa-exclamation-triangle";
      default:
        return "fa-bell";
    }
  };

  const getNotificationBadgeClass = (type) => {
    switch (type) {
      case "report":
        return "border-yellow-500 bg-yellow-50";
      case "ban":
        return "border-red-500 bg-red-50";
      case "block":
        return "border-orange-500 bg-orange-50";
      case "message_deleted":
        return "border-purple-500 bg-purple-50";
      case "warning":
        return "border-yellow-500 bg-yellow-50";
      default:
        return "border-blue-500 bg-blue-50";
    }
  };

  return (
    <>
      <div className="bg-white shadow-md py-3 md:py-4 px-4 md:px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="text-gray-600 hover:text-blue-600 lg:hidden"
          >
            <i className={`fas ${sidebarOpen ? "fa-times" : "fa-bars"}`}></i>
          </button>
          <Link
            to="/"
            className="text-xl md:text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 truncate"
          >
            AI Chat Moderation
          </Link>
        </div>
        <div className="flex items-center gap-2 md:gap-5">
          <div className="relative">
            <button
              className="text-gray-600 hover:text-blue-600 relative"
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) {
                  markNotificationsAsRead();
                }
              }}
            >
              <i className="fas fa-bell text-lg md:text-xl"></i>
              {hasNotifications && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {incomingNotifications.length +
                    unreadSystemNotifications.length >
                  9
                    ? "9+"
                    : incomingNotifications.length +
                      unreadSystemNotifications.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-3 border-b flex justify-between items-center">
                  <h3 className="font-medium">Notifications</h3>
                  <button
                    onClick={() => markNotificationsAsRead()}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Mark all as read
                  </button>
                </div>
                <div className="divide-y divide-gray-100">
                  {systemNotifications.length === 0 &&
                    incomingNotifications.length === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        No notifications
                      </div>
                    )}
                  {systemNotifications.map((notification, index) => {
                    const badgeClass = getNotificationBadgeClass(
                      notification.type
                    );
                    const iconName = getNotificationIcon(notification.type);

                    return (
                      <div
                        key={`sys-${index}`}
                        className={`p-3 ${
                          notification.read ? "bg-white" : "bg-gray-50"
                        } hover:bg-gray-100 border-l-4 ${badgeClass} mb-1 cursor-pointer`}
                        onClick={() => {
                          if (currentUser && currentUser.notifications) {
                            currentUser.notifications =
                              currentUser.notifications.map((n) =>
                                n.id === notification.id
                                  ? { ...n, read: true }
                                  : n
                              );
                          }
                        }}
                      >
                        <div className="flex items-start">
                          <div
                            className={`mt-1 mr-3 flex-shrink-0 ${
                              notification.type === "report"
                                ? "text-yellow-500"
                                : notification.type === "ban"
                                ? "text-red-500"
                                : notification.type === "block"
                                ? "text-orange-500"
                                : notification.type === "message_deleted"
                                ? "text-purple-500"
                                : "text-blue-500"
                            }`}
                          >
                            <i className={`fas ${iconName} text-lg`}></i>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className="font-medium text-sm">
                                {notification.title}
                              </p>
                              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                {formatNotificationTime(notification.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-0.5">
                              {notification.message}
                            </p>
                            {notification.adminAction && (
                              <div className="mt-1 text-xs text-gray-500 italic">
                                Action by:{" "}
                                {notification.adminName || "Administrator"}
                              </div>
                            )}
                            {!notification.read && (
                              <div className="mt-1.5">
                                <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                                  New
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {incomingNotifications.map((notification, index) => (
                    <div key={`msg-${index}`} className="p-3 hover:bg-gray-50">
                      <div className="flex items-start">
                        <img
                          src={
                            notification.sender.avatar ||
                            getAvatarByRole(notification.sender)
                          }
                          className="w-8 h-8 rounded-full mr-3 mt-1"
                          alt={notification.sender.name}
                        />
                        <div>
                          <p className="font-medium text-sm">
                            {notification.sender.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {notification.content.length > 40
                              ? `${notification.content.substring(0, 40)}...`
                              : notification.content}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link to="/" className="text-gray-600 hover:text-blue-600 relative">
            <i className="fas fa-home text-xl"></i>
            <span className="hidden md:inline ml-2">Home</span>
          </Link>
          <Link
            to="/profile"
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white overflow-hidden shadow-sm"
              style={{ backgroundColor: avatar?.color || "#4f46e5" }}
            >
              <span className="font-medium text-sm">
                {avatar?.initials || user?.name?.charAt(0) || "?"}
              </span>
            </div>
            <span className="hidden md:inline">{user?.name || "User"}</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default ChatHeader;
