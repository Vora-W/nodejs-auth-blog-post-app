import React, { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const AuthContext = React.createContext();

function AuthProvider(props) {
  const [state, setState] = useState({
    loading: null,
    error: null,
    user: null,
  });

  const login = async (username, password) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/auth/login",
        { username, password }
      );
      const { token } = response.data;
      if (token) {
        localStorage.setItem("token", token);
        const decoded = jwtDecode(token);
        const user = decoded.user; // { id, firstName, lastName } แนบมาใน Token
        setState({ ...state, loading: false, user, error: null });
      }
    } catch (error) {
      console.error(error);
      setState({
        ...state,
        loading: false,
        error: error.response?.data?.message || "Invalid username or password",
      });
      throw error;
    }
  };

  const register = async (username, password, firstName, lastName) => {
    // Function register ทำหน้าที่สร้าง Request ไปที่ API POST /auth/register
    try {
      const response = await axios.post(
        "http://localhost:4000/auth/register",
        {
          username,
          password,
          firstName,
          lastName,
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
      setState({
        ...state,
        error: error.response?.data?.message || "Register failed",
      });
      throw error;
    }
  };

  const logout = () => {
    // Function logout ทำหน้าที่ในการลบ JWT Token ออกจาก Local Storage
    localStorage.removeItem("token");
    setState({ ...state, user: null });
  };

  const isAuthenticated = Boolean(localStorage.getItem("token"));

  return (
    <AuthContext.Provider
      value={{ state, login, logout, register, isAuthenticated }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

// this is a hook that consume AuthContext
const useAuth = () => React.useContext(AuthContext);

export { AuthProvider, useAuth };
