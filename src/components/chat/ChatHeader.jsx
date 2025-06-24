import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { getAvatarByRole } from "../../utils/avatarUtils";
import { Context } from "../../main";
import { toast } from "react-toastify";

const ChatHeader = ({
  user,
  toggleSidebar,
  sidebarOpen,
  notifications = [],
}) => {
  const avatar = user ? getAvatarByRole(user) : null;
  const { user: currentUser, setUser } = useContext(Context);
  const [showNotifications, setShowNotifications] = useState(false);
  const incomingNotifications = currentUser
    ? notifications.filter((n) => n.sender?._id !== currentUser._id)
    : [];
  const systemNotifications = currentUser?.notifications || [];
  const unreadSystemNotifications = systemNotifications.filter((n) => !n.read);
  const hasNotifications =
    incomingNotifications.length > 0 || unreadSystemNotifications.length > 0;
  const markNotificationAsRead = (notificationId) => {
    if (!currentUser || !currentUser.notifications) return;
    const updatedNotifications = currentUser.notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );

    setUser((prev) => ({
      ...prev,
      notifications: updatedNotifications,
    }));
  };
  const markAllNotificationsAsRead = () => {
    if (!currentUser || !currentUser.notifications) return;
    const updatedNotifications = currentUser.notifications.map((n) => ({
      ...n,
      read: true,
    }));

    setUser((prev) => ({
      ...prev,
      notifications: updatedNotifications,
    }));
  };
  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification.id);

    switch (notification.type) {
      case "report":
        toast.info(
          "You have been reported by an admin. Please review community guidelines."
        );
        break;
      case "ban":
        toast.error(
          "Your account has been banned. Contact support for more information."
        );
        break;
      case "block":
        toast.warning("Your account has been temporarily blocked.");
        break;
      case "message_deleted":
        toast.info("One of your messages was deleted by an admin.");
        break;
      case "warning":
        toast.warning("You have received a warning from an admin.");
        break;
      default:
        toast.info(notification.message);
    }
    setShowNotifications(false);
  };
  const handleMessageNotificationClick = (messageNotification) => {
    toast.info(`Opening chat with ${messageNotification.sender.name}`);
    setShowNotifications(false);
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
              className="text-gray-600 hover:text-blue-600 relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications && hasNotifications) {
                }
              }}
            >
              <div className="flex items-center gap-2">
                <i className="fas fa-bell text-lg md:text-xl"></i>
                <span className="hidden md:inline text-sm font-medium">
                  Notifications
                </span>
              </div>

              {hasNotifications && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center animate-pulse">
                  {Math.min(
                    incomingNotifications.length +
                      unreadSystemNotifications.length,
                    99
                  )}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">
                      Notifications
                    </h3>
                    <div className="flex items-center gap-2">
                      {hasNotifications && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {systemNotifications.length === 0 &&
                  incomingNotifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <i className="fas fa-bell-slash text-3xl text-gray-300 mb-3"></i>
                      <p className="font-medium">No notifications</p>
                      <p className="text-sm text-gray-400">
                        You're all caught up!
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {systemNotifications.map((notification, index) => {
                        const badgeClass = getNotificationBadgeClass(
                          notification.type
                        );
                        const iconName = getNotificationIcon(notification.type);
                        const isUnread = !notification.read;

                        return (
                          <div
                            key={`sys-${notification.id || index}`}
                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                              isUnread ? "bg-blue-50" : "bg-white"
                            } border-l-4 ${badgeClass}`}
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
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
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <p
                                    className={`font-medium text-sm ${
                                      isUnread
                                        ? "text-gray-900"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {notification.title}
                                  </p>
                                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                    {formatNotificationTime(
                                      notification.createdAt
                                    )}
                                  </span>
                                </div>
                                <p
                                  className={`text-sm mt-1 ${
                                    isUnread ? "text-gray-800" : "text-gray-600"
                                  }`}
                                >
                                  {notification.message}
                                </p>
                                {notification.adminAction && (
                                  <div className="mt-2 text-xs text-gray-500 italic">
                                    <i className="fas fa-user-shield mr-1"></i>
                                    Admin action by:{" "}
                                    {notification.adminName || "Administrator"}
                                  </div>
                                )}
                                {isUnread && (
                                  <div className="mt-2">
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                                      <i className="fas fa-circle text-xs mr-1"></i>
                                      New
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {incomingNotifications.map((notification, index) => {
                        const senderAvatar = getAvatarByRole(
                          notification.sender
                        );
                        return (
                          <div
                            key={`msg-${index}`}
                            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 border-green-500"
                            onClick={() =>
                              handleMessageNotificationClick(notification)
                            }
                          >
                            <div className="flex items-start">
                              {senderAvatar?.imageUrl ? (
                                <img
                                  src={senderAvatar.imageUrl}
                                  className="w-10 h-10 rounded-full mr-3 mt-1 border-2 border-green-200"
                                  alt={notification.sender.name}
                                />
                              ) : (
                                <div
                                  className="w-10 h-10 rounded-full mr-3 mt-1 flex items-center justify-center text-white text-sm font-medium border-2 border-green-200"
                                  style={{
                                    backgroundColor:
                                      senderAvatar?.color || "#4f46e5",
                                  }}
                                >
                                  {senderAvatar?.initials ||
                                    notification.sender.name?.charAt(0) ||
                                    "?"}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <p className="font-medium text-sm text-gray-900">
                                    <i className="fas fa-comment-alt text-green-500 mr-1"></i>
                                    {notification.sender.name}
                                  </p>
                                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                    {formatNotificationTime(
                                      notification.createdAt
                                    )}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.content.length > 60
                                    ? `${notification.content.substring(
                                        0,
                                        60
                                      )}...`
                                    : notification.content}
                                </p>
                                <div className="mt-2">
                                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                    <i className="fas fa-envelope text-xs mr-1"></i>
                                    New Message
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {hasNotifications && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <button
                      onClick={() => {
                        markAllNotificationsAsRead();
                        setShowNotifications(false);
                        toast.success("All notifications marked as read");
                      }}
                      className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-1"
                    >
                      <i className="fas fa-check-double mr-1"></i>
                      Mark all as read and close
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <Link
            to="/profile"
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
          >
            {user && (
              <div className="relative">
                {avatar?.imageUrl ? (
                  <img
                    src={avatar.imageUrl}
                    alt={user?.name || "User"}
                    className="w-8 h-8 rounded-full object-cover shadow-sm"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white overflow-hidden shadow-sm ${
                    avatar?.imageUrl ? "hidden" : "flex"
                  }`}
                  style={{ backgroundColor: avatar?.color || "#4f46e5" }}
                >
                  <span className="font-medium text-sm">
                    {avatar?.initials || user?.name?.charAt(0) || "?"}
                  </span>
                </div>
              </div>
            )}
            <span className="hidden md:inline">{user?.name || "User"}</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default ChatHeader;
