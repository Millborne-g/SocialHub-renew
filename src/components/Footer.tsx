"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useUrlStore } from "@/store/UrlStore";

const Footer = () => {
    const { accessToken } = useAuthStore();
    const { urlTemplate } = useUrlStore();
    const pathname = usePathname();
    const isShareRoute = pathname.startsWith("/share");
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`flex items-center justify-center bottom-0 w-full py-2 px-3 md:px-0 ${
                accessToken || isShareRoute ? "static" : "fixed"
            }`}
            style={{
                backgroundColor: urlTemplate?.background || "#FFFFFF",
            }}
        >
            <span
                className="font-display text-sm text-[#929292] text-center"
                style={{
                    color: urlTemplate?.text || "#929292",
                }}
            >
                © {new Date().getFullYear()} SocialHub |{" "}
                <a
                    href="https://millborneportfolio.vercel.app/"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{
                        color: isHovered
                            ? urlTemplate?.primary || "#0066ff"
                            : urlTemplate?.text || "#929292",
                        transition: "color 0.2s ease-in-out",   
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Millborne Galamiton.
                </a>{" "}
                All rights reserved.
            </span>
        </div>
    );
};

export default Footer;
