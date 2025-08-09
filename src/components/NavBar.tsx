"use client";

import React from "react";
import Image from "next/image";
import logo from "../../public/Logo.png";
import Button from "./Button";
import { usePathname, useRouter } from "next/navigation";

const NavBar = () => {
    const router = useRouter();
    const pathname = usePathname();
    return (
        <div
            className={`w-full bg-white shadow-lg flex items-center justify-center p-3 fixed ${
                pathname === "/" || pathname === "" ? "" : "hidden"
            }`}
        >
            <div className="flex items-center justify-between w-full max-w-5xl">
                <a href="/" className="flex items-center gap-2">
                    <Image src={logo} alt="logo" />
                    <span className="text-xl font-bold font-display">
                        SocialHub
                    </span>
                </a>
                <div className="flex items-center gap-2">
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
                </div>
            </div>
        </div>
    );
};

export default NavBar;
