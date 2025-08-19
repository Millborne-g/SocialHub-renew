"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import logo from "../../public/Logo.png";
import Button from "./Button";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { decodeToken } from "@/lib/jwt";
import userImage from "../../public/user-icon.png";
import { User, Logout, Home } from "iconsax-reactjs";

const NavBar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [userDetails, setUserDetails] = useState<any>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const navbarOptions = [
        {
            label: "Home",
            path: "/home",
            onClick: () => {
                router.push("/home");
            },
        },
    ];

    const { accessToken, logout, refreshToken } = useAuthStore();

    useEffect(() => {
        const refreshUserToken = async () => {
            if (accessToken) {
                setUserDetails(decodeToken(accessToken));
            } else {
                await refreshToken();
            }
        };
        refreshUserToken();
    }, [accessToken]);

    const handleLogout = async () => {
        try {
            await logout();
            setIsDropdownOpen(false);
            router.push("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isDropdownOpen) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [isDropdownOpen]);

    return (
        <div
            className={`w-full bg-white shadow-lg flex items-center justify-center flex-col p-3 fixed gap-3 ${
                pathname === "/login" || pathname === "/signup" ? "hidden" : ""
            }`}
        >
            <div className="flex items-center justify-between w-full md:max-w-3xl xl:max-w-7xl">
                <a href="/" className="flex items-center gap-2">
                    <Image src={logo} alt="logo" />
                    <span className="text-xl font-bold font-display">
                        SocialHub
                    </span>
                </a>
                <div className="flex items-center gap-2">
                    {userDetails ? (
                        <div className="relative">
                            <div
                                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDropdown();
                                }}
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                    {userDetails.user.userImage ? (
                                        <Image
                                            src={userDetails.user.userImage}
                                            alt="user image"
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    ) : (
                                        <User className="text-xl text-gray-500" />
                                    )}
                                </div>
                                <span className="text-sm">
                                    {userDetails.user.firstName}{" "}
                                    {userDetails.user.lastName}
                                </span>
                            </div>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                                    <div className="py-1">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            <Logout className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                text="Login"
                                onClick={() => {
                                    router.push("/login");
                                }}
                            />
                            <Button
                                variant="primary"
                                text="Sign up"
                                onClick={() => {
                                    router.push("/signup");
                                }}
                            />
                        </>
                    )}
                </div>
            </div>

            {userDetails && <div className="w-full border-b border-gray-200" />}

            {userDetails && (
                <div className="flex items-center justify-between w-full md:max-w-3xl xl:max-w-7xl">
                    {navbarOptions.map((item) => {
                        const isActive = pathname.startsWith(item.path);
                        return (
                            <div
                                key={item.label}
                                className={`py-2 px-4 font-display cursor-pointer text-base transition-colors ${
                                    isActive
                                        ? "text-primary border-blue-200 border-b-primary border-b-2"
                                        : "bg-transparent hover:bg-black/10 active:bg-black/20 text-black"
                                }`}
                                onClick={item.onClick}
                            >
                                <span>{item.label}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default NavBar;
