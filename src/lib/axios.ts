import { useAuthStore } from "@/store/authStore";
import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
        config.headers.authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// Response interceptor to handle token refresh
// ------------------------------------------------------------------------------------------------
// The whole purpose of an interceptor (in your case with Axios) is to make token refreshing automatic
// ------------------------------------------------------------------------------------------------
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't already tried to refresh
        // AND this is not a refresh token request itself
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/api/auth/refresh")
        ) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh the token
                const { refreshToken } = useAuthStore.getState();
                const newToken = await refreshToken();

                // If refresh was successful and we got a new token
                if (newToken) {
                    // Update the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    // Retry the original request
                    return api(originalRequest);
                } else {
                    // No new token, logout and reject
                    const { logout } = useAuthStore.getState();
                    await logout();
                    return Promise.reject(error);
                }
            } catch (refreshError) {
                // If refresh fails, logout and reject
                const { logout } = useAuthStore.getState();
                await logout();
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
