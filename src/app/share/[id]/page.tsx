"use client";

import Button from "@/components/Button";
import ExternalUrl from "@/components/ExternalUrl";
import Modal from "@/components/Modal";
import {
    Add,
    ArrowLeft2,
    ArrowRight2,
    Check,
    CloseCircle,
    Edit,
    Save2,
    Share,
    Trash,
    User,
} from "iconsax-reactjs";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "@/components/SortableItem";
import TextField from "@/components/TextField";
import { useParams } from "next/navigation";
import axios from "axios";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { decodeToken } from "@/lib/jwt";
import Image from "next/image";
import { useUrlStore } from "@/store/UrlStore";
import {
    EmailShareButton,
    FacebookShareButton,
    GabShareButton,
    HatenaShareButton,
    InstapaperShareButton,
    LineShareButton,
    LinkedinShareButton,
    LivejournalShareButton,
    MailruShareButton,
    OKShareButton,
    PinterestShareButton,
    PocketShareButton,
    RedditShareButton,
    TelegramShareButton,
    ThreadsShareButton,
    TumblrShareButton,
    TwitterShareButton,
    ViberShareButton,
    VKShareButton,
    WhatsappShareButton,
    WorkplaceShareButton,
    EmailIcon,
    FacebookIcon,
    GabIcon,
    HatenaIcon,
    InstapaperIcon,
    LineIcon,
    LinkedinIcon,
    LivejournalIcon,
    MailruIcon,
    OKIcon,
    PinterestIcon,
    PocketIcon,
    RedditIcon,
    TelegramIcon,
    ThreadsIcon,
    TumblrIcon,
    TwitterIcon,
    ViberIcon,
    VKIcon,
    WhatsappIcon,
    WorkplaceIcon,
    FacebookMessengerShareButton,
    FacebookMessengerIcon,
} from "react-share";
import QRCode from "qrcode";
import { Copy } from "iconsax-reactjs";
import LoadingScreen from "@/components/LoadingScreen";

