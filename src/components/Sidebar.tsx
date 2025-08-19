"use client";

import Image from "next/image";
import React from "react";
import logo from "../../public/Logo.png";
import { LinkSquare } from "iconsax-reactjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import api from "@/lib/axios";

const Sidebar = () => {
    const pathname = usePathname();
    const [refreshToken, setRefreshToken] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchToken = async () => {
            try {
                setIsLoading(true);
                const response = await api.get("/api/auth/getRefreshToken");
                const { refreshToken: token } = response.data;
                console.log("Fetched token from API:", token);
                setRefreshToken(token);
            } catch (error) {
                console.error("Error fetching refresh token:", error);
                setRefreshToken(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchToken();
    }, []);

    const menu = [
        {
            name: "Links",
            url: "/home/links",
            icon: (
                <LinkSquare
                    className={`text-xl ${
                        pathname === "/home/links" ? "text-primary" : ""
                    }`}
                    variant={`${pathname === "/home" ? "Bold" : "Linear"}`}
                />
            ),
        },
    ];

    // Show loading state
    if (isLoading) {
        return (
            <div className="fixed top-0 left-0 h-screen font-display flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    // Don't render anything if no token
    if (!refreshToken) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 h-screen font-display ">
            {/* Background overlay */}
            <div className="absolute inset-0 w-full h-full bg-black/25 transition-opacity lg:hidden"></div>
            <div className="h-full p-4">
                <div className="relative w-64 h-full bg-white shadow-elevation-2 rounded-3xl z-40 flex flex-col gap-4">
                    <a
                        href="/"
                        className="flex items-center gap-2 pt-7 pb-2 px-5"
                    >
                        <Image src={logo} alt="logo" className="w-8 h-8" />
                        <span className="text-lg font-bold font-display">
                            SocialHub
                        </span>
                    </a>
                    <div className="h-px bg-gray-200"></div>
                    <div className="flex flex-col gap-2">
                        {menu.map((item) => {
                            const isActive = pathname === item.url;
                            return (
                                <Link
                                    href={item.url}
                                    key={item.name}
                                    className={`py-3 px-5 flex gap-2 items-center text-md ${
                                        isActive
                                            ? "text-primary bg-"
                                            : "text-gray-500"
                                    }`}
                                >
                                    {item.icon}
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
