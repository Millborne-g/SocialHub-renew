"use client";

import hero from "../../public/hero-page.png";
import Image from "next/image";
import { ArrowRight } from "iconsax-reactjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function Home() {
    const [userEmail, setUserEmail] = useState("");
    const router = useRouter();

    const { accessToken, refreshToken } = useAuthStore();

    useEffect(() => {
        const refreshUserToken = async () => {
            // setIsLoading(true);
            if (accessToken) {
                router.push("/home");
            } else {
                let res = await refreshToken();
                if (res === null) {
                    router.push("/");
                }
            }
            // setIsLoading(false);
        };
        refreshUserToken();
    }, [accessToken, refreshToken]);

    return (
        <div className="flex items-center justify-center h-screen p-3">
            {/* lg:max-w-[60rem] lg:px-0 xl:max-w-[76rem]  */}
            <div className="flex w-full lg:max-w-[60rem] lg:px-0 xl:max-w-[76rem] items-center gap-15 ">
                <div className="flex-1 flex flex-col gap-4 px-10 md:px-0">
                    <span className="text-4xl font-bold font-display leading-tight text-center md:text-left">
                        Your One-Stop Link Storage Solution:{" "}
                        <span className="bg-[#F9ED32]">
                            Accessible and Shareable
                        </span>
                    </span>
                    <span className="text-xl text-center md:text-left">
                        Elevate Your Link Management Experience as Store, Share,
                        and Access Your Links with Our Cutting-Edge Storage
                        Solution.
                    </span>
                    <div className="w-full text-center md:text-left">
                        <div className="bg-primary p-1 rounded-lg grid grid-cols-12 gap-2 hover:bg-primary/85 ">
                            <input
                                type="text"
                                className="text-base w-full p-3 rounded-lg bg-white font-display md:col-span-9 col-span-8"
                                placeholder="Enter your email..."
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                            />
                            <div
                                className="flex items-center justify-center gap-2 md:col-span-3 col-span-4 cursor-pointer font-display"
                                onClick={() => {
                                    router.push(
                                        `/signup${
                                            userEmail
                                                ? `?email=${userEmail}`
                                                : ""
                                        }`
                                    );
                                }}
                            >
                                <span className="text-base text-white">
                                    Sign Up
                                </span>
                                <span>
                                    <ArrowRight size="18" color="#FFFFFF" />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 hidden md:block">
                    <Image src={hero} alt="hero" />
                </div>
            </div>
        </div>
    );
}
