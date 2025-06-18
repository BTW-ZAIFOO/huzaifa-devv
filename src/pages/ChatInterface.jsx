import React, { useState, useContext, useEffect, useRef } from "react";
import { Navigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { io as socketIOClient } from "socket.io-client";
import { Context } from "../main";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWindow from "../components/chat/ChatWindow";
import AdminPanel from "../components/admin/AdminPanel";
import ChatHeader from "../components/chat/ChatHeader";
import ConnectionStatus from "../components/chat/ConnectionStatus";
import { getAvatarByRole } from "../utils/avatarUtils";
import {
  containsInappropriateContent,
  extractInappropriateWords,
} from "../utils/moderationUtils";
import LoadingScreen from "../components/LoadingScreen";
import UserProfile from "../components/UserProfile";
import GroupProfileSidebar from "../components/chat/GroupProfileSidebar";

const ChatInterface = ({ adminMode }) => {
  const { isAuthenticated, user, isAdmin, setUser, isAuthLoading } =
    useContext(Context);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [showGroupProfileSidebar, setShowGroupProfileSidebar] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const socketRef = useRef(null);
  const heartbeatRef = useRef(null);
  const SOCKET_URL = "http://localhost:4000";

  useEffect(() => {
    if (user) {
      try {
        const savedChat = localStorage.getItem(`chat_state_${user._id}`);
        if (savedChat) {
          const chatData = JSON.parse(savedChat);
          if (chatData.selectedChat && chatData.selectedUser) {
            setSelectedChat(chatData.selectedChat);
            setSelectedUser(chatData.selectedUser);
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const setupSocket = () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      socketRef.current = socketIOClient(SOCKET_URL, {
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      socketRef.current.on("connect", () => {
        setSocketConnected(true);
        setReconnectAttempt(0);

        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        heartbeatRef.current = setInterval(() => {
          if (socketRef.current) {
            socketRef.current.emit("heartbeat", { userId: user._id });
          }
        }, 15000);
      });

      socketRef.current.on("disconnect", () => {
        setSocketConnected(false);

        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current);
        }
      });

      socketRef.current.on("connect_error", (error) => {
        setSocketConnected(false);

        if (reconnectAttempt < 5) {
          setTimeout(() => {
            setReconnectAttempt((prev) => prev + 1);
            setupSocket();
          }, 2000);
        } else {
          console.error(
            "Unable to connect to chat server. Please check your connection and refresh the page."
          );
          toast.error(
            "Unable to connect to chat server. Please check your connection and refresh the page."
          );
        }
      });

      socketRef.current.on("error", (error) => {
        console.error("Server error.");
        toast.error("Server error: " + (error.message || "Unknown error"));
      });

      socketRef.current.on("admin-message-deleted", ({ messageId }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? {
                  ...msg,
                  isDeleted: true,
                  content: "This message was deleted by an admin",
                }
              : msg
          )
        );
        console.log("Message deleted by admin.");
        toast.info("A message was deleted by an admin.");
      });

      socketRef.current.on("admin-user-blocked", (notification) => {
        if (notification && notification.type === "block") {
          setUser((prev) => ({
            ...prev,
            status: "blocked",
            blockReason: notification.reason,
            notifications: [notification, ...(prev.notifications || [])],
          }));
          console.log(`You have been blocked by an admin.`);
          toast.warning(
            notification.message || "You have been blocked by an admin."
          );
        }
      });

      socketRef.current.on("admin-user-banned", (notification) => {
        if (notification && notification.type === "ban") {
          setUser((prev) => ({
            ...prev,
            status: "banned",
            bannedReason: notification.reason,
            notifications: [notification, ...(prev.notifications || [])],
          }));
          console.log(`You have been banned by an admin.`);
          toast.error(
            notification.message || "You have been banned by an admin."
          );
        }
      });

      socketRef.current.on("admin-notification", (notification) => {
        setUser((prev) => ({
          ...prev,
          notifications: [notification, ...(prev.notifications || [])],
        }));
        console.log("New admin notification");
        toast.info(
          notification.message || "You have a new notification from admin."
        );
      });

      socketRef.current.on("user-profile-updated", (updatedUserData) => {
        setAllUsers((prevUsers) =>
          prevUsers.map((u) => {
            if (u._id === updatedUserData.userId) {
              let updatedAvatar =
                typeof updatedUserData.avatar === "string" &&
                updatedUserData.avatar
                  ? updatedUserData.avatar
                  : u.avatar;
              if (updatedAvatar && !updatedAvatar.startsWith("data:")) {
                const timestamp = new Date().getTime();
                updatedAvatar = updatedAvatar.includes("?")
                  ? `${updatedAvatar}&t=${timestamp}`
                  : `${updatedAvatar}?t=${timestamp}`;
              }

              return {
                ...u,
                name: updatedUserData.name || u.name,
                bio:
                  updatedUserData.bio !== undefined
                    ? updatedUserData.bio
                    : u.bio,
                location:
                  updatedUserData.location !== undefined
                    ? updatedUserData.location
                    : u.location,
                interests: updatedUserData.interests || u.interests,
                avatar: updatedAvatar,
              };
            }
            return u;
          })
        );

        if (selectedUser && selectedUser._id === updatedUserData.userId) {
          let updatedAvatar =
            typeof updatedUserData.avatar === "string" && updatedUserData.avatar
              ? updatedUserData.avatar
              : selectedUser.avatar;
          if (updatedAvatar && !updatedAvatar.startsWith("data:")) {
            const timestamp = new Date().getTime();
            updatedAvatar = updatedAvatar.includes("?")
              ? `${updatedAvatar}&t=${timestamp}`
              : `${updatedAvatar}?t=${timestamp}`;
          }

          setSelectedUser((prev) => ({
            ...prev,
            name: updatedUserData.name || prev.name,
            bio:
              updatedUserData.bio !== undefined
                ? updatedUserData.bio
                : prev.bio,
            location:
              updatedUserData.location !== undefined
                ? updatedUserData.location
                : prev.location,
            interests: updatedUserData.interests || prev.interests,
            avatar: updatedAvatar,
          }));
        }

        if (user && updatedUserData.userId === user._id) {
          let updatedAvatar =
            typeof updatedUserData.avatar === "string" && updatedUserData.avatar
              ? updatedUserData.avatar
              : user.avatar;
          if (updatedAvatar && !updatedAvatar.startsWith("data:")) {
            const timestamp = new Date().getTime();
            updatedAvatar = updatedAvatar.includes("?")
              ? `${updatedAvatar}&t=${timestamp}`
              : `${updatedAvatar}?t=${timestamp}`;
          }
          const updatedUser = {
            ...user,
            name: updatedUserData.name || user.name,
            bio:
              updatedUserData.bio !== undefined
                ? updatedUserData.bio
                : user.bio,
            location:
              updatedUserData.location !== undefined
                ? updatedUserData.location
                : user.location,
            interests: updatedUserData.interests || user.interests,
            avatar: updatedAvatar,
          };
          setUser(updatedUser);
          try {
            localStorage.setItem("user", JSON.stringify(updatedUser));
          } catch (err) {}
        }
      });

      socketRef.current.on("message-deleted", ({ messageId, permanent }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? {
                  ...msg,
                  isDeleted: !permanent,
                  permanentlyDeleted: permanent,
                  content: permanent
                    ? "This message has been permanently deleted"
                    : "This message has been deleted",
                }
              : msg
          )
        );
      });

      socketRef.current.on("new-message", (message) => {
        if (selectedChat && message.chat === selectedChat.chat._id) {
          setMessages((prev) => [...prev, message]);

          if (message.sender._id !== user._id) {
            socketRef.current.emit("message-received", {
              chatId: selectedChat.chat._id,
              messageId: message._id,
            });
          }
        } else if (message.sender._id !== user._id) {
          setNotifications((prev) => [
            {
              chatId: message.chat,
              sender: message.sender,
              content: message.content,
              createdAt: message.createdAt,
            },
            ...prev,
          ]);
        }
      });
    };

    setupSocket();

    socketRef.current.on("new-message", (message) => {
      if (selectedChat && message.chat === selectedChat.chat._id) {
        setMessages((prev) => [...prev, message]);

        if (message.sender._id !== user._id) {
          socketRef.current.emit("message-received", {
            chatId: selectedChat.chat._id,
            messageId: message._id,
          });
        }
      } else if (message.sender._id !== user._id) {
        setNotifications((prev) => [
          {
            chatId: message.chat,
            sender: message.sender,
            content: message.content,
            createdAt: message.createdAt,
          },
          ...prev,
        ]);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };
  }, [user, reconnectAttempt]);

  useEffect(() => {
    if (!socketRef.current) return;
    if (selectedChat && selectedChat.chat && selectedChat.chat._id) {
      socketRef.current.emit("join-room", selectedChat.chat._id);
    }
    return () => {
      if (
        socketRef.current &&
        selectedChat &&
        selectedChat.chat &&
        selectedChat.chat._id
      ) {
        socketRef.current.emit("leave-room", selectedChat.chat._id);
      }
    };
  }, [selectedChat]);

  useEffect(() => {
    if (!user || !socketConnected || !socketRef.current) return;
    axios
      .get("http://localhost:4000/api/v1/user/all", { withCredentials: true })
      .then((res) => {
        res.data.users.forEach((u) => {
          if (u._id !== user._id) {
            axios
              .post(
                "http://localhost:4000/api/v1/chat/create",
                { recipientId: u._id },
                { withCredentials: true }
              )
              .then((chatRes) => {
                if (socketRef.current && chatRes.data.chat._id) {
                  console.log(`Joining room: ${chatRes.data.chat._id}`);
                  socketRef.current.emit("join-room", chatRes.data.chat._id);
                }
              })
              .catch((err) => console.error("Error creating chat:", err));
          }
        });
      })
      .catch((err) =>
        console.error("Error fetching users for chat rooms:", err)
      );
  }, [user, socketConnected]);

  useEffect(() => {
    if (selectedUser) {
      loadUserMessages();
    } else {
      setMessages([]);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    axios
      .get("http://localhost:4000/api/v1/user/all", { withCredentials: true })
      .then((res) => {
        setAllUsers(res.data.users);
        setLoading(false);

        const currentUserFromApi = res.data.users.find(
          (u) => u._id === user._id
        );
        if (currentUserFromApi) {
          if (
            currentUserFromApi.isReported &&
            !currentUserFromApi.notifications?.some((n) => n.type === "report")
          ) {
            const reason =
              currentUserFromApi.reportReason || "Content policy violation";
            addUserNotification({
              type: "report",
              title: "Your Account Has Been Reported",
              message: `An admin has reported your account: "${reason}"`,
              severity: "high",
            });
          }

          if (
            currentUserFromApi.status === "banned" &&
            !currentUserFromApi.notifications?.some((n) => n.type === "ban")
          ) {
            const reason =
              currentUserFromApi.bannedReason || "Multiple violations";
            addUserNotification({
              type: "ban",
              title: "Your Account Has Been Banned",
              message: `Your account has been banned: "${reason}"`,
              severity: "critical",
            });
          }

          if (
            currentUserFromApi.status === "blocked" &&
            !currentUserFromApi.notifications?.some((n) => n.type === "block")
          ) {
            const reason =
              currentUserFromApi.blockReason || "Temporary suspension";
            addUserNotification({
              type: "block",
              title: "Your Account Has Been Blocked",
              message: `Your account has been temporarily blocked: "${reason}"`,
              severity: "high",
            });
          }
        }
      })
      .catch(() => setLoading(false));
  }, [user]);

  const fetchUsersWithStatus = async (showLoading = true) => {
    if (showLoading) setLoading(true);

    try {
      const res = await axios.get("http://localhost:4000/api/v1/user/all", {
        withCredentials: true,
      });

      const usersWithVerifiedStatus = res.data.users.map((user) => {
        if (!user.status) {
          user.status = "offline";
        }

        if (user.status !== "blocked" && user.status !== "banned") {
          const lastActivity = new Date(user.lastSeen || 0);
          const now = new Date();
          const inactiveThreshold = 5 * 60 * 1000;

          if (now - lastActivity > inactiveThreshold) {
            user.status = "offline";
          }
        }

        return user;
      });

      setAllUsers(usersWithVerifiedStatus);

      if (selectedUser) {
        const updatedSelectedUser = usersWithVerifiedStatus.find(
          (u) => u._id === selectedUser._id || u.id === selectedUser._id
        );

        if (updatedSelectedUser) {
          setSelectedUser((prev) => ({
            ...prev,
            status: updatedSelectedUser.status,
            lastSeen: updatedSelectedUser.lastSeen,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const addUserNotification = (notification) => {
    const newNotification = {
      id: `notification-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
      ...notification,
    };

    const updatedUser = { ...user };

    if (!updatedUser.notifications) {
      updatedUser.notifications = [];
    }

    updatedUser.notifications = [
      newNotification,
      ...(updatedUser.notifications || []),
    ];

    setUser(updatedUser);

    const toastType =
      notification.severity === "critical"
        ? toast.error
        : notification.severity === "high"
        ? toast.warning
        : notification.severity === "medium"
        ? toast.info
        : toast.info;

    const icon =
      notification.type === "report"
        ? "🚩"
        : notification.type === "ban"
        ? "⛔"
        : notification.type === "block"
        ? "🚫"
        : "ℹ️";

    toastType(notification.message, {
      icon,
      autoClose: notification.severity === "critical" ? 10000 : 5000,
    });
  };

  const handleUserSelect = async (otherUser) => {
    try {
      let chatRes;

      if (otherUser.isGroupChat) {
        chatRes = {
          data: {
            chat: {
              _id: otherUser._id,
              isGroupChat: true,
              groupName: otherUser.groupName || otherUser.name,
            },
          },
        };
      } else {
        const userId = otherUser._id || otherUser.id;
        chatRes = await axios.post(
          "http://localhost:4000/api/v1/chat/create",
          { recipientId: userId },
          { withCredentials: true }
        );
      }

      const newSelectedChat = {
        chat: chatRes.data.chat,
        otherUser,
        isGroupChat: otherUser.isGroupChat || false,
      };

      setSelectedChat(newSelectedChat);

      if (user) {
        try {
          localStorage.setItem(
            `chat_state_${user._id}`,
            JSON.stringify({
              selectedChat: newSelectedChat,
              selectedUser: otherUser,
            })
          );
        } catch (error) {
          console.error("Error saving chat state to localStorage:", error);
        }
      }

      setNotifications((prev) =>
        prev.filter((n) => n.chatId !== chatRes.data.chat._id)
      );

      const msgRes = await axios.get(
        `http://localhost:4000/api/v1/message/${chatRes.data.chat._id}`,
        { withCredentials: true }
      );

      setMessages(msgRes.data.messages);
      setSelectedUser(otherUser);
      setShowProfileSidebar(false);
    } catch (err) {
      console.error("Failed to load conversation");
      toast.error("Failed to load conversation");
    }
  };

  const handleViewProfile = async () => {
    if (
      selectedChat &&
      selectedChat.chat &&
      (selectedChat.chat.isGroupChat || selectedChat.isGroupChat)
    ) {
      if (selectedChat.chat._id) {
        try {
          const res = await axios.get(
            `http://localhost:4000/api/v1/chat/group/${selectedChat.chat._id}`,
            { withCredentials: true }
          );
          setSelectedGroup(res.data.group);
          setShowGroupProfileSidebar(true);
        } catch (err) {
          setSelectedGroup(selectedChat.chat);
          setShowGroupProfileSidebar(true);
        }
      } else {
        setSelectedGroup(selectedChat.chat);
        setShowGroupProfileSidebar(true);
      }
    } else {
      setShowProfileSidebar(true);
    }
  };

  const handleViewGroupMemberProfile = (member) => {
    const fullMemberData = allUsers.find((u) => u._id === member._id) || member;
    setSelectedMember(fullMemberData);
    setShowGroupProfileSidebar(false);
    setShowProfileSidebar(true);
  };

  const clearSelectedChat = () => {
    setSelectedChat(null);
    setSelectedUser(null);
    setMessages([]);
    setShowProfileSidebar(false);
    if (user) {
      localStorage.removeItem(`chat_state_${user._id}`);
    }
  };

  const handleSendMessage = async (messageText, isVoice = false) => {
    if (!messageText.trim() || !selectedChat) return;
    if (containsInappropriateContent(messageText)) {
      const flaggedWords = extractInappropriateWords(messageText);
      if (flaggedWords.length > 0 && !isAdmin) {
        console.warn("Message contains inappropriate content");
        toast.warn(
          "Your message contains words that may be inappropriate. Please revise your message."
        );
        return;
      }
    }

    if (!socketConnected || !socketRef.current) {
      console.error(
        "You are currently disconnected. Please wait while we reconnect."
      );
      toast.error(
        "You are currently disconnected. Please wait while we reconnect."
      );
      return;
    }

    try {
      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        content: messageText,
        sender: {
          _id: user._id,
          name: user.name,
          avatar: getAvatarByRole(user),
        },
        createdAt: new Date().toISOString(),
        chat: selectedChat.chat._id,
        isOptimistic: true,
        isVoice,
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      if (isVoice) {
        toast.info("Processing voice message...", { autoClose: 2000 });
      }

      let res;

      if (isVoice) {
        const formData = new FormData();
        formData.append("chatId", selectedChat.chat._id);
        formData.append("isVoice", "true");

        if (messageText instanceof Blob || messageText instanceof File) {
          formData.append("voiceData", messageText, "voice-message.webm");
        } else {
          formData.append("content", messageText);
        }

        try {
          res = await axios.post(
            "http://localhost:4000/api/v1/message/send",
            formData,
            {
              withCredentials: true,
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        } catch (err) {
          console.error("Failed to send voice message:", err);
          toast.error("Failed to send voice message. Please try again.");
          setMessages((prev) =>
            prev.filter((msg) => msg._id !== optimisticMessage._id)
          );
          return;
        }
      } else {
        try {
          res = await axios.post(
            "http://localhost:4000/api/v1/message/send",
            {
              chatId: selectedChat.chat._id,
              content: messageText,
            },
            { withCredentials: true }
          );
        } catch (err) {
          console.error("Failed to send message:", err);
          toast.error("Failed to send message. Please try again.");
          setMessages((prev) =>
            prev.filter((msg) => msg._id !== optimisticMessage._id)
          );
          return;
        }
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === optimisticMessage._id ? res.data.message : msg
        )
      );

      if (isVoice) {
        toast.success("Voice message sent successfully");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error(err.response?.data?.message || "Failed to send message");
      setMessages((prev) => prev.filter((msg) => !msg.isOptimistic));
    }
  };

  const loadUserMessages = async () => {
    if (selectedChat && selectedChat.chat && selectedChat.chat._id) {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/v1/message/${selectedChat.chat._id}`,
          { withCredentials: true }
        );
        setMessages(res.data.messages);
      } catch (error) {
        console.error("Failed to load conversation");
        toast.error("Failed to load conversation");
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!isAdmin) return;

    try {
      await axios.delete(`http://localhost:4000/api/v1/message/${messageId}`, {
        withCredentials: true,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                isDeleted: true,
                content: "This message was deleted by an admin",
              }
            : msg
        )
      );
      console.log("Message deleted successfully");
      toast.success("Message deleted successfully");
      try {
        const targetMessage = messages.find((msg) => msg._id === messageId);
        if (targetMessage) {
          console.log("Admin deleted message:", targetMessage.content);
          const senderUser = allUsers.find(
            (u) => u._id === targetMessage.sender._id
          );
          if (senderUser) {
            senderUser.moderationHistory = [
              ...(senderUser.moderationHistory || []),
              {
                action: "message_deleted",
                timestamp: new Date(),
                content: targetMessage.content,
                admin: user.name,
              },
            ];
          }
        }
      } catch (apiError) {
        console.error("API error when deleting message:", apiError);
      }
    } catch (error) {
      console.error("Failed to delete message");
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  };

  const handleBanUser = async (userId, reason) => {
    if (!isAdmin) return;

    try {
      const userToBan = allUsers.find((u) => u._id === userId);
      if (!userToBan) {
        toast.error("User not found");
        return;
      }

      const userMessages = messages
        .filter((msg) => msg.sender._id === userId)
        .map((msg) => ({
          content: msg.content,
          timestamp: msg.createdAt,
          messageId: msg._id,
        }));

      console.log(`Admin is banning user ${userToBan.name}`, {
        reason,
        messages: userMessages,
      });

      userToBan.status = "banned";
      userToBan.bannedReason = reason;
      userToBan.bannedAt = new Date();
      userToBan.bannedBy = user.name;

      console.log(`Banning user ${userToBan.name} with reason: ${reason}`);
      toast.success(`User ${userToBan.name} has been banned for ${reason}`);

      const systemMessage = {
        _id: `system-${Date.now()}`,
        isSystemMessage: true,
        content: `${userToBan.name} has been banned by an administrator.`,
        text: `${userToBan.name} has been banned by an administrator.`,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, systemMessage]);

      if (selectedUser && selectedUser._id === userId) {
        setTimeout(() => {
          setSelectedChat(null);
          setSelectedUser(null);
          setMessages([]);
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to ban user");
      toast.error("Failed to ban user");
    }
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleDeleteOwnMessage = async (messageId, permanent = false) => {
    try {
      await axios.delete(
        `http://localhost:4000/api/v1/message/${messageId}?permanent=${permanent}`,
        { withCredentials: true }
      );
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                isDeleted: !permanent,
                permanentlyDeleted: permanent,
                content: permanent
                  ? "This message has been permanently deleted"
                  : "This message has been deleted",
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Failed to delete message");
      toast.error("Failed to delete message");
    }
  };

  if (isAuthLoading) {
    return <LoadingScreen />;
  }

  if (
    !isAuthLoading &&
    isAuthenticated &&
    (user?.status === "blocked" || user?.status === "banned")
  ) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-10 text-center max-w-md">
          <div className="text-5xl mb-4">
            <i
              className={`fas ${
                user.status === "banned"
                  ? "fa-user-slash text-red-600"
                  : "fa-ban text-yellow-600"
              }`}
            ></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {user.status === "banned" ? "Account Banned" : "Account Blocked"}
          </h2>
          <p className="text-gray-600 mb-4">
            {user.status === "banned"
              ? "Your account has been banned by an administrator. You cannot use the chat."
              : "Your account has been blocked by an administrator. You cannot use the chat."}
          </p>
          {user?.bannedReason && (
            <div className="mb-2 text-red-700 text-sm">
              Reason: {user.bannedReason}
            </div>
          )}
          {user?.blockReason && (
            <div className="mb-2 text-yellow-700 text-sm">
              Reason: {user.blockReason}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!isAuthLoading) {
    if (!isAuthenticated) {
      return <Navigate to="/auth" />;
    }

    if (adminMode && !isAdmin) {
      return <Navigate to="/chat" />;
    }
  }

  if (adminMode && isAdmin) {
    return (
      <div className="bg-gray-100 h-screen flex flex-col">
        <AdminHeader user={user} />
        <AdminPanel
          users={allUsers}
          onBlockUser={(userId, action, reason) => {
            if (action === "block" || action === "ban") {
              const targetUser = allUsers.find((u) => u._id === userId);
              const actionText = action === "block" ? "Blocked" : "Banned";
              toast.success(`${actionText} user ${targetUser?.name || userId}`);
            }
            fetchUsers();
          }}
          onReportUser={(userId, reason) => {
            const targetUser = allUsers.find((u) => u._id === userId);
            if (targetUser) {
              toast.info(
                `Reported user ${targetUser.name} for ${
                  reason || "policy violation"
                }`
              );
            }
            fetchUsers();
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen w-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col h-full w-full bg-white/90 overflow-hidden">
        <ChatHeader
          user={user}
          toggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
          notifications={notifications}
        />
        <ConnectionStatus
          isConnected={socketConnected}
          reconnecting={!socketConnected && reconnectAttempt > 0}
          attempt={reconnectAttempt}
        />
        <div className="flex flex-1 overflow-hidden h-full w-full">
          {(sidebarOpen || window.innerWidth > 1024) && (
            <div className="bg-white/95 border-r border-gray-200 shadow-lg h-full z-10">
              <ChatSidebar
                users={allUsers}
                selectedUser={selectedChat?.otherUser}
                onSelectUser={handleUserSelect}
                isAdmin={false}
                loading={loading}
                showAdminChat={isAdmin}
                notifications={notifications}
              />
            </div>
          )}

          <div className="flex-1 flex flex-col bg-gradient-to-br from-white via-blue-50 to-indigo-50 h-full overflow-hidden relative">
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {selectedChat ? (
                <>
                  <ChatWindow
                    selectedUser={selectedChat.otherUser}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onViewProfile={handleViewProfile}
                    isAdmin={isAdmin}
                    onDeleteMessage={isAdmin ? handleDeleteMessage : null}
                    onDeleteOwnMessage={handleDeleteOwnMessage}
                    onBanUser={isAdmin ? handleBanUser : null}
                    onCloseChat={clearSelectedChat}
                  />
                  {showProfileSidebar && (selectedUser || selectedMember) && (
                    <UserProfile
                      user={selectedMember || selectedUser}
                      onClose={() => {
                        setShowProfileSidebar(false);
                        setSelectedMember(null);
                        setSelectedUser(true);
                      }}
                      isAdmin={isAdmin}
                      onBlockUser={isAdmin ? handleBanUser : null}
                      onReportUser={isAdmin ? handleReportUser : null}
                      isModal={true}
                    />
                  )}
                  {showGroupProfileSidebar &&
                    (selectedGroup &&
                    selectedGroup._id === selectedChat.chat._id ? (
                      <GroupProfileSidebar
                        group={selectedGroup}
                        onClose={() => setShowGroupProfileSidebar(false)}
                        onViewUserProfile={handleViewGroupMemberProfile}
                      />
                    ) : (
                      <GroupProfileSidebar
                        group={selectedChat.chat}
                        onClose={() => setShowGroupProfileSidebar(false)}
                        onViewUserProfile={handleViewGroupMemberProfile}
                      />
                    ))}
                </>
              ) : (
                <EmptyState setSidebarOpen={setSidebarOpen} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminHeader = ({ user }) => (
  <div className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
    <div className="flex items-center gap-3">
      <Link
        to="/"
        className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
      >
        AI Chat Moderation
      </Link>
      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full">
        Admin Mode
      </span>
    </div>
    <div className="flex items-center gap-5">
      <Link to="/" className="text-gray-600 hover:text-blue-600">
        <i className="fas fa-home"></i>{" "}
        <span className="hidden md:inline">Home</span>
      </Link>
      <Link to="/chat" className="text-gray-600 hover:text-blue-600">
        <i className="fas fa-comments"></i>{" "}
        <span className="hidden md:inline">Regular Chat</span>
      </Link>
      <Link
        to="/profile"
        className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white overflow-hidden shadow-sm">
          {user?.avatar || getAvatarByRole(user) ? (
            <img
              src={getAvatarByRole(user)}
              alt={user?.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-medium text-sm">{user?.name?.charAt(0)}</span>
          )}
        </div>
        <span className="hidden md:inline">{user?.name}</span>
      </Link>
    </div>
  </div>
);

export default ChatInterface;
