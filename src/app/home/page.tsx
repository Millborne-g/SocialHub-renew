"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { decodeToken } from "@/lib/jwt";
import api from "@/lib/axios";
import Button from "@/components/Button";
import { Add, Edit, Filter, SearchNormal1 } from "iconsax-reactjs";
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
                    setCurrentPage(1); // Reset to first page when searching
                }, 500); // 500ms delay
            };
        })(),
        []
    );

    useEffect(() => {
        if (accessToken && userDetails) {
            const fetchUrls = async () => {
                try {
                    setLoading(true);
                    const response = await api.get(
                        `/api/url?page=${currentPage}&limit=${pageSize}&filter=${filter}&search=${encodeURIComponent(
                            search
                        )}`
                    );
                    setUrls(response.data.urls);
                    setPagination(response.data.pagination);
                } catch (error) {
                    console.error("Error fetching URLs:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchUrls();
        }
    }, [
        accessToken,
        currentPage,
        pageSize,
        filter,
        search,
        refreshTrigger,
        userDetails,
    ]);

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
        setSearch(searchTerm);
        debouncedSearch(searchTerm);
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
            setUserDetails(null);
            console.log("Home refreshUserToken", accessToken, !userDetails);
            setIsLoading(true);
            if (accessToken) {
                setUserDetails(decodeToken(accessToken));
            } else {
                let res = await refreshToken();
                if (res === null) {
                    router.push("/");
                }
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
        <div className="sm:h-[750px] w-full flex justify-center">
            <div className="w-full lg:max-w-[60rem] xl:max-w-[76rem] pt-10 px-3 lg:px-0">
                <div className="flex flex-col gap-8 h-full ">
                    <div className="flex items-start justify-start sm:justify-between sm:flex-row flex-col md:items-center gap-5">
                        <div className="flex flex-col gap-2">
                            <span className="text-4xl font-medium">
                                {greeting},{" "}
                                {userDetails?.user?.firstName || "none"}
                            </span>
                            <span className="text-base text-gray-500">
                                {greetingsMessage}
                            </span>
                        </div>
                        <div className="flex items-start justify-start md:items-center gap-2">
                            <Button
                                text="Create"
                                rounded="full"
                                variant="primary"
                                icon={<Add />}
                                size="lg"
                                onClick={() => {
                                    router.push("/home/create");
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-5 h-full ">
                        {/* Search & Filters */}
                        <div className="flex sm:justify-start sm:items-start w-full gap-5 sm:flex-row flex-col">
                            <div className="relative flex-1">
                                <TextField
                                    placeholder="Search URLs by title or description..."
                                    startIcon={
                                        <SearchNormal1 className="w-4 h-4" />
                                    }
                                    // endIcon={search && (
                                    //     <button
                                    //         onClick={() => {
                                    //             setSearch("");
                                    //             setCurrentPage(1);
                                    //         }}
                                    //         className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    //         title="Clear search"
                                    //     >
                                    //         ✕
                                    //     </button>
                                    // )}
                                    type="search"
                                    value={search}
                                    onChange={handleSearchChange}
                                    width="full"
                                />
                                {/* {search && (
                                    <button
                                        onClick={() => {
                                            setSearch("");
                                            setCurrentPage(1);
                                        }}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        title="Clear search"
                                    >
                                        ✕
                                    </button>
                                )} */}
                                {/* {loading && search && (
                                    <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                    </div>
                                )} */}
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    className="w-full px-4 py-2 text-base border border-gray-300 rounded-md p-2 peer focus:outline-none focus:border-primary w-40"
                                    value={filter}
                                    onChange={(e) =>
                                        handleFilterChange(e.target.value)
                                    }
                                >
                                    <option value="all">All</option>
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>
                        </div>

                        {/* Search Results Info */}
                        {search && (
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>
                                    {loading
                                        ? "Searching..."
                                        : `Found ${pagination.total} result${
                                              pagination.total !== 1 ? "s" : ""
                                          } for "${search}"`}
                                </span>
                                <button
                                    onClick={() => {
                                        setSearch("");
                                        setCurrentPage(1);
                                    }}
                                    className="text-primary hover:text-primary-dark transition-colors"
                                >
                                    Clear search
                                </button>
                            </div>
                        )}

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
                                            Views
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            URLs
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Date
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Time
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-6 py-4 text-center text-gray-500"
                                            >
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                                    <span className="ml-2">
                                                        Loading...
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : urls.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-6 py-4 text-center text-gray-500"
                                            >
                                                {search
                                                    ? `No URLs found matching "${search}"`
                                                    : "No URLs found"}
                                            </td>
                                        </tr>
                                    ) : (
                                        urls.map((url: any) => (
                                            <tr
                                                key={url._id}
                                                className="odd:bg-white even:bg-gray-50 border-gray-200 border-b"
                                            >
                                                <th
                                                    scope="row"
                                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                                                >
                                                    {url.title}
                                                </th>
                                                <td className="px-6 py-4">
                                                    {url.description ? (
                                                        <span className="text-gray-500 break-words line-clamp-2">
                                                            {url.description}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500 italic">
                                                            No description
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {url.public ? (
                                                        <span className="rounded-full bg-green-200 px-2 py-1 text-xs text-green-600">
                                                            Public
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-blue-200 px-2 py-1 text-xs text-blue-600">
                                                            Private
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {url.views}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {url.externalUrls.length >
                                                    0 ? (
                                                        <span className="text-blue-600">
                                                            {
                                                                url.externalUrls
                                                                    .length
                                                            }
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500 italic">
                                                            No URLs
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
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
                                                </td>
                                                <td className="px-6 py-4">
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
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="text-blue-600 hover:underline cursor-pointer"
                                                            onClick={() => {
                                                                router.push(
                                                                    `/home/${url._id}`
                                                                );
                                                            }}
                                                        >
                                                            Edit
                                                        </span>
                                                        <span
                                                            className="text-red-600 hover:underline cursor-pointer"
                                                            onClick={() => {
                                                                setOnDeleteId(
                                                                    url._id
                                                                );
                                                                setOnDelete(
                                                                    true
                                                                );
                                                            }}
                                                        >
                                                            Delete
                                                        </span>
                                                        {url.public && (
                                                            <span
                                                                className="text-blue-600 hover:underline cursor-pointer"
                                                                onClick={() => {
                                                                    window.open(
                                                                        `/share/${url._id}`,
                                                                        "_blank"
                                                                    );
                                                                }}
                                                            >
                                                                Visit
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            <div className="px-6 py-4 flex items-center justify-between">
                                {/* <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-500">
                                        Show:
                                    </span>
                                    <select
                                        value={pageSize}
                                        onChange={(e) =>
                                            handlePageSizeChange(
                                                Number(e.target.value)
                                            )
                                        }
                                        disabled={loading}
                                        className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                    <span className="text-sm text-gray-500">
                                        entries per page
                                    </span>
                                </div> */}
                            </div>
                            <nav
                                className="px-6 py-4 flex items-center flex-column flex-wrap md:flex-row justify-between pt-4"
                                aria-label="Table navigation"
                            >
                                <span className="text-sm font-normal text-gray-500 mb-4 md:mb-0 block w-full md:inline md:w-auto">
                                    Showing{" "}
                                    <span className="font-semibold text-gray-900">
                                        {(pagination.page - 1) *
                                            pagination.limit +
                                            1}
                                        -
                                        {Math.min(
                                            pagination.page * pagination.limit,
                                            pagination.total
                                        )}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-semibold text-gray-900 ">
                                        {pagination.total}
                                    </span>
                                </span>
                                <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
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
                                            className={`flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed ${
                                                !pagination.hasPrevPage ||
                                                loading
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }`}
                                        >
                                            {loading ? "..." : "Previous"}
                                        </button>
                                    </li>
                                    {(() => {
                                        const pages = [];
                                        const maxVisiblePages = 5;
                                        let startPage = Math.max(
                                            1,
                                            pagination.page -
                                                Math.floor(maxVisiblePages / 2)
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
                                                endPage - maxVisiblePages + 1
                                            );
                                        }

                                        // Add first page and ellipsis if needed
                                        if (startPage > 1) {
                                            pages.push(
                                                <li key={1}>
                                                    <button
                                                        onClick={() =>
                                                            handlePageChange(1)
                                                        }
                                                        disabled={loading}
                                                        className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        1
                                                    </button>
                                                </li>
                                            );
                                            if (startPage > 2) {
                                                pages.push(
                                                    <li
                                                        key="ellipsis1"
                                                        className="flex items-center justify-center px-3 h-8 text-gray-500"
                                                    >
                                                        ...
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
                                                            handlePageChange(i)
                                                        }
                                                        disabled={loading}
                                                        className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed ${
                                                            i ===
                                                            pagination.page
                                                                ? "text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700"
                                                                : "text-gray-500 bg-white"
                                                        }`}
                                                    >
                                                        {i}
                                                    </button>
                                                </li>
                                            );
                                        }

                                        // Add last page and ellipsis if needed
                                        if (endPage < pagination.totalPages) {
                                            if (
                                                endPage <
                                                pagination.totalPages - 1
                                            ) {
                                                pages.push(
                                                    <li
                                                        key="ellipsis2"
                                                        className="flex items-center justify-center px-3 h-8 text-gray-500"
                                                    >
                                                        ...
                                                    </li>
                                                );
                                            }
                                            pages.push(
                                                <li key={pagination.totalPages}>
                                                    <button
                                                        onClick={() =>
                                                            handlePageChange(
                                                                pagination.totalPages
                                                            )
                                                        }
                                                        disabled={loading}
                                                        className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {pagination.totalPages}
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
                                            className={`flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed ${
                                                !pagination.hasNextPage ||
                                                loading
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }`}
                                        >
                                            {loading ? "..." : "Next"}
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* delete modal */}
            {onDelete && (
                <Modal
                    title="Confirm"
                    onClose={() => setOnDelete(false)}
                    onSave={() => handleDeleteURL(onDeleteId)}
                    content={
                        <div className="flex items-center justify-center flex-col gap-4">
                            <span className="text-2xl text-center">
                                Are you sure you want to delete?
                            </span>
                        </div>
                    }
                />
            )}

            {isLoading && <LoadingScreen />}
        </div>
    );
};

export default Home;
