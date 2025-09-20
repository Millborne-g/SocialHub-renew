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
    template?: any;
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

    // Function to extract domain from URL
    const getDomain = (url: string): string => {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch (error) {
            // Fallback if URL is invalid
            return url;
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
                props.mode === "edit" ? "sm:h-75" : ""
            }`}
        >
            {props.mode === "edit" && (
                <div className="z-10 absolute -top-5 -right-2 rounded-full bg-white group cursor-pointer shadow-md h-9 w-fit px-2 gap-3 text-center flex justify-center items-center">
                    <span
                        className="text-xs text-gray-900 hover:text-gray-500"
                        onClick={props.onEdit}
                    >
                        <Edit />
                    </span>
                    <span
                        className="text-xs text-gray-900 hover:text-gray-500"
                        onClick={props.onDelete}
                    >
                        <Trash />
                    </span>
                </div>
            )}
            <div
                className={`shadow-sm rounded-lg overflow-auto h-full hover:shadow-md cursor-pointer transition-all duration-500 ease-in-out ${
                    props.mode !== "edit"
                        ? "group hover:scale-105 bg-white shadow-2xl"
                        : ""
                }`}
                onClick={() => {
                    if (props.mode !== "edit") {
                        window.open(props.url, "_blank");
                    }
                }}
                style={{
                    background: props.template?.background
                        ? `color-mix(in srgb, ${props.template.background} 80%, white 20%)`
                        : undefined,
                    // backgroundImage:
                    //     props.template?.background && props.mode !== "edit"
                    //         ? `linear-gradient(135deg,
                    //         ${props.template.primary || "#0066ff"}20,
                    //         ${props.template.secondary || "#ffffff"}10,
                    //         ${props.template.accent || "#f0f0f0"}15)`
                    //         : undefined,
                    backgroundSize: props.template?.background ? "200% 200%" : undefined,
                    backgroundPosition: props.template?.background ? "0% 0%" : undefined,
                    transition:
                        "all 0.5s ease-in-out, background-position 0.8s ease-in-out, filter 0.3s ease-in-out",
                }}
                onMouseEnter={(e) => {
                    if (props.template?.background) {
                        if (
                            props.template?.background &&
                            props.mode !== "edit"
                        ) {
                            const primary =
                                props.template?.primary || "#0066ff";
                            const secondary =
                                props.template?.secondary || "#ffffff";
                            const accent = props.template?.accent || "#f0f0f0";

                            e.currentTarget.style.background = `linear-gradient(135deg, 
                            ${primary}, 
                            ${secondary}, 
                            ${accent}30,
                            ${primary}25,
                            ${accent}35)`;
                            e.currentTarget.style.backgroundSize = "300% 300%";
                            e.currentTarget.style.backgroundPosition =
                                "100% 100%";
                            // e.currentTarget.style.filter =
                            //     "blur(0.5px) brightness(1.1) saturate(1.2)";
                        }
                    } else {
                        e.currentTarget.style.background = "#FFFFFF";
                    }
                }}
                onMouseLeave={(e) => {
                    if (props.template?.background) {
                        if (
                            props.template?.background &&
                            props.mode !== "edit"
                        ) {
                            
                            e.currentTarget.style.background = props
                                .template?.background
                                ? `color-mix(in srgb, ${props.template.background} 80%, white 20%)`
                                : "";
                            // e.currentTarget.style.backgroundImage = `linear-gradient(135deg,
                            //     ${props.template.primary || "#0066ff"}20,
                            //     ${props.template.secondary || "#ffffff"}10,
                            //     ${props.template.accent || "#f0f0f0"}15)`;
                            e.currentTarget.style.backgroundSize = "200% 200%";
                            e.currentTarget.style.backgroundPosition = "0% 0%";
                        }
                    } else {
                        e.currentTarget.style.background = "#FFFFFF";
                    }
                }}
            >
                <div className="w-full h-40 flex items-center justify-center">
                    <img
                        src={getFaviconUrl(props.url)}
                        alt="image"
                        className={`w-full h-full object-cover ${
                            props.template?.background
                                ? "group-hover:scale-95 transition-all duration-300 group-hover:rounded-lg "
                                : "group-hover:scale-95 transition-all duration-300 group-hover:rounded-lg "
                        }`}
                    />
                </div>
                <div
                    className={`flex flex-col gap-1 p-3 justify-between  ${
                        props.mode === "edit" ? "h-35" : ""
                    }`}
                >
                    <div className="flex flex-col gap-1">
                        <span className="text-base font-bold break-words line-clamp-2">
                            {props.title}
                        </span>
                        <span
                            className="text-xs text-gray-600 break-words line-clamp-2"
                            style={{
                                color: props.template?.accent,
                            }}
                        >
                            {getDomain(props.url)}/...
                        </span>
                    </div>
                    <div>
                        {props.mode === "edit" && (
                            <>
                                <div className="w-full h-[1px] bg-gray-200 my-2"></div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <span
                                            className="text-xs text-gray-600"
                                            style={{
                                                color: props.template?.text,
                                            }}
                                        >
                                            {props.dateTime.split("T")[0]} at{" "}
                                            {props.dateTime
                                                .split("T")[1]
                                                .substring(0, 5)}
                                        </span>
                                    </div>

                                    <div className="relative group ">
                                        <div className="w-[85px] absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 -top-8 -right-9 transform -translate-x-1/2">
                                            <span className="text-center">
                                                Click & drag
                                            </span>
                                        </div>
                                        <span
                                            {...listeners}
                                            {...attributes}
                                            className="text-lg text-gray-600 hover:bg-gray-300 px-1 rounded-sm cursor-pointer"
                                            style={{
                                                color: props.template?.text,
                                            }}
                                        >
                                            ⋮⋮
                                        </span>
                                    </div>
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
