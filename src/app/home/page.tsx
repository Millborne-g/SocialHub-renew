"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { decodeToken } from "@/lib/jwt";
import api from "@/lib/axios";
import Button from "@/components/Button";
import { Add, Filter, SearchNormal1 } from "iconsax-reactjs";
import TextField from "@/components/TextField";
import { useRouter } from "next/navigation";

const Home = () => {
    const { accessToken } = useAuthStore();
    const router = useRouter();
    const [userDetails, setUserDetails] = useState<any>(null);

    const [urls, setUrls] = useState<any>([]);

    useEffect(() => {
        if (accessToken) {
            setUserDetails(decodeToken(accessToken));
        }
    }, [accessToken]);

    useEffect(() => {
        if (accessToken) {
            const fetchUrls = async () => {
                const response = await api.get("/api/url");
                setUrls(response.data);
            };
            fetchUrls();
        }
    }, [accessToken]);

    return (
        <div className="h-screen w-full flex justify-center">
            <div className="w-full md:max-w-3xl xl:max-w-7xl pt-10">
                <div className="flex flex-col gap-8 h-full ">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-2">
                            <span className="text-4xl font-medium">
                                Welcome,{" "}
                                {userDetails?.user?.firstName || "none"}
                            </span>
                            <span className="text-base text-gray-500">
                                Good to see you!
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                text="Create"
                                rounded="full"
                                variant="primary"
                                icon={<Add />}
                                size="lg"
                                onClick={() => {
                                    router.push("/home/url");
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-5 h-full ">
                        {/* Search & Filters */}
                        <div className="flex items-center w-full gap-5">
                            <TextField
                                placeholder="Search"
                                startIcon={
                                    <SearchNormal1 className="w-4 h-4" />
                                }
                                // endIcon={<Filter className="w-4 h-4" />}
                                type="search"
                                value={""}
                                onChange={() => {}}
                                width="full"
                            />
                            <div className="flex items-center gap-2">
                                <select className="px-4 py-2 text-base border border-gray-300 rounded-md p-2 peer focus:outline-none focus:border-primary w-40">
                                    <option value="all">All</option>
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>
                        </div>

                        {/* Url list */}
                        <div className="relative overflow-x-auto shadow-md sm:rounded-lg h-[500px] flex flex-col justify-between">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">
                                            Title
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Description
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Date
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Time
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="odd:bg-white even:bg-gray-50 border-gray-200 border-b bg-red-200">
                                        <th
                                            scope="row"
                                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                                        >
                                            Apple MacBook Pro 17"
                                        </th>
                                        <td className="px-6 py-4">Silver</td>
                                        <td className="px-6 py-4">Laptop</td>
                                        <td className="px-6 py-4">$2999</td>
                                        <td className="px-6 py-4">
                                            <a
                                                href="#"
                                                className="font-medium text-blue-600 hover:underline"
                                            >
                                                Edit
                                            </a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <nav
                                className="px-6 py-4 flex items-center flex-column flex-wrap md:flex-row justify-between pt-4"
                                aria-label="Table navigation"
                            >
                                <span className="text-sm font-normal text-gray-500 mb-4 md:mb-0 block w-full md:inline md:w-auto">
                                    Showing{" "}
                                    <span className="font-semibold text-gray-900">
                                        1-10
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-semibold text-gray-900 ">
                                        1000
                                    </span>
                                </span>
                                <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
                                    <li>
                                        <a
                                            href="#"
                                            className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700"
                                        >
                                            Previous
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                                        >
                                            1
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                                        >
                                            2
                                        </a>
                                    </li>
                                    {/* Active */}
                                    {/* <li>
                                        <a
                                            href="#"
                                            aria-current="page"
                                            className="flex items-center justify-center px-3 h-8 text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700"
                                        >
                                            3
                                        </a>
                                    </li> */}
                                    <li>
                                        <a
                                            href="#"
                                            className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700"
                                        >
                                            Next
                                        </a>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
