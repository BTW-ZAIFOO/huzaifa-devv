import React, { useState, useRef, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { Context } from "../../main";
import { generateAvatar } from "../../utils/avatarUtils";
import { highlightInappropriateContent, containsInappropriateContent } from "../../utils/moderationUtils";

const ChatWindow = ({
    selectedUser,
    messages,
    onSendMessage,
    onViewProfile,
    isAdmin,
    onDeleteMessage,
    flaggedWords = []
}) => {
    const [messageText, setMessageText] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const messagesEndRef = useRef(null);
    const [recognition, setRecognition] = useState(null);

    const isAdminChat = selectedUser?.role === "admin";
    const isBannedUser = selectedUser?.status === "banned";
    const isBlockedUser = selectedUser?.status === "blocked";
    const isMessageDisabled = ((isBannedUser || isBlockedUser) && !isAdmin);

    const { user: loggedInUser } = useContext(Context);

    useEffect(() => {
        initializeSpeechRecognition();
        return () => recognition?.stop();
    }, []);

    const initializeSpeechRecognition = () => {
        if ("webkitSpeechRecognition" in window) {
            const SpeechRecognition = window.webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = 'en-US';

            recognitionInstance.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                setMessageText(transcript);
            };

            recognitionInstance.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                toast.error("Speech recognition failed. Please try again.");
                setIsRecording(false);
            };

            setRecognition(recognitionInstance);
        }
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!canSendMessage()) return;

        if (messageText.trim()) {
            onSendMessage(messageText);
            setMessageText("");
        }
    };

    const canSendMessage = () => {
        if (selectedUser.status === "banned" && !isAdmin) {
            toast.error("This user has been banned and cannot receive messages.");
            return false;
        }
        if (selectedUser.status === "blocked" && !isAdmin) {
            toast.error("This user has been blocked and cannot receive messages.");
            return false;
        }
        return true;
    };

    const handleVoiceInput = () => {
        if (!recognition) {
            toast.error("Speech recognition is not supported in your browser");
            return;
        }
        isRecording ? stopRecording() : startRecording();
    };

    const startRecording = () => {
        setMessageText("");
        recognition.start();
        setIsRecording(true);
    };

    const stopRecording = () => {
        recognition.stop();
        setIsRecording(false);
        if (messageText.trim()) {
            onSendMessage(messageText, true);
            setMessageText("");
        }
    };

    const handleDeleteMessage = (messageId) => {
        if (onDeleteMessage && isAdmin) {
            onDeleteMessage(messageId);
            toast.success("Message deleted successfully");
        }
    };

    const getInputPlaceholder = () => {
        if (isBannedUser && !isAdmin) return "This user has been banned";
        if (isBlockedUser && !isAdmin) return "This user has been blocked";
        if (isRecording) return "Listening...";
        return "Type a message...";
    };

    function highlightInappropriate(text) {
        return highlightInappropriateContent(text, flaggedWords);
    }

    function renderMessageStatus(message) {
        if (message.from !== "me") return null;

        return (
            <span className="ml-1">
                {message.status === "sent" && <i className="fas fa-check text-xs" title="Sent"></i>}
                {message.status === "delivered" && <i className="fas fa-check-double text-xs" title="Delivered"></i>}
                {message.status === "read" && <i className="fas fa-check-double text-blue-300 text-xs" title="Read"></i>}
            </span>
        );
    }

    function renderUserStatusBadge() {
        if (isAdminChat) {
            return <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded-full">Admin</span>;
        }
        if (isBannedUser) {
            return <span className="ml-2 bg-red-100 text-red-800 text-xs px-1.5 py-0.5 rounded-full">Banned</span>;
        }
        if (isBlockedUser) {
            return <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0.5 rounded-full">Blocked</span>;
        }
        return null;
    }

    function renderMessages() {
        if (messages.length === 0) {
            return renderEmptyState();
        }

        return (
            <>
                <div className="space-y-6">
                    {renderStatusNotification()}
                    {messages.map((message) => (
                        message.isSystemMessage ? renderSystemMessage(message) : renderChatMessage(message)
                    ))}
                </div>
            </>
        );
    }

    function renderEmptyState() {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center px-8 py-12 bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-sm">
                    <div className="mb-4 text-4xl text-blue-500">
                        <i className={isAdminChat ? "fas fa-headset" : "fas fa-comment-dots"}></i>
                    </div>
                    <p className="text-lg">
                        {isAdminChat ? "Start a conversation with admin support!" : "No messages yet. Start the conversation!"}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">Type a message below to begin</p>
                </div>
            </div>
        );
    }

    function renderStatusNotification() {
        if ((isBannedUser || isBlockedUser) && !isAdmin) {
            const isUserBanned = isBannedUser;
            return (
                <div className="flex justify-center mb-4">
                    <div className={`${isUserBanned ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"} px-4 py-2 rounded-lg text-sm text-center max-w-md shadow-sm`}>
                        <i className={`fas ${isUserBanned ? "fa-ban" : "fa-exclamation-triangle"} mr-2`}></i>
                        {isUserBanned
                            ? "This user has been banned by an admin. You cannot send messages."
                            : "This user has been temporarily blocked by an admin."
                        }
                    </div>
                </div>
            );
        }
        return null;
    }

    function renderSystemMessage(message) {
        return (
            <div key={message.id} className="flex justify-center">
                <div className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg text-sm max-w-md text-center shadow-sm">
                    <i className="fas fa-info-circle mr-2"></i>
                    {message.text}
                </div>
            </div>
        );
    }

    function renderChatMessage(message) {
        const senderId = message.sender?._id || message.sender || message.from;
        const currentUserId = loggedInUser?._id;
        const isMe = senderId && currentUserId && senderId.toString() === currentUserId.toString();
        const messageText = message.content || message.text || "";
        const isMessageFlagged = message.flagged || containsInappropriateContent(messageText, flaggedWords);
        const isDeleted = message.isDeleted;

        return (
            <div
                key={message._id || message.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"} group relative`}
            >
                <div className={`max-w-[75%] flex ${isMe ? "flex-row-reverse" : ""}`}>
                    {!isMe && (
                        <img
                            src={generateAvatar(selectedUser)}
                            alt={selectedUser.name}
                            className="w-10 h-10 rounded-full mt-1 mr-2 border-2 border-white shadow-sm"
                        />
                    )}

                    <div
                        className={`relative rounded-2xl px-5 py-3 shadow-sm ${isDeleted
                            ? "bg-gray-200 text-gray-500 italic"
                            : isMe
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-none"
                                : isMessageFlagged
                                    ? "bg-red-50 text-gray-800 rounded-tl-none border border-red-200"
                                    : "bg-gray-100 text-gray-800 rounded-tl-none shadow"
                            }`}
                    >
                        {isMessageFlagged && !isDeleted && (
                            <div className="absolute -top-6 right-0 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-md shadow-sm">
                                <i className="fas fa-flag mr-1"></i> Flagged content
                            </div>
                        )}

                        {message.isVoice && !isDeleted && (
                            <span className="absolute -top-6 left-0 text-xs text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm">
                                <i className="fas fa-microphone mr-1"></i> Voice message
                            </span>
                        )}

                        {isDeleted ? (
                            <div className="flex items-center text-gray-500">
                                <i className="fas fa-ban mr-2"></i>
                                <span className="italic">{messageText}</span>
                            </div>
                        ) : (isAdmin ? (
                            <div
                                className={isMe ? "text-white break-words" : "text-gray-800 break-words"}
                                style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
                                dangerouslySetInnerHTML={{ __html: highlightInappropriate(messageText) }}
                            />
                        ) : (
                            <div
                                className={isMe ? "text-white break-words" : "text-gray-800 break-words"}
                                style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
                            >
                                {messageText}
                            </div>
                        ))}

                        <div className={`text-xs mt-1.5 flex items-center gap-1.5 ${isMe ? "text-blue-100" : "text-gray-500"}`}>
                            {message.time || (message.createdAt && new Date(message.createdAt).toLocaleTimeString())}
                            {isMe && renderMessageStatus(message)}
                            {isDeleted && <span className="ml-1 italic">(deleted by admin)</span>}
                        </div>

                        {isAdmin && onDeleteMessage && !isDeleted && (
                            <div className="absolute -top-2 -right-2 flex gap-1">
                                <button
                                    className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow"
                                    onClick={() => handleDeleteMessage(message._id || message.id)}
                                    title="Delete message"
                                >
                                    <i className="fas fa-times text-xs"></i>
                                </button>
                                {!isMe && isMessageFlagged && (
                                    <button
                                        className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-gray-800 transition-all shadow"
                                        onClick={() => onBanUser && onBanUser(senderId, "Inappropriate content")}
                                        title="Ban user for this message"
                                    >
                                        <i className="fas fa-user-slash text-xs"></i>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white/90 rounded-br-3xl shadow-inner">
            <div className={`py-5 px-8 border-b flex justify-between items-center shadow-sm rounded-tr-3xl ${isAdminChat ? 'bg-purple-50' :
                    isBannedUser ? 'bg-red-50' :
                        isBlockedUser ? 'bg-yellow-50' :
                            'bg-gradient-to-r from-blue-50 to-indigo-50'
                }`}>
                <div className="flex items-center">
                    {isAdminChat ? (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center mr-3 shadow-md">
                            <i className="fas fa-headset text-white text-lg"></i>
                        </div>
                    ) : (
                        <div className="relative">
                            <img
                                src={generateAvatar(selectedUser)}
                                alt={selectedUser.name}
                                className="w-12 h-12 rounded-full object-cover mr-3 border-2 border-white shadow-sm"
                            />
                            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${selectedUser.status === "online" ? "bg-green-500" :
                                    selectedUser.status === "banned" ? "bg-black" :
                                        selectedUser.status === "blocked" ? "bg-red-500" :
                                            "bg-gray-400"
                                }`}></span>
                        </div>
                    )}
                    <div>
                        <h3 className="font-medium text-lg flex items-center">
                            {selectedUser.name}
                            {renderUserStatusBadge()}
                        </h3>
                        <span className="text-sm text-gray-500">
                            {selectedUser.status === "online" ? (
                                <span className="flex items-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                                    {isAdminChat ? "Always Available" : "Online"}
                                </span>
                            ) : (
                                selectedUser.lastSeen
                            )}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {!isAdminChat && (
                        <button
                            className="p-2.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                            onClick={onViewProfile}
                            title="View Profile"
                        >
                            <i className="far fa-user-circle text-xl"></i>
                        </button>
                    )}
                </div>
            </div>
            <div
                className={`flex-1 p-8 overflow-y-auto ${isAdminChat ? 'bg-purple-50/30' :
                        isBannedUser ? 'bg-red-50/20' :
                            isBlockedUser ? 'bg-yellow-50/20' :
                                'bg-gradient-to-br from-gray-50 to-blue-50/30'
                    }`}
                style={{
                    scrollBehavior: 'smooth',
                    maxHeight: 'calc(100vh - 220px)',
                    overflowY: 'auto'
                }}
            >
                {renderMessages()}
                <div ref={messagesEndRef} className="h-4" />
            </div>
            <form onSubmit={handleSendMessage} className="p-6 border-t flex items-end gap-3 bg-white/95 shadow-lg rounded-b-3xl">
                <div className="flex-1 relative">
                    <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder={getInputPlaceholder()}
                        className={`w-full p-4 pr-12 bg-gray-100 rounded-2xl resize-none focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 border border-transparent focus:border-blue-200 transition-all ${isMessageDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        style={{ maxHeight: '120px', minHeight: '50px' }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                        rows={1}
                        disabled={isMessageDisabled}
                    ></textarea>
                    {isRecording && (
                        <div className="absolute right-12 bottom-3 flex items-center text-red-500">
                            <div className="mr-2 h-2 w-2 bg-red-500 rounded-full animate-ping"></div>
                            Recording...
                        </div>
                    )}
                    <button
                        type="button"
                        className={`absolute right-3 bottom-3 p-2 rounded-full focus:outline-none transition-all ${isRecording ? "bg-red-500 text-white animate-pulse" : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                            } ${isMessageDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={handleVoiceInput}
                        title={isRecording ? "Stop recording" : "Voice to text"}
                        disabled={isMessageDisabled}
                    >
                        <i className={`fas ${isRecording ? "fa-stop" : "fa-microphone"}`}></i>
                    </button>
                </div>
                <button
                    type="submit"
                    className={`p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex-shrink-0 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all ${isMessageDisabled || (!messageText.trim() && !isRecording) ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    disabled={isMessageDisabled || (!messageText.trim() && !isRecording)}
                >
                    <i className="fas fa-paper-plane"></i>
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
