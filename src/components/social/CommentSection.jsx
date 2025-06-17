import React, { useState, useContext } from "react";
import { Context } from "../../main";
import { toast } from "react-toastify";
import axios from "axios";
import { getAvatarUrl } from "../../utils/avatarUtils";

const CommentSection = ({
  postId,
  comments = [],
  onCommentAdded,
  onCommentDeleted,
}) => {
  const { user } = useContext(Context);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `http://localhost:4000/api/v1/post/${postId}/comment`,
        { text: newComment },
        { withCredentials: true }
      );

      if (res.data.success) {
        setNewComment("");
        if (onCommentAdded) {
          onCommentAdded(res.data.comment);
        }
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error(error.response?.data?.message || "Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(
        `http://localhost:4000/api/v1/post/${postId}/comment/${commentId}`,
        { withCredentials: true }
      );

      if (onCommentDeleted) {
        onCommentDeleted(commentId);
      }

      toast.success("Comment deleted");
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="p-4">
      <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
        <div className="flex-shrink-0">
          {user && getAvatarUrl(user) ? (
            <img
              src={getAvatarUrl(user)}
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-semibold bg-gray-400">
              {user?.name?.charAt(0) || "?"}
            </div>
          )}
        </div>
        <div className="flex-grow relative">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full border border-gray-300 rounded-full py-2 px-4 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500 ${
              loading || !newComment.trim()
                ? "opacity-50 cursor-not-allowed"
                : "hover:text-blue-700"
            }`}
          >
            {loading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-paper-plane"></i>
            )}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {comments.length > 0 ? (
          comments.map((comment) => {
            const isAuthor = comment.author?._id === user?._id;
            const avatarUrl = getAvatarUrl(comment.author);

            return (
              <div key={comment._id} className="flex gap-2 group">
                <div className="flex-shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={comment.author?.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-semibold bg-gray-400">
                      {comment.author?.name?.charAt(0) || "?"}
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <div className="bg-gray-100 rounded-lg px-3 py-2 inline-block">
                    <div className="font-medium text-gray-800">
                      {comment.author?.name}
                    </div>
                    <div className="text-gray-700">
                      {comment.text || comment.content}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center">
                    <span className="mr-3">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                    <button className="font-medium hover:underline mr-3">
                      Like
                    </button>
                    <button className="font-medium hover:underline">
                      Reply
                    </button>
                    {isAuthor && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="ml-3 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                      >
                        <i className="far fa-trash-alt"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 py-2">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
