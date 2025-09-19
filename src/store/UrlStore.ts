"use client";

import { create } from "zustand";

interface UrlStore {
    urlPreviewMode: boolean;
    setUrlPreviewMode: (urlPreviewMode: boolean) => void;
    urlTemplate: {
        id: string;
        background: string;
        text: string;
        primary: string;
        secondary: string;
        accent: string;
    } | null;
    setUrlTemplate: (urlTemplate: any) => void;
}

export const useUrlStore = create<UrlStore>((set) => ({
    urlPreviewMode: false,
    setUrlPreviewMode: (urlPreviewMode: boolean) => set({ urlPreviewMode }),
    urlTemplate: null,
    setUrlTemplate: (urlTemplate: any) => set({ urlTemplate }),
}));
