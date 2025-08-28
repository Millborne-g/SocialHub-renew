"use client";

import Button from "@/components/Button";
import ExternalUrl from "@/components/ExternalUrl";
import Modal from "@/components/Modal";
import {
    Add,
    Check,
    CloseCircle,
    Edit,
    Save2,
    Share,
    Trash,
    User,
} from "iconsax-reactjs";
import React, { useEffect, useState } from "react";
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

const Url = () => {
    const router = useRouter();
    const { id } = useParams();
    const { accessToken, refreshToken } = useAuthStore();
    const [userDetails, setUserDetails] = useState<any>(null);

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
    // const [previewMode, setPreviewMode] = useState(false);

    const [externalURLs, setExternalUrls] = useState<any[]>([]);

    const handleAddURL = () => {
        if (newUrlTitle.trim() && newUrl.trim()) {
            const newURLItem = {
                _id: Date.now().toString(),
                title: newUrlTitle.trim(),
                url: newUrl.trim(),
                updatedAt: new Date().toISOString(),
                sequence: externalURLs.length + 1,
            };

            setExternalUrls((prev) => [...prev, newURLItem]);
            setNewUrlTitle("");
            setNewUrl("");
            setAddURLModal(false);
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
                router.push(`${response.data._id}`);
                setIsSaving(false);
            } else {
                //---------------------------------- for update ----------------------------------
            }
        } catch (error) {
            console.log("Save error:", error);
            toast.error("Failed to save profile. Please try again.");
        } finally {
            setIsSaving(false);
            setOnSave(false);
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
            if (id !== "create") {
                const response = await api.get(`/api/url/${id}`);
                setTitle(response.data.url.title);
                setDescription(response.data.url.description);
                setImage(response.data.url.image);
                setImagePreview(response.data.url.image);
                setExternalUrls(response.data.externalUrls);
                setIsPrivate(response.data.url.isPrivate);
                setEditMode(false);
                setPreviewMode(true);

                if (response.data.url.userId === userDetails?.user?.id) {
                    setIsFromUser(true);
                }

                setIsUrlFound(true);

                console.log( "userDetails?.user?.id");
            } else {
                setIsUrlFound(true);
                setEditMode(true);
                setPreviewMode(false);
                setIsFromUser(true);
            }
        };
        fetchUrl();
    }, [id, userDetails]);

    useEffect(() => {
        const refreshUserToken = async () => {
            // setIsLoading(true);
            if (accessToken && !userDetails) {
                setUserDetails(decodeToken(accessToken));
            } else {
                await refreshToken();
            }
            // setIsLoading(false);
        };
        refreshUserToken();
    }, [accessToken, refreshToken]);

    return isUrlFound ? (
        <div className="h-screen w-full flex justify-center relative overflow-auto">
            <div className="w-full md:max-w-3xl xl:max-w-7xl pt-10 pb-10">
                <div className="flex items-center justify-center ">
                    <div className="w-full max-w-xl ">
                        {/* header */}
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-5 justify-between items-start">
                                <div className="flex gap-5">
                                    <div className="relative">
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
                                    <div className="col-span-3 flex flex-col gap-2 justify-center">
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
                                                    <span className="text-2xl font-bold">
                                                        {title ? (
                                                            title
                                                        ) : (
                                                            <span className="text-gray-500 italic">
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
                                        <div className="flex items-center gap-1">
                                            {userDetails?.user?.userImage ? (
                                                <Image
                                                    src={
                                                        userDetails?.user
                                                            ?.userImage
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
                                            <span className="text-sm text-gray-950">
                                                {userDetails?.user?.firstName}{" "}
                                                {userDetails?.user?.lastName}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {/* {editMode && isFromUser ? (
                                    <div className="flex items-center gap-2 y cursor-pointer hover:text-gray-400  text-primary">
                                        <span className="flex text-sm">
                                            Edit
                                        </span>
                                        <span className="text-sm cursor-pointer">
                                            <Edit />
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 y cursor-pointer hover:text-gray-400  text-primary">
                                        <span className="flex text-sm">
                                            Share
                                        </span>
                                        <span className="text-sm cursor-pointer">
                                            <Share />
                                        </span>
                                    </div>
                                )} */}
                                <div className="flex flex-col gap-2">
                                    {!isPrivate && previewMode && (
                                        <div className="flex items-center gap-2 y cursor-pointer hover:text-gray-400  text-primary">
                                            <span className="flex text-sm">
                                                Share
                                            </span>
                                            <span className="text-sm cursor-pointer">
                                                <Share />
                                            </span>
                                        </div>
                                    )}

                                    {isFromUser && !editMode && !isPrivate && (
                                        <div
                                            className="flex items-center gap-2 y cursor-pointer hover:text-gray-400  text-primary"
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
                                        <span className="text-sm text-gray-700 break-words whitespace-pre-wrap">
                                            {description
                                                ? description
                                                : !previewMode && (
                                                      <span className="text-gray-500 italic">
                                                          No Description
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
                        <div className="w-full h-[1px] bg-gray-200 my-5"></div>
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
                                    <div className="grid grid-cols-3 gap-x-2 gap-y-10">
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
                                                .map((url) => (
                                                    <ExternalUrl
                                                        title={url.title}
                                                        url={url.url}
                                                        dateTime={
                                                            url.updatedAt || ""
                                                        }
                                                        key={url._id}
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
                                                    />
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
                                        <span className="text-gray-500 italic">
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

            {/* menu */}
            {editMode && isFromUser && (
                <div className="fixed bottom-5 right-0 h-full flex justify-center items-center">
                    <div className="w-fit bg-white rounded-xl shadow-md p-4">
                        <div className="flex items-center justify-center flex-col gap-6">
                            {/* {id === "create" ? (
                                <div className="flex items-center gap-2 mr-4">
                                    <div className="flex items-center gap-3">
                                        <span className="ml-2 text-sm font-medium text-gray-900">
                                            Edit
                                        </span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={!editMode}
                                                onChange={() =>
                                                    setEditMode(!editMode)
                                                }
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                          
                                        </label>
                                        <span className="text-sm font-medium text-gray-900">
                                            Preview
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                editMode &&
                                isFromUser && (
                                    <div className="flex items-center gap-2 mr-4">
                                        <div className="flex items-center gap-3">
                                            <span className="ml-2 text-sm font-medium text-gray-900">
                                                Private View
                                            </span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={isPrivate}
                                                    onChange={() =>
                                                        setIsPrivate(!isPrivate)
                                                    }
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                     
                                            </label>
                                            <span className="text-sm font-medium text-gray-900">
                                                Public View
                                            </span>
                                        </div>
                                    </div>
                                )
                            )} */}

                            <div className="flex items-center gap-2 mr-4">
                                <div className="flex items-center gap-3">
                                    <span className="ml-2 text-sm font-medium text-gray-900">
                                        Edit
                                    </span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={previewMode}
                                            onChange={() =>
                                                setPreviewMode(!previewMode)
                                            }
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        {/* <span className="ml-2 text-sm font-medium text-gray-900">
                                            {editMode ? "Edit" : "Preview"}
                                        </span> */}
                                    </label>
                                    <span className="text-sm font-medium text-gray-900">
                                        Preview
                                    </span>
                                </div>
                            </div>

                            <div className="w-full">
                                <Button
                                    text={isSaving ? "Saving..." : "Save"}
                                    variant="primary"
                                    icon={isSaving ? null : <Save2 />}
                                    onClick={() => {
                                        if (!isSaving) {
                                            setOnSave(true);
                                        }
                                    }}
                                    width="full"
                                    disabled={isSaving}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* add modal */}
            {addURLModal && (
                <Modal
                    title="Add URL"
                    onClose={() => setAddURLModal(false)}
                    onSave={handleAddURL}
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
                    onSave={handleSave}
                    content={
                        <div className="flex items-center justify-center flex-col gap-4">
                            <span className="text-2xl text-center">
                                Are you sure you want to save?
                            </span>
                        </div>
                    }
                />
            )}
        </div>
    ) : (
        <div className="h-screen w-full flex justify-center items-center">
            <span className="text-2xl text-center">URL not found</span>
        </div>
    );
};

export default Url;
