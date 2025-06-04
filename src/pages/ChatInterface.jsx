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
import { containsInappropriateContent, extractInappropriateWords } from "../utils/moderationUtils";
import LoadingScreen from "../components/LoadingScreen";

// Main chat interface component
const ChatInterface = ({ adminMode }) => {

    // Context and state hooks
    const { isAuthenticated, user, isAdmin, setUser, isAuthLoading } = useContext(Context);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [socketConnected, setSocketConnected] = useState(false);
    const [reconnectAttempt, setReconnectAttempt] = useState(0);
    const socketRef = useRef(null);
    const heartbeatRef = useRef(null);
    const SOCKET_URL = "http://localhost:4000";

    // Restore chat state from localStorage on mount
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

    // Setup socket connection and listeners
    useEffect(() => {
        if (!user) return;

        const setupSocket = () => {

            // Disconnect previous socket if exists
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }

            // Create new socket connection
            socketRef.current = socketIOClient(SOCKET_URL, {
                withCredentials: true,
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000
            });

            // On successful connection
            socketRef.current.on("connect", () => {
                setSocketConnected(true);
                setReconnectAttempt(0);

                // Start heartbeat interval to keep connection alive
                if (heartbeatRef.current) clearInterval(heartbeatRef.current);
                heartbeatRef.current = setInterval(() => {
                    if (socketRef.current) {
                        socketRef.current.emit('heartbeat', { userId: user._id });
                    }
                }, 15000);
            });

            // On disconnect, clear heartbeat
            socketRef.current.on("disconnect", () => {
                setSocketConnected(false);

                if (heartbeatRef.current) {
                    clearInterval(heartbeatRef.current);
                }
            });

            // Handle connection errors and attempt reconnection
            socketRef.current.on("connect_error", (error) => {
                setSocketConnected(false);

                if (reconnectAttempt < 5) {
                    setTimeout(() => {
                        setReconnectAttempt(prev => prev + 1);
                        setupSocket();
                    }, 2000);
                } else {
                    console.error("Unable to connect to chat server. Please check your connection and refresh the page.");
                    toast.error("Unable to connect to chat server. Please check your connection and refresh the page.");
                }
            });

            // Handle server errors
            socketRef.current.on("error", (error) => {
                console.error("Server error.");
                toast.error("Server error: " + (error.message || "Unknown error"));
            });

            // Listen for admin actions (message deleted, user blocked/banned, notifications)
            socketRef.current.on("admin-message-deleted", ({ messageId }) => {
                setMessages(prev =>
                    prev.map(msg =>
                        msg._id === messageId
                            ? { ...msg, isDeleted: true, content: "This message was deleted by an admin" }
                            : msg
                    )
                );
                console.log("Message deleted by admin.");
                toast.info("A message was deleted by an admin.");
            });

            socketRef.current.on("admin-user-blocked", (notification) => {
                if (notification && notification.type === "block") {
                    setUser(prev => ({
                        ...prev,
                        status: "blocked",
                        blockReason: notification.reason,
                        notifications: [notification, ...(prev.notifications || [])]
                    }));
                    console.log(`You have been blocked by an admin.`);
                    toast.warning(notification.message || "You have been blocked by an admin.");
                }
            });

            socketRef.current.on("admin-user-banned", (notification) => {
                if (notification && notification.type === "ban") {
                    setUser(prev => ({
                        ...prev,
                        status: "banned",
                        bannedReason: notification.reason,
                        notifications: [notification, ...(prev.notifications || [])]
                    }));
                    console.log(`You have been banned by an admin.`);
                    toast.error(notification.message || "You have been banned by an admin.");
                }
            });

            socketRef.current.on("admin-notification", (notification) => {
                setUser(prev => ({
                    ...prev,
                    notifications: [notification, ...(prev.notifications || [])]
                }));
                console.log("New admin notification");
                toast.info(notification.message || "You have a new notification from admin.");
            });
        };

        setupSocket();

        // Listen for new messages
        if (socketRef.current) {
            socketRef.current.on("new-message", (message) => {

                // If message is not for the current chat, add to notifications
                if (message.sender._id !== user._id && (!selectedChat || message.chat !== selectedChat.chat._id)) {
                    setNotifications(prev => [
                        {
                            chatId: message.chat,
                            sender: message.sender,
                            content: message.content,
                            createdAt: message.createdAt,
                        },
                        ...prev
                    ]);
                }

                // If message is for the current chat, add to messages
                if (selectedChat && message.chat === selectedChat.chat._id) {
                    setMessages(prev => [...prev, message]);
                }
            });
        }

        // Cleanup on unmount
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

    // Join chat rooms for all users (except self) after socket connects
    useEffect(() => {
        if (!user || !socketConnected || !socketRef.current) return;
        axios.get("http://localhost:4000/api/v1/user/all", { withCredentials: true })
            .then(res => {
                res.data.users.forEach(u => {
                    if (u._id !== user._id) {
                        axios.post("http://localhost:4000/api/v1/chat/create",
                            { recipientId: u._id },
                            { withCredentials: true }
                        )
                            .then(chatRes => {
                                if (socketRef.current && chatRes.data.chat._id) {
                                    console.log(`Joining room: ${chatRes.data.chat._id}`);
                                    socketRef.current.emit("join-room", chatRes.data.chat._id);
                                }
                            })
                            .catch(err => console.error("Error creating chat:", err));
                    }
                });
            })
            .catch(err => console.error("Error fetching users for chat rooms:", err));
    }, [user, socketConnected]);

    // Fetch users when admin mode or user changes
    useEffect(() => {
        fetchUsers();
    }, [adminMode, user?.id]);

    // Load messages when a user is selected
    useEffect(() => {
        if (selectedUser) {
            loadUserMessages();
        } else {
            setMessages([]);
        }
    }, [selectedUser]);

    // Fetch all users and check for notifications (report, ban, block)
    useEffect(() => {
        if (!user) return;
        setLoading(true);
        axios.get("http://localhost:4000/api/v1/user/all", { withCredentials: true })
            .then(res => {
                setAllUsers(res.data.users);
                setLoading(false);

                // Check for new notifications and add if needed
                const currentUserFromApi = res.data.users.find(u => u._id === user._id);
                if (currentUserFromApi) {
                    if (currentUserFromApi.isReported &&
                        !currentUserFromApi.notifications?.some(n => n.type === 'report')) {

                        const reason = currentUserFromApi.reportReason || "Content policy violation";
                        addUserNotification({
                            type: 'report',
                            title: 'Your Account Has Been Reported',
                            message: `An admin has reported your account: "${reason}"`,
                            severity: 'high'
                        });
                    }

                    if (currentUserFromApi.status === 'banned' &&
                        !currentUserFromApi.notifications?.some(n => n.type === 'ban')) {
                        const reason = currentUserFromApi.bannedReason || "Multiple violations";
                        addUserNotification({
                            type: 'ban',
                            title: 'Your Account Has Been Banned',
                            message: `Your account has been banned: "${reason}"`,
                            severity: 'critical'
                        });
                    }

                    if (currentUserFromApi.status === 'blocked' &&
                        !currentUserFromApi.notifications?.some(n => n.type === 'block')) {
                        const reason = currentUserFromApi.blockReason || "Temporary suspension";
                        addUserNotification({
                            type: 'block',
                            title: 'Your Account Has Been Blocked',
                            message: `Your account has been temporarily blocked: "${reason}"`,
                            severity: 'high'
                        });
                    }
                }
            })
            .catch(() => setLoading(false));
    }, [user]);

    // Effect to periodically check and update user statuses
    useEffect(() => {
        // Initial fetch with status check
        fetchUsersWithStatus();

        // Set up interval to refresh user statuses periodically
        const intervalId = setInterval(() => {
            fetchUsersWithStatus(false); // false indicates a silent refresh
        }, 15000); // Every 15 seconds

        return () => clearInterval(intervalId);
    }, []);

    // Improved user fetcher with status verification
    const fetchUsersWithStatus = async (showLoading = true) => {
        if (showLoading) setLoading(true);

        try {
            const res = await axios.get("http://localhost:4000/api/v1/user/all", { withCredentials: true });

            // Update users with verified status information
            const usersWithVerifiedStatus = res.data.users.map(user => {
                // Default to offline if status is missing
                if (!user.status) {
                    user.status = "offline";
                }

                // Check for cookie/auth related status (if not blocked or banned)
                if (user.status !== "blocked" && user.status !== "banned") {
                    // Get the last activity timestamp (if available)
                    const lastActivity = new Date(user.lastSeen || 0);
                    const now = new Date();
                    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds

                    // If last activity is more than the threshold ago, mark as offline
                    if (now - lastActivity > inactiveThreshold) {
                        user.status = "offline";
                    }
                }

                return user;
            });

            setAllUsers(usersWithVerifiedStatus);

            // Also update selected user if needed
            if (selectedUser) {
                const updatedSelectedUser = usersWithVerifiedStatus.find(u =>
                    u._id === selectedUser._id || u.id === selectedUser._id
                );

                if (updatedSelectedUser) {
                    setSelectedUser(prev => ({
                        ...prev,
                        status: updatedSelectedUser.status,
                        lastSeen: updatedSelectedUser.lastSeen
                    }));
                }
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    // Helper to add a notification to the user and show a toast
    const addUserNotification = (notification) => {
        const newNotification = {
            id: `notification-${Date.now()}`,
            createdAt: new Date().toISOString(),
            read: false,
            ...notification
        };

        const updatedUser = { ...user };

        if (!updatedUser.notifications) {
            updatedUser.notifications = [];
        }

        updatedUser.notifications = [newNotification, ...(updatedUser.notifications || [])];

        setUser(updatedUser);

        // Choose toast type and icon based on severity/type
        const toastType = notification.severity === 'critical' ? toast.error :
            notification.severity === 'high' ? toast.warning :
                notification.severity === 'medium' ? toast.info :
                    toast.info;

        const icon = notification.type === 'report' ? '🚩' :
            notification.type === 'ban' ? '⛔' :
                notification.type === 'block' ? '🚫' : 'ℹ️';

        toastType(notification.message, {
            icon,
            autoClose: notification.severity === 'critical' ? 10000 : 5000
        });
    };

    // Handle selecting a user to chat with
    const handleUserSelect = async (otherUser) => {
        try {
            const userId = otherUser._id || otherUser.id;
            const chatRes = await axios.post(
                "http://localhost:4000/api/v1/chat/create",
                { recipientId: userId },
                { withCredentials: true }
            );

            const newSelectedChat = {
                chat: chatRes.data.chat,
                otherUser
            };

            setSelectedChat(newSelectedChat);

            // Save chat state to localStorage
            if (user) {
                try {
                    localStorage.setItem(
                        `chat_state_${user._id}`,
                        JSON.stringify({
                            selectedChat: newSelectedChat,
                            selectedUser: otherUser
                        })
                    );
                } catch (error) {
                    console.error("Error saving chat state to localStorage:", error);
                }
            }

            // Remove notifications for this chat
            setNotifications(prev =>
                prev.filter(n => n.chatId !== chatRes.data.chat._id)
            );

            // Load messages for this chat
            const msgRes = await axios.get(
                `http://localhost:4000/api/v1/message/${chatRes.data.chat._id}`,
                { withCredentials: true }
            );

            setMessages(msgRes.data.messages);
            setSelectedUser(otherUser);
        }
        catch (err) {
            console.error("Failed to load conversation");
            toast.error("Failed to load conversation");
        }
    };

    // Handle view profile action
    const handleViewProfile = () => {
        if (!selectedUser) return;

        // Add code to show user profile (this will be handled by the UserProfile component in ChatWindow)
        const userProfileElement = document.getElementById('user-profile-sidebar');
        if (userProfileElement) {
            userProfileElement.style.transform = 'translateX(0)';
        } else {
            // Show profile sidebar
            const userProfileEl = document.createElement('div');
            userProfileEl.id = 'user-profile-sidebar';
            document.body.appendChild(userProfileEl);
        }

        // You could also toggle a state to show/hide the profile sidebar
        // setShowUserProfile(true);

        logAdminActivity(`Viewed ${selectedUser.name}'s profile`);
    };

    // Clear selected chat and messages
    const clearSelectedChat = () => {
        setSelectedChat(null);
        setSelectedUser(null);
        setMessages([]);
        if (user) {
            localStorage.removeItem(`chat_state_${user._id}`);
        }
    };

    // Handle sending a message (with moderation check)
    const handleSendMessage = async (messageText, isVoice = false) => {
        if (!messageText.trim() || !selectedChat) return;

        // Check for inappropriate content
        if (containsInappropriateContent(messageText)) {
            const flaggedWords = extractInappropriateWords(messageText);
            if (flaggedWords.length > 0 && !isAdmin) {
                console.warn("Message contains inappropriate content");
                toast.warn("Your message contains words that may be inappropriate. Please revise your message.");
                return;
            }
        }

        // Prevent sending if disconnected
        if (!socketConnected || !socketRef.current) {
            console.error("You are currently disconnected. Please wait while we reconnect.");
            toast.error("You are currently disconnected. Please wait while we reconnect.");
            return;
        }

        try {

            // Optimistically add message to UI
            const optimisticMessage = {
                _id: `temp-${Date.now()}`,
                content: messageText,
                sender: {
                    _id: user._id,
                    name: user.name,
                    avatar: getAvatarByRole(user)
                },
                createdAt: new Date().toISOString(),
                chat: selectedChat.chat._id,
                isOptimistic: true,
                isVoice
            };

            setMessages(prev => [...prev, optimisticMessage]);

            // Send message to server
            const res = await axios.post(
                "http://localhost:4000/api/v1/message/send",
                {
                    chatId: selectedChat.chat._id,
                    content: messageText,
                    isVoice
                },
                { withCredentials: true }
            );

            // Replace optimistic message with real one
            setMessages(prev => prev.map(msg =>
                msg._id === optimisticMessage._id ? res.data.message : msg
            ));

        } catch (err) {
            toast.error("Failed to send message");
            console.error("Failed to send message");
            setMessages(prev => prev.filter((msg) => !msg.isOptimistic));
        }
    };

    // Fetch all users from API
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://localhost:4000/api/v1/user/all", { withCredentials: true });
            setAllUsers(res.data.users);
            setLoading(false);
        } catch {
            setLoading(false);
        }
    };

    // Load messages for the selected chat
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

    // Admin: Delete a message
    const handleDeleteMessage = async (messageId) => {
        if (!isAdmin) return;

        try {

            // Optimistically mark message as deleted
            setMessages(prev => prev.map(msg =>
                msg._id === messageId ? { ...msg, isDeleted: true, content: "This message was deleted by an admin" } : msg
            ));
            console.log("Message deleted successfully");
            toast.success("Message deleted successfully");

            // Optionally update moderation history for sender
            try {
                const targetMessage = messages.find(msg => msg._id === messageId);
                if (targetMessage) {
                    console.log("Admin deleted message:", targetMessage.content);
                    const senderUser = allUsers.find(u => u._id === targetMessage.sender._id);
                    if (senderUser) {
                        senderUser.moderationHistory = [
                            ...(senderUser.moderationHistory || []),
                            {
                                action: "message_deleted",
                                timestamp: new Date(),
                                content: targetMessage.content,
                                admin: user.name
                            }
                        ];
                    }
                }
            } catch (apiError) {
                console.error("API error when deleting message:", apiError);
            }
        }
        catch (error) {
            console.error("Failed to delete message");
            toast.error("Failed to delete message");
        }
    };

    // Admin: Ban a user
    const handleBanUser = async (userId, reason) => {
        if (!isAdmin) return;

        try {
            const userToBan = allUsers.find(u => u._id === userId);
            if (!userToBan) {
                toast.error("User not found");
                return;
            }

            // Gather messages for moderation record
            const userMessages = messages
                .filter((msg) => msg.sender._id === userId)
                .map((msg) => ({
                    content: msg.content,
                    timestamp: msg.createdAt,
                    messageId: msg._id
                }));

            console.log(`Admin is banning user ${userToBan.name}`, {
                reason,
                messages: userMessages
            });

            // Update user status locally (should also update on server)
            userToBan.status = "banned";
            userToBan.bannedReason = reason;
            userToBan.bannedAt = new Date();
            userToBan.bannedBy = user.name;

            console.log(`Banning user ${userToBan.name} with reason: ${reason}`);
            toast.success(`User ${userToBan.name} has been banned for ${reason}`);

            // Add a system message to chat
            const systemMessage = {
                _id: `system-${Date.now()}`,
                isSystemMessage: true,
                content: `${userToBan.name} has been banned by an administrator.`,
                text: `${userToBan.name} has been banned by an administrator.`,
                createdAt: new Date().toISOString()
            };

            setMessages(prev => [...prev, systemMessage]);

            // If banned user is currently selected, clear chat after a delay
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

    // Toggle sidebar visibility
    const toggleSidebar = () => setSidebarOpen((prev) => !prev);

    // User deletes their own message (soft or permanent)
    const handleDeleteOwnMessage = async (messageId, permanent = false) => {
        try {
            await axios({
                method: 'DELETE',
                url: `http://localhost:4000/api/v1/message/${messageId}`,
                data: { permanent },
                withCredentials: true
            });
            setMessages(prev =>
                prev.map(msg =>
                    msg._id === messageId
                        ? {
                            ...msg,
                            isDeleted: !permanent,
                            permanentlyDeleted: permanent,
                            content: permanent
                                ? "This message has been permanently deleted"
                                : "This message has been deleted"
                        }
                        : msg
                )
            );
        } catch (error) {
            console.error("Failed to delete message");
            toast.error("Failed to delete message");
        }
    };

    // Show loading screen while authentication is loading
    if (isAuthLoading) {
        return <LoadingScreen />;
    }

    // Show blocked/banned message if user is blocked or banned
    if (!isAuthLoading && isAuthenticated && (user?.status === "blocked" || user?.status === "banned")) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <div className="bg-white rounded-lg shadow-lg p-10 text-center max-w-md">
                    <div className="text-5xl mb-4">
                        <i className={`fas ${user.status === "banned" ? "fa-user-slash text-red-600" : "fa-ban text-yellow-600"}`}></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {user.status === "banned" ? "Account Banned" : "Account Blocked"}
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {user.status === "banned" ? "Your account has been banned by an administrator. You cannot use the chat." : "Your account has been blocked by an administrator. You cannot use the chat."}
                    </p>
                    {user?.bannedReason && (
                        <div className="mb-2 text-red-700 text-sm">Reason: {user.bannedReason}</div>
                    )}
                    {user?.blockReason && (
                        <div className="mb-2 text-yellow-700 text-sm">Reason: {user.blockReason}</div>
                    )}
                </div>
            </div>
        );
    }

    // Redirect to auth if not authenticated
    if (!isAuthLoading) {
        if (!isAuthenticated) {
            return <Navigate to="/auth" />;
        }

        // Prevent non-admins from accessing admin mode
        if (adminMode && !isAdmin) {
            return <Navigate to="/chat" />;
        }
    }

    // Render admin panel if in admin mode
    if (adminMode && isAdmin) {
        return (
            <div className="bg-gray-100 h-screen flex flex-col">
                <AdminHeader user={user} />
                <AdminPanel
                    users={allUsers}
                    onBlockUser={(userId, action, reason) => {
                        if (action === "block" || action === "ban") {
                            const targetUser = allUsers.find(u => u._id === userId);
                            const actionText = action === "block" ? "Blocked" : "Banned";
                            toast.success(`${actionText} user ${targetUser?.name || userId}`);
                        }
                        fetchUsers();
                    }}
                    onReportUser={(userId, reason) => {
                        const targetUser = allUsers.find(u => u._id === userId);
                        if (targetUser) {
                            toast.info(`Reported user ${targetUser.name} for ${reason || 'policy violation'}`);
                        }
                        fetchUsers();
                    }}
                />
            </div>
        );
    }

    // Main chat UI
    return (
        <div className="min-h-screen h-screen w-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col h-full w-full bg-white/90 overflow-hidden">

                {/* Chat header with notifications and sidebar toggle */}
                <ChatHeader
                    user={user}
                    toggleSidebar={toggleSidebar}
                    sidebarOpen={sidebarOpen}
                    notifications={notifications}
                />

                {/* Connection status indicator */}
                <ConnectionStatus
                    isConnected={socketConnected}
                    reconnecting={!socketConnected && reconnectAttempt > 0}
                    attempt={reconnectAttempt}
                />
                <div className="flex flex-1 overflow-hidden h-full w-full">

                    {/* Sidebar with user list */}
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

                    {/* Main chat window */}
                    <div className="flex-1 flex flex-col bg-gradient-to-br from-white via-blue-50 to-indigo-50 h-full overflow-hidden">
                        <div className="flex-1 flex flex-col h-full overflow-hidden">
                            {selectedChat ? (
                                <ChatWindow
                                    selectedUser={selectedChat.otherUser}
                                    messages={messages}
                                    onSendMessage={handleSendMessage}
                                    onViewProfile={handleViewProfile}  // Pass the profile handler
                                    isAdmin={isAdmin}
                                    onDeleteMessage={isAdmin ? handleDeleteMessage : null}
                                    onDeleteOwnMessage={handleDeleteOwnMessage}
                                    onBanUser={isAdmin ? handleBanUser : null}
                                    onCloseChat={clearSelectedChat}
                                />
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

// Admin header component for admin panel
const AdminHeader = ({ user }) => (
    <div className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <Link to="/" className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                AI Chat Moderation
            </Link>
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full">
                Admin Mode
            </span>
        </div>
        <div className="flex items-center gap-5">
            <Link to="/" className="text-gray-600 hover:text-blue-600">
                <i className="fas fa-home"></i> <span className="hidden md:inline">Home</span>
            </Link>
            <Link to="/chat" className="text-gray-600 hover:text-blue-600">
                <i className="fas fa-comments"></i> <span className="hidden md:inline">Regular Chat</span>
            </Link>
            <Link to="/profile" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white overflow-hidden shadow-sm">
                    {user?.avatar || getAvatarByRole(user) ? (
                        <img src={getAvatarByRole(user)} alt={user?.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="font-medium text-sm">{user?.name?.charAt(0)}</span>
                    )}
                </div>
                <span className="hidden md:inline">{user?.name}</span>
            </Link>
        </div>
    </div>
);

// Empty state shown when no chat is selected
const EmptyState = ({ setSidebarOpen }) => (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="text-center p-10 bg-white rounded-2xl shadow-sm max-w-md">
            <div className="text-blue-600 mb-6 text-6xl">
                <i className="far fa-comments"></i>
            </div>
            <h3 className="text-2xl font-medium text-gray-700 mb-3">Select a conversation</h3>
            <p className="text-gray-500 mb-6">Choose a user from the list to start chatting</p>
            <button
                onClick={() => setSidebarOpen(true)}
                className="px-5 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors shadow-sm flex items-center gap-2"
            >
                <i className="fas fa-users"></i> View Users
            </button>
        </div>
    </div>
);

export default ChatInterface;
