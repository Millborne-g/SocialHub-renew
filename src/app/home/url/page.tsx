"use client";

import Button from "@/components/Button";
import ExternalUrl from "@/components/ExternalUrl";
import Modal from "@/components/Modal";
import { Add, Check, CloseCircle, Edit, Save2, Trash } from "iconsax-reactjs";
import React, { useState } from "react";
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

const Url = () => {
    const [title, setTitle] = useState("");
    const [titleEdit, setTitleEdit] = useState(false);
    const [description, setDescription] = useState("");
    const [descriptionEdit, setDescriptionEdit] = useState(false);
    const [image, setImage] = useState("");
    const [imageEdit, setImageEdit] = useState(false);

    const [addURLModal, setAddURLModal] = useState(false);
    const [editURLModal, setEditURLModal] = useState(false);
    const [newUrlTitle, setNewUrlTitle] = useState("");
    const [newUrl, setNewUrl] = useState("");
    const [activeId, setActiveId] = useState("");

    const [editMode, setEditMode] = useState(true);
    // const [previewMode, setPreviewMode] = useState(false);

    const [externalURLs, setExternalUrls] = useState([
        {
            id: "0",
            title: "Title 0",
            url: "https://www.google.com/search?q=linktre",
            dateTime: "2025-01-01T00:00:00.000Z",
            sequence: 3,
        },

        {
            id: "1",
            title: "Title 1",
            url: "https://www.google.com/search?q=linktre",
            dateTime: "2025-01-01T00:00:00.000Z",
            sequence: 2,
        },
        {
            id: "2",
            title: "Title 2",
            url: "https://www.google.com/search?q=linktre",
            dateTime: "2025-01-01T00:00:00.000Z",
            sequence: 1,
        },
    ]);

    const handleAddURL = () => {
        if (newUrlTitle.trim() && newUrl.trim()) {
            const newURLItem = {
                id: Date.now().toString(),
                title: newUrlTitle.trim(),
                url: newUrl.trim(),
                dateTime: new Date().toISOString(),
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
            const filtered = prev.filter((url) => url.id !== id);
            // Update sequence values after deletion
            return filtered.map((url, index) => ({
                ...url,
                sequence: index + 1,
            }));
        });
    };

    const handleEditURL = (id: string) => {
        const urlToEdit = externalURLs.find((url) => url.id === id);
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
                url.id === activeId
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
                const oldIndex = urls.findIndex((url) => url.id === active.id);
                const newIndex = urls.findIndex((url) => url.id === over.id);

                const reorderedUrls = arrayMove(urls, oldIndex, newIndex);

                // Update sequence values based on new order
                return reorderedUrls.map((url, index) => ({
                    ...url,
                    sequence: index + 1,
                }));
            });
        }
    };
    return (
        <div className="h-screen w-full flex justify-center relative overflow-auto">
            <div className="w-full md:max-w-3xl xl:max-w-7xl pt-10 pb-10">
                <div className="flex items-center justify-center ">
                    <div className="w-full max-w-xl ">
                        {/* header */}
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-5">
                                <div className="relative">
                                    {editMode && (
                                        <div
                                            className="absolute -top-5 -right-2 rounded-full bg-white group hover:bg-gray-200 cursor-pointer shadow-md h-9 w-9 text-center flex justify-center items-center"
                                            onClick={() => {
                                                if (image) {
                                                    setImage("");
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
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    setImage(
                                                        event.target
                                                            ?.result as string
                                                    );
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    <div className="w-30 h-30  rounded-3xl col-span-2 overflow-hidden">
                                        {image ? (
                                            <img
                                                src={image}
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
                                                        if (e.key === "Enter") {
                                                            setTitleEdit(false);
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
                                                {editMode && (
                                                    <span
                                                        className="text-gray-700 hover:text-gray-400 cursor-pointer"
                                                        onClick={() =>
                                                            setTitleEdit(true)
                                                        }
                                                    >
                                                        <Edit />
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-gray-950">
                                            Firstname Lastname
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                {editMode && (
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
                                            {description ? (
                                                description
                                            ) : (
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
                            {editMode && (
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
                                <div className="grid grid-cols-3 gap-x-2 gap-y-10">
                                    <SortableContext
                                        items={externalURLs
                                            .sort(
                                                (a, b) =>
                                                    a.sequence - b.sequence
                                            )
                                            .map((url) => url.id)}
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
                                                    dateTime={url.dateTime}
                                                    key={url.id}
                                                    id={url.id}
                                                    onDelete={() =>
                                                        handleDeleteURL(url.id)
                                                    }
                                                    onEdit={() =>
                                                        handleEditURL(url.id)
                                                    }
                                                    mode={editMode ? "edit" : "preview"}
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

            <div className="fixed bottom-5 right-0 h-full flex justify-center items-center">
                <div className="w-fit bg-white rounded-xl shadow-md p-4">
                    <div className="flex items-center flex-col gap-6">
                        <div>
                            <div className="flex items-center gap-2 mr-4">
                                <div className="flex items-center">
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
                                        <span className="ml-2 text-sm font-medium text-gray-900">
                                            {editMode ? "Edit" : "Preview"}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div>
                            <Button
                                text="Save"
                                variant="primary"
                                icon={<Save2 />}
                                onClick={() => handleAddURL()}
                            />
                        </div>
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
        </div>
    );
};

export default Url;
