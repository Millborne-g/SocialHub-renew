"use client"

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { decodeToken } from "@/lib/jwt";
import api from "@/lib/axios";

const Home = () => {
    const { accessToken } = useAuthStore();

    const [userDetails, setUserDetails] = useState<any>(null);

    const [urls, setUrls] = useState<any>([]);

    useEffect(() => {
        if (accessToken) {
            setUserDetails(decodeToken(accessToken));
        }
    }, [accessToken]);

    useEffect(() => {
        const fetchUrls = async () => {
            const response = await api.get("/api/url");
            setUrls(response.data);
        };
        fetchUrls();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold">
                {userDetails?.user?.firstName || "none"}
            </h1>
        </div>
    );
};

export default Home;
