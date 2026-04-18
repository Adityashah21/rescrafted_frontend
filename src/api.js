import axios from "axios";

// 🔥 Get base URL from environment
const BASE_URL = import.meta.env.VITE_API_URL;

// ❌ If env is missing, log error (helps debugging)
if (!BASE_URL) {
    console.error("❌ VITE_API_URL is not defined!");
}

// ✅ Create axios instance
const API = axios.create({
    baseURL: `${BASE_URL}/api`,
    withCredentials: true, // useful if you later use cookies
});

// ==========================
// 🔐 REQUEST INTERCEPTOR
// ==========================
API.interceptors.request.use(
    (config) => {
        try {
            const token = localStorage.getItem("token");

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("❌ Error reading token:", error);
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ==========================
// 🔁 RESPONSE INTERCEPTOR
// ==========================
API.interceptors.response.use(
    (response) => response,
    (error) => {
        // Auto logout on unauthorized
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }

        // Helpful debug logs
        console.error("❌ API Error:", error?.response || error.message);

        return Promise.reject(error);
    }
);

export default API;