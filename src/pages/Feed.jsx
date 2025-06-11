import React, { useState, useEffect, useContext } from "react";
import { Context } from "../main";
import { toast } from "react-toastify";
import axios from "axios";
import { Navigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import PostForm from "../components/social/PostForm";
import PostCard from "../components/social/PostCard";
import UserSuggestion from "../components/social/UserSuggestion";
import TrendingTopics from "../components/social/TrendingTopics";

const Feed = () => {
  const { isAuthenticated, isAuthLoading, user, isAdmin } = useContext(Context);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [filter, setFilter] = useState("all"); // all, following, trending

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
      fetchSuggestedUsers();
      fetchTrendingTopics();
    }
  }, [isAuthenticated, filter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);

      let endpoint = "http://localhost:4000/api/v1/post/all";
      if (filter === "following") {
        endpoint = "http://localhost:4000/api/v1/post/following";
      } else if (filter === "trending") {
        endpoint = "http://localhost:4000/api/v1/post/trending";
      }

      const res = await axios.get(endpoint, {
        withCredentials: true,
      });

      setPosts(res.data.posts);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedUsers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:4000/api/v1/user/suggested",
        {
          withCredentials: true,
        }
      );
      setSuggestedUsers(res.data.users || []);
    } catch (error) {
      console.error("Failed to fetch suggested users:", error);
    }
  };

  const fetchTrendingTopics = async () => {
    try {
      const res = await axios.get(
        "http://localhost:4000/api/v1/post/trending/topics",
        {
          withCredentials: true,
        }
      );
      setTrendingTopics(res.data.topics || []);
    } catch (error) {
      console.error("Failed to fetch trending topics:", error);
    }
  };

  const handleCreatePost = async (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
    fetchPosts();
  };

  const handlePostDelete = async (postId) => {
    try {
      await axios.delete(`http://localhost:4000/api/v1/post/${postId}`, {
        withCredentials: true,
      });
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
      toast.success("Post deleted successfully");
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error("Failed to delete post");
    }
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  if (isAuthLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/auth" />;

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/4 hidden lg:block">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-24">
              <h2 className="font-bold text-lg text-gray-800 mb-4 flex items-center">
                <i className="fas fa-fire-alt text-orange-500 mr-2"></i>{" "}
                Trending Topics
              </h2>
              <TrendingTopics topics={trendingTopics} />
            </div>
          </div>
          <div className="lg:w-1/2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <PostForm onPostCreated={handleCreatePost} />
            </div>
            <div className="bg-white rounded-xl shadow-sm p-3">
              <div className="flex justify-between">
                <button
                  onClick={() => handleFilterChange("all")}
                  className={`px-4 py-2 rounded-lg flex-1 ${
                    filter === "all"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <i className="fas fa-globe-americas mr-2"></i> All Posts
                </button>
                <button
                  onClick={() => handleFilterChange("following")}
                  className={`px-4 py-2 rounded-lg flex-1 ${
                    filter === "following"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <i className="fas fa-user-friends mr-2"></i> Following
                </button>
                <button
                  onClick={() => handleFilterChange("trending")}
                  className={`px-4 py-2 rounded-lg flex-1 ${
                    filter === "trending"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <i className="fas fa-fire mr-2"></i> Trending
                </button>
              </div>
            </div>
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onDelete={handlePostDelete}
                    onUpdate={handlePostUpdate}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                <div className="text-6xl text-gray-300 mb-4">
                  <i className="far fa-newspaper"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-500 mb-4">
                  {filter === "following"
                    ? "Follow more people to see their posts here!"
                    : "Be the first to create a post!"}
                </p>
              </div>
            )}
          </div>
          <div className="lg:w-1/4 hidden lg:block">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-24">
              <h2 className="font-bold text-lg text-gray-800 mb-4">
                Suggested Users
              </h2>
              <UserSuggestion users={suggestedUsers} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
