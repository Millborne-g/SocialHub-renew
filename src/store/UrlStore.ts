"use client";

import { create } from "zustand";

interface UrlStore {
    urlPreviewMode: boolean;
    setUrlPreviewMode: (urlPreviewMode: boolean) => void;
}

export const useUrlStore = create<UrlStore>((set) => ({
    urlPreviewMode: false,
    setUrlPreviewMode: (urlPreviewMode: boolean) => set({ urlPreviewMode }),
}));
