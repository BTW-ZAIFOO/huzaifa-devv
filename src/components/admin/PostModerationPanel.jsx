import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { getAvatarByRole } from "../../utils/avatarUtils";
import ConfirmDialog from "../ConfirmDialog";

const PostModerationPanel = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showHideConfirm, setShowHideConfirm] = useState(false);
  const [showWarnConfirm, setShowWarnConfirm] = useState(false);
  const [moderationReason, setModerationReason] = useState("");
  const [activeView, setActiveView] = useState("reported"); // reported, all, hidden

  useEffect(() => {
    fetchPosts();
  }, [activeView]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let endpoint = "http://localhost:4000/api/v1/admin/posts/reported";

      if (activeView === "all") {
        endpoint = "http://localhost:4000/api/v1/post/all";
      } else if (activeView === "hidden") {
        endpoint = "http://localhost:4000/api/v1/admin/posts/hidden";
      }

      const res = await axios.get(endpoint, { withCredentials: true });
      setPosts(res.data.posts || []);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      toast.error("Failed to load posts for moderation");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;

    try {
      await axios.post(
        `http://localhost:4000/api/v1/admin/post/${selectedPost._id}/delete`,
        { reason: moderationReason },
        { withCredentials: true }
      );

      setPosts(posts.filter((post) => post._id !== selectedPost._id));
      toast.success("Post deleted successfully");
      setShowDeleteConfirm(false);
      setModerationReason("");
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error("Failed to delete post");
    }
  };

  const handleHidePost = async () => {
    if (!selectedPost) return;

    try {
      await axios.post(
        `http://localhost:4000/api/v1/admin/post/${selectedPost._id}/hide`,
        { reason: moderationReason },
        { withCredentials: true }
      );

      setPosts(
        posts.map((post) =>
          post._id === selectedPost._id ? { ...post, isHidden: true } : post
        )
      );
      toast.success("Post hidden successfully");
      setShowHideConfirm(false);
      setModerationReason("");
    } catch (error) {
      console.error("Failed to hide post:", error);
      toast.error("Failed to hide post");
    }
  };

  const handleWarnUser = async () => {
    if (!selectedPost) return;

    try {
      await axios.post(
        `http://localhost:4000/api/v1/admin/post/${selectedPost._id}/warn`,
        { reason: moderationReason },
        { withCredentials: true }
      );

      toast.success("Warning sent to user successfully");
      setShowWarnConfirm(false);
      setModerationReason("");
    } catch (error) {
      console.error("Failed to warn user:", error);
      toast.error("Failed to warn user");
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Post Moderation</h2>
        <p className="text-gray-600 mt-1">
          Manage reported and inappropriate content
        </p>

        <div className="flex mt-4 border-b">
          <button
            onClick={() => setActiveView("reported")}
            className={`px-4 py-2 font-medium text-sm ${
              activeView === "reported"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Reported Posts
          </button>
          <button
            onClick={() => setActiveView("hidden")}
            className={`px-4 py-2 font-medium text-sm ${
              activeView === "hidden"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Hidden Posts
          </button>
          <button
            onClick={() => setActiveView("all")}
            className={`px-4 py-2 font-medium text-sm ${
              activeView === "all"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All Posts
          </button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-gray-500 text-5xl mb-4">
            <i className="far fa-clipboard"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-700">No posts found</h3>
          <p className="text-gray-500 mt-1">
            {activeView === "reported"
              ? "There are no reported posts at the moment."
              : activeView === "hidden"
              ? "No posts have been hidden."
              : "There are no posts to moderate."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => {
                const avatar = getAvatarByRole(post.user);

                return (
                  <tr
                    key={post._id}
                    className={`${
                      post.isHidden
                        ? "bg-orange-50"
                        : post.isReported
                        ? "bg-red-50"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          {avatar?.imageUrl ? (
                            <img
                              src={avatar.imageUrl}
                              alt={post.user.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium"
                              style={{
                                backgroundColor: avatar?.color || "#4F46E5",
                              }}
                            >
                              {avatar?.initials ||
                                post.user.name?.charAt(0) ||
                                "?"}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {post.user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {post.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2">
                        {post.content}
                      </div>
                      {post.media && (
                        <div className="text-xs text-blue-600 mt-1">
                          [Contains media]
                        </div>
                      )}
                      {post.isReported && post.reportReason && (
                        <div className="text-xs text-red-600 mt-1">
                          <span className="font-semibold">Report reason:</span>{" "}
                          {post.reportReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {post.isHidden ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                          Hidden
                        </span>
                      ) : post.isReported ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Reported
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setShowWarnConfirm(true);
                        }}
                        className="text-yellow-600 hover:text-yellow-900 mr-3"
                        title="Warn User"
                      >
                        <i className="fas fa-exclamation-triangle"></i>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setShowHideConfirm(true);
                        }}
                        className={`${
                          post.isHidden
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-orange-600 hover:text-orange-900"
                        } mr-3`}
                        disabled={post.isHidden}
                        title={post.isHidden ? "Already hidden" : "Hide Post"}
                      >
                        <i className="fas fa-eye-slash"></i>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setShowDeleteConfirm(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Post"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Delete Post
            </h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to permanently delete this post? This action
              cannot be undone.
            </p>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="reason"
              >
                Reason for deletion:
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="reason"
                rows="3"
                placeholder="Provide a reason..."
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                disabled={!moderationReason.trim()}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showHideConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Hide Post</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to hide this post? It will still be visible
              to the author and admins.
            </p>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="reason"
              >
                Reason for hiding:
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="reason"
                rows="3"
                placeholder="Provide a reason..."
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowHideConfirm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleHidePost}
                className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
                disabled={!moderationReason.trim()}
              >
                Hide
              </button>
            </div>
          </div>
        </div>
      )}

      {showWarnConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Warn User</h3>
            <p className="text-gray-700 mb-4">
              Send a warning to the user about this post. This will not delete
              or hide the post.
            </p>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="reason"
              >
                Warning reason:
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="reason"
                rows="3"
                placeholder="Provide a reason for the warning..."
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowWarnConfirm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleWarnUser}
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                disabled={!moderationReason.trim()}
              >
                Send Warning
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostModerationPanel;
