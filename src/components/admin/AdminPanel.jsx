import React, { useState, useEffect, useContext, useRef } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import AdminDashboard from "./AdminDashboard";
import ChatWindow from "../chat/ChatWindow";
import ChatSidebar from "../chat/ChatSidebar";
import ReportsView from "./ReportsView";
import PostModerationPanel from "./PostModerationPanel.jsx";
import { Context } from "../../main";
import {
  extractInappropriateWords,
  containsInappropriateContent,
} from "../../utils/moderationUtils";
import io from "socket.io-client";

const AdminPanel = ({ users: initialUsers }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [adminActivity, setAdminActivity] = useState([]);
  const [flaggedUsers, setFlaggedUsers] = useState({});
  const [activeView, setActiveView] = useState("dashboard");
  const [reports, setReports] = useState([]);
  const [userActivities, setUserActivities] = useState({});
  const [messageQueue, setMessageQueue] = useState([]);
  const [users, setUsers] = useState(initialUsers || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: adminUser } = useContext(Context);
  const socketRef = useRef(null);
  const SOCKET_URL = "http://localhost:4000";
  const [adminSettings, setAdminSettings] = useState({
    autoDeleteFlaggedContent: false,
    notifyUsersOnAction: true,
    monitorAllChats: true,
    moderationLevel: "medium",
  });

  useEffect(() => {
    if (!adminUser?.role === "admin") return;

    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      reconnection: true,
    });

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-admin-room");
    });
    socketRef.current.on("admin-message-monitor", (message) => {
      setMessageQueue((prev) => [message, ...prev].slice(0, 50));

      if (containsInappropriateContent(message.content)) {
        const flaggedWords = extractInappropriateWords(message.content);
        logAdminActivity(
          `Auto-detected inappropriate content from ${
            message.sender.name
          }: ${flaggedWords.join(", ")}`,
          "alert"
        );

        setAdminActivity((prev) => [
          {
            timestamp: new Date(),
            action: `⚠️ Flagged message from ${message.sender.name}: "${message.content}"`,
            type: "warning",
            messageId: message._id,
            userId: message.sender._id,
            flaggedWords,
          },
          ...prev,
        ]);

        if (adminSettings.autoDeleteFlaggedContent) {
          handleDeleteMessage(message._id, true);
        }
      }

      trackUserActivity(message.sender._id, "message_sent", {
        content:
          message.content.substring(0, 50) +
          (message.content.length > 50 ? "..." : ""),
        timestamp: message.createdAt,
      });
    });

    socketRef.current.on("user-profile-updated", (updatedUserData) => {
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u._id === updatedUserData.userId) {
            return {
              ...u,
              name: updatedUserData.name || u.name,
              bio:
                updatedUserData.bio !== undefined ? updatedUserData.bio : u.bio,
              location:
                updatedUserData.location !== undefined
                  ? updatedUserData.location
                  : u.location,
              interests: updatedUserData.interests || u.interests,
              avatar:
                typeof updatedUserData.avatar === "string" &&
                updatedUserData.avatar
                  ? updatedUserData.avatar
                  : u.avatar,
              updatedAt: updatedUserData.updatedAt,
            };
          }
          return u;
        })
      );

      if (selectedUser && selectedUser._id === updatedUserData.userId) {
        setSelectedUser((prev) => ({
          ...prev,
          name: updatedUserData.name || prev.name,
          bio:
            updatedUserData.bio !== undefined ? updatedUserData.bio : prev.bio,
          location:
            updatedUserData.location !== undefined
              ? updatedUserData.location
              : prev.location,
          interests: updatedUserData.interests || prev.interests,
          avatar:
            typeof updatedUserData.avatar === "string" && updatedUserData.avatar
              ? updatedUserData.avatar
              : prev.avatar,
        }));
      }

      logAdminActivity(
        `User ${updatedUserData.name || "Unknown"} updated their profile`
      );
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [adminUser, adminSettings.autoDeleteFlaggedContent]);

  useEffect(() => {
    if (selectedUser) {
      loadUserMessages();
    } else {
      setMessages([]);
    }
  }, [selectedUser, activeView]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const loadUserMessages = async () => {
    try {
      const userId = selectedUser._id || selectedUser.id;

      setAdminActivity((prev) => [
        {
          timestamp: new Date(),
          action: `Loaded chat history for ${selectedUser.name}`,
        },
        ...prev,
      ]);

      const simulatedMessages = [
        {
          _id: "msg1",
          content: "Hello there, how are you?",
          sender: { _id: userId, name: selectedUser.name },
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          _id: "msg2",
          content: "I'm doing well, thanks for asking!",
          sender: { _id: adminUser._id, name: adminUser.name },
          createdAt: new Date(Date.now() - 3500000).toISOString(),
        },
        {
          _id: "msg3",
          content: "What can I help you with today?",
          sender: { _id: adminUser._id, name: adminUser.name },
          createdAt: new Date(Date.now() - 3400000).toISOString(),
        },
      ];

      setMessages(simulatedMessages);
    } catch (error) {
      console.error("Failed to load user messages:", error);
      toast.error("Failed to load conversation");
    }
  };

  const handleSendMessage = (messageText, isVoice = false) => {
    if (!messageText.trim()) return;

    const newMessage = {
      _id: `admin-msg-${Date.now()}`,
      content: messageText,
      sender: { _id: adminUser._id, name: adminUser.name },
      createdAt: new Date().toISOString(),
      isVoice,
    };

    setMessages((prev) => [...prev, newMessage]);
    logAdminActivity(`Sent message to ${selectedUser.name}`);
  };

  const handleDeleteMessage = async (messageId, isAutoDelete = false) => {
    try {
      const messageToDelete =
        messages.find((m) => m._id === messageId) ||
        messageQueue.find((m) => m._id === messageId);

      if (!messageToDelete) {
        console.error("Message not found");
        toast.error("Message not found");
        return;
      }

      if (messages.find((m) => m._id === messageId)) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId
              ? {
                  ...m,
                  isDeleted: true,
                  content: "This message was deleted by an admin",
                  deletedAt: new Date().toISOString(),
                  deletedBy: adminUser.name,
                }
              : m
          )
        );
      }

      setMessageQueue((prev) => prev.filter((m) => m._id !== messageId));
      const messageUser = users.find(
        (u) => u._id === messageToDelete.sender._id
      );
      if (messageUser) {
        if (!messageUser.notifications) {
          messageUser.notifications = [];
        }

        messageUser.notifications.unshift({
          id: `msg-deleted-${Date.now()}`,
          type: "message_deleted",
          title: "Message Removed",
          message: `${
            isAutoDelete ? "The system" : "An administrator"
          } has removed one of your messages for violating our guidelines.`,
          createdAt: new Date().toISOString(),
          read: false,
          severity: "medium",
          adminName: isAutoDelete ? "System" : adminUser.name,
          adminAction: true,
          actionTimestamp: new Date().toISOString(),
          originalContent:
            messageToDelete.content.substring(0, 30) +
            (messageToDelete.content.length > 30 ? "..." : ""),
        });

        trackUserActivity(messageUser._id, "message_deleted", {
          content: messageToDelete.content.substring(0, 50),
          deletedBy: isAutoDelete ? "System" : adminUser.name,
          reason: isAutoDelete
            ? "Automated content moderation"
            : "Admin moderation",
        });
      }

      const actionMsg = isAutoDelete
        ? `System automatically deleted message with inappropriate content from ${messageToDelete.sender.name}`
        : `Deleted message from ${
            messageToDelete.sender.name
          }: "${messageToDelete.content.substring(0, 30)}${
            messageToDelete.content.length > 30 ? "..." : ""
          }"`;

      logAdminActivity(actionMsg, isAutoDelete ? "warning" : "standard");

      if (socketRef.current && messageToDelete.chat) {
        socketRef.current.emit("admin-delete-message", {
          messageId,
          chatId: messageToDelete.chat,
        });
      }

      if (isAutoDelete) {
        addNewReport({
          type: "message",
          content: messageToDelete.content,
          user: messageToDelete.sender,
          timestamp: new Date().toISOString(),
          status: "auto_actioned",
          reason: "Automated content moderation - inappropriate content",
          flaggedWords: extractInappropriateWords(messageToDelete.content),
          actionTaken: "deleted",
          actionedBy: "system",
        });
      }

      if (!isAutoDelete) {
        console.log("Message deleted and logged.");
        toast.success("Message deleted and logged");
      }
    } catch (error) {
      console.log("Failed to delete message.");
      toast.error("Failed to delete message");
    }
  };

  const trackUserActivity = (userId, activity, details) => {
    const user = users.find((u) => u._id === userId);
    if (!user) return;

    setUserActivities((prev) => ({
      ...prev,
      [userId]: [
        { activity, details, timestamp: new Date().toISOString() },
        ...(prev[userId] || []).slice(0, 19),
      ],
    }));

    user.lastActivity = activity;
    user.lastActivityTime = new Date().toLocaleTimeString();
  };

  const handleBanUser = async (userId, reason, evidence = null) => {
    try {
      const userToBan = users.find((u) => u._id === userId);
      if (!userToBan) {
        console.error("User not found");
        toast.error("User not found");
        return;
      }

      try {
        await axios.post(
          `http://localhost:4000/api/v1/admin/ban-user`,
          {
            userId,
            reason,
            evidence,
          },
          {
            withCredentials: true,
          }
        );
      } catch (apiError) {}

      if (!userToBan.notifications) {
        userToBan.notifications = [];
      }

      userToBan.notifications.unshift({
        id: `ban-${Date.now()}`,
        type: "ban",
        title: "Account Banned",
        message: `Your account has been banned: "${
          reason || "Violation of community guidelines"
        }"`,
        createdAt: new Date().toISOString(),
        read: false,
        severity: "critical",
        adminName: adminUser.name,
        adminAction: true,
        actionTimestamp: new Date().toISOString(),
      });

      if (!Array.isArray(userToBan.notifications)) {
        userToBan.notifications = [];
      }

      if (socketRef.current) {
        socketRef.current.emit("admin-ban-user", {
          userId,
          notification: {
            type: "ban",
            title: "Account Banned",
            message: `Your account has been banned: "${
              reason || "Violation of community guidelines"
            }"`,
            reason: reason || "Violation of community guidelines",
            createdAt: new Date().toISOString(),
            adminName: adminUser.name,
          },
        });
      }

      console.log(`User ${userToBan.name} has been banned for: ${reason}`);
      toast.success(`User ${userToBan.name} has been banned for ${reason}`);
      logAdminActivity(`Banned user ${userToBan.name} for: ${reason}`, "alert");

      userToBan.status = "banned";
      userToBan.bannedReason = reason;
      userToBan.bannedAt = new Date().toISOString();
      userToBan.bannedBy = adminUser.name;

      setUsers((prev) => prev.map((u) => (u._id === userId ? userToBan : u)));

      trackUserActivity(userId, "banned", {
        reason,
        by: adminUser.name,
        timestamp: new Date().toISOString(),
      });

      if (evidence) {
        addNewReport({
          type: "user",
          user: userToBan,
          content: evidence,
          timestamp: new Date().toISOString(),
          status: "resolved",
          reason: reason,
          actionTaken: "banned",
          actionedBy: adminUser.name,
        });
      }

      if (selectedUser && selectedUser._id === userId) {
        setActiveView("dashboard");
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Failed to ban user.");
      toast.error("Failed to ban user");
    }
  };

  const handleBlockUserAction = async (
    userId,
    action = "block",
    reason = null
  ) => {
    const user = users.find((u) => u._id === userId || u.id === userId);
    if (!user) {
      console.error("User not found");
      toast.error("User not found");
      return;
    }

    const isBlocked = user.status === "blocked";
    const isBanned = user.status === "banned";

    if ((action === "block" && !isBlocked) || (action === "ban" && !isBanned)) {
      if (!reason) {
        reason = prompt(
          `Enter reason for ${action === "block" ? "blocking" : "banning"} ${
            user.name
          }:`
        );
        if (!reason) {
          toast.error(
            `${
              action === "block" ? "Block" : "Ban"
            } action cancelled: Reason is required`
          );
          return;
        }
      }
    }

    if (!user.notifications) {
      user.notifications = [];
    }

    if (action === "block") {
      const updatedUser = { ...user };

      if (!isBlocked) {
        try {
          await axios.post(
            `http://localhost:4000/api/v1/admin/block-user`,
            {
              userId,
              reason,
            },
            {
              withCredentials: true,
            }
          );
        } catch (apiError) {
          toast.error("Failed to block user");
          console.error("API error when blocking user:", apiError);
        }

        updatedUser.notifications.unshift({
          id: `block-${Date.now()}`,
          type: "block",
          title: "Account Blocked",
          message: `Your account has been temporarily blocked. Reason: ${
            reason || "Administrative action"
          }`,
          createdAt: new Date().toISOString(),
          read: false,
          severity: "high",
          adminName: adminUser.name,
          adminAction: true,
          actionTimestamp: new Date().toISOString(),
        });

        if (socketRef.current) {
          socketRef.current.emit("admin-block-user", {
            userId,
            notification: {
              type: "block",
              title: "Account Blocked",
              message: `Your account has been temporarily blocked. Reason: ${
                reason || "Administrative action"
              }`,
              reason: reason || "Administrative action",
              createdAt: new Date().toISOString(),
              adminName: adminUser.name,
            },
          });
        }

        updatedUser.blockReason = reason || "Administrative action";
        updatedUser.blockedAt = new Date().toISOString();
        updatedUser.blockedBy = adminUser.name;

        trackUserActivity(userId, "blocked", {
          reason: reason || "Administrative action",
          by: adminUser.name,
          timestamp: new Date().toISOString(),
        });
      } else {
        try {
          await axios.post(
            `http://localhost:4000/api/v1/admin/unblock-user`,
            {
              userId,
            },
            {
              withCredentials: true,
            }
          );
        } catch (apiError) {}

        updatedUser.notifications.unshift({
          id: `unblock-${Date.now()}`,
          type: "unblock",
          title: "Account Unblocked",
          message: `Your account has been unblocked. You can now resume normal activities.`,
          createdAt: new Date().toISOString(),
          read: false,
          severity: "medium",
          adminName: adminUser.name,
          adminAction: true,
          actionTimestamp: new Date().toISOString(),
        });

        trackUserActivity(userId, "unblocked", {
          by: adminUser.name,
          timestamp: new Date().toISOString(),
        });
      }

      updatedUser.status = isBlocked ? "online" : "blocked";

      setUsers((prev) =>
        prev.map((u) => (u._id === userId || u.id === userId ? updatedUser : u))
      );

      logAdminActivity(
        `${isBlocked ? "Unblocked" : "Blocked"} user ${user.name}${
          !isBlocked ? ` for: ${reason || "Administrative action"}` : ""
        }`,
        isBlocked ? "standard" : "warning"
      );
      console.log(
        `User ${user.name} ${isBlocked ? "unblocked" : "blocked"} successfully`
      );
      toast.success(
        `User ${user.name} ${isBlocked ? "unblocked" : "blocked"} successfully`
      );
    } else if (action === "ban") {
      if (!isBanned) {
        handleBanUser(userId, reason || "Policy violation");
      } else {
        try {
          await axios.post(
            `http://localhost:4000/api/v1/admin/unban-user`,
            {
              userId,
            },
            {
              withCredentials: true,
            }
          );
        } catch (apiError) {}

        const updatedUser = { ...user, status: "online" };

        updatedUser.notifications.unshift({
          id: `unban-${Date.now()}`,
          type: "unban",
          title: "Account Unbanned",
          message: `Your account has been unbanned. You can now resume normal activities.`,
          createdAt: new Date().toISOString(),
          read: false,
          severity: "medium",
          adminName: adminUser.name,
          adminAction: true,
          actionTimestamp: new Date().toISOString(),
        });

        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId || u.id === userId ? updatedUser : u
          )
        );

        trackUserActivity(userId, "unbanned", {
          by: adminUser.name,
          timestamp: new Date().toISOString(),
        });

        logAdminActivity(`Unbanned user ${user.name}`, "standard");
        console.log(`User ${user.name} unbanned successfully`);
        toast.success(`User ${user.name} unbanned successfully`);
      }
    }
  };

  const logAdminActivity = (action, type = "standard") => {
    setAdminActivity((prev) => [
      {
        timestamp: new Date(),
        action,
        type,
      },
      ...prev.slice(0, 99),
    ]);
  };

  const handleReportUserAction = (userId, customReason = "") => {
    const user = users.find((u) => u._id === userId || u.id === userId);
    if (!user) {
      console.error("User not found");
      toast.error("User not found");
      return;
    }

    if (user.isReported && !customReason) {
      user.isReported = false;
      user.reportReason = null;
      user.reportedAt = null;
      user.reportedBy = null;

      if (user.notifications) {
        user.notifications = user.notifications.filter(
          (n) => n.type !== "report"
        );
      }

      setReports((prev) =>
        prev.filter(
          (r) =>
            !(
              r.type === "user" &&
              r.user._id === userId &&
              r.status !== "resolved"
            )
        )
      );

      logAdminActivity(`Removed report from user ${user.name}`);
      toast.success(`Report removed from user ${user.name}`);
      return;
    }

    if (!customReason) {
      const reportReason = prompt(
        "Please provide a reason for reporting this user:"
      );
      if (!reportReason || reportReason.trim() === "") {
        console.error("Report cancelled: A reason is required");
        toast.error("Report cancelled: A reason is required");
        return;
      }
      customReason = reportReason.trim();
    }

    user.isReported = true;
    user.reportReason = customReason;
    user.reportedAt = new Date().toISOString();
    user.reportedBy = adminUser.name;
    user.reportId = `report-${Date.now()}`;

    if (!user.notifications) {
      user.notifications = [];
    }

    user.notifications.unshift({
      id: `report-${Date.now()}`,
      type: "report",
      title: "Account Reported by Administrator",
      message: `Your account has been reported by an administrator: "${customReason}"`,
      createdAt: new Date().toISOString(),
      read: false,
      severity: "high",
      reportId: user.reportId,
      adminName: adminUser.name,
      adminAction: true,
      actionTimestamp: new Date().toISOString(),
    });

    addNewReport({
      type: "user",
      user: user,
      content: customReason,
      timestamp: new Date().toISOString(),
      status: "pending",
      reason: customReason,
      reportedBy: adminUser.name,
    });

    trackUserActivity(userId, "reported", {
      reason: customReason,
      by: adminUser.name,
      timestamp: new Date().toISOString(),
    });

    logAdminActivity(
      `Reported user ${user.name} for: ${customReason}`,
      "warning"
    );
    toast.success(`User ${user.name} has been reported for "${customReason}"`);
  };

  const renderAdminNav = () => (
    <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex items-center space-x-4">
      <button
        onClick={() => setActiveView("dashboard")}
        className={`px-3 py-1.5 rounded-md transition-colors ${
          activeView === "dashboard"
            ? "bg-purple-700 text-white"
            : "bg-purple-100 text-purple-700 hover:bg-purple-200"
        }`}
      >
        <i className="fas fa-th-large mr-1.5"></i> Dashboard
      </button>
      <button
        onClick={() => setActiveView("reports")}
        className={`px-3 py-1.5 rounded-md transition-colors flex items-center ${
          activeView === "reports"
            ? "bg-purple-700 text-white"
            : "bg-purple-100 text-purple-700 hover:bg-purple-200"
        }`}
      >
        <i className="fas fa-flag mr-1.5"></i> Reports
        {Array.isArray(reports) &&
          reports.filter((r) => r.status === "pending").length > 0 && (
            <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {reports.filter((r) => r.status === "pending").length}
            </span>
          )}
      </button>
      <button
        onClick={() => setActiveView("posts")}
        className={`px-3 py-1.5 rounded-md transition-colors flex items-center ${
          activeView === "posts"
            ? "bg-purple-700 text-white"
            : "bg-purple-100 text-purple-700 hover:bg-purple-200"
        }`}
      >
        <i className="fas fa-file-alt mr-1.5"></i> Posts
      </button>
      <button
        onClick={() => setActiveView("messages")}
        className={`px-3 py-1.5 rounded-md transition-colors flex items-center ${
          activeView === "messages"
            ? "bg-purple-700 text-white"
            : "bg-purple-100 text-purple-700 hover:bg-purple-200"
        }`}
      >
        <i className="fas fa-comment-alt mr-1.5"></i> Live Messages
        {Array.isArray(messageQueue) && messageQueue.length > 0 && (
          <span className="ml-1.5 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {messageQueue.length}
          </span>
        )}
      </button>
      <button
        onClick={() => setActiveView("settings")}
        className={`px-3 py-1.5 rounded-md transition-colors ${
          activeView === "settings"
            ? "bg-purple-700 text-white"
            : "bg-purple-100 text-purple-700 hover:bg-purple-200"
        }`}
      >
        <i className="fas fa-cog mr-1.5"></i> Settings
      </button>
    </div>
  );

  const renderSettingsView = () => (
    <div className="flex-1 p-6 bg-gray-50 overflow-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Admin Settings</h2>
        <p className="text-gray-600">
          Configure moderation settings and preferences
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Content Moderation
            </h3>
            <div className="space-y-4">
              <div>
                <label className="flex items-center text-gray-700">
                  <input
                    type="checkbox"
                    checked={adminSettings.autoDeleteFlaggedContent}
                    onChange={() =>
                      setAdminSettings((prev) => ({
                        ...prev,
                        autoDeleteFlaggedContent:
                          !prev.autoDeleteFlaggedContent,
                      }))
                    }
                    className="mr-3 h-4 w-4 accent-red-600 rounded"
                  />
                  <span>Automatically delete flagged content</span>
                </label>
                <p className="text-xs text-gray-500 ml-7 mt-1">
                  Messages containing inappropriate words will be deleted
                  without review
                </p>
              </div>
              <div>
                <label className="flex items-center text-gray-700">
                  <input
                    type="checkbox"
                    checked={adminSettings.notifyUsersOnAction}
                    onChange={() =>
                      setAdminSettings((prev) => ({
                        ...prev,
                        notifyUsersOnAction: !prev.notifyUsersOnAction,
                      }))
                    }
                    className="mr-3 h-4 w-4 accent-blue-600 rounded"
                  />
                  <span>Notify users on moderation actions</span>
                </label>
                <p className="text-xs text-gray-500 ml-7 mt-1">
                  Users will receive notifications when their content is
                  moderated
                </p>
              </div>
              <div>
                <label className="flex items-center text-gray-700">
                  <input
                    type="checkbox"
                    checked={adminSettings.monitorAllChats}
                    onChange={() =>
                      setAdminSettings((prev) => ({
                        ...prev,
                        monitorAllChats: !prev.monitorAllChats,
                      }))
                    }
                    className="mr-3 h-4 w-4 accent-blue-600 rounded"
                  />
                  <span>Monitor all chat conversations</span>
                </label>
                <p className="text-xs text-gray-500 ml-7 mt-1">
                  All messages will be monitored for inappropriate content
                </p>
              </div>
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moderation Level
                </label>
                <select
                  value={adminSettings.moderationLevel}
                  onChange={(e) =>
                    setAdminSettings((prev) => ({
                      ...prev,
                      moderationLevel: e.target.value,
                    }))
                  }
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="low">
                    Low - Flag obvious violations only
                  </option>
                  <option value="medium">
                    Medium - Standard content filtering
                  </option>
                  <option value="high">
                    High - Strict content policy enforcement
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Admin Preferences
            </h3>
            <div className="space-y-4">
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default View
                </label>
                <select
                  value={activeView}
                  onChange={(e) => setActiveView(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="dashboard">Dashboard</option>
                  <option value="reports">Reports</option>
                  <option value="messages">Live Messages</option>
                  <option value="settings">Settings</option>
                </select>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => {
                    toast.info("Settings saved successfully");
                    logAdminActivity("Updated admin settings");
                  }}
                  className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleViewUserChat = (user) => {
    setSelectedUser(user);
    setActiveView("chat");
    logAdminActivity(`Viewing ${user.name}'s chat history`);
  };

  const handleViewUserProfile = () => {
    if (!selectedUser) return;
    logAdminActivity(`Viewed ${selectedUser.name}'s profile`);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        "http://localhost:4000/api/v1/user/all",
        {
          withCredentials: true,
        }
      );

      const userData = response.data.users || [];

      const enhancedUsers = userData.map((user) => ({
        ...user,
        notifications: user.notifications || [],
        status: user.status || (user.isOnline ? "online" : "offline"),
        flaggedWords: user.flaggedWords || [],
      }));

      setUsers(enhancedUsers);
      logAdminActivity(`Loaded ${enhancedUsers.length} users`);
      processUsersForModeration(enhancedUsers);
    } catch (err) {
      setError("Failed to load users. Please try again.");
      toast.error("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  const processUsersForModeration = (userList) => {
    const flaggedUserMap = {};

    userList.forEach((user) => {
      if (user.messages) {
        user.messages.forEach((message) => {
          if (containsInappropriateContent(message.content)) {
            const flaggedWords = extractInappropriateWords(message.content);
            if (flaggedWords.length > 0) {
              if (!flaggedUserMap[user._id]) {
                flaggedUserMap[user._id] = [];
              }
              flaggedUserMap[user._id] = [
                ...new Set([...flaggedUserMap[user._id], ...flaggedWords]),
              ];
            }
          }
        });
      }
    });

    setFlaggedUsers(flaggedUserMap);
  };

  const handleRefreshUsers = () => {
    fetchUsers();
    console.log("Refreshing user data...");
    toast.info("Refreshing user data...");
  };

  const addNewReport = (reportData) => {
    setReports((prev) => [
      {
        id: `report-${Date.now()}`,
        ...reportData,
        timestamp: reportData.timestamp || new Date().toISOString(),
        reviewed: false,
      },
      ...prev,
    ]);
  };

  const handleResolveReport = (reportId, action, reason) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId
          ? {
              ...report,
              status: "resolved",
              resolution: action,
              resolutionReason: reason,
              resolvedBy: adminUser.name,
              resolvedAt: new Date().toISOString(),
              reviewed: true,
            }
          : report
      )
    );

    logAdminActivity(
      `Resolved report #${reportId.split("-")[1]} with action: ${action}`,
      "standard"
    );
    toast.success(`Report resolved with action: ${action}`);
  };

  const handleIgnoreReport = (reportId) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId
          ? {
              ...report,
              status: "ignored",
              ignoredBy: adminUser.name,
              ignoredAt: new Date().toISOString(),
              reviewed: true,
            }
          : report
      )
    );

    logAdminActivity(`Ignored report #${reportId.split("-")[1]}`, "standard");
    toast.info(`Report marked as ignored`);
  };

  const renderMessageQueue = () => {
    if (messageQueue.length === 0) {
      return (
        <div className="text-center py-20 bg-white rounded-lg shadow-sm">
          <div className="text-gray-400 text-5xl mb-4">
            <i className="far fa-comment-alt"></i>
          </div>
          <h3 className="text-xl font-medium text-gray-700">
            No messages in queue
          </h3>
          <p className="text-gray-500 mt-2">
            New messages will appear here in real-time
          </p>
        </div>
      );
    } else {
      return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {messageQueue.map((message) => {
                const hasFlaggedContent = containsInappropriateContent(
                  message.content
                );
                const flaggedWords = hasFlaggedContent
                  ? extractInappropriateWords(message.content)
                  : [];

                return (
                  <tr
                    key={message._id}
                    className={hasFlaggedContent ? "bg-red-50" : ""}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          <div
                            className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium"
                            style={{
                              backgroundColor:
                                getAvatarByRole(message.sender)?.color ||
                                "#4f46e5",
                            }}
                          >
                            {getAvatarByRole(message.sender)?.initials ||
                              message.sender.name?.charAt(0) ||
                              "?"}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {message.sender.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {message.sender._id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {hasFlaggedContent ? (
                          <div>
                            {message.content.split(" ").map((word, i) => {
                              const isFlagged = flaggedWords.includes(
                                word.toLowerCase()
                              );
                              return (
                                <span
                                  key={i}
                                  className={
                                    isFlagged
                                      ? "bg-red-200 text-red-800 px-1 rounded mx-1"
                                      : "mx-1"
                                  }
                                >
                                  {word}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          message.content
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {hasFlaggedContent ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Flagged
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Clean
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewUserChat(message.sender)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <i className="fas fa-comments"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(message._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                      <button
                        onClick={() =>
                          handleBlockUserAction(
                            message.sender._id,
                            "block",
                            "Inappropriate message content"
                          )
                        }
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <i className="fas fa-ban"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
  };

  return (
    <>
      <div className="flex-1 flex flex-col h-full">
        <div className="bg-purple-100 p-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSidebar}
              className="lg:hidden text-purple-700 hover:bg-purple-200 p-2 rounded-md"
            >
              <i className={`fas ${sidebarOpen ? "fa-times" : "fa-bars"}`}></i>
            </button>
            <h1 className="text-xl font-semibold text-purple-800">
              <i className="fas fa-shield-alt mr-2"></i> Admin Control Panel
            </h1>
            <span className="bg-purple-200 text-purple-800 text-xs px-2.5 py-1 rounded-full">
              Admin Access
            </span>
          </div>
          <div>
            <button
              onClick={handleRefreshUsers}
              className="bg-white text-purple-700 px-3 py-1.5 rounded-full shadow-sm hover:bg-purple-50 transition-colors"
            >
              <i className="fas fa-sync-alt mr-2"></i> Refresh Users
            </button>
          </div>
        </div>

        {renderAdminNav()}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mb-3"></div>
              <p className="text-gray-700">Loading user data...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fas fa-exclamation-triangle text-red-500"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <div className="mt-2">
                  <button
                    onClick={fetchUsers}
                    className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors text-xs"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {activeView === "chat" &&
            (sidebarOpen || window.innerWidth > 1024) && (
              <ChatSidebar
                users={users.filter((u) => u.role !== "admin")}
                selectedUser={selectedUser}
                onSelectUser={handleViewUserChat}
                isAdmin={true}
                onBlockUser={handleBlockUserAction}
                onReportUser={handleReportUserAction}
                loading={loading}
              />
            )}

          <div className="flex-1 flex">
            {activeView === "dashboard" && (
              <AdminDashboard
                users={users}
                onBlockUser={handleBlockUserAction}
                onReportUser={handleReportUserAction}
                onViewUserChat={handleViewUserChat}
                onBanUser={handleBanUser}
                flaggedUsers={flaggedUsers}
                userActivities={userActivities}
                onViewUserActivity={(userId) => {
                  const user = users.find((u) => u._id === userId);
                  if (user) {
                    toast.info(`Viewing ${user.name}'s activity history`);
                  }
                }}
              />
            )}

            {activeView === "chat" && (
              <div className="flex-1 flex flex-col">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3">
                  <button
                    onClick={() => setActiveView("dashboard")}
                    className="flex items-center text-purple-600 hover:text-purple-800 px-4 py-1.5 bg-white rounded-full shadow-sm"
                  >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Back to Dashboard
                  </button>
                </div>
                <ChatWindow
                  selectedUser={selectedUser}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onViewProfile={handleViewUserProfile}
                  isAdmin={true}
                  onDeleteMessage={handleDeleteMessage}
                  onBanUser={handleBanUser}
                />
              </div>
            )}

            {activeView === "reports" && (
              <div className="flex-1 overflow-hidden">
                <ReportsView
                  reports={reports}
                  onResolve={handleResolveReport}
                  onIgnore={handleIgnoreReport}
                  onViewUser={handleViewUserChat}
                  onBanUser={handleBanUser}
                  onBlockUser={handleBlockUserAction}
                />
              </div>
            )}

            {activeView === "messages" && (
              <div className="flex-1 p-6 bg-gray-50 overflow-auto">
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">
                      Live Message Monitoring
                    </h2>
                    <p className="text-gray-600">
                      Real-time message stream across all conversations
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-4 flex items-center">
                      <input
                        type="checkbox"
                        id="autoDeleteToggle"
                        checked={adminSettings.autoDeleteFlaggedContent}
                        onChange={() =>
                          setAdminSettings((prev) => ({
                            ...prev,
                            autoDeleteFlaggedContent:
                              !prev.autoDeleteFlaggedContent,
                          }))
                        }
                        className="mr-2 h-4 w-4 accent-red-600 rounded"
                      />
                      <label
                        htmlFor="autoDeleteToggle"
                        className="text-sm text-gray-700"
                      >
                        Auto-delete flagged content
                      </label>
                    </div>
                    <button
                      onClick={() => setMessageQueue([])}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Clear Queue
                    </button>
                  </div>
                </div>
                {renderMessageQueue()}
              </div>
            )}

            {activeView === "settings" && renderSettingsView()}

            {activeView === "posts" && (
              <div className="flex-1 p-6 bg-gray-50 overflow-auto">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Post Management
                  </h2>
                  <p className="text-gray-600">
                    Monitor, review, and moderate user posts
                  </p>
                </div>
                <PostModerationPanel />
              </div>
            )}
          </div>

          {activeView !== "chat" && (
            <div className="w-[320px] bg-white border-l border-gray-200 overflow-auto hidden lg:block">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-800">
                  Admin Activity Log
                </h3>
              </div>
              <div className="p-4">
                {adminActivity.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No activity yet
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {adminActivity.map((activity, index) => (
                      <li
                        key={index}
                        className={`text-sm border-b border-gray-100 pb-2 ${
                          activity.type === "alert"
                            ? "bg-red-50 p-2 rounded"
                            : activity.type === "warning"
                            ? "bg-yellow-50 p-2 rounded"
                            : ""
                        }`}
                      >
                        <span className="text-xs text-gray-500 block">
                          {activity.timestamp.toLocaleTimeString()}
                        </span>
                        <span
                          className={`${
                            activity.type === "alert"
                              ? "text-red-800"
                              : activity.type === "warning"
                              ? "text-yellow-800"
                              : "text-gray-800"
                          }`}
                        >
                          {activity.action}
                        </span>

                        {activity.type === "warning" && activity.messageId && (
                          <div className="mt-2 flex space-x-2">
                            <button
                              onClick={() =>
                                handleDeleteMessage(activity.messageId)
                              }
                              className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => {
                                if (activity.userId) {
                                  handleBlockUserAction(
                                    activity.userId,
                                    "block",
                                    "Flagged message content"
                                  );
                                }
                              }}
                              className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded hover:bg-yellow-200"
                            >
                              Block User
                            </button>
                            <button
                              onClick={() => {
                                const updatedActivity = adminActivity.filter(
                                  (_, i) => i !== index
                                );
                                setAdminActivity(updatedActivity);
                              }}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200"
                            >
                              Ignore
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminPanel;
