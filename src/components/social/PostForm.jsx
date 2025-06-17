import React, { useState, useContext } from "react";
import { Context } from "../../main";
import { toast } from "react-toastify";
import axios from "axios";
import { getAvatarUrl } from "../../utils/avatarUtils";
import EmojiPicker from "emoji-picker-react";

const PostForm = ({ onPostCreated }) => {
  const { user } = useContext(Context);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const avatarUrl = user ? getAvatarUrl(user) : null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, GIF, and WEBP images are allowed");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleEmojiSelect = (emojiData) => {
    setContent((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && !image) {
      toast.error("Post cannot be empty");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) {
        formData.append("media", image);
      }

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
        setImage(null);
        setImagePreview(null);
        toast.success("Post created successfully!");

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

  return (
    <div className="w-full">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={user?.name}
              className="h-10 w-10 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://ui-avatars.com/api/?name=" + (user?.name || "User");
              }}
            />
          ) : (
            <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-lg font-semibold bg-gray-400">
              {user?.name?.charAt(0) || "?"}
            </div>
          )}
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

            {imagePreview && (
              <div className="relative mt-2 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-60 w-auto mx-auto object-contain"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}

            <div className="flex justify-between items-center mt-3">
              <div className="flex space-x-2 relative">
                <label className="cursor-pointer text-gray-500 hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-blue-50">
                  <i className="far fa-image"></i>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/gif"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
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
                disabled={loading || (!content.trim() && !image)}
                className={`${
                  loading || (!content.trim() && !image)
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
