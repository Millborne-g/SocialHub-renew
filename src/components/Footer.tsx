"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const Footer = () => {
    const { accessToken } = useAuthStore();
    const pathname = usePathname();
    const isShareRoute = pathname.startsWith("/share");

    return (
        <div
            className={`flex items-center justify-center bottom-0 w-full py-2 px-3 md:px-0 ${
                accessToken || isShareRoute ? "static" : "fixed"
            }`}
        >
            <span className="font-display text-sm text-[#929292] text-center">
                © {new Date().getFullYear()} SocialHub |{" "}
                <a
                    href="https://millborneportfolio.vercel.app/"
                    className="hover:text-primary"
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
