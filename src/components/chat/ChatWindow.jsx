import React, { useState, useRef, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { Context } from "../../main";
import { getAvatarByRole } from "../../utils/avatarUtils";
import {
  highlightInappropriateContent,
  containsInappropriateContent,
} from "../../utils/moderationUtils";
import axios from "axios";

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
  flaggedWords = [],
  typingUsers = [],
  onTypingStart,
  onTypingStop,
}) => {
  const [messageText, setMessageText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const { user: loggedInUser } = useContext(Context);
  const messagesEndRef = useRef(null);
  const isAdminChat = selectedUser?.role === "admin";
  const isBannedUser = selectedUser?.status === "banned";
  const isBlockedUser = selectedUser?.status === "blocked";
  const isMessageDisabled = (isBannedUser || isBlockedUser) && !isAdmin;
  const isCurrentUserBlockedOrBanned =
    loggedInUser?.status === "blocked" || loggedInUser?.status === "banned";
  const isChatDisabled = isCurrentUserBlockedOrBanned;
  const avatar = getAvatarByRole(selectedUser);

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
      recognitionInstance.lang = "en-US";
      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        setMessageText(transcript);
      };
      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        toast.error("Speech recognition failed. Please try again.");
        setIsRecording(false);
      };
      setRecognition(recognitionInstance);
    }
  };
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessageText(value);

    if (value.trim() && !isTyping) {
      setIsTyping(true);
      if (onTypingStart) onTypingStart();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (onTypingStop) onTypingStop();
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!canSendMessage() || isSending) return;

    if (messageText.trim()) {
      setIsTyping(false);
      if (onTypingStop) onTypingStop();

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      const currentMessage = messageText.trim();
      setMessageText("");
      setIsSending(true);

      try {
        await onSendMessage(currentMessage);
      } catch (error) {
        console.error("Error sending message:", error);
        setMessageText(currentMessage);
      } finally {
        setIsSending(false);
      }
    }
  };

  const canSendMessage = () => {
    if (isSending) return false;
    if (selectedUser?.status === "banned" && !isAdmin) {
      toast.error("This user has been banned and cannot receive messages.");
      return false;
    }
    if (selectedUser?.status === "blocked" && !isAdmin) {
      toast.error("This user has been blocked and cannot receive messages.");
      return false;
    }
    return true;
  };

  const handleVoiceInput = () => {
    if (!recognition) {
      console.error("Speech recognition is not supported in this browser.");
      toast.error("Speech recognition is not supported in your browser");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        isRecording ? stopRecording() : startRecording();
      })
      .catch((err) => {
        console.error("Microphone permission denied:", err);
        toast.error("Please allow microphone access to record voice messages");
      });
  };

  const startRecording = () => {
    try {
      setMessageText("");
      recognition.start();
      setIsRecording(true);
      toast.info("Recording started... Speak now");
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("Failed to start recording. Please try again.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    try {
      recognition.stop();
      setIsRecording(false);

      setTimeout(async () => {
        if (messageText.trim()) {
          setIsSending(true);
          try {
            await onSendMessage(messageText, true);
            toast.success("Voice message processed");
            setMessageText("");
          } catch (error) {
            console.error("Error sending voice message:", error);
          } finally {
            setIsSending(false);
          }
        } else {
          toast.warn("No speech detected. Please try again.");
        }
      }, 300);
    } catch (error) {
      console.error("Failed to stop recording:", error);
      toast.error("Failed to process voice message");
      setIsRecording(false);
    }
  };

  const handleDeleteMessage = (messageId) => {
    if (onDeleteMessage && isAdmin) {
      onDeleteMessage(messageId);
      console.log("Message deleted by admin");
      toast.success("Message deleted successfully");
    }
  };

  const handleDeleteOwnMessage = async (messageId, permanent = false) => {
    if (!messageId) return;

    try {
      if (permanent) {
        const confirmed = window.confirm(
          "Permanently delete this message? This cannot be undone."
        );
        if (!confirmed) return;
      }

      if (onDeleteOwnMessage) {
        await onDeleteOwnMessage(messageId, permanent);
      } else {
        await axios.delete(
          `http://localhost:4000/api/v1/message/${messageId}?permanent=${permanent}`,
          { withCredentials: true }
        );
        console.log(
          `Message ${
            permanent ? "permanently deleted" : "deleted"
          } successfully`
        );
        toast.success(
          permanent ? "Message permanently deleted" : "Message deleted"
        );
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  const getInputPlaceholder = () => {
    if (isCurrentUserBlockedOrBanned)
      return loggedInUser.status === "banned"
        ? "You are banned and cannot send messages"
        : "You are blocked and cannot send messages";
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
        {message.status === "sent" && (
          <i className="fas fa-check text-xs" title="Sent"></i>
        )}
        {message.status === "delivered" && (
          <i className="fas fa-check-double text-xs" title="Delivered"></i>
        )}
        {message.status === "read" && (
          <i
            className="fas fa-check-double text-blue-300 text-xs"
            title="Read"
          ></i>
        )}
      </span>
    );
  }

  function renderUserStatusBadge() {
    if (isAdminChat) {
      return (
        <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded-full">
          Admin
        </span>
      );
    }
    if (isBannedUser) {
      return (
        <span className="ml-2 bg-red-100 text-red-800 text-xs px-1.5 py-0.5 rounded-full">
          Banned
        </span>
      );
    }
    if (isBlockedUser) {
      return (
        <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0.5 rounded-full">
          Blocked
        </span>
      );
    }
    return null;
  }

  function renderMessages() {
    if (messages.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="space-y-6">
        {renderStatusNotification()}
        {messages.map((message, index) =>
          message.isSystemMessage
            ? renderSystemMessage(message, index)
            : renderChatMessage(message, index)
        )}
      </div>
    );
  }

  function renderEmptyState() {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center px-8 py-12 bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-sm">
          <div className="mb-4 text-4xl text-blue-500">
            <i
              className={isAdminChat ? "fas fa-headset" : "fas fa-comment-dots"}
            ></i>
          </div>
          <p className="text-lg">
            {isAdminChat
              ? "Start a conversation with admin support!"
              : "No messages yet. Start the conversation!"}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Type a message below to begin
          </p>
        </div>
      </div>
    );
  }

  function renderStatusNotification() {
    if ((isBannedUser || isBlockedUser) && !isAdmin) {
      const isUserBanned = isBannedUser;
      return (
        <div className="flex justify-center mb-4">
          <div
            className={`${
              isUserBanned
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            } px-4 py-2 rounded-lg text-sm text-center max-w-md shadow-sm`}
          >
            <i
              className={`fas ${
                isUserBanned ? "fa-ban" : "fa-exclamation-triangle"
              } mr-2`}
            ></i>
            {isUserBanned
              ? "This user has been banned by an admin. You cannot send messages."
              : "This user has been temporarily blocked by an admin."}
          </div>
        </div>
      );
    }
    return null;
  }

  function renderSystemMessage(message, index) {
    return (
      <div
        key={`system-${message.id || message._id || index}`}
        className="flex justify-center"
      >
        <div className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg text-sm max-w-md text-center shadow-sm">
          <i className="fas fa-info-circle mr-2"></i>
          {message.text}
        </div>
      </div>
    );
  }

  function renderChatMessage(message, index) {
    const senderId = message.sender?._id || message.sender || message.from;
    const currentUserId = loggedInUser?._id;
    const isMe =
      senderId &&
      currentUserId &&
      senderId.toString() === currentUserId.toString();
    const messageText = message.content || message.text || "";
    const isMessageFlagged =
      message.flagged ||
      containsInappropriateContent(messageText, flaggedWords);
    const isDeleted = message.isDeleted;
    const isPermanentlyDeleted = message.permanentlyDeleted;
    const senderName =
      message.sender?.name ||
      selectedUser?.participants?.find((p) => p._id === senderId)?.name;
    const uniqueKey = `message-${message._id || message.id || index}-${
      message.createdAt || Date.now()
    }-${senderId}`;

    return (
      <div
        key={uniqueKey}
        className={`flex ${
          isMe ? "justify-end" : "justify-start"
        } group relative`}
      >
        <div className={`max-w-[75%] flex ${isMe ? "flex-row-reverse" : ""}`}>
          {!isMe && (
            <div
              className="w-10 h-10 rounded-full mt-1 mr-2 border-2 border-white shadow-sm flex items-center justify-center text-white text-sm font-medium"
              style={{ backgroundColor: avatar.color }}
            >
              {avatar.initials}
            </div>
          )}

          <div
            className={`relative rounded-2xl px-5 py-3 shadow-sm ${
              isDeleted || isPermanentlyDeleted
                ? "bg-gray-200 text-gray-500 italic"
                : isMe
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-none"
                : isMessageFlagged
                ? "bg-red-50 text-gray-800 rounded-tl-none border border-red-200"
                : "bg-gray-100 text-gray-800 rounded-tl-none shadow"
            }`}
          >
            {!isMe && (
              <div className="text-xs font-semibold text-blue-600 mb-1">
                {senderName}
              </div>
            )}

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

            {isDeleted || isPermanentlyDeleted ? (
              <div className="flex items-center text-gray-500">
                <i className="fas fa-ban mr-2"></i>
                <span className="italic">{messageText}</span>
              </div>
            ) : isAdmin ? (
              <div
                className={
                  isMe ? "text-white break-words" : "text-gray-800 break-words"
                }
                style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
                dangerouslySetInnerHTML={{
                  __html: highlightInappropriate(messageText),
                }}
              />
            ) : (
              <div
                className={
                  isMe ? "text-white break-words" : "text-gray-800 break-words"
                }
                style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
              >
                {messageText}
              </div>
            )}
            <div
              className={`text-xs mt-1.5 flex items-center gap-1.5 ${
                isMe ? "text-blue-100" : "text-gray-500"
              }`}
            >
              {message.time ||
                (message.createdAt &&
                  new Date(message.createdAt).toLocaleTimeString())}
              {isMe && renderMessageStatus(message)}
              {isDeleted && !isPermanentlyDeleted && (
                <span className="ml-1 italic">(deleted)</span>
              )}
              {isPermanentlyDeleted && (
                <span className="ml-1 italic">(permanently deleted)</span>
              )}
            </div>

            {!isDeleted && !isPermanentlyDeleted && (
              <div className="absolute top-2 right-2 z-10">
                <button
                  className="text-gray-400 hover:text-gray-700 focus:outline-none"
                  onClick={() =>
                    setDropdownOpen(
                      dropdownOpen === (message._id || message.id)
                        ? null
                        : message._id || message.id
                    )
                  }
                >
                  <i className="fas fa-ellipsis-v h-14"></i>
                </button>

                {dropdownOpen === (message._id || message.id) && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    {isMe ? (
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setDropdownOpen(null);
                          handleDeleteOwnMessage(
                            message._id || message.id,
                            true
                          );
                        }}
                      >
                        Delete for everyone
                      </button>
                    ) : (
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => {
                          setDropdownOpen(null);
                          handleDeleteOwnMessage(
                            message._id || message.id,
                            false
                          );
                        }}
                      >
                        <i className="fas fa-eye-slash mr-2"></i>
                        Delete for me
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {isAdmin &&
              onDeleteMessage &&
              !isDeleted &&
              !isPermanentlyDeleted && (
                <div className="absolute -top-2 -right-2 flex gap-1">
                  <button
                    className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow"
                    onClick={() =>
                      handleDeleteMessage(message._id || message.id)
                    }
                    title="Delete message"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                  {!isMe && isMessageFlagged && (
                    <button
                      className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-gray-800 transition-all shadow"
                      onClick={() =>
                        onBanUser &&
                        onBanUser(senderId, "Inappropriate content")
                      }
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

  const isGroupChat = selectedUser?.isGroupChat;

  const renderGroupHeader = () => {
    if (!isGroupChat) return null;

    const group = selectedUser;
    const memberCount = group.participants ? group.participants.length : 0;

    return (
      <div
        className={`py-3 md:py-5 px-4 md:px-8 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50`}
      >
        <div className="flex items-center">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-3 shadow-md text-white">
            <i className="fas fa-users"></i>
          </div>
          <div>
            <h3 className="font-medium text-base md:text-lg flex items-center">
              {group.groupName || group.name || "Group Chat"}
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                Group
              </span>
            </h3>
            <span className="text-xs md:text-sm text-gray-500">
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="p-2 md:p-2.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
            onClick={onViewProfile}
            title="Group Info"
          >
            <i className="fas fa-info-circle text-lg md:text-xl"></i>
          </button>
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
    );
  };

  const renderTypingIndicator = () => {
    if (!typingUsers || typingUsers.length === 0) return null;

    const typingUserNames = typingUsers
      .map((userId) => {
        if (selectedUser?.isGroupChat) {
          const participant = selectedUser.participants?.find(
            (p) => p._id === userId
          );
          return participant?.name || "Someone";
        } else {
          if (userId === selectedUser._id) return selectedUser.name;
          return "Someone";
        }
      })
      .filter(Boolean);

    if (typingUserNames.length === 0) return null;

    return (
      <div className="px-4 py-2 text-sm text-gray-500 italic">
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
          <span>
            {typingUserNames.join(", ")}{" "}
            {typingUserNames.length === 1 ? "is" : "are"} typing...
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-white/90 rounded-br-3xl shadow-inner overflow-hidden">
      {isGroupChat ? (
        renderGroupHeader()
      ) : (
        <div
          className={`py-3 md:py-5 px-4 md:px-8 flex justify-between items-center shadow-sm ${
            isAdminChat
              ? "bg-purple-50"
              : isBannedUser
              ? "bg-red-50"
              : isBlockedUser
              ? "bg-yellow-50"
              : "bg-gradient-to-r from-blue-50 to-indigo-50"
          }`}
        >
          <div className="flex items-center">
            {isAdminChat ? (
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center mr-3 shadow-md">
                <i className="fas fa-headset text-white text-lg"></i>
              </div>
            ) : (
              <div className="relative">
                <div
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full mr-3 border-2 border-white shadow-sm flex items-center justify-center text-white font-medium cursor-pointer"
                  style={{ backgroundColor: avatar.color }}
                  onClick={onViewProfile}
                  title="View profile"
                  role="button"
                >
                  {avatar.initials}
                </div>
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    selectedUser.status === "online"
                      ? "bg-green-500"
                      : selectedUser.status === "banned"
                      ? "bg-black"
                      : selectedUser.status === "blocked"
                      ? "bg-red-500"
                      : "bg-gray-400"
                  }`}
                ></span>
              </div>
            )}
            <div>
              <h3 className="font-medium text-base md:text-lg flex items-center">
                {selectedUser.name}
                {renderUserStatusBadge()}
              </h3>
              {selectedUser.email && (
                <span className="text-xs md:text-sm text-gray-500 block">
                  {selectedUser.email}
                </span>
              )}
              <span className="text-xs md:text-sm text-gray-500">
                {selectedUser.status === "online" ? (
                  <span className="flex items-center">Online</span>
                ) : (
                  <span className="flex items-center">
                    Offline{" "}
                    {selectedUser.lastSeen ? `- ${selectedUser.lastSeen}` : ""}
                  </span>
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isAdminChat && (
              <button
                className="p-2 md:p-2.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                onClick={onViewProfile}
                title="View Profile"
              >
                <i className="far fa-user-circle text-lg md:text-xl"></i>
              </button>
            )}
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
      )}

      <div
        className={`flex-1 p-4 md:p-8 overflow-y-auto ${
          isAdminChat
            ? "bg-purple-50/30"
            : isBannedUser
            ? "bg-red-50/20"
            : isBlockedUser
            ? "bg-yellow-50/20"
            : "bg-gradient-to-br from-gray-50 to-blue-50/30"
        }`}
        style={{
          scrollBehavior: "smooth",
          maxHeight: "calc(100vh - 200px)",
          overflowY: "auto",
        }}
      >
        {renderMessages()}
        {renderTypingIndicator()}
        <div ref={messagesEndRef} className="h-4" />
      </div>
      <form
        onSubmit={handleSendMessage}
        className="p-4 md:p-6 flex items-end gap-3 bg-white/95 shadow-lg"
      >
        <div className="flex-1 relative items-center">
          <textarea
            value={messageText}
            onChange={handleInputChange}
            placeholder={getInputPlaceholder()}
            className={`w-full p-3 md:p-4 pr-12 bg-gray-100 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 border border-transparent focus:border-blue-200 transition-all ${
              isMessageDisabled || isChatDisabled
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            style={{ maxHeight: "120px", minHeight: "50px" }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            rows={1}
            disabled={isMessageDisabled || isChatDisabled}
          />
          {isRecording && (
            <div className="absolute right-12 bottom-3 flex items-center text-red-500">
              <div className="mr-2 h-2 w-2 bg-red-500 rounded-full animate-ping"></div>
              Recording...
            </div>
          )}

          <button
            type="button"
            className={`absolute right-3 bottom-3 p-2 rounded-full focus:outline-none transition-all ${
              isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "bg-gray-200 text-gray-500 hover:bg-gray-300"
            } ${
              isMessageDisabled || isChatDisabled
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={handleVoiceInput}
            title={isRecording ? "Stop recording" : "Voice to text"}
            disabled={isMessageDisabled || isChatDisabled}
          >
            <i
              className={`fas ${isRecording ? "fa-stop" : "fa-microphone"}`}
            ></i>
          </button>
        </div>
        <button
          type="submit"
          className={`p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl flex-shrink-0 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all mb-2 ${
            isMessageDisabled ||
            isChatDisabled ||
            isSending ||
            (!messageText.trim() && !isRecording)
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          disabled={
            isMessageDisabled ||
            isChatDisabled ||
            isSending ||
            (!messageText.trim() && !isRecording)
          }
        >
          {isSending ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-paper-plane"></i>
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
