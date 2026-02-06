import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const usePosts = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [post, setPost] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [isError, setIsError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  };

  const getPosts = async (input) => {
    const { status, keywords, page } = input;
    try {
      const params = new URLSearchParams();
      params.append("status", status);
      params.append("keywords", keywords);
      params.append("page", page);
      setIsError(false);
      setIsLoading(true);
      const results = await axios.get(
        `http://localhost:4000/posts?${params.toString()}`,
        { headers: getAuthHeaders() }
      );
      setPosts(results.data.data);
      setTotalPages(results.data.total_pages);
      setIsLoading(false);
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const deletePost = async (postId) => {
    try {
      setIsError(false);
      setIsLoading(true);
      await axios.delete(`http://localhost:4000/posts/${postId}`, {
        headers: getAuthHeaders(),
      });
      const newPosts = posts.filter((post) => {
        return post._id !== postId;
      });
      setPosts(newPosts);
      setIsLoading(false);
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const getPostById = async (postId) => {
    try {
      setIsError(false);
      setIsLoading(true);
      const result = await axios.get(
        `http://localhost:4000/posts/${postId}`,
        { headers: getAuthHeaders() }
      );
      setPost(result.data.data);
      setIsLoading(false);
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const createPost = async (data) => {
    try {
      setIsError(false);
      setIsLoading(true);
      await axios.post(`http://localhost:4000/posts`, data, {
        headers: getAuthHeaders(),
      });
      setIsLoading(false);
      navigate("/");
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const updatePostById = async (postId, data) => {
    try {
      setIsError(false);
      setIsLoading(true);
      await axios.put(`http://localhost:4000/posts/${postId}`, data, {
        headers: getAuthHeaders(),
      });
      setIsLoading(false);
      navigate("/");
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  return {
    posts,
    totalPages,
    post,
    getPosts,
    getPostById,
    createPost,
    updatePostById,
    deletePost,
    isError,
    isLoading,
  };
};

export default usePosts;
