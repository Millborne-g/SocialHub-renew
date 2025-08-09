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
    refreshToken: () => Promise<void>;
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
        const response = await api.get("/api/auth/refresh");
        const { accessToken } = response.data;
        set({ accessToken });
        return accessToken;
    },
}));
