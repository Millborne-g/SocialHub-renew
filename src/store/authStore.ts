"use client";

import api from "@/lib/axios";
import { create } from "zustand";

interface AuthStore {
    accessToken: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (
        firstName: string,
        lastName: string,
        email: string,
        password: string
    ) => Promise<void>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<void> | any;
}

export const useAuthStore = create<AuthStore>((set) => ({
    accessToken: null,
    login: async (email: string, password: string) => {
        const response = await api.get(
            `/api/auth?email=${email}&password=${password}`
        );

        const { accessToken } = response.data;
        set({ accessToken });
    },
    signup: async (
        firstName: string,
        lastName: string,
        email: string,
        password: string
    ) => {
        const response = await api.post("/api/auth", {
            firstName,
            lastName,
            email,
            password,
        });
        const { accessToken } = response.data;
        set({ accessToken });
    },
    logout: async () => {
        await api.post("/api/auth/logout");
        set({ accessToken: null });
    },

    refreshToken: async () => {
        try {
            const response = await api.get("/api/auth/refresh");
            const { accessToken } = response.data;
            if (accessToken) {
                set({ accessToken });
                return accessToken;
            } else {
                return null;
            }
        } catch (error: any) {
            console.log("Refresh token error:", error);

            // If we get a 401 on refresh, it means the refresh token is invalid
            // We should logout immediately to prevent infinite loops
            if (error.response?.status === 401) {
                set({ accessToken: null });
                // Don't call logout() here to avoid potential infinite loops
                // The interceptor will handle the logout
            }

            return null;
        }
    },
}));
