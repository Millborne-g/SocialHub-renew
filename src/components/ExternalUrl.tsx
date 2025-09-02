import { Edit, Trash } from "iconsax-reactjs";
import React from "react";
import { useSortable } from "@dnd-kit/sortable";

const ExternalUrl = (props: {
    title: string;
    url: string;
    dateTime: string;
    mode?: "edit" | "preview";
    onEdit?: () => void;
    onDelete?: () => void;
    id: string; // Add id prop for useSortable
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: props.id });

    // Function to convert URL to Google favicon service format
    const getFaviconUrl = (url: string): string => {
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname;
            return `https://www.google.com/s2/favicons?sz=256&domain=${domain}`;
        } catch (error) {
            // Fallback if URL is invalid
            return "https://www.google.com/s2/favicons?sz=256&domain=google.com";
        }
    };

    const style = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        transition,
        zIndex: isDragging ? "100" : "auto",
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative cursor-move ${
                props.mode === "edit" ? "h-75" : ""
            }`}
        >
            {props.mode === "edit" && (
                <div className="absolute -top-5 -right-2 rounded-full bg-white group cursor-pointer shadow-md h-9 w-fit px-2 gap-3 text-center flex justify-center items-center">
                    <span
                        className="text-xs hover:text-gray-500"
                        onClick={props.onEdit}
                    >
                        <Edit />
                    </span>
                    <span
                        className="text-xs hover:text-gray-500"
                        onClick={props.onDelete}
                    >
                        <Trash />
                    </span>
                </div>
            )}
            <div
                className={`shadow-sm rounded-lg overflow-auto h-full hover:shadow-md cursor-pointer transition-all duration-300 ${
                    props.mode !== "edit" ? "hover:scale-105" : ""
                }`}
                onClick={() => {
                    if(props.mode !== "edit") {
                        window.open(props.url, "_blank");
                    }
                }}
            >
                <div className="bg-gray-100 w-full h-40 flex items-center justify-center">
                    <img
                        src={getFaviconUrl(props.url)}
                        alt="image"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div
                    className={`flex flex-col gap-1 p-3 justify-between  ${
                        props.mode === "edit" ? "h-35" : ""
                    }`}
                >
                    <div className="flex flex-col gap-1">
                        <span className="text-base font-bold">
                            {props.title}
                        </span>
                        <span className="text-xs text-gray-600 break-words line-clamp-2">
                            {props.url}
                        </span>
                    </div>
                    <div>
                        {props.mode === "edit" && (
                            <>
                                <div className="w-full h-[1px] bg-gray-200 my-2"></div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-gray-600">
                                            {props.dateTime.split("T")[0]} at{" "}
                                            {props.dateTime
                                                .split("T")[1]
                                                .substring(0, 5)}
                                        </span>
                                    </div>

                                    <span
                                        {...listeners}
                                        {...attributes}
                                        className="text-lg text-gray-600 hover:bg-gray-300 px-1 rounded-sm cursor-pointer"
                                    >
                                        ⋮⋮
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExternalUrl;
