"use client";

import React from "react";
import Image from "next/image";
import logo from "../../public/Logo.png";
import Button from "./Button";

const NavBar = () => {
    return (
        <div className="w-full bg-white shadow-lg flex items-center justify-center p-3">
            <div className="flex items-center justify-between w-full max-w-[1300px]">
                <div className="flex items-center gap-2">
                    <Image src={logo} alt="logo" />
                    <span className="text-2xl font-bold font-display">
                        SocialHub
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        text="Login"
                        onClick={() => {}}
                    />
                    <Button
                        variant="primary"
                        text="Sign up"
                        onClick={() => {}}
                    />
                </div>
            </div>
        </div>
    );
};

export default NavBar;
