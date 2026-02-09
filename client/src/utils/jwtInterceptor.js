import axios from "axios";

function jwtInterceptor() {
  axios.interceptors.request.use((req) => {
    // Attach JWT token (if any) to every outgoing request
    const token = localStorage.getItem("token");

    if (token) {
      if (!req.headers) {
        req.headers = {};
      }
      // Common convention is to send the token via the Authorization header
      req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
  });

  axios.interceptors.response.use(
    (req) => {
      return req;
    },
    (error) => {
      // If the server responds with an authentication error,
      // remove the token and redirect the user to the Login page.
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        localStorage.removeItem("token");
        // Force navigation to the login route for re-authentication
        window.location.href = "/login";
      }

      return Promise.reject(error);
    }
  );
}

export default jwtInterceptor;
