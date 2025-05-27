import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import AdminDashboard from "./AdminDashboard";
import ChatWindow from "../chat/ChatWindow";
import ChatSidebar from "../chat/ChatSidebar";

const AdminPanel = ({ users, onBlockUser, onReportUser }) => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [adminView, setAdminView] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [messages, setMessages] = useState([]);
    const [adminActivity, setAdminActivity] = useState([]);

    useEffect(() => {
        if (selectedUser) {
            loadUserMessages();
        } else {
            setMessages([]);
        }
    }, [selectedUser, adminView]);

    const loadUserMessages = async () => {
        try {
            setMessages([]);
        } catch (error) {
            console.error("Error loading messages:", error);
            toast.error("Failed to load conversation");
        }
    };

    const handleSendMessage = (messageText, isVoice = false) => {
        if (!messageText.trim()) return;

        const newMessage = {
            id: Date.now(),
            text: messageText,
            from: "me",
            to: selectedUser._id,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: "sent",
            isVoice
        };

        setMessages([...messages, newMessage]);
        logAdminActivity(`Messaged ${selectedUser.name}`);
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setAdminView("chat");
        logAdminActivity(`Viewed ${user.name}'s chat`);
    };

    const handleDeleteMessage = (messageId) => {
        setMessages(messages.filter(m => m.id !== messageId));
        toast.success("Message deleted successfully");
        logAdminActivity("Deleted a message");
    };

    const handleViewUserProfile = () => {
        if (!selectedUser) return;

        toast.info(`Viewing ${selectedUser.name}'s profile`);
        logAdminActivity(`Viewed ${selectedUser.name}'s profile`);
    };

    const handleBackToDashboard = () => {
        setAdminView("dashboard");
        setSelectedUser(null);
    };

    const handleToggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleBlockUserAction = (userId) => {
        const user = users.find(u => u._id === userId);
        if (user) {
            onBlockUser(userId);
            const isBlocked = user.status === "blocked";
            logAdminActivity(`${isBlocked ? 'Unblocked' : 'Blocked'} user ${user.name}`);
        }
    };

    const handleReportUserAction = (userId) => {
        const user = users.find(u => u._id === userId);
        if (user) {
            onReportUser(userId);
            const isReported = user.isReported;
            logAdminActivity(`${isReported ? 'Removed report from' : 'Reported'} user ${user.name}`);
        }
    };

    const logAdminActivity = (action) => {
        setAdminActivity([
            { timestamp: new Date(), action },
            ...adminActivity
        ]);
    };

    return (
        <>
            <div className="flex-1 flex flex-col">
                <div className="bg-purple-100 p-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleToggleSidebar}
                            className="lg:hidden text-purple-700 hover:bg-purple-200 p-2 rounded-md"
                        >
                            <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
                        </button>
                        <h1 className="text-xl font-semibold text-purple-800">
                            <i className="fas fa-shield-alt mr-2"></i> Admin Control Panel
                        </h1>
                        <span className="bg-purple-200 text-purple-800 text-xs px-2.5 py-1 rounded-full">
                            Admin Access
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBackToDashboard}
                            className={`px-3 py-1.5 rounded-md transition-colors ${adminView === "dashboard"
                                ? "bg-purple-700 text-white"
                                : "bg-purple-200 text-purple-700 hover:bg-purple-300"
                                }`}
                        >
                            <i className="fas fa-th-large mr-1.5"></i> Dashboard
                        </button>
                    </div>
                </div>
                <div className="flex flex-1 overflow-hidden">
                    {(adminView === "chat" && (sidebarOpen || window.innerWidth > 1024)) && (
                        <ChatSidebar
                            users={users.filter(u => u.role !== "admin")}
                            selectedUser={selectedUser}
                            onSelectUser={handleSelectUser}
                            isAdmin={true}
                            onBlockUser={handleBlockUserAction}
                            onReportUser={handleReportUserAction}
                            loading={false}
                        />
                    )}
                    <div className="flex-1 flex">
                        {adminView === "dashboard" ? (
                            <AdminDashboard
                                users={users}
                                onBlockUser={handleBlockUserAction}
                                onReportUser={handleReportUserAction}
                                onViewUserChat={handleSelectUser}
                            />
                        ) : (
                            <div className="flex-1 flex flex-col">
                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3">
                                    <button
                                        onClick={handleBackToDashboard}
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
                                />
                            </div>
                        )}
                    </div>
                    {adminView === "dashboard" && (
                        <div className="w-[320px] bg-white border-l border-gray-200 overflow-auto hidden lg:block">
                            <div className="p-4 border-b bg-gray-50">
                                <h3 className="font-semibold text-gray-800">Admin Activity Log</h3>
                            </div>
                            <div className="p-4">
                                {adminActivity.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No activity yet</p>
                                ) : (
                                    <ul className="space-y-3">
                                        {adminActivity.map((activity, index) => (
                                            <li key={index} className="text-sm border-b border-gray-100 pb-2">
                                                <span className="text-xs text-gray-500 block">
                                                    {activity.timestamp.toLocaleTimeString()}
                                                </span>
                                                <span className="text-gray-800">{activity.action}</span>
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
