import React, { useState, useContext } from "react";
import { Context } from "../../main";
import { toast } from "react-toastify";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";

const getAvatarByRole = (user) => {
  if (!user || !user.role) return { color: "#4f46e5" };
  switch (user.role) {
    case "admin":
      return { color: "#ef4444" };
    case "moderator":
      return { color: "#f59e42" };
    case "user":
      return { color: "#3b82f6" };
    default:
      return { color: "#4f46e5" };
  }
};

const PostForm = ({ onPostCreated }) => {
  const { user } = useContext(Context);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  const handleEmojiSelect = (emojiData) => {
    setContent((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Post cannot be empty");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("content", content);

      const res = await axios.post(
        "http://localhost:4000/api/v1/post/create",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        setContent("");
        toast.success(
          `Post created successfully by ${user?.name || "Unknown"}!`,
          { className: "animate-toast-pop" }
        );
        if (onPostCreated) {
          onPostCreated(res.data.post);
        }
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error(error.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  if (
    typeof window !== "undefined" &&
    !document.getElementById("toastPopKeyframes")
  ) {
    const style = document.createElement("style");
    style.id = "toastPopKeyframes";
    style.innerHTML = `
    @keyframes toastPop {
      0% { transform: scale(0.8); opacity: 0;}
      60% { transform: scale(1.05); opacity: 1;}
      100% { transform: scale(1); }
    }
    .animate-toast-pop { animation: toastPop 0.5s cubic-bezier(.4,0,.2,1);}
  `;
    document.head.appendChild(style);
  }

  return (
    <div
      className="w-full animate-fade-in"
      style={{
        animation: "fadeInUp 0.7s cubic-bezier(.4,0,.2,1)",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center text-white text-lg font-semibold"
            style={{
              backgroundColor: user ? getAvatarByRole(user)?.color : "#4f46e5",
            }}
          >
            {user?.name?.charAt(0) || "?"}
          </div>
        </div>
        <div className="flex-grow">
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg p-3 min-h-[100px] resize-none"
              maxLength={500}
            />

            <div className="flex justify-between items-center mt-3">
              <div className="flex space-x-2 relative">
                <button
                  type="button"
                  className="text-gray-500 hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-blue-50"
                  onClick={() => setShowEmoji(!showEmoji)}
                >
                  <i className="far fa-smile"></i>
                </button>
                {showEmoji && (
                  <div className="absolute top-10 left-0 z-10">
                    <EmojiPicker
                      onEmojiClick={handleEmojiSelect}
                      disableAutoFocus={true}
                      lazyLoadEmojis={true}
                    />
                  </div>
                )}
                <span className="text-xs text-gray-400 self-center ml-2">
                  {content.length}/500
                </span>
              </div>
              <button
                type="submit"
                disabled={loading || !content.trim()}
                className={`${
                  loading || !content.trim()
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white px-4 py-2 rounded-lg transition-colors`}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> Posting...
                  </>
                ) : (
                  "Post"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostForm;
