import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  containsInappropriateContent,
  extractInappropriateWords,
} from "../../utils/moderationUtils";

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 5MB.");
      e.target.value = null;
      return;
    }

    setMedia(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Post content is required");
      return;
    }

    if (containsInappropriateContent(content)) {
      const flaggedWords = extractInappropriateWords(content);
      toast.warning(
        `Your post contains inappropriate content: ${flaggedWords.join(", ")}`
      );
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("content", content);
      if (media) {
        formData.append("media", media);
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

      toast.success("Post created successfully");
      setContent("");
      setMedia(null);
      setMediaPreview(null);
      onPostCreated(res.data.post);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
        />

        {mediaPreview && (
          <div className="relative mt-3 mb-2">
            <img
              src={mediaPreview}
              alt="Preview"
              className="max-h-60 rounded-lg mx-auto"
            />
            <button
              type="button"
              onClick={() => {
                setMedia(null);
                setMediaPreview(null);
              }}
              className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white rounded-full p-1"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        <div className="flex justify-between items-center mt-3">
          <div>
            <label className="cursor-pointer flex items-center text-gray-600 hover:text-blue-600">
              <i className="far fa-image mr-2 text-lg"></i>
              <span className="text-sm">Add Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleMediaChange}
                className="hidden"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Posting...
              </>
            ) : (
              "Post"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
