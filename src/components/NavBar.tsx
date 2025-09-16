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
import LoadingScreen from "./LoadingScreen";
import { useUrlStore } from "@/store/UrlStore";

const NavBar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [userDetails, setUserDetails] = useState<any>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const isShareRoute = pathname.startsWith("/share");

    const navbarOptions = [
        {
            label: "Home",
            path: "/home",
            onClick: () => {
                router.push("/home");
            },
        },
        // {
        //     label: "Templates",
        //     path: "/templates",
        //     onClick: () => {
        //         router.push("/templates");
        //     },
        // },
    ];

    const { accessToken, logout, refreshToken } = useAuthStore();
    const { urlPreviewMode } = useUrlStore();

    // useEffect(() => {
    //     const refreshUserToken = async () => {
    //         if (accessToken) {
    //             setUserDetails(decodeToken(accessToken));
    //         } else {
    //             // await refreshToken();
    //         }
    //     };
    //     refreshUserToken();
    // }, [accessToken]);

    useEffect(() => {
        const refreshUserToken = async () => {
            console.log("Navbar refreshUserToken");

            setIsLoading(true);
            if (accessToken && !userDetails) {
                setUserDetails(decodeToken(accessToken));
                // router.push("/home");
            } else {
                if (!isShareRoute) {
                    let res = await refreshToken();
                    if (res === null) {
                        router.push("/");
                    }
                }
            }
            setIsLoading(false);
        };

        // if (!isShareRoute) {
        refreshUserToken();
        // }
    }, [accessToken, isShareRoute]);

    const handleLogout = async () => {
        try {
            await logout();
            setIsDropdownOpen(false);
            setUserDetails(null);
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

    // Handle scroll to show/hide shadow
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setIsScrolled(scrollTop > 0);
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <>
            {urlPreviewMode ? (
                <div
                    className={`w-full bg-white fixed top-0 flex justify-center items-center z-30 p-3 transition-shadow duration-200 ${
                        isScrolled ? "shadow-lg" : ""
                    }`}
                >
                    <div className="flex items-center justify-between w-full lg:max-w-[60rem] lg:px-0 xl:max-w-[76rem] ">
                        <a href="/" className="flex items-center gap-2">
                            {/* <Image src={logo} alt="logo" /> */}
                            <span className="text-2xl font-black font-display">
                                Link
                                <span className="text-primary">LET</span>
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
                                                <img
                                                    src={
                                                        userDetails.user
                                                            .userImage
                                                    }
                                                    alt="user image"
                                                    className="w-full h-full object-cover rounded-full"
                                                    width={32}
                                                    height={32}
                                                />
                                            ) : (
                                                <User className="w-6 h-6 text-gray-500" />
                                            )}
                                        </div>
                                        <span className="text-sm hidden sm:block">
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
                </div>
            ) : (
                <div
                    className={`w-full bg-white shadow-lg flex items-center justify-center flex-col p-3 gap-3 z-30 ${
                        pathname === "/login" ||
                        pathname === "/signup" ||
                        isShareRoute
                            ? "hidden"
                            : ""
                    } ${userDetails ? "sticky top-0" : "fixed"}`}
                >
                    <div className="flex items-center justify-between w-full lg:max-w-[60rem] lg:px-0 xl:max-w-[76rem] ">
                        <a href="/" className="flex items-center gap-2">
                            {/* <Image src={logo} alt="logo" /> */}
                            {/* <span className="text-xl font-bold font-display">
                                SocialHub
                            </span> */}

                            <span className="text-2xl font-black font-display">
                                Link
                                <span className="text-primary">LET</span>
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
                                                <img
                                                    src={
                                                        userDetails.user
                                                            .userImage
                                                    }
                                                    alt="user image"
                                                    className="w-full h-full object-cover rounded-full"
                                                    width={32}
                                                    height={32}
                                                />
                                            ) : (
                                                <User className="w-6 h-6 text-gray-500" />
                                            )}
                                        </div>
                                        <span className="text-sm hidden sm:block">
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

                    {userDetails && (
                        <div className="w-full border-b border-gray-200" />
                    )}

                    {userDetails && (
                        <div className="flex items-center w-full lg:max-w-[60rem] lg:px-0 xl:max-w-[76rem] ">
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
            )}

            {/* {isLoading && <LoadingScreen />} */}
        </>
    );
};

export default NavBar;
