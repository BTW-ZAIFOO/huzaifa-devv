import React, { useState, useContext, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Context } from "../../main";
import { toast } from "react-toastify";
import axios from "axios";
import { getAvatarUrl } from "../../utils/avatarUtils";
import CommentSection from "./CommentSection";
import ConfirmDialog from "../ConfirmDialog";

const PostCard = ({
  post,
  onDelete,
  onUpdate,
  isAdmin = false,
  showActions = true,
}) => {
  const { user } = useContext(Context);
  const [liked, setLiked] = useState(post.likes?.includes(user?._id));
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showOptions, setShowOptions] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModActions, setShowModActions] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [saved, setSaved] = useState(() => {
    try {
      const savedPosts = JSON.parse(localStorage.getItem("savedPosts") || "[]");
      return savedPosts.includes(post._id);
    } catch {
      return false;
    }
  });
  const optionsRef = useRef(null);
  const isAuthor = post.author?._id === user?._id;
  const postedTime = new Date(post.createdAt);
  const timeAgo = formatTimeAgo(postedTime);
  const avatarUrl = post.author ? getAvatarUrl(post.author) : null;

  useEffect(() => {
    function handleClickOutside(event) {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [optionsRef]);

  const handleLike = async () => {
    try {
      const endpoint = liked
        ? `http://localhost:4000/api/v1/post/${post._id}/unlike`
        : `http://localhost:4000/api/v1/post/${post._id}/like`;

      await axios.post(endpoint, {}, { withCredentials: true });

      setLiked(!liked);
      setLikesCount((prevCount) => (liked ? prevCount - 1 : prevCount + 1));

      if (onUpdate) {
        const updatedPost = {
          ...post,
          likes: liked
            ? post.likes.filter((id) => id !== user._id)
            : [...post.likes, user._id],
        };
        onUpdate(updatedPost);
      }
    } catch (error) {
      console.error("Failed to update like status:", error);
      toast.error("Failed to update like status");
    }
  };

  const handleDelete = async () => {
    try {
      if (onDelete) {
        await onDelete(post._id);
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error("Failed to delete post");
    }
  };

  const handleUpdate = async () => {
    setLoading(true);

    try {
      if (!editContent.trim()) {
        toast.error("Post cannot be empty");
        return;
      }

      const res = await axios.put(
        `http://localhost:4000/api/v1/post/${post._id}`,
        { content: editContent },
        { withCredentials: true }
      );

      if (res.data.success && onUpdate) {
        onUpdate({
          ...post,
          content: editContent,
          updatedAt: new Date().toISOString(),
        });
        setEditing(false);
        toast.success("Post updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update post:", error);
      toast.error(error.response?.data?.message || "Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  const handleModeratorAction = async (action, reason) => {
    try {
      setLoading(true);
      let endpoint;
      let successMsg;

      switch (action) {
        case "delete":
          endpoint = `http://localhost:4000/api/v1/admin/post/${post._id}/delete`;
          successMsg = "Post deleted by admin";
          break;
        case "warn":
          endpoint = `http://localhost:4000/api/v1/admin/post/${post._id}/warn`;
          successMsg = "Warning sent to user";
          break;
        case "hide":
          endpoint = `http://localhost:4000/api/v1/admin/post/${post._id}/hide`;
          successMsg = "Post hidden from public view";
          break;
        default:
          throw new Error("Invalid action");
      }

      const res = await axios.post(
        endpoint,
        { reason },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(successMsg);

        if (action === "delete" && onDelete) {
          onDelete(post._id);
        } else if (onUpdate) {
          onUpdate({
            ...post,
            isHidden: action === "hide" ? true : post.isHidden,
            moderationInfo: {
              ...post.moderationInfo,
              action,
              reason,
              moderatedBy: user.name,
              moderatedAt: new Date().toISOString(),
            },
          });
        }
      }
    } catch (error) {
      console.error(`Failed to ${action} post:`, error);
      toast.error(`Failed to ${action} post`);
    } finally {
      setLoading(false);
      setShowModActions(false);
    }
  };

  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };

  const shareToSocialMedia = (platform) => {
    let shareUrl = window.location.origin + `/post/${post._id}`;
    let shareText = `Check out this post from ${
      post.author?.name
    }: ${post.content.substring(0, 50)}${
      post.content.length > 50 ? "..." : ""
    }`;

    try {
      let url;
      switch (platform) {
        case "facebook":
          url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            shareUrl
          )}`;
          break;
        case "twitter":
          url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            shareText
          )}&url=${encodeURIComponent(shareUrl)}`;
          break;
        case "linkedin":
          url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
            shareUrl
          )}&title=${encodeURIComponent(
            "Shared Post"
          )}&summary=${encodeURIComponent(shareText)}`;
          break;
        case "copy":
          navigator.clipboard
            .writeText(shareUrl)
            .then(() => toast.success("Link copied to clipboard!"))
            .catch((err) => {
              console.error("Clipboard error:", err);
              toast.error("Failed to copy link");
            });
          setShowShareOptions(false);
          return;
      }

      if (url) {
        window.open(url, "_blank", "width=600,height=400");
        setShowShareOptions(false);
      }
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Failed to share post");
      setShowShareOptions(false);
    }
  };

  const handleSave = () => {
    let savedPosts = [];
    try {
      savedPosts = JSON.parse(localStorage.getItem("savedPosts") || "[]");
    } catch {}
    if (saved) {
      savedPosts = savedPosts.filter((id) => id !== post._id);
      toast.info("Post removed from saved");
    } else {
      savedPosts.push(post._id);
      toast.success("Post saved");
    }
    localStorage.setItem("savedPosts", JSON.stringify(savedPosts));
    setSaved(!saved);
  };

  function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }

  if (post.isHidden && !isAdmin && !isAuthor) {
    return (
      <div className="bg-gray-50 rounded-xl shadow-sm p-6 text-center">
        <div className="text-gray-500">
          <i className="fas fa-eye-slash text-xl mb-2"></i>
          <p>This post has been hidden by a moderator.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-2xl shadow-md border border-gray-100 mb-6 transition-all duration-200 hover:shadow-lg ${
        post.isHidden ? "border-l-4 border-orange-500" : ""
      }`}
    >
      <div className="flex items-center gap-3 px-5 pt-5 pb-2 relative">
        <Link to={`/profile/${post.author?._id}`}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={post.author.name}
              className="h-11 w-11 rounded-full object-cover border-2 border-blue-100 shadow"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://ui-avatars.com/api/?name=" +
                  (post.author.name || "User");
              }}
            />
          ) : (
            <div className="h-11 w-11 rounded-full flex items-center justify-center text-white text-lg font-semibold bg-gray-400 border-2 border-blue-100 shadow">
              {post.author?.name?.charAt(0) || "?"}
            </div>
          )}
        </Link>
        <div className="flex-1">
          <Link
            to={`/profile/${post.author?._id}`}
            className="font-semibold text-gray-900 hover:text-blue-600"
          >
            {post.author?.name}
          </Link>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <span>{timeAgo}</span>
            {post.updatedAt && post.updatedAt !== post.createdAt && (
              <span className="ml-1">(edited)</span>
            )}
            {post.isHidden && (
              <span className="ml-2 bg-orange-100 text-orange-800 text-xs px-1.5 py-0.5 rounded">
                Hidden by moderator
              </span>
            )}
          </div>
        </div>
        {showActions && (
          <div ref={optionsRef}>
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="text-gray-400 hover:text-blue-600 p-1 rounded-full transition-colors"
              aria-label="Post options"
            >
              <i className="fas fa-ellipsis-h"></i>
            </button>
            {showOptions && (
              <div className="absolute mb-5 right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-20 border border-gray-100">
                {isAuthor && (
                  <>
                    <button
                      onClick={() => {
                        setEditing(true);
                        setShowOptions(false);
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <i className="fas fa-edit mr-2"></i> Edit Post
                    </button>
                    <button
                      onClick={() => {
                        setShowConfirmDelete(true);
                        setShowOptions(false);
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <i className="fas fa-trash-alt mr-2"></i> Delete Post
                    </button>
                  </>
                )}
                <button
                  onClick={handleSave}
                  className="flex w-full items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                >
                  <i
                    className={`fas ${
                      saved ? "fa-bookmark" : "fa-bookmark"
                    } mr-2`}
                  ></i>
                  {saved ? "Unsave Post" : "Save Post"}
                </button>
                <button
                  onClick={handleShare}
                  className="flex w-full items-center px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50"
                >
                  <i className="fas fa-share-alt mr-2"></i> Share Post
                </button>
                {!isAuthor && (
                  <button
                    onClick={() => {
                      toast.info("Post reported");
                      setShowOptions(false);
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <i className="fas fa-flag mr-2"></i> Report Post
                  </button>
                )}
                {isAdmin && !isAuthor && (
                  <button
                    onClick={() => {
                      setShowModActions(true);
                      setShowOptions(false);
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-purple-600 hover:bg-purple-50"
                  >
                    <i className="fas fa-shield-alt mr-2"></i> Moderator Actions
                  </button>
                )}
              </div>
            )}

            {showModActions && isAdmin && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className="font-medium text-sm text-gray-700">
                    Moderator Actions
                  </h3>
                </div>
                <button
                  onClick={() =>
                    handleModeratorAction("delete", "Content violation")
                  }
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  disabled={loading}
                >
                  <i className="fas fa-trash-alt mr-2"></i> Delete Post
                </button>
                <button
                  onClick={() =>
                    handleModeratorAction("warn", "Inappropriate content")
                  }
                  className="flex w-full items-center px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50"
                  disabled={loading}
                >
                  <i className="fas fa-exclamation-triangle mr-2"></i> Warn User
                </button>
                <button
                  onClick={() => handleModeratorAction("hide", "Under review")}
                  className="flex w-full items-center px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
                  disabled={loading}
                >
                  <i className="fas fa-eye-slash mr-2"></i> Hide Post
                </button>
                <div className="border-t border-gray-100 px-4 py-2">
                  <button
                    onClick={() => setShowModActions(false)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {editing ? (
        <div className="px-5 pb-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg p-3 min-h-[100px] resize-none"
            maxLength={500}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => {
                setEditing(false);
                setEditContent(post.content);
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-1"></i> Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="px-5 pb-3">
          <p className="text-gray-800 whitespace-pre-wrap text-lg leading-relaxed">
            {post.content}
          </p>
        </div>
      )}

      {post.media && (
        <div className="w-full px-5 pb-3">
          <img
            src={post.media}
            alt="Post content"
            className="w-full h-auto object-cover max-h-96 rounded-xl border border-gray-100 shadow"
          />
        </div>
      )}

      <div className="px-5 py-2 border-t border-gray-100 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
              liked
                ? "bg-blue-100 text-blue-600 font-semibold"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <i className={`${liked ? "fas" : "far"} fa-thumbs-up`}></i>
            <span>{liked ? "Liked" : "Like"}</span>
            {likesCount > 0 && (
              <span className="ml-1 text-xs font-medium">{likesCount}</span>
            )}
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-gray-600 hover:bg-gray-50"
          >
            <i className="far fa-comment"></i>
            <span>Comment</span>
            {post.comments?.length > 0 && (
              <span className="ml-1 text-xs font-medium">
                {post.comments.length}
              </span>
            )}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
              saved
                ? "bg-yellow-100 text-yellow-600"
                : "text-gray-600 hover:bg-yellow-50"
            }`}
            title={saved ? "Unsave Post" : "Save Post"}
          >
            <i className={`fas fa-bookmark`}></i>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-gray-600 hover:bg-indigo-50"
            title="Share Post"
          >
            <i className="fas fa-share-alt"></i>
          </button>
          {showShareOptions && (
            <div className="absolute bottom-full mb-2 right-5 bg-white rounded-lg shadow-md border border-gray-200 py-2 px-1 z-30">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  shareToSocialMedia("facebook");
                }}
                className="flex items-center w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md"
              >
                <i className="fab fa-facebook text-blue-600 mr-2"></i> Facebook
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  shareToSocialMedia("twitter");
                }}
                className="flex items-center w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md"
              >
                <i className="fab fa-twitter text-blue-400 mr-2"></i> Twitter
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  shareToSocialMedia("linkedin");
                }}
                className="flex items-center w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md"
              >
                <i className="fab fa-linkedin text-blue-700 mr-2"></i> LinkedIn
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  shareToSocialMedia("copy");
                }}
                className="flex items-center w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md"
              >
                <i className="far fa-copy text-gray-600 mr-2"></i> Copy Link
              </button>
            </div>
          )}
        </div>
      </div>

      {showComments && (
        <div className="border-t border-gray-100">
          <CommentSection
            postId={post._id}
            comments={post.comments || []}
            onCommentAdded={(newComment) => {
              if (onUpdate) {
                onUpdate({
                  ...post,
                  comments: [...(post.comments || []), newComment],
                });
              }
            }}
            onCommentDeleted={(commentId) => {
              if (onUpdate) {
                onUpdate({
                  ...post,
                  comments: (post.comments || []).filter(
                    (c) => c._id !== commentId
                  ),
                });
              }
            }}
          />
        </div>
      )}

      {showConfirmDelete && (
        <ConfirmDialog
          isOpen={showConfirmDelete}
          title="Delete Post"
          message="Are you sure you want to delete this post? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDelete}
          onCancel={() => setShowConfirmDelete(false)}
        />
      )}
    </div>
  );
};

export default PostCard;
