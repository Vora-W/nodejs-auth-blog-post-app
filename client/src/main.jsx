import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./contexts/authentication";
import { BrowserRouter } from "react-router-dom";
// ✨ เพิ่มบรรทัดนี้
import jwtInterceptor from "./utils/jwtInterceptor";

// ✨ เรียกใช้ก่อน render
jwtInterceptor();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);