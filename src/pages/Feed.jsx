import React, { useState, useEffect, useContext, useRef } from "react";
import { Context } from "../main";
import { toast } from "react-toastify";
import axios from "axios";
import { Navigate, Link } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import PostForm from "../components/social/PostForm";
import PostCard from "../components/social/PostCard";
import UserSuggestion from "../components/social/UserSuggestion";
import UserProfileSidebar from "../components/social/UserProfileSidebar";
import SearchBar from "../components/social/SearchBar";
import io from "socket.io-client";

const Feed = () => {
  const { isAuthenticated, isAuthLoading, user, isAdmin } = useContext(Context);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchResults, setSearchResults] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const socketRef = useRef(null);
  const observerRef = useRef(null);
  const lastPostRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    let socket = null;
    let connectionAttempts = 0;
    const MAX_ATTEMPTS = 3;
    const RETRY_DELAY = 2000;

    const connectSocket = () => {
      try {
        console.log("Attempting to connect to socket server...");

        if (socketRef.current) {
          socketRef.current.disconnect();
        }

        const socket = io("http://localhost:4000", {
          withCredentials: true,
          reconnectionAttempts: 3,
          reconnectionDelay: 1000,
          timeout: 5000,
          transports: ["polling", "websocket"],
        });

        socket.on("connect", () => {
          console.log("Socket connection successful");
          connectionAttempts = 0;
        });

        socket.on("connect_error", (error) => {
          console.warn(
            `Socket connection error (attempt ${
              connectionAttempts + 1
            }/${MAX_ATTEMPTS}):`,
            error
          );

          if (connectionAttempts < MAX_ATTEMPTS) {
            connectionAttempts++;
            setTimeout(connectSocket, RETRY_DELAY);
          } else {
            console.error(
              "Max reconnection attempts reached. Proceeding without socket connection."
            );
          }
        });

        socket.on("new-post", (newPost) => {
          if (filter !== "trending") {
            setPosts((prevPosts) => [newPost, ...prevPosts]);
            toast.info("New post added to your feed!");
          }
        });

        socket.on("post-updated", (updatedPost) => {
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post._id === updatedPost._id ? updatedPost : post
            )
          );
        });

        socket.on("post-deleted", ({ postId }) => {
          setPosts((prevPosts) =>
            prevPosts.filter((post) => post._id !== postId)
          );
        });

        socket.on("post-liked", (data) => {
          setPosts((prevPosts) =>
            prevPosts.map((post) => {
              if (post._id === data.postId) {
                if (!post.likes.includes(data.likedBy._id)) {
                  return {
                    ...post,
                    likes: [...post.likes, data.likedBy._id],
                  };
                }
              }
              return post;
            })
          );
        });

        socket.on("follow-updated", (data) => {
          if (data.followerId === user?._id) {
            setSuggestedUsers((prev) =>
              prev.filter((u) => u._id !== data.followedId)
            );

            if (filter === "following") {
              fetchPosts(1, true);
            }
          }
        });

        socketRef.current = socket;
      } catch (err) {
        console.error("Socket initialization error:", err);
      }
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        try {
          socketRef.current.disconnect();
          socketRef.current = null;
        } catch (err) {
          console.warn("Error during socket cleanup:", err);
        }
      }
    };
  }, [user, filter]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts(1, true);
      fetchSuggestedUsers();
      fetchTrendingTopics();
    }
  }, [isAuthenticated, filter]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !loading &&
          !searchResults
        ) {
          loadMorePosts();
        }
      },
      { threshold: 1.0 }
    );

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, searchResults]);

  useEffect(() => {
    if (lastPostRef.current && observerRef.current) {
      observerRef.current.observe(lastPostRef.current);
    }
    return () => {
      if (lastPostRef.current && observerRef.current) {
        observerRef.current.unobserve(lastPostRef.current);
      }
    };
  }, [posts]);

  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery);
    } else {
      setSearchResults(null);
    }
  }, [searchQuery]);

  const fetchPosts = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);

      let endpoint = "http://localhost:4000/api/v1/post/all";
      if (filter === "following") {
        endpoint = "http://localhost:4000/api/v1/post";
      } else if (filter === "trending") {
        endpoint = "http://localhost:4000/api/v1/post/trending";
      }

      console.log(`Fetching posts from: ${endpoint}`);

      const res = await axios.get(`${endpoint}?page=${pageNum}&limit=10`, {
        withCredentials: true,
      });

      if (!res.data || !res.data.success) {
        console.warn("API response missing data or success flag:", res);
        throw new Error("Invalid API response");
      }

      const newPosts = res.data.posts || [];
      console.log(`Received ${newPosts.length} posts`);

      if (reset) {
        setPosts(newPosts);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      }

      setPage(pageNum);
      setHasMore(newPosts.length === 10);
    } catch (error) {
      console.error("Failed to fetch posts:", error);

      if (filter === "following" || filter === "trending") {
        try {
          console.log("Trying fallback to all posts");
          const fallbackRes = await axios.get(
            `http://localhost:4000/api/v1/post/all?page=${pageNum}&limit=10`,
            {
              withCredentials: true,
            }
          );

          const fallbackPosts = fallbackRes.data.posts || [];

          if (reset) {
            setPosts(fallbackPosts);
          } else {
            setPosts((prevPosts) => [...prevPosts, ...fallbackPosts]);
          }

          setPage(pageNum);
          setHasMore(fallbackPosts.length === 10);

          toast.info("Showing all posts instead of filtered view");
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
          toast.error("Failed to load posts");
        }
      } else {
        toast.error("Failed to load posts");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = () => {
    if (hasMore && !loading) {
      fetchPosts(page + 1);
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
      setTrendingTopics([
        { name: "AI", postCount: 125 },
        { name: "Technology", postCount: 98 },
        { name: "Programming", postCount: 87 },
        { name: "Web", postCount: 65 },
        { name: "Learning", postCount: 42 },
      ]);
    }
  };

  const handleCreatePost = async (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
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

  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      setLoading(true);

      const postRes = await axios.get(
        `http://localhost:4000/api/v1/post/search?q=${encodeURIComponent(
          query
        )}`,
        { withCredentials: true }
      );

      const userRes = await axios.get(
        `http://localhost:4000/api/v1/user/search?q=${encodeURIComponent(
          query
        )}`,
        { withCredentials: true }
      );

      setSearchResults({
        posts: postRes.data.posts || [],
        users: userRes.data.users || [],
      });
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleFollowChange = (userId, isNowFollowing) => {
    if (isNowFollowing) {
      setSuggestedUsers((prev) => prev.filter((user) => user._id !== userId));

      if (socketRef.current) {
        socketRef.current.emit("follow-user", {
          followerId: user._id,
          followedId: userId,
        });
      }

      if (filter === "following") {
        fetchPosts(1, true);
      }
    }
  };

  if (isAuthLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/auth" />;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="fixed top-0 left-0 right-0 bg-white shadow z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <h1 className="text-xl font-bold text-blue-600">SocialFeed</h1>
          </Link>
          <div className="flex-1 max-w-xl mx-4">
            <SearchBar onSearch={handleSearchChange} />
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/chat"
              className="text-gray-700 hover:text-blue-600 relative"
            >
              <i className="fas fa-comments text-xl"></i>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                3
              </span>
            </Link>
            <Link to="/profile" className="flex items-center">
              <img
                src={user?.avatar || "https://via.placeholder.com/40"}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            </Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="flex flex-col lg:flex-row gap-6 relative">
          <div className="lg:w-1/4 hidden lg:block">
            <div className="fixed w-[calc(25%-1.5rem)] max-w-[280px]">
              <div className="space-y-6">
                <UserProfileSidebar user={user} />
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 space-y-6 min-h-[calc(100vh-80px)]">
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

            {/* Scrollable post content */}
            <div className="space-y-6 overflow-y-auto">
              {searchResults && (
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <h2 className="text-xl font-bold mb-4">
                    Search Results for "{searchQuery}"
                  </h2>

                  {searchResults.users.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Users</h3>
                      <div className="space-y-2">
                        {searchResults.users.map((user) => (
                          <Link
                            key={user._id}
                            to={`/profile/${user._id}`}
                            className="flex items-center p-2 hover:bg-gray-50 rounded-lg"
                          >
                            <img
                              src={
                                user.avatar || "https://via.placeholder.com/40"
                              }
                              alt={user.name}
                              className="w-10 h-10 rounded-full mr-3 object-cover"
                            />
                            <div>
                              <h4 className="font-medium">{user.name}</h4>
                              {user.bio && (
                                <p className="text-sm text-gray-500 truncate">
                                  {user.bio}
                                </p>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.posts.length > 0 ? (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Posts</h3>
                      <div className="space-y-4">
                        {searchResults.posts.map((post) => (
                          <PostCard
                            key={post._id}
                            post={post}
                            onDelete={handlePostDelete}
                            onUpdate={handlePostUpdate}
                            isAdmin={isAdmin}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    searchResults.users.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No results found
                      </p>
                    )
                  )}

                  <button
                    onClick={() => setSearchResults(null)}
                    className="mt-4 text-blue-600 hover:text-blue-800"
                  >
                    Clear search results
                  </button>
                </div>
              )}

              {loading && posts.length === 0 ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : posts.length > 0 ? (
                <div className="space-y-6">
                  {posts.map((post, index) => (
                    <div
                      key={post._id}
                      ref={index === posts.length - 1 ? lastPostRef : null}
                    >
                      <PostCard
                        post={post}
                        onDelete={handlePostDelete}
                        onUpdate={handlePostUpdate}
                        isAdmin={isAdmin}
                      />
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                    </div>
                  )}
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
          </div>

          {/* Right Sidebar - Fixed */}
          <div className="lg:w-1/4 hidden lg:block">
            <div className="fixed w-[calc(25%-1.5rem)] max-w-[280px]">
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="font-bold text-lg text-gray-800 mb-4">
                  Suggested Users
                </h2>
                <UserSuggestion
                  users={suggestedUsers}
                  currentUser={user}
                  onFollowChange={handleFollowChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
