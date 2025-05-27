import React, { useState, useContext, useEffect, useRef } from "react";
import { Navigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { io as socketIOClient } from "socket.io-client";
import { Context } from "../main";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWindow from "../components/chat/ChatWindow";
import UserProfile from "../components/chat/UserProfile";
import AdminPanel from "../components/admin/AdminPanel";
import ChatHeader from "../components/chat/ChatHeader";
import ConnectionStatus from "../components/chat/ConnectionStatus";
import { generateAvatar, getAvatarByRole } from "../utils/avatarUtils";

const ChatInterface = ({ adminMode }) => {
    const { isAuthenticated, user, isAdmin } = useContext(Context);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserProfile, setShowUserProfile] = useState(false);
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

    useEffect(() => {
        if (!user) return;

        const setupSocket = () => {
            console.log(`Setting up socket connection, attempt: ${reconnectAttempt + 1}`);

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
                timeout: 20000
            });

            socketRef.current.on("connect", () => {
                console.log("Socket connected successfully");
                setSocketConnected(true);
                setReconnectAttempt(0);

                if (heartbeatRef.current) clearInterval(heartbeatRef.current);
                heartbeatRef.current = setInterval(() => {
                    if (socketRef.current) {
                        socketRef.current.emit('heartbeat', { userId: user._id });
                    }
                }, 15000);
            });

            socketRef.current.on("disconnect", () => {
                console.log("Socket disconnected");
                setSocketConnected(false);

                if (heartbeatRef.current) {
                    clearInterval(heartbeatRef.current);
                }
            });

            socketRef.current.on("connect_error", (error) => {
                console.error("Socket connection error:", error);
                setSocketConnected(false);

                if (reconnectAttempt < 5) {
                    setTimeout(() => {
                        setReconnectAttempt(prev => prev + 1);
                        setupSocket();
                    }, 2000);
                } else {
                    toast.error("Unable to connect to chat server. Please check your connection and refresh the page.");
                }
            });

            socketRef.current.on("error", (error) => {
                console.error("Socket error from server:", error);
                toast.error("Server error: " + (error.message || "Unknown error"));
            });
        };

        setupSocket();

        if (socketRef.current) {
            socketRef.current.on("new-message", (message) => {
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

                if (selectedChat && message.chat === selectedChat.chat._id) {
                    setMessages(prev => [...prev, message]);
                }
            });
        }

        return () => {
            if (socketRef.current) {
                console.log("Cleaning up socket connection");
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
        if (!user || !socketConnected || !socketRef.current) return;

        console.log("Joining chat rooms for user");

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

    useEffect(() => {
        fetchUsers();
    }, [adminMode, user?.id]);

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
        axios.get("http://localhost:4000/api/v1/user/all", { withCredentials: true })
            .then(res => {
                setAllUsers(res.data.users);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [user]);

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

            setNotifications(prev =>
                prev.filter(n => n.chatId !== chatRes.data.chat._id)
            );

            const msgRes = await axios.get(
                `http://localhost:4000/api/v1/message/${chatRes.data.chat._id}`,
                { withCredentials: true }
            );

            setMessages(msgRes.data.messages);
            setSelectedUser(otherUser);
        } catch (err) { }
    };

    const handleSendMessage = async (messageText, isVoice = false) => {
        if (!messageText.trim() || !selectedChat) return;

        if (!socketConnected || !socketRef.current) {
            toast.error("You are currently disconnected. Please wait while we reconnect.");
            return;
        }

        try {
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
                isOptimistic: true
            };

            setMessages(prev => [...prev, optimisticMessage]);

            const res = await axios.post(
                "http://localhost:4000/api/v1/message/send",
                {
                    chatId: selectedChat.chat._id,
                    content: messageText
                },
                { withCredentials: true }
            );

            setMessages(prev => prev.map(msg =>
                msg._id === optimisticMessage._id ? res.data.message : msg
            ));

        } catch (err) {
            console.error("Error sending message:", err);
            toast.error("Failed to send message");

            setMessages(prev => prev.filter(msg => !msg.isOptimistic));
        }
    };

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

    const loadUserMessages = async () => {
        if (selectedChat && selectedChat.chat && selectedChat.chat._id) {
            try {
                const res = await axios.get(
                    `http://localhost:4000/api/v1/message/${selectedChat.chat._id}`,
                    { withCredentials: true }
                );
                setMessages(res.data.messages);
            } catch { }
        }
    };

    const toggleUserProfile = () => setShowUserProfile(!showUserProfile);

    if (!isAuthenticated) {
        return <Navigate to="/auth" />;
    }
    if (adminMode && !isAdmin) {
        return <Navigate to="/chat" />;
    }

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);

    if (adminMode && isAdmin) {
        return (
            <div className="bg-gray-100 h-screen flex flex-col">
                <AdminHeader user={user} />
                <AdminPanel
                    users={allUsers}
                    onBlockUser={() => { }}
                    onReportUser={() => { }}
                />
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen h-screen w-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
                <div className="flex-1 flex flex-col h-full w-full bg-white/90">
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
                            <div className="bg-white/95 border-r border-gray-200 shadow-lg h-full">
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
                        <div className="flex-1 flex flex-col bg-gradient-to-br from-white via-blue-50 to-indigo-50 h-full">
                            <div className="flex-1 flex flex-col h-full">
                                {selectedChat ? (
                                    <ChatWindow
                                        selectedUser={selectedChat.otherUser}
                                        messages={messages}
                                        onSendMessage={handleSendMessage}
                                        onViewProfile={toggleUserProfile}
                                        isAdmin={false}
                                        onDeleteMessage={null}
                                    />
                                ) : (
                                    <EmptyState setSidebarOpen={setSidebarOpen} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const AdminHeader = ({ user }) => (
    <>
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
    </>
);

const EmptyState = ({ setSidebarOpen }) => (
    <>
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
    </>
);

export default ChatInterface;
