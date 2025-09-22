"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { decodeToken } from "@/lib/jwt";
import api from "@/lib/axios";
import CustomButton from "@/components/CustomButton";
import {
    Add,
    Edit,
    Filter,
    SearchNormal1,
    CloseCircle,
    Link2,
    Eye,
    Trash,
    Export,
    ArrowLeft2,
    ArrowRight2,
    Warning2,
    Link,
} from "iconsax-reactjs";
import TextField from "@/components/TextField";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Modal from "@/components/Modal";
import { useUrlStore } from "@/store/UrlStore";
import LoadingScreen from "@/components/LoadingScreen";

const Home = () => {
    const { accessToken, refreshToken } = useAuthStore();
    const { setUrlPreviewMode } = useUrlStore();

    const router = useRouter();
    const [userDetails, setUserDetails] = useState<any>(null);

    const [urls, setUrls] = useState<any>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [onDelete, setOnDelete] = useState(false);
    const [onDeleteId, setOnDeleteId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const greetingsRandom = [
        "Hello",
        "Hi",
        "Hey",
        "Howdy",
        "What's up",
        "What's good",
        "Yo",
        "Greetings",
        "Hey there",
        "Hiya",
        "Sup",
        "Welcome",
    ];

    const greetingsMessageRandom = [
        "Good to see you!",
        "Welcome back!",
        "Glad to have you here!",
        "Nice to see you!",
        "Welcome to our platform!",
        "Hope you're doing well!",
        "Always a pleasure!",
        "Happy to see you!",
        "Thanks for dropping by!",
        "We're glad you're here!",
        "Hope your day's going great!",
        "You're in the right place!",
    ];
    const [greeting, setGreeting] = useState("");
    const [greetingsMessage, setGreetingsMessage] = useState("");

    useEffect(() => {
        if (accessToken) {
            setUserDetails(decodeToken(accessToken));
        }
    }, [accessToken]);

    // Debounced search function
    const debouncedSearch = useCallback(
        (() => {
            let timeoutId: NodeJS.Timeout;
            return (searchTerm: string) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    setSearch(searchTerm); // Update actual search state
                    setCurrentPage(1); // Reset to first page when searching
                }, 500); // 500ms delay
            };
        })(),
        []
    );

    useEffect(() => {
        const fetchUrls = async () => {
            try {
                setLoading(true);

                setUrls([]);
                setPagination({
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPrevPage: false,
                });
                const response = await api.get(
                    `/api/url?page=${currentPage}&limit=${pageSize}&filter=${filter}&search=${encodeURIComponent(
                        search
                    )}`
                );

                console.log("search", search);
                console.log(encodeURIComponent(search));

                console.log("response", response.data);
                setUrls(response.data.urls);
                setPagination(response.data.pagination);
            } catch (error) {
                console.error("Error fetching URLs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUrls();
    }, [currentPage, pageSize, filter, search, refreshTrigger]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    const handleFilterChange = (newFilter: string) => {
        setFilter(newFilter);
        setCurrentPage(1); // Reset to first page when changing filter
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value;
        setSearchInput(searchTerm); // Update input immediately for responsive typing
        debouncedSearch(searchTerm); // Debounce the actual search
    };

    const handleDeleteURL = async (id: string) => {
        try {
            setIsLoading(true);
            const response = await api.delete(`/api/url/${id}`);

            toast.success("URL deleted successfully");
            // Trigger refetch by updating refreshTrigger
            setRefreshTrigger((prev) => prev + 1);
            setOnDelete(false);
        } catch (error) {
            console.error("Error deleting URL:", error);
            toast.error("Error deleting URL");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (setUrlPreviewMode) {
            setUrlPreviewMode(false);
        }
    }, [setUrlPreviewMode]);

    useEffect(() => {
        const refreshUserToken = async () => {
            setIsLoading(true);
            if (accessToken) {
                setUserDetails(decodeToken(accessToken));
            } else {
                // let res = await refreshToken();
                // if (res === null) {
                //     router.push("/");
                // }
            }
            setIsLoading(false);
        };
        refreshUserToken();
    }, [accessToken, refreshToken]);

    useEffect(() => {
        setGreeting(
            greetingsRandom[Math.floor(Math.random() * greetingsRandom.length)]
        );
        setGreetingsMessage(
            greetingsMessageRandom[
                Math.floor(Math.random() * greetingsMessageRandom.length)
            ]
        );
    }, []);

    return (
        <div className="min-h-[calc(90vh-100px)] w-full bg-gradient-to-br from-gray-50 to-white">
            <div className="lg:max-w-[60rem] lg:px-0 xl:max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col gap-8">
                    {/* Enhanced Header Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                        <div className="flex items-start justify-between flex-col sm:flex-row gap-6">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    {/* <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-lg">
                                            {userDetails?.user?.firstName?.charAt(
                                                0
                                            ) || "U"}
                                        </span>
                                    </div> */}
                                    <div>
                                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                                            {greeting},{" "}
                                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                {userDetails?.user?.firstName ||
                                                    "User"}
                                            </span>
                                        </h1>
                                        <p className="text-lg text-gray-600 mt-1">
                                            {greetingsMessage}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <CustomButton
                                    text="Create New"
                                    icon={<Add className="w-5 h-5" />}
                                    onClick={() => {
                                        router.push("/home/create");
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Search & Filters Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex flex-col sm:flex-row gap-4 w-full">
                            <div className="relative flex-1">
                                <div className="relative">
                                    <TextField
                                        placeholder="Search URLs by title or description..."
                                        startIcon={
                                            <SearchNormal1 className="w-5 h-5 text-gray-400" />
                                        }
                                        type="search"
                                        value={searchInput}
                                        onChange={handleSearchChange}
                                        width="full"
                                        className="w-full pl-12 pr-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                                    />
                                    {searchInput && (
                                        <button
                                            onClick={() => {
                                                setSearch("");
                                                setSearchInput("");
                                                setCurrentPage(1);
                                            }}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                                            title="Clear search"
                                        >
                                            <CloseCircle className="w-4 h-4" />
                                        </button>
                                    )}
                                    {loading && search && (
                                        <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-5 h-5 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">
                                        Filter:
                                    </span>
                                </div>
                                <select
                                    className="px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white min-w-[120px]"
                                    value={filter}
                                    onChange={(e) =>
                                        handleFilterChange(e.target.value)
                                    }
                                >
                                    <option value="all">All URLs</option>
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Search Results Info */}
                    {search && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-medium text-blue-800">
                                        {loading
                                            ? "Searching..."
                                            : `Found ${
                                                  pagination.total
                                              } result${
                                                  pagination.total !== 1
                                                      ? "s"
                                                      : ""
                                              } for "${search}"`}
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        setSearch("");
                                        setSearchInput("");
                                        setCurrentPage(1);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 transition-colors px-3 py-1 rounded-lg hover:bg-blue-100 text-sm font-medium"
                                >
                                    Clear search
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Enhanced URL Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-4 font-semibold tracking-wider"
                                        >
                                            Title
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-4 font-semibold tracking-wider"
                                        >
                                            Description
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-4 font-semibold tracking-wider text-center"
                                        >
                                            Status
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-4 font-semibold tracking-wider text-center"
                                        >
                                            Views
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-4 font-semibold tracking-wider text-center"
                                        >
                                            URLs
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-4 font-semibold tracking-wider"
                                        >
                                            Created
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-4 font-semibold tracking-wider text-center"
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-6 py-12 text-center"
                                            >
                                                <div className="flex flex-col items-center justify-center gap-4">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                                                    <span className="text-gray-600 font-medium">
                                                        Loading your URLs...
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : urls.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-6 py-12 text-center"
                                            >
                                                <div className="flex flex-col items-center justify-center gap-4">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <Link2 className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                    <div className="text-center">
                                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                            {search
                                                                ? "No matching URLs found"
                                                                : "No URLs yet"}
                                                        </h3>
                                                        <p className="text-gray-500 mb-4">
                                                            {search
                                                                ? `No URLs found matching "${search}"`
                                                                : "Get started by creating your first URL collection"}
                                                        </p>
                                                        {!search && (
                                                            <button
                                                                onClick={() =>
                                                                    router.push(
                                                                        "/home/create"
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                            >
                                                                <Add className="w-4 h-4" />
                                                                Create Your
                                                                First URL
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        urls.map((url: any) => (
                                            <tr
                                                key={url._id}
                                                className="hover:bg-gray-50 transition-colors duration-150 group"
                                            >
                                                <th
                                                    scope="row"
                                                    className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap group-hover:text-blue-600 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center overflow-hidden">
                                                            {url.image ? (
                                                                <img
                                                                    src={
                                                                        url.image
                                                                    }
                                                                    alt="URL Image"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <Link2 className="w-4 h-4 text-blue-600" />
                                                            )}
                                                        </div>
                                                        <span className="truncate max-w-[200px]">
                                                            {url.title}
                                                        </span>
                                                    </div>
                                                </th>
                                                <td className="px-6 py-4">
                                                    {url.description ? (
                                                        <span className="text-gray-600 break-words line-clamp-2 max-w-[300px]">
                                                            {url.description}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-sm">
                                                            No description
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {url.public ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                            Public
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                            Private
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center gap-1 text-gray-700 font-medium">
                                                        <Eye className="w-4 h-4 text-gray-400" />
                                                        {url.views}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {url.externalUrls.length >
                                                    0 ? (
                                                        <span className="inline-flex items-center gap-1 text-blue-600 font-medium">
                                                            <Link className="w-4 h-4" />
                                                            {
                                                                url.externalUrls
                                                                    .length
                                                            }
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-sm">
                                                            No URLs
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm">
                                                        <div className="font-medium text-gray-900">
                                                            {new Date(
                                                                url.createdAt
                                                            ).toLocaleDateString(
                                                                "en-US",
                                                                {
                                                                    year: "numeric",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                }
                                                            )}
                                                        </div>
                                                        <div className="text-gray-500">
                                                            {new Date(
                                                                url.createdAt
                                                            ).toLocaleTimeString(
                                                                "en-US",
                                                                {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                    hour12: true,
                                                                }
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-start gap-1">
                                                        <button
                                                            className="cursor-pointer p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                            onClick={() => {
                                                                router.push(
                                                                    `/home/${url._id}`
                                                                );
                                                            }}
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            className="cursor-pointer p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                            onClick={() => {
                                                                setOnDeleteId(
                                                                    url._id
                                                                );
                                                                setOnDelete(
                                                                    true
                                                                );
                                                            }}
                                                            title="Delete"
                                                        >
                                                            <Trash className="w-4 h-4" />
                                                        </button>
                                                        {url.public && (
                                                            <button
                                                                className="cursor-pointer p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                                                onClick={() => {
                                                                    window.open(
                                                                        `/share/${url._id}`,
                                                                        "_blank"
                                                                    );
                                                                }}
                                                                title="Visit"
                                                            >
                                                                <Export className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Enhanced Pagination */}
                        {urls.length > 0 && (
                            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                                <nav
                                    className="flex items-center justify-between"
                                    aria-label="Table navigation"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-700">
                                            Showing{" "}
                                            <span className="font-semibold text-gray-900">
                                                {(pagination.page - 1) *
                                                    pagination.limit +
                                                    1}
                                            </span>
                                            {" - "}
                                            <span className="font-semibold text-gray-900">
                                                {Math.min(
                                                    pagination.page *
                                                        pagination.limit,
                                                    pagination.total
                                                )}
                                            </span>
                                            {" of "}
                                            <span className="font-semibold text-gray-900">
                                                {pagination.total}
                                            </span>
                                            {" results"}
                                        </span>
                                    </div>
                                    <ul className="inline-flex items-center gap-1">
                                        <li>
                                            <button
                                                onClick={() =>
                                                    handlePageChange(
                                                        pagination.page - 1
                                                    )
                                                }
                                                disabled={
                                                    !pagination.hasPrevPage ||
                                                    loading
                                                }
                                                className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ArrowLeft2 className="w-4 h-4 mr-1" />
                                                Previous
                                            </button>
                                        </li>
                                        {(() => {
                                            const pages = [];
                                            const maxVisiblePages = 5;
                                            let startPage = Math.max(
                                                1,
                                                pagination.page -
                                                    Math.floor(
                                                        maxVisiblePages / 2
                                                    )
                                            );
                                            let endPage = Math.min(
                                                pagination.totalPages,
                                                startPage + maxVisiblePages - 1
                                            );

                                            // Adjust start page if we're near the end
                                            if (
                                                endPage - startPage + 1 <
                                                maxVisiblePages
                                            ) {
                                                startPage = Math.max(
                                                    1,
                                                    endPage -
                                                        maxVisiblePages +
                                                        1
                                                );
                                            }

                                            // Add first page and ellipsis if needed
                                            if (startPage > 1) {
                                                pages.push(
                                                    <li key={1}>
                                                        <button
                                                            onClick={() =>
                                                                handlePageChange(
                                                                    1
                                                                )
                                                            }
                                                            disabled={loading}
                                                            className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            1
                                                        </button>
                                                    </li>
                                                );
                                                if (startPage > 2) {
                                                    pages.push(
                                                        <li
                                                            key="ellipsis1"
                                                            className="flex items-center justify-center px-3 py-2 text-gray-500"
                                                        >
                                                            <span className="text-lg">
                                                                ⋯
                                                            </span>
                                                        </li>
                                                    );
                                                }
                                            }

                                            // Add visible page numbers
                                            for (
                                                let i = startPage;
                                                i <= endPage;
                                                i++
                                            ) {
                                                pages.push(
                                                    <li key={i}>
                                                        <button
                                                            onClick={() =>
                                                                handlePageChange(
                                                                    i
                                                                )
                                                            }
                                                            disabled={loading}
                                                            className={`flex items-center justify-center px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                                i ===
                                                                pagination.page
                                                                    ? "text-blue-600 bg-blue-50 border-blue-300 hover:bg-blue-100 hover:text-blue-700"
                                                                    : "text-gray-500 bg-white hover:bg-gray-50 hover:text-gray-700"
                                                            }`}
                                                        >
                                                            {i}
                                                        </button>
                                                    </li>
                                                );
                                            }

                                            // Add last page and ellipsis if needed
                                            if (
                                                endPage < pagination.totalPages
                                            ) {
                                                if (
                                                    endPage <
                                                    pagination.totalPages - 1
                                                ) {
                                                    pages.push(
                                                        <li
                                                            key="ellipsis2"
                                                            className="flex items-center justify-center px-3 py-2 text-gray-500"
                                                        >
                                                            <span className="text-lg">
                                                                ⋯
                                                            </span>
                                                        </li>
                                                    );
                                                }
                                                pages.push(
                                                    <li
                                                        key={
                                                            pagination.totalPages
                                                        }
                                                    >
                                                        <button
                                                            onClick={() =>
                                                                handlePageChange(
                                                                    pagination.totalPages
                                                                )
                                                            }
                                                            disabled={loading}
                                                            className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            {
                                                                pagination.totalPages
                                                            }
                                                        </button>
                                                    </li>
                                                );
                                            }

                                            return pages;
                                        })()}
                                        <li>
                                            <button
                                                onClick={() =>
                                                    handlePageChange(
                                                        pagination.page + 1
                                                    )
                                                }
                                                disabled={
                                                    !pagination.hasNextPage ||
                                                    loading
                                                }
                                                className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Next
                                                <ArrowRight2 className="w-4 h-4 ml-1" />
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Enhanced Delete Modal */}
            {onDelete && (
                <Modal
                    title="Delete URL Collection"
                    onClose={() => setOnDelete(false)}
                    onSave={() => handleDeleteURL(onDeleteId)}
                    content={
                        <div className="flex items-center justify-center flex-col gap-6 py-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <Warning2 className="w-8 h-8 text-red-600" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Are you sure you want to delete this URL
                                    collection?
                                </h3>
                                <p className="text-gray-600">
                                    This action cannot be undone. All URLs in
                                    this collection will be permanently removed.
                                </p>
                            </div>
                        </div>
                    }
                />
            )}

            {isLoading && <LoadingScreen />}
        </div>
    );
};

export default Home;
