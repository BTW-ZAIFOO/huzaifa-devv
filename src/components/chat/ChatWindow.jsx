import React, { useState, useRef, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { Context } from "../../main";
import { generateAvatar } from "../../utils/avatarUtils";
import { highlightInappropriateContent, containsInappropriateContent } from "../../utils/moderationUtils";
import axios from "axios";

// ChatWindow component handles the chat UI, message sending, moderation, and admin actions
const ChatWindow = ({
    selectedUser,
    messages,
    onSendMessage,
    onViewProfile,
    isAdmin,
    onDeleteMessage,
    onDeleteOwnMessage,
    onBanUser,
    onCloseChat,
    flaggedWords = []
}) => {

    // State for message input, voice recording, and speech recognition
    const [messageText, setMessageText] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const messagesEndRef = useRef(null);
    const [recognition, setRecognition] = useState(null);

    // User and chat status flags
    const isAdminChat = selectedUser?.role === "admin";
    const isBannedUser = selectedUser?.status === "banned";
    const isBlockedUser = selectedUser?.status === "blocked";
    const isMessageDisabled = ((isBannedUser || isBlockedUser) && !isAdmin);
    const { user: loggedInUser } = useContext(Context);
    const isCurrentUserBlockedOrBanned = loggedInUser?.status === "blocked" || loggedInUser?.status === "banned";
    const isChatDisabled = isCurrentUserBlockedOrBanned;

    // Initialize speech recognition on mount
    useEffect(() => {
        initializeSpeechRecognition();
        return () => recognition?.stop();
    }, []);

    // Setup speech recognition if supported
    const initializeSpeechRecognition = () => {
        if ("webkitSpeechRecognition" in window) {
            const SpeechRecognition = window.webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = 'en-US';
            recognitionInstance.onresult = (event) => {

                // Update message text as speech is recognized
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                setMessageText(transcript);
            };
            recognitionInstance.onerror = (event) => {

                // Handle speech recognition errors
                console.error("Speech recognition error:", event.error);
                toast.error("Speech recognition failed. Please try again.");
                setIsRecording(false);
            };

            setRecognition(recognitionInstance);
        }
    };

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [messages]);

    // Handle sending a message (text or voice)
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!canSendMessage()) return;

        if (messageText.trim()) {
            onSendMessage(messageText);
            setMessageText("");
        }
    };

    // Check if the current user can send a message to the selected user
    const canSendMessage = () => {
        if (selectedUser.status === "banned" && !isAdmin) {
            console.error("This user has been banned and cannot receive messages.");
            toast.error("This user has been banned and cannot receive messages.");
            return false;
        }
        if (selectedUser.status === "blocked" && !isAdmin) {
            console.error("This user has been blocked and cannot receive messages.");
            toast.error("This user has been blocked and cannot receive messages.");
            return false;
        }
        return true;
    };

    // Handle toggling voice input (start/stop recording)
    const handleVoiceInput = () => {
        if (!recognition) {
            console.error("Speech recognition is not supported in this browser.");
            toast.error("Speech recognition is not supported in your browser");
            return;
        }
        isRecording ? stopRecording() : startRecording();
    };

    // Start voice recording
    const startRecording = () => {
        setMessageText("");
        recognition.start();
        setIsRecording(true);
    };

    // Stop voice recording and send the message if any text was recognized
    const stopRecording = () => {
        recognition.stop();
        setIsRecording(false);
        if (messageText.trim()) {
            onSendMessage(messageText, true);
            setMessageText("");
        }
    };

    // Admin deletes any message
    const handleDeleteMessage = (messageId) => {
        if (onDeleteMessage && isAdmin) {
            onDeleteMessage(messageId);
            console.log("Message deleted by admin");
            toast.success("Message deleted successfully");
        }
    };

    // User deletes their own message (soft or permanent)
    const handleDeleteOwnMessage = async (messageId, permanent = false) => {
        if (!messageId) return;

        try {
            if (permanent) {
                const confirmed = window.confirm("Permanently delete this message? This cannot be undone.");
                if (!confirmed) return;
            }

            if (onDeleteOwnMessage) {
                await onDeleteOwnMessage(messageId, permanent);
            } else {
                await axios({
                    method: 'DELETE',
                    url: `http://localhost:4000/api/v1/message/${messageId}`,
                    data: { permanent },
                    withCredentials: true
                });
                console.log(`Message ${permanent ? "permanently deleted" : "deleted"} successfully`);
                toast.success(permanent ? "Message permanently deleted" : "Message deleted");
            }
        } catch (error) {
            console.error("Error deleting message:", error);
            toast.error("Failed to delete message");
        }
    };

    // Get placeholder text for the input area based on user/chat status
    const getInputPlaceholder = () => {
        if (isCurrentUserBlockedOrBanned) return loggedInUser.status === "banned"
            ? "You are banned and cannot send messages"
            : "You are blocked and cannot send messages";
        if (isBannedUser && !isAdmin) return "This user has been banned";
        if (isBlockedUser && !isAdmin) return "This user has been blocked";
        if (isRecording) return "Listening...";
        return "Type a message...";
    };

    // Highlight inappropriate words in a message
    function highlightInappropriate(text) {
        return highlightInappropriateContent(text, flaggedWords);
    }

    // Render message status icons (sent, delivered, read)
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

    // Render badge for user status (admin, banned, blocked)
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

    // Render all chat messages or empty state if no messages
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

    // Render UI when there are no messages yet
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

    // Render notification if user is banned or blocked
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

    // Render system messages (info, notifications)
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

    // Render a single chat message (with moderation, deletion, admin actions)
    function renderChatMessage(message) {
        // Determine sender and message properties
        const senderId = message.sender?._id || message.sender || message.from;
        const currentUserId = loggedInUser?._id;
        const isMe = senderId && currentUserId && senderId.toString() === currentUserId.toString();
        const messageText = message.content || message.text || "";
        const isMessageFlagged = message.flagged || containsInappropriateContent(messageText, flaggedWords);
        const isDeleted = message.isDeleted;
        const isPermanentlyDeleted = message.permanentlyDeleted;
        const avatar = generateAvatar(message.sender);

        return (
            <div
                key={message._id || message.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"} group relative`}
            >
                <div className={`max-w-[75%] flex ${isMe ? "flex-row-reverse" : ""}`}>

                    {/* Show avatar for other users */}
                    {!isMe && (
                        <div
                            className="w-10 h-10 rounded-full mt-1 mr-2 border-2 border-white shadow-sm flex items-center justify-center text-white text-sm font-medium"
                            style={{ backgroundColor: avatar.color }}
                        >
                            {avatar.initials}
                        </div>
                    )}

                    <div
                        className={`relative rounded-2xl px-5 py-3 shadow-sm ${isDeleted || isPermanentlyDeleted
                            ? "bg-gray-200 text-gray-500 italic"
                            : isMe
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-none"
                                : isMessageFlagged
                                    ? "bg-red-50 text-gray-800 rounded-tl-none border border-red-200"
                                    : "bg-gray-100 text-gray-800 rounded-tl-none shadow"
                            }`}
                    >

                        {/* Show flagged badge if message is inappropriate */}
                        {isMessageFlagged && !isDeleted && (
                            <div className="absolute -top-6 right-0 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-md shadow-sm">
                                <i className="fas fa-flag mr-1"></i> Flagged content
                            </div>
                        )}

                        {/* Show voice message badge */}
                        {message.isVoice && !isDeleted && (
                            <span className="absolute -top-6 left-0 text-xs text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm">
                                <i className="fas fa-microphone mr-1"></i> Voice message
                            </span>
                        )}

                        {/* Show deleted/permanently deleted message */}
                        {isDeleted || isPermanentlyDeleted ? (
                            <div className="flex items-center text-gray-500">
                                <i className="fas fa-ban mr-2"></i>
                                <span className="italic">{messageText}</span>
                            </div>
                        ) : (isAdmin ? (

                            // Admin sees highlighted inappropriate content
                            <div
                                className={isMe ? "text-white break-words" : "text-gray-800 break-words"}
                                style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
                                dangerouslySetInnerHTML={{ __html: highlightInappropriate(messageText) }}
                            />
                        ) : (

                            // Regular user sees plain text
                            <div
                                className={isMe ? "text-white break-words" : "text-gray-800 break-words"}
                                style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
                            >
                                {messageText}
                            </div>
                        ))}

                        {/* Message time and status */}
                        <div className={`text-xs mt-1.5 flex items-center gap-1.5 ${isMe ? "text-blue-100" : "text-gray-500"}`}>
                            {message.time || (message.createdAt && new Date(message.createdAt).toLocaleTimeString())}
                            {isMe && renderMessageStatus(message)}
                            {isDeleted && !isPermanentlyDeleted && <span className="ml-1 italic">(deleted)</span>}
                            {isPermanentlyDeleted && <span className="ml-1 italic">(permanently deleted)</span>}
                        </div>

                        {/* Message action buttons for user (delete, permanent delete) */}
                        {!isDeleted && !isPermanentlyDeleted && (
                            <div className="absolute -top-2 -right-2 flex gap-1">
                                <button
                                    className="bg-gray-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-gray-600 transition-all shadow"
                                    onClick={() => handleDeleteOwnMessage(message._id || message.id, false)}
                                    title="Delete message"
                                >
                                    <i className="fas fa-times text-xs"></i>
                                </button>
                                <button
                                    className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow"
                                    onClick={() => handleDeleteOwnMessage(message._id || message.id, true)}
                                    title="Permanently delete message"
                                >
                                    <i className="fas fa-trash-alt text-xs"></i>
                                </button>
                            </div>
                        )}

                        {/* Admin action buttons (delete, ban for flagged) */}
                        {isAdmin && onDeleteMessage && !isDeleted && !isPermanentlyDeleted && (
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

    // Main render: header, messages, input area
    return (
        <div className="flex-1 flex flex-col bg-white/90 rounded-br-3xl shadow-inner overflow-hidden">

            {/* Chat header with user info and actions */}
            <div className={`py-3 md:py-5 px-4 md:px-8 border-b flex justify-between items-center shadow-sm ${isAdminChat ? 'bg-purple-50' :
                isBannedUser ? 'bg-red-50' :
                    isBlockedUser ? 'bg-yellow-50' :
                        'bg-gradient-to-r from-blue-50 to-indigo-50'
                }`}>
                <div className="flex items-center">
                    {isAdminChat ? (

                        // Admin avatar
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center mr-3 shadow-md">
                            <i className="fas fa-headset text-white text-lg"></i>
                        </div>
                    ) : (

                        // User avatar with status indicator
                        <div className="relative">
                            {(() => {
                                const avatar = generateAvatar(selectedUser);
                                return (
                                    <div
                                        className="w-10 h-10 md:w-12 md:h-12 rounded-full mr-3 border-2 border-white shadow-sm flex items-center justify-center text-white font-medium"
                                        style={{ backgroundColor: avatar.color }}
                                        onClick={onViewProfile}
                                        title="View profile"
                                        role="button"
                                    >
                                        {avatar.initials}
                                    </div>
                                );
                            })()}

                            {/* Status dot - gray dot for offline users */}
                            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${selectedUser.status === "online" ? "bg-green-500" :
                                    selectedUser.status === "banned" ? "bg-black" :
                                        selectedUser.status === "blocked" ? "bg-red-500" :
                                            "bg-gray-400" /* Gray for offline */
                                }`}></span>
                        </div>
                    )}
                    <div>
                        <h3 className="font-medium text-base md:text-lg flex items-center">
                            {selectedUser.name}
                            {renderUserStatusBadge()}
                        </h3>
                        <span className="text-xs md:text-sm text-gray-500">
                            {selectedUser.status === "online" ? (
                                <span className="flex items-center">
                                    Online
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    Offline {selectedUser.lastSeen ? `- ${selectedUser.lastSeen}` : ""}
                                </span>
                            )}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">

                    {/* View profile button (not for admin chat) */}
                    {!isAdminChat && (
                        <button
                            className="p-2 md:p-2.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                            onClick={onViewProfile}
                            title="View Profile"
                        >
                            <i className="far fa-user-circle text-lg md:text-xl"></i>
                        </button>
                    )}

                    {/* Close chat button */}
                    {onCloseChat && (
                        <button
                            className="p-2 md:p-2.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                            onClick={onCloseChat}
                            title="Close Chat"
                        >
                            <i className="fas fa-times text-lg md:text-xl"></i>
                        </button>
                    )}
                </div>
            </div>

            {/* Message list area */}
            <div
                className={`flex-1 p-4 md:p-8 overflow-y-auto ${isAdminChat ? 'bg-purple-50/30' :
                    isBannedUser ? 'bg-red-50/20' :
                        isBlockedUser ? 'bg-yellow-50/20' :
                            'bg-gradient-to-br from-gray-50 to-blue-50/30'
                    }`}
                style={{
                    scrollBehavior: 'smooth',
                    maxHeight: 'calc(100vh - 200px)',
                    overflowY: 'auto'
                }}
            >
                {renderMessages()}
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Message input area */}
            <form onSubmit={handleSendMessage} className="p-4 md:p-6 border-t flex items-end gap-3 bg-white/95 shadow-lg">
                <div className="flex-1 relative items-center">
                    <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder={getInputPlaceholder()}
                        className={`w-full p-3 md:p-4 pr-12 bg-gray-100 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 border border-transparent focus:border-blue-200 transition-all ${isMessageDisabled || isChatDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        style={{ maxHeight: '120px', minHeight: '50px' }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                        rows={1}
                        disabled={isMessageDisabled || isChatDisabled}
                    ></textarea>

                    {/* Voice recording indicator */}
                    {isRecording && (
                        <div className="absolute right-12 bottom-3 flex items-center text-red-500">
                            <div className="mr-2 h-2 w-2 bg-red-500 rounded-full animate-ping"></div>
                            Recording...
                        </div>
                    )}

                    {/* Voice input button */}
                    <button
                        type="button"
                        className={`absolute right-3 bottom-3 p-2 rounded-full focus:outline-none transition-all ${isRecording ? "bg-red-500 text-white animate-pulse" : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                            } ${isMessageDisabled || isChatDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={handleVoiceInput}
                        title={isRecording ? "Stop recording" : "Voice to text"}
                        disabled={isMessageDisabled || isChatDisabled}
                    >
                        <i className={`fas ${isRecording ? "fa-stop" : "fa-microphone"}`}></i>
                    </button>
                </div>

                {/* Send message button */}
                <button
                    type="submit"
                    className={`p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl flex-shrink-0 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all mb-2 ${isMessageDisabled || isChatDisabled || (!messageText.trim() && !isRecording) ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    disabled={isMessageDisabled || isChatDisabled || (!messageText.trim() && !isRecording)}
                >
                    <i className="fas fa-paper-plane"></i>
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;