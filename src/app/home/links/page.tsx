"use client"

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { decodeToken } from "@/lib/jwt";

const Home = () => {
    const { accessToken } = useAuthStore();

    const [userDetails, setUserDetails] = useState<any>(null);

    useEffect(() => {
        if (accessToken) {
            setUserDetails(decodeToken(accessToken));
        }
    }, [accessToken]);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold">
                {userDetails?.user?.firstName || "none"}
            </h1>
        </div>
    );
};

export default Home;