const Url = () => {
    const router = useRouter();
    const { id } = useParams();
    const { accessToken, refreshToken } = useAuthStore();
    const { setUrlPreviewMode, setUrlTemplate } = useUrlStore();
    const [userDetails, setUserDetails] = useState<any>(null);
    const [userAlias, setUserAlias] = useState<{
        name: string;
        image: string;
        imageFile: File | null;
    } | null>(null);

    const [isFromUser, setIsFromUser] = useState<boolean>(false);

    const [title, setTitle] = useState("");
    const [titleEdit, setTitleEdit] = useState(false);
    const [description, setDescription] = useState("");
    const [descriptionEdit, setDescriptionEdit] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [isPrivate, setIsPrivate] = useState(false);

    const [addURLModal, setAddURLModal] = useState(false);
    const [editURLModal, setEditURLModal] = useState(false);
    const [newUrlTitle, setNewUrlTitle] = useState("");
    const [newUrl, setNewUrl] = useState("");
    const [activeId, setActiveId] = useState("");

    const [editMode, setEditMode] = useState(true);

    const [previewMode, setPreviewMode] = useState(false);

    const [onSave, setOnSave] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUrlFound, setIsUrlFound] = useState(false);
    const [shareModal, setShareModal] = useState(false);
    const [shareUrl, setShareUrl] = useState("");
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
    // const [previewMode, setPreviewMode] = useState(false);

    const [externalURLs, setExternalUrls] = useState<any[]>([]);

    // Add state variables to track original values for change detection
    const [originalTitle, setOriginalTitle] = useState("");
    const [originalDescription, setOriginalDescription] = useState("");
    const [originalImage, setOriginalImage] = useState<File | null>(null);
    const [originalIsPrivate, setOriginalIsPrivate] = useState(false);
    const [originalExternalURLs, setOriginalExternalURLs] = useState<any[]>([]);
    const [originalTemplate, setOriginalTemplate] = useState<any>(null);
    const [createdBy, setCreatedBy] = useState<any>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [template, setTemplate] = useState<any>(null);

    // Panel puller state
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartY, setDragStartY] = useState(0);
    const [templates, setTemplates] = useState<any[]>([
        {
            id: "1",
            background: "#000000",
            text: "#ffffff",
            primary: "#fe2c55",
            secondary: "#de8c9d",
            accent: "#2af0ea",
        },

        {
            id: "2",
            background: "#ffffff",
            text: "#000000",
            primary: "#4267B2",
            secondary: "#898F9C",
            accent: "#1877F2",
        },
        {
            id: "3",
            background: "#1DA1F2",
            text: "#ffffff",
            primary: "#71C9F8",
            secondary: "#AAB8C2",
            accent: "#E1E8ED",
        },
        {
            id: "4",
            background: "#833AB4",
            text: "#ffffff",
            primary: "#C13584",
            secondary: "#E1306C",
            accent: "#FCAF45",
        },
        {
            background: "#2C2F33",
            text: "#ffffff",
            primary: "#7289DA",
            secondary: "#99AAB5",
            accent: "#43B581",
        },
        {
            id: "5",
            background: "#FF0000",
            text: "#ffffff",
            primary: "#282828",
            secondary: "#606060",
            accent: "#CC0000",
        },
    ]);

    // Function to generate QR code
    const generateQRCode = async (url: string) => {
        try {
            // Create a URL that will prompt user to click/confirm before opening
            // Using a simple redirect service that shows a confirmation page
            const qrUrl = `https://www.google.com/url?q=${encodeURIComponent(
                url
            )}&sa=D&source=qr`;

            const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
                width: 200,
                margin: 2,
                color: {
                    dark: "#000000",
                    light: "#FFFFFF",
                },
            });
            setQrCodeDataUrl(qrCodeDataUrl);
        } catch (error) {
            console.error("Error generating QR code:", error);
        }
    };

    // Function to open share modal and generate QR code
    const handleShareModalOpen = () => {
        const currentUrl = window.location.href;
        console.log("Current URL for sharing:", currentUrl);
        setShareUrl(currentUrl);
        generateQRCode(currentUrl);
        setShareModal(true);
    };

    const selectNewTemplate = (template: any) => {
        setUrlTemplate(template);
        setTemplate(template);
    };

    // Panel puller drag handlers
    const handlePanelDragStart = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStartY(e.clientY);
        e.preventDefault();
    };

    const handlePanelDragMove = (e: MouseEvent) => {
        if (!isDragging) return;

        const deltaY = e.clientY - dragStartY;
        const threshold = 50; // Minimum drag distance to trigger toggle

        if (Math.abs(deltaY) > threshold) {
            setIsPanelOpen(deltaY < 0); // Open if dragged up, close if dragged down
            setIsDragging(false);
        }
    };

    const handlePanelDragEnd = () => {
        setIsDragging(false);
    };

    const togglePanel = () => {
        setIsPanelOpen(!isPanelOpen);
    };

    // Function to check if there are any changes
    const hasChanges = () => {
        if (id === "create") {
            // For new items, check if any field has content
            return (
                title.trim() !== "" ||
                description.trim() !== "" ||
                image !== null ||
                externalURLs.length > 0
            );
        }

        // For existing items, compare with original values
        const titleChanged = title !== originalTitle;
        const descriptionChanged = description !== originalDescription;
        const imageChanged = image !== originalImage;
        const privacyChanged = isPrivate !== originalIsPrivate;
        const templateChanged = template !== originalTemplate;
        // Check if external URLs have changed (length, content, or order)
        const urlsChanged =
            externalURLs.length !== originalExternalURLs.length ||
            externalURLs.some((url, index) => {
                const originalUrl = originalExternalURLs[index];
                return (
                    !originalUrl ||
                    url.title !== originalUrl.title ||
                    url.url !== originalUrl.url ||
                    url.sequence !== originalUrl.sequence
                );
            });

        return (
            titleChanged ||
            descriptionChanged ||
            imageChanged ||
            privacyChanged ||
            templateChanged ||
            urlsChanged
        );
    };

    const handleAddURL = () => {
        if (newUrl.trim()) {
            let newUrlTitleString = "";
            if (newUrlTitle.trim()) {
                newUrlTitleString = newUrlTitle.trim();
            } else {
                newUrlTitleString = (() => {
                    const url = new URL(newUrl.trim());
                    const parts = url.hostname.split(".");
                    // Handle localhost and similar single-part hostnames
                    if (parts.length === 1) {
                        return (
                            parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
                        );
                    }
                    // Handle normal domains
                    const domain = parts.slice(-2, -1)[0];
                    return domain.charAt(0).toUpperCase() + domain.slice(1);
                })();
            }
            const newURLItem = {
                _id: Date.now().toString(),
                title: newUrlTitleString,
                url: newUrl.trim(),
                updatedAt: new Date().toISOString(),
                sequence: externalURLs.length + 1,
            };

            setExternalUrls((prev) => [...prev, newURLItem]);
            setNewUrlTitle("");
            setNewUrl("");
            setAddURLModal(false);
        } else {
            toast.error("Please enter a URL");
        }
    };

    const handleDeleteURL = (id: string) => {
        setExternalUrls((prev) => {
            const filtered = prev.filter((url) => url._id !== id);
            // Update sequence values after deletion
            return filtered.map((url, index) => ({
                ...url,
                sequence: index + 1,
            }));
        });
    };

    const handleEditURL = (id: string) => {
        const urlToEdit = externalURLs.find((url) => url._id === id);
        if (urlToEdit) {
            setNewUrlTitle(urlToEdit.title);
            setNewUrl(urlToEdit.url);
            setActiveId(id);
            setEditURLModal(true);
        }
    };

    const handleUpdateURL = () => {
        setExternalUrls((prev) => {
            const updated = prev.map((url) =>
                url._id === activeId
                    ? { ...url, title: newUrlTitle, url: newUrl }
                    : url
            );
            return updated;
        });
        setEditURLModal(false);
        setNewUrlTitle("");
        setNewUrl("");
        setActiveId("");
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            if (id === "create") {
                if (!title) {
                    toast.error("Please enter a title");
                    return;
                }

                if (externalURLs.length === 0) {
                    toast.error("Please add at least one URL");
                    return;
                }

                setIsSaving(true);

                // Create FormData for file upload
                const formData = new FormData();
                formData.append("title", title);
                formData.append("description", description);
                formData.append("externalURLs", JSON.stringify(externalURLs));
                formData.append("public", (!isPrivate).toString());
                formData.append("template", JSON.stringify(template));

                // If image is a base64 string, convert it back to a file
                if (image) {
                    formData.append("image", image);
                }

                const response = await api.post(`/api/url`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                toast.success("Url saved successfully!");
                console.log("Save successful:", response.data);

                // Update original values after successful save
                setOriginalTitle(title);
                setOriginalDescription(description);
                setOriginalImage(image);
                setOriginalIsPrivate(isPrivate);
                setOriginalExternalURLs([...externalURLs]);
                setOriginalTemplate(template);

                router.push(`${response.data._id}`);
                setIsSaving(false);
                setUrlPreviewMode(false);
            }
        } catch (error) {
            console.log("Save error:", error);
            toast.error("Failed to save profile. Please try again.");
        } finally {
            setIsSaving(false);
            setOnSave(false);
            setIsLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            setIsLoading(true);
            if (!title) {
                toast.error("Please enter a title");
                return;
            }

            setIsSaving(true);

            // Create FormData for file upload
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("externalURLs", JSON.stringify(externalURLs));
            formData.append("public", (!isPrivate).toString());
            formData.append("template", JSON.stringify(template));

            // If image is a base64 string, convert it back to a file
            if (image) {
                formData.append("image", image);
            } else {
                if (image === null) {
                    formData.append("image", null as any);
                }
            }

            const response = await api.put(`/api/url/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success("Url updated successfully!");
            console.log("Update successful:", response.data);

            // Update original values after successful update
            setOriginalTitle(title);
            setOriginalDescription(description);
            setOriginalImage(image);
            setOriginalIsPrivate(isPrivate);
            setOriginalExternalURLs([...externalURLs]);
            setOriginalTemplate(template);

            setIsSaving(false);
            setUrlPreviewMode(false);
            setOnSave(false);
        } catch (error) {
            console.log("Update error:", error);
            toast.error("Failed to update URL. Please try again.");
        } finally {
            setIsSaving(false);
            setIsLoading(false);
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: any) => {
        setActiveId("");
        const { active, over } = event;

        if (active.id !== over.id) {
            setExternalUrls((urls) => {
                const oldIndex = urls.findIndex((url) => url._id === active.id);
                const newIndex = urls.findIndex((url) => url._id === over.id);

                const reorderedUrls = arrayMove(urls, oldIndex, newIndex);

                // Update sequence values based on new order
                return reorderedUrls.map((url, index) => ({
                    ...url,
                    sequence: index + 1,
                }));
            });
        }
    };

    useEffect(() => {
        const fetchUrl = async () => {
            setUrlPreviewMode(true);
            if (id !== "create") {
                setIsLoading(true);
                const response = await api.get(`/api/share/${id}`);
                if (response) {
                    setTitle(response.data.url.title);
                    setDescription(response.data.url.description);
                    setImage(response.data.url.image);
                    setImagePreview(response.data.url.image);
                    setExternalUrls(response.data.externalUrls);
                    setIsPrivate(!response.data.url.public);
                    setEditMode(true);
                    setPreviewMode(true);
                    setTemplate(response.data.url.template);
                    setUrlTemplate(response.data.url.template);
                    if (response.data.url.userAlias) {
                        setUserAlias({
                            name: response.data.url.userAlias.name,
                            image: response.data.url.userAlias.imageFile,
                            imageFile: response.data.url.userAlias.imageFile,
                        });
                    }
                    // Store original values for change detection
                    setOriginalTitle(response.data.url.title);
                    setOriginalDescription(response.data.url.description);
                    setOriginalImage(response.data.url.image);
                    setOriginalIsPrivate(!response.data.url.public);
                    setOriginalExternalURLs(response.data.externalUrls);
                    setOriginalTemplate(response.data.url.template);
                    setCreatedBy(response.data.createdBy);

                    if (response.data.url.userId === userDetails?.user?.id) {
                        setIsFromUser(true);
                    }

                    setIsUrlFound(true);
                } else {
                    console.log(response);

                    setIsUrlFound(true);
                }
            } else {
                setIsUrlFound(true);
                setEditMode(true);
                setPreviewMode(false);
                setIsFromUser(true);
                setIsPrivate(true);
                // Initialize original values for new items
                setOriginalTitle("");
                setOriginalDescription("");
                setOriginalImage(null);
                setOriginalIsPrivate(false);
                setOriginalExternalURLs([]);
                setOriginalTemplate(null);
                setCreatedBy(null);
            }
            setIsLoading(false);
        };
        fetchUrl();
    }, [id, userDetails]);

    useEffect(() => {
        const refreshUserToken = async () => {
            setIsLoading(true);
            if (accessToken && !userDetails) {
                setUserDetails(decodeToken(accessToken));
            } else {
                let res = await refreshToken();
                // if (res === null) {
                //     router.push("/");
                // }
            }
            setIsLoading(false);
        };
        refreshUserToken();
    }, [accessToken]);

    useEffect(() => {
        const incrementViews = async () => {
            const response = await api.post(`/api/share/${id}`, { id });
            if (response) {
                console.log(response);
            }
        };
        if (isUrlFound) {
            incrementViews();
        }
    }, [id, isUrlFound]);

    // Add event listeners for drag
    React.useEffect(() => {
        if (isDragging) {
            document.addEventListener("mousemove", handlePanelDragMove);
            document.addEventListener("mouseup", handlePanelDragEnd);
            return () => {
                document.removeEventListener("mousemove", handlePanelDragMove);
                document.removeEventListener("mouseup", handlePanelDragEnd);
            };
        }
    }, [isDragging, dragStartY]);

    return isUrlFound ? (
        <div
            className="w-full flex justify-center relative px-3 md:px-0"
            style={{
                backgroundColor: template?.background || "#ffffff",
                color: template?.text || "#000000",
            }}
        >
            <div
                className={`w-full lg:max-w-[60rem] lg:px-0 xl:max-w-[76rem]  ${
                    previewMode ? "pt-30 pb-10 " : "pt-10 "
                } min-h-screen`}
            >
                <div className="flex items-center justify-center ">
                    <div className="w-full max-w-xl ">
                        {/* header */}
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-5 sm:justify-between justify-center items-start relative">
                                <div className="flex gap-5 relative sm:flex-row flex-col items-center">
                                    <div
                                        className={`${
                                            previewMode
                                                ? imagePreview === ""
                                                    ? "hidden"
                                                    : "relative"
                                                : "relative"
                                        }`}
                                    >
                                        {!previewMode && (
                                            <div
                                                className="absolute -top-5 -right-2 rounded-full bg-white group hover:bg-gray-200 cursor-pointer shadow-md h-9 w-9 text-center flex justify-center items-center"
                                                onClick={() => {
                                                    if (image) {
                                                        setImage(null);
                                                        setImagePreview("");
                                                    } else {
                                                        document
                                                            .getElementById(
                                                                "imageInput"
                                                            )
                                                            ?.click();
                                                    }
                                                }}
                                            >
                                                <span className="text-xs">
                                                    {image ? (
                                                        <CloseCircle />
                                                    ) : (
                                                        <Edit />
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        <input
                                            id="imageInput"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file =
                                                    e.target.files?.[0];
                                                if (file) {
                                                    // Validate file type
                                                    if (
                                                        !file.type.startsWith(
                                                            "image/"
                                                        )
                                                    ) {
                                                        alert(
                                                            "Please select a valid image file"
                                                        );
                                                        return;
                                                    }

                                                    // Validate file size (max 5MB)
                                                    const maxSize =
                                                        5 * 1024 * 1024; // 5MB
                                                    if (file.size > maxSize) {
                                                        alert(
                                                            "Image size should be less than 5MB"
                                                        );
                                                        return;
                                                    }

                                                    setImage(file);
                                                    const reader =
                                                        new FileReader();
                                                    reader.onload = (event) => {
                                                        setImagePreview(
                                                            event.target
                                                                ?.result as string
                                                        );
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        <div className="w-30 h-30  rounded-3xl col-span-2 overflow-hidden">
                                            {imagePreview ? (
                                                <img
                                                    src={imagePreview}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
                                                    <span className="text-sm">
                                                        No Image
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-span-3 flex flex-col gap-2 justify-center sm:text-left text-center">
                                        <div className="flex gap-4 items-center">
                                            {titleEdit ? (
                                                <>
                                                    <input
                                                        placeholder="Enter Title"
                                                        value={title}
                                                        className="text-2xl font-bold border-b border-gray-300 focus:outline-none focus:border-primary w-full"
                                                        onChange={(e) => {
                                                            const val =
                                                                e.target.value;
                                                            setTitle(
                                                                val.slice(0, 50)
                                                            );
                                                        }}
                                                        onBlur={() =>
                                                            setTitleEdit(false)
                                                        }
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key ===
                                                                "Enter"
                                                            ) {
                                                                setTitleEdit(
                                                                    false
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    <span
                                                        className="text-gray-700 hover:text-gray-400 cursor-pointer"
                                                        onClick={() =>
                                                            setTitleEdit(false)
                                                        }
                                                    >
                                                        <CloseCircle />
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <span
                                                        className="text-2xl font-bold"
                                                        style={{
                                                            color:
                                                                template?.text ||
                                                                "#000000",
                                                        }}
                                                    >
                                                        {title ? (
                                                            title
                                                        ) : (
                                                            <span
                                                                className="italic"
                                                                style={{
                                                                    color:
                                                                        template?.secondary ||
                                                                        "#6b7280",
                                                                }}
                                                            >
                                                                No Title
                                                            </span>
                                                        )}
                                                    </span>
                                                    {!previewMode && (
                                                        <span
                                                            className="text-gray-700 hover:text-gray-400 cursor-pointer"
                                                            onClick={() =>
                                                                setTitleEdit(
                                                                    true
                                                                )
                                                            }
                                                        >
                                                            <Edit />
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 sm:justify-start justify-center">
                                            <div className="flex items-center gap-1">
                                                {userAlias ? (
                                                    <>
                                                        {userAlias.image !==
                                                            "" &&
                                                        userAlias.image !==
                                                            null ? (
                                                            <img
                                                                src={
                                                                    userAlias?.image
                                                                }
                                                                alt="user image"
                                                                className="w-4 h-4 rounded-full"
                                                                width={16}
                                                                height={16}
                                                            />
                                                        ) : (
                                                            <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                                                                <User className="w-3 h-3 text-gray-500" />
                                                            </div>
                                                        )}
                                                        <span
                                                            className="text-sm"
                                                            style={{
                                                                color:
                                                                    template?.secondary ||
                                                                    "#111827",
                                                            }}
                                                        >
                                                            {userAlias?.name}
                                                        </span>

                                                        {!previewMode && (
                                                            <span
                                                                className="text-gray-700 hover:text-gray-400 cursor-pointer text-sm"
                                                                onClick={() =>
                                                                    setUserAlias(
                                                                        null
                                                                    )
                                                                }
                                                            >
                                                                <CloseCircle />
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        {createdBy?.userImage ? (
                                                            <img
                                                                src={
                                                                    createdBy?.userImage
                                                                }
                                                                alt="user image"
                                                                className="w-4 h-4 rounded-full"
                                                                width={16}
                                                                height={16}
                                                            />
                                                        ) : (
                                                            <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                                                                <User className="w-3 h-3 text-gray-500" />
                                                            </div>
                                                        )}
                                                        <span
                                                            className="text-sm"
                                                            style={{
                                                                color:
                                                                    template?.secondary ||
                                                                    "#111827",
                                                            }}
                                                        >
                                                            {
                                                                createdBy?.fullName
                                                            }
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ----- share button for large screen ----- */}
                                {previewMode && (
                                    <div
                                        className="hidden sm:flex items-center gap-2 y cursor-pointer hover:text-gray-400 text-primary transition-all duration-300 hover:drop-shadow-lg hover:shadow-lg"
                                        style={{
                                            color:
                                                template?.accent || "#6b7280",
                                            filter: "drop-shadow(0 0 0 transparent)",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.filter = `drop-shadow(0 0 8px ${
                                                template?.accent || "#6b7280"
                                            })`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.filter =
                                                "drop-shadow(0 0 0 transparent)";
                                        }}
                                        onClick={handleShareModalOpen}
                                    >
                                        <span className="flex text-sm">
                                            Share
                                        </span>
                                        <span className="text-sm cursor-pointer">
                                            <Share />
                                        </span>
                                    </div>
                                )}

                                {/* ----- share button for small screen ----- */}
                                {previewMode && (
                                    <div
                                        className={`absolute ${
                                            imagePreview === ""
                                                ? "-top-10"
                                                : "top-0"
                                        }  right-0 gap-2 y cursor-pointer hover:text-gray-400 flex justify-center items-center text-primary sm:hidden`}
                                        style={{
                                            color:
                                                template?.accent || "#6b7280",
                                        }}
                                        onClick={handleShareModalOpen}
                                    >
                                        <span className="flex text-sm">
                                            Share
                                        </span>
                                        <span className="text-sm cursor-pointer">
                                            <Share />
                                        </span>
                                    </div>
                                )}

                                {isFromUser && !editMode && (
                                    <div
                                        className="items-center gap-2 y cursor-pointer hover:text-gray-400  text-primary sm:flex absolute top-0 right-0"
                                        onClick={() => {
                                            setPreviewMode(false);
                                            setEditMode(true);
                                        }}
                                    >
                                        <span className="flex text-sm">
                                            Edit
                                        </span>
                                        <span className="text-sm cursor-pointer">
                                            <Edit />
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                {!previewMode && (
                                    <div className="flex justify-end">
                                        <span
                                            className="text-gray-700 hover:text-gray-400 cursor-pointer text-sm"
                                            onClick={() =>
                                                setDescriptionEdit(true)
                                            }
                                        >
                                            <Edit />
                                        </span>
                                    </div>
                                )}
                                {descriptionEdit ? (
                                    <div className="flex">
                                        <textarea
                                            placeholder="Enter Description"
                                            value={description}
                                            className="text-sm text-gray-700 border-b border-gray-300 focus:outline-none focus:border-primary w-full resize-none"
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setDescription(
                                                    val.slice(0, 300)
                                                );
                                            }}
                                            onBlur={() =>
                                                setDescriptionEdit(false)
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    setDescriptionEdit(false);
                                                }
                                            }}
                                        />
                                        <span
                                            className="text-gray-700 hover:text-gray-400 cursor-pointer text-sm"
                                            onClick={() =>
                                                setDescriptionEdit(false)
                                            }
                                        >
                                            <CloseCircle />
                                        </span>
                                    </div>
                                ) : (
                                    <>
                                        <span
                                            className="text-sm break-words whitespace-pre-wrap sm:text-left text-center"
                                            style={{
                                                color: template?.text
                                                    ? `${template.text}CC`
                                                    : "#374151CC",
                                            }}
                                        >
                                            {description
                                                ? description
                                                : !previewMode && (
                                                      <span
                                                          className="italic"
                                                          style={{
                                                              color:
                                                                  template?.secondary ||
                                                                  "#6b7280",
                                                          }}
                                                      >
                                                          No Description
                                                          (optional)
                                                      </span>
                                                  )}
                                        </span>
                                        {/* <span
                                        className="text-gray-700 hover:text-gray-400 cursor-pointer text-sm"
                                        onClick={() => setDescriptionEdit(true)}
                                    >
                                        <Edit />
                                    </span> */}
                                    </>
                                )}
                            </div>
                        </div>
                        <div
                            className="w-full h-[1px] my-5"
                            style={{
                                backgroundColor: template?.accent || "#e5e7eb",
                            }}
                        ></div>
                        <div className="flex flex-col gap-10 py-5">
                            {!previewMode && (
                                <div className="flex justify-end">
                                    <Button
                                        size="sm"
                                        text="Add"
                                        icon={<Add />}
                                        variant="primary"
                                        onClick={() => setAddURLModal(true)}
                                    />
                                </div>
                            )}
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                                onDragStart={handleDragStart}
                            >
                                {externalURLs.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-4">
                                        <SortableContext
                                            items={externalURLs
                                                .sort(
                                                    (a, b) =>
                                                        a.sequence - b.sequence
                                                )
                                                .map((url) => url._id)}
                                            strategy={rectSortingStrategy}
                                        >
                                            {externalURLs
                                                .sort(
                                                    (a, b) =>
                                                        a.sequence - b.sequence
                                                )
                                                .map((url, index) => (
                                                    <motion.div
                                                        key={url._id}
                                                        initial={{
                                                            opacity: 0,
                                                            y: 20,
                                                            scale: 0.9,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                            scale: 1,
                                                        }}
                                                        transition={{
                                                            duration: 0.5,
                                                            delay: index * 0.3,
                                                            ease: "easeOut",
                                                        }}
                                                    >
                                                        <ExternalUrl
                                                            title={url.title}
                                                            url={url.url}
                                                            dateTime={
                                                                url.updatedAt ||
                                                                ""
                                                            }
                                                            id={url._id}
                                                            onDelete={() =>
                                                                handleDeleteURL(
                                                                    url._id
                                                                )
                                                            }
                                                            onEdit={() =>
                                                                handleEditURL(
                                                                    url._id
                                                                )
                                                            }
                                                            mode={
                                                                previewMode
                                                                    ? "preview"
                                                                    : "edit"
                                                            }
                                                            template={template}
                                                        />
                                                    </motion.div>
                                                ))}
                                            {/* <DragOverlay>
                                        {activeId ? (
                                            <div
                                                style={{
                                                    width: "100px",
                                                    height: "100px",
                                                    backgroundColor: "red",
                                                }}
                                            ></div>
                                        ) : null}
                                    </DragOverlay> */}
                                        </SortableContext>
                                    </div>
                                ) : (
                                    <div className="flex justify-center items-center h-full">
                                        <span
                                            className="italic"
                                            style={{
                                                color:
                                                    template?.secondary ||
                                                    "#6b7280",
                                            }}
                                        >
                                            No URLs found. Add some to get
                                            started.
                                        </span>
                                    </div>
                                )}
                            </DndContext>
                        </div>

                        {/* <div className="grid grid-cols-3 gap-1">
                            <ExternalUrl
                                title={"Title"}
                                url={"https://www.google.com/search?q=linktre"}
                                dateTime={"2025-01-01T00:00:00.000Z"}
                            />
                        </div> */}
                    </div>
                </div>
            </div>

            {/* add modal */}
            {addURLModal && (
                <Modal
                    title="Add URL"
                    onClose={() => setAddURLModal(false)}
                    onSave={handleAddURL}
                    content={
                        <div className="flex flex-col gap-4">
                            <TextField
                                placeholder="URL"
                                type="text"
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                            />
                            <TextField
                                placeholder="Title (Optional)"
                                type="text"
                                value={newUrlTitle}
                                onChange={(e) => setNewUrlTitle(e.target.value)}
                            />
                        </div>
                    }
                />
            )}
            {/* edit modal */}
            {editURLModal && (
                <Modal
                    title="Edit URL"
                    onClose={() => setEditURLModal(false)}
                    onSave={handleUpdateURL}
                    content={
                        <div className="flex flex-col gap-4">
                            <TextField
                                placeholder="Title"
                                type="text"
                                value={newUrlTitle}
                                onChange={(e) => setNewUrlTitle(e.target.value)}
                            />
                            <TextField
                                placeholder="URL"
                                type="text"
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                            />
                        </div>
                    }
                />
            )}
            {/* save modal */}
            {onSave && (
                <Modal
                    title="Confirm"
                    onClose={() => setOnSave(false)}
                    onSave={() => {
                        if (id === "create") {
                            handleSave();
                        } else {
                            handleUpdate();
                        }
                    }}
                    content={
                        <div className="flex items-center justify-center flex-col gap-4">
                            <span className="text-2xl text-center">
                                Are you sure you want to save?
                            </span>
                        </div>
                    }
                />
            )}
            {/* Share modal */}
            {shareModal && (
                <Modal
                    title="Share"
                    onClose={() => setShareModal(false)}
                    onSave={() => {
                        setShareModal(false);
                    }}
                    noButtons={true}
                    template={template}
                    content={
                        <div className="flex flex-col gap-6">
                            {/* QR Code */}
                            <div className="flex flex-col items-center gap-2">
                                {/* <label className="text-sm font-medium text-gray-700">
                                    QR Code
                                </label> */}
                                {qrCodeDataUrl && (
                                    <div className="p-4 bg-white border border-gray-200 rounded-lg">
                                        <img
                                            src={qrCodeDataUrl}
                                            alt="QR Code"
                                            className="w-48 h-48"
                                        />
                                    </div>
                                )}
                                <p
                                    className="text-xs text-gray-500 text-center"
                                    style={{
                                        color: template?.secondary || "#6b7280",
                                    }}
                                >
                                    Scan to open this page
                                </p>
                            </div>

                            {/* URL Input */}
                            <div className="flex flex-col gap-2">
                                {/* <label className="text-sm font-medium text-gray-700">
                                    Share URL
                                </label> */}
                                <TextField
                                    placeholder="Share URL"
                                    type="text"
                                    value={shareUrl}
                                    onChange={(e) =>
                                        setShareUrl(e.target.value)
                                    }
                                    endIcon={
                                        <div
                                            className="cursor-pointer bg-white px-1 rounded-md"
                                            onClick={() => {
                                                navigator.clipboard.writeText(
                                                    shareUrl
                                                );
                                                toast.success(
                                                    "Copied to clipboard!"
                                                );
                                            }}
                                            onMouseEnter={(e) => {
                                                if (template) {
                                                    e.currentTarget.style.color = `${template?.text}`;
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (template) {
                                                    e.currentTarget.style.color = `${template?.text}`;
                                                }
                                            }}
                                            style={{
                                                background:
                                                    `color-mix(in srgb, ${template?.background} 80%, white 20%)` ||
                                                    "#FFFFFF",
                                            }}
                                        >
                                            <Copy
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.opacity =
                                                        "0.8";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.opacity =
                                                        "1";
                                                }}
                                                style={{
                                                    color:
                                                        template?.text ||
                                                        "#6a7282",
                                                }}
                                            />
                                        </div>
                                    }
                                    backgroundColor={template?.background}
                                    textColor={template?.text}
                                />
                            </div>

                            {/* Share Buttons */}
                            <div className="flex flex-col gap-3">
                                {/* <label className="text-sm font-medium text-gray-700">
                                    Share on Social Media
                                </label> */}
                                <div className="flex gap-3 items-start overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                    {/* Email */}
                                    <EmailShareButton
                                        url={shareUrl}
                                        subject={title}
                                        body={description}
                                    >
                                        <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[80px] flex-shrink-0">
                                            <EmailIcon size={32} round />
                                            <span
                                                className="text-xs text-gray-600"
                                                style={{
                                                    color:
                                                        template?.text ||
                                                        "#6b7280",
                                                }}
                                            >
                                                Email
                                            </span>
                                        </div>
                                    </EmailShareButton>

                                    {/* Facebook */}
                                    <FacebookShareButton
                                        url={shareUrl}
                                        onClick={() =>
                                            console.log(
                                                "Facebook share clicked with URL:",
                                                shareUrl
                                            )
                                        }
                                    >
                                        <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[80px] flex-shrink-0">
                                            <FacebookIcon size={32} round />
                                            <span
                                                className="text-xs text-gray-600"
                                                style={{
                                                    color:
                                                        template?.text ||
                                                        "#6b7280",
                                                }}
                                            >
                                                Facebook
                                            </span>
                                        </div>
                                    </FacebookShareButton>

                                    {/* Facebook Messenger */}
                                    <FacebookMessengerShareButton
                                        url={shareUrl}
                                        title={title}
                                        appId={
                                            process.env
                                                .NEXT_PUBLIC_FACEBOOK_APP_ID ||
                                            ""
                                        }
                                    >
                                        <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[80px] flex-shrink-0">
                                            <FacebookMessengerIcon
                                                size={32}
                                                round
                                            />
                                            <span
                                                className="text-xs text-gray-600"
                                                style={{
                                                    color:
                                                        template?.text ||
                                                        "#6b7280",
                                                }}
                                            >
                                                Facebook Messenger
                                            </span>
                                        </div>
                                    </FacebookMessengerShareButton>

                                    {/* Twitter */}
                                    <TwitterShareButton
                                        url={shareUrl}
                                        title={title}
                                        onClick={() =>
                                            console.log(
                                                "Twitter share clicked with URL:",
                                                shareUrl,
                                                "Title:",
                                                title
                                            )
                                        }
                                    >
                                        <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[80px] flex-shrink-0">
                                            <TwitterIcon size={32} round />
                                            <span
                                                className="text-xs text-gray-600"
                                                style={{
                                                    color:
                                                        template?.text ||
                                                        "#6b7280",
                                                }}
                                            >
                                                Twitter
                                            </span>
                                        </div>
                                    </TwitterShareButton>

                                    {/* LinkedIn */}
                                    <LinkedinShareButton
                                        url={shareUrl}
                                        title={title}
                                        summary={description}
                                    >
                                        <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[80px] flex-shrink-0">
                                            <LinkedinIcon size={32} round />
                                            <span
                                                className="text-xs text-gray-600"
                                                style={{
                                                    color:
                                                        template?.text ||
                                                        "#6b7280",
                                                }}
                                            >
                                                LinkedIn
                                            </span>
                                        </div>
                                    </LinkedinShareButton>

                                    {/* WhatsApp */}
                                    <WhatsappShareButton
                                        url={shareUrl}
                                        title={title}
                                    >
                                        <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[80px] flex-shrink-0">
                                            <WhatsappIcon size={32} round />
                                            <span
                                                className="text-xs text-gray-600"
                                                style={{
                                                    color:
                                                        template?.text ||
                                                        "#6b7280",
                                                }}
                                            >
                                                WhatsApp
                                            </span>
                                        </div>
                                    </WhatsappShareButton>

                                    {/* Telegram */}
                                    <TelegramShareButton
                                        url={shareUrl}
                                        title={title}
                                    >
                                        <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[80px] flex-shrink-0">
                                            <TelegramIcon size={32} round />
                                            <span
                                                className="text-xs text-gray-600"
                                                style={{
                                                    color:
                                                        template?.text ||
                                                        "#6b7280",
                                                }}
                                            >
                                                Telegram
                                            </span>
                                        </div>
                                    </TelegramShareButton>

                                    {/* Reddit */}
                                    <RedditShareButton
                                        url={shareUrl}
                                        title={title}
                                    >
                                        <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[80px] flex-shrink-0">
                                            <RedditIcon size={32} round />
                                            <span
                                                className="text-xs text-gray-600"
                                                style={{
                                                    color:
                                                        template?.text ||
                                                        "#6b7280",
                                                }}
                                            >
                                                Reddit
                                            </span>
                                        </div>
                                    </RedditShareButton>

                                    {/* Pinterest */}
                                    <PinterestShareButton
                                        url={shareUrl}
                                        media={imagePreview}
                                        description={description}
                                    >
                                        <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[80px] flex-shrink-0">
                                            <PinterestIcon size={32} round />
                                            <span
                                                className="text-xs text-gray-600"
                                                style={{
                                                    color:
                                                        template?.text ||
                                                        "#6b7280",
                                                }}
                                            >
                                                Pinterest
                                            </span>
                                        </div>
                                    </PinterestShareButton>

                                    {/* Tumblr */}
                                    <TumblrShareButton
                                        url={shareUrl}
                                        title={title}
                                        caption={description}
                                    >
                                        <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[80px] flex-shrink-0">
                                            <TumblrIcon size={32} round />
                                            <span
                                                className="text-xs text-gray-600"
                                                style={{
                                                    color:
                                                        template?.text ||
                                                        "#6b7280",
                                                }}
                                            >
                                                Tumblr
                                            </span>
                                        </div>
                                    </TumblrShareButton>

                                    {/* VK */}
                                    <VKShareButton url={shareUrl} title={title}>
                                        <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[80px] flex-shrink-0">
                                            <VKIcon size={32} round />
                                            <span
                                                className="text-xs text-gray-600"
                                                style={{
                                                    color:
                                                        template?.text ||
                                                        "#6b7280",
                                                }}
                                            >
                                                VK
                                            </span>
                                        </div>
                                    </VKShareButton>

                                    {/* Line */}
                                    <LineShareButton
                                        url={shareUrl}
                                        title={title}
                                    >
                                        <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[80px] flex-shrink-0">
                                            <LineIcon size={32} round />
                                            <span
                                                className="text-xs text-gray-600"
                                                style={{
                                                    color:
                                                        template?.text ||
                                                        "#6b7280",
                                                }}
                                            >
                                                Line
                                            </span>
                                        </div>
                                    </LineShareButton>

                                    {/* Viber */}
                                    <ViberShareButton
                                        url={shareUrl}
                                        title={title}
                                    >
                                        <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[80px] flex-shrink-0">
                                            <ViberIcon size={32} round />
                                            <span
                                                className="text-xs text-gray-600"
                                                style={{
                                                    color:
                                                        template?.text ||
                                                        "#6b7280",
                                                }}
                                            >
                                                Viber
                                            </span>
                                        </div>
                                    </ViberShareButton>

                                    {/* Pocket */}
                                    <PocketShareButton
                                        url={shareUrl}
                                        title={title}
                                    >
                                        <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[80px] flex-shrink-0">
                                            <PocketIcon size={32} round />
                                            <span
                                                className="text-xs text-gray-600"
                                                style={{
                                                    color:
                                                        template?.text ||
                                                        "#6b7280",
                                                }}
                                            >
                                                Pocket
                                            </span>
                                        </div>
                                    </PocketShareButton>

                                    {/* Instapaper */}
                                    <InstapaperShareButton
                                        url={shareUrl}
                                        title={title}
                                        description={description}
                                    >
                                        <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[80px] flex-shrink-0">
                                            <InstapaperIcon size={32} round />
                                            <span
                                                className="text-xs text-gray-600"
                                                style={{
                                                    color:
                                                        template?.text ||
                                                        "#6b7280",
                                                }}
                                            >
                                                Instapaper
                                            </span>
                                        </div>
                                    </InstapaperShareButton>

                                    {/* Threads */}
                                    <ThreadsShareButton
                                        url={shareUrl}
                                        title={title}
                                    >
                                        <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[80px] flex-shrink-0">
                                            <ThreadsIcon size={32} round />
                                            <span
                                                className="text-xs text-gray-600"
                                                style={{
                                                    color:
                                                        template?.text ||
                                                        "#6b7280",
                                                }}
                                            >
                                                Threads
                                            </span>
                                        </div>
                                    </ThreadsShareButton>

                                    {/* Workplace */}
                                    <WorkplaceShareButton
                                        url={shareUrl}
                                        quote={title}
                                    >
                                        <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[80px] flex-shrink-0">
                                            <WorkplaceIcon size={32} round />
                                            <span
                                                className="text-xs text-gray-600"
                                                style={{
                                                    color:
                                                        template?.text ||
                                                        "#6b7280",
                                                }}
                                            >
                                                Workplace
                                            </span>
                                        </div>
                                    </WorkplaceShareButton>

                                    {/* Gab */}
                                    <GabShareButton
                                        url={shareUrl}
                                        title={title}
                                    >
                                        <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[80px] flex-shrink-0">
                                            <GabIcon size={32} round />
                                            <span
                                                className="text-xs text-gray-600"
                                                style={{
                                                    color:
                                                        template?.text ||
                                                        "#6b7280",
                                                }}
                                            >
                                                Gab
                                            </span>
                                        </div>
                                    </GabShareButton>

                                    {/* Hatena */}
                                    <HatenaShareButton
                                        url={shareUrl}
                                        title={title}
                                    >
                                        <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[80px] flex-shrink-0">
                                            <HatenaIcon size={32} round />
                                            <span
                                                className="text-xs text-gray-600"
                                                style={{
                                                    color:
                                                        template?.text ||
                                                        "#6b7280",
                                                }}
                                            >
                                                Hatena
                                            </span>
                                        </div>
                                    </HatenaShareButton>

                                    {/* LiveJournal */}
                                    <LivejournalShareButton
                                        url={shareUrl}
                                        title={title}
                                        description={description}
                                    >
                                        <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[80px] flex-shrink-0">
                                            <LivejournalIcon size={32} round />
                                            <span
                                                className="text-xs text-gray-600"
                                                style={{
                                                    color:
                                                        template?.text ||
                                                        "#6b7280",
                                                }}
                                            >
                                                LiveJournal
                                            </span>
                                        </div>
                                    </LivejournalShareButton>

                                    {/* Mail.ru */}
                                    <MailruShareButton
                                        url={shareUrl}
                                        title={title}
                                        description={description}
                                    >
                                        <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[80px] flex-shrink-0">
                                            <MailruIcon size={32} round />
                                            <span
                                                className="text-xs text-gray-600"
                                                style={{
                                                    color:
                                                        template?.text ||
                                                        "#6b7280",
                                                }}
                                            >
                                                Mail.ru
                                            </span>
                                        </div>
                                    </MailruShareButton>

                                    {/* OK.ru */}
                                    <OKShareButton
                                        url={shareUrl}
                                        title={title}
                                        description={description}
                                    >
                                        <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[80px] flex-shrink-0">
                                            <OKIcon size={32} round />
                                            <span
                                                className="text-xs text-gray-600"
                                                style={{
                                                    color:
                                                        template?.text ||
                                                        "#6b7280",
                                                }}
                                            >
                                                OK.ru
                                            </span>
                                        </div>
                                    </OKShareButton>
                                </div>
                            </div>
                        </div>
                    }
                />
            )}
            {isLoading && <LoadingScreen />}
        </div>
    ) : (
        <>
            <div className="h-screen w-full flex justify-center items-center">
                <span className="text-2xl text-center">URL not found</span>
            </div>
            {isLoading && <LoadingScreen />}
        </>
    );
};

export default Url;
