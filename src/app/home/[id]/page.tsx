"use client";

import Button from "@/components/Button";
import ExternalUrl from "@/components/ExternalUrl";
import Modal from "@/components/Modal";
import {
    Add,
    ArrowLeft,
    ArrowLeft2,
    ArrowRight2,
    ArrowRotateRight,
    ArrowUp,
    ArrowUp2,
    Check,
    CloseCircle,
    Edit,
    Link,
    Link21,
    Magicpen,
    Save2,
    SearchNormal1,
    Share,
    Trash,
    User,
} from "iconsax-reactjs";
import React, { useEffect, useState, useRef } from "react";
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
import { GoogleGenAI } from "@google/genai";
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
import LoadingScreen from "@/components/LoadingScreen";

const Url = () => {
    const router = useRouter();
    const { id } = useParams();
    const ai = new GoogleGenAI({
        apiKey: GEMINI_API_KEY,
    });
    const { accessToken, refreshToken } = useAuthStore();
    const { setUrlPreviewMode, setUrlTemplate } = useUrlStore();
    const [userDetails, setUserDetails] = useState<any>(null);

    const [userAlias, setUserAlias] = useState<{
        name: string;
        image: string;
        imageFile: File | null;
    } | null>(null);

    console.log(userAlias);

    const [userAliasOnEdit, setUserAliasOnEdit] = useState<{
        name: string;
        image: string;
        imageFile: File | null;
    } | null>(null);

    const [userAliasEdit, setUserAliasEdit] = useState(false);

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
    const [newUrlImage, setNewUrlImage] = useState<{
        preview: string;
        file: File;
    } | null>(null);
    const [editUrlImage, setEditUrlImage] = useState<{
        preview: string;
        file: File;
    } | null>(null);
    const [activeId, setActiveId] = useState("");

    const [editMode, setEditMode] = useState(true);

    const [previewMode, setPreviewMode] = useState(false);

    const [onSave, setOnSave] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUrlFound, setIsUrlFound] = useState(false);
    // const [previewMode, setPreviewMode] = useState(false);

    const [externalURLs, setExternalUrls] = useState<any[]>([]);

    // Add state variables to track original values for change detection
    const [originalTitle, setOriginalTitle] = useState("");
    const [originalDescription, setOriginalDescription] = useState("");
    const [originalImage, setOriginalImage] = useState<File | null>(null);
    const [originalIsPrivate, setOriginalIsPrivate] = useState(false);
    const [originalExternalURLs, setOriginalExternalURLs] = useState<any[]>([]);
    const [originalTemplate, setOriginalTemplate] = useState<any>(null);
    const [originalUserAlias, setOriginalUserAlias] = useState<any>(null);
    // Dropdown state for title suggestions
    const [showTitleDropdown, setShowTitleDropdown] = useState(false);
    const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

    // Dropdown state for description suggestions
    const [showDescriptionDropdown, setShowDescriptionDropdown] =
        useState(false);
    const [generatedDescriptions, setGeneratedDescriptions] = useState<
        string[]
    >([]);
    const [isGeneratingDescription, setIsGeneratingDescription] =
        useState(false);

    // Panel puller state menu
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartY, setDragStartY] = useState(0);

    // Panel puller state template
    const [isPanelOpenTemplate, setIsPanelOpenTemplate] = useState(true);
    const [isDraggingTemplate, setIsDraggingTemplate] = useState(false);
    const [dragStartYTemplate, setDragStartYTemplate] = useState(0);

    const [isLoading, setIsLoading] = useState(false);

    // Add ref for the scrollable container
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    // Add refs for template items to enable scrolling
    const templateRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    // State to track if scroll container is at the top
    const [isAtTop, setIsAtTop] = useState(true);

    const [template, setTemplate] = useState<any>(null);
    const [templates, setTemplates] = useState<any[]>([
        {
            id: "1",
            name: "TikTok",
            background: "#000000",
            text: "#ffffff",
            primary: "#fe2c55",
            secondary: "#de8c9d",
            accent: "#2af0ea",
        },
        {
            id: "2",
            name: "Facebook",
            background: "#F0F2F5",
            text: "#1C1E21",
            primary: "#1877F2",
            secondary: "#5795F7",
            accent: "#00B4FF",
        },
        {
            id: "3",
            name: "Instagram",
            background: "#121212",
            text: "#FFFFFF",
            primary: "#833AB4",
            secondary: "#C13584",
            accent: "#FCAF45",
        },
        {
            id: "4",
            name: "X (formerly Twitter)",
            background: "#000000",
            text: "#FFFFFF",
            primary: "#1DA1F2",
            secondary: "#5A9AC2",
            accent: "#4DFFFF",
        },
        {
            id: "5",
            name: "YouTube",
            background: "#FFFFFF",
            text: "#282828",
            primary: "#FF0000",
            secondary: "#FF5252",
            accent: "#FFA07A",
        },
        {
            id: "6",
            name: "Pinterest",
            background: "#FFFFFF",
            text: "#111111",
            primary: "#E60023",
            secondary: "#FF3352",
            accent: "#FF4D94",
        },
        {
            id: "10",
            name: "Tumblr",
            background: "#001935",
            text: "#FFFFFF",
            primary: "#00B8FF",
            secondary: "#4DD0FF",
            accent: "#FFC0CB",
        },
        {
            id: "11",
            name: "Discord",
            background: "#36393F",
            text: "#FFFFFF",
            primary: "#7289DA",
            secondary: "#99AAB5",
            accent: "#FFC0CB",
        },
        {
            id: "12",
            name: "Snapchat",
            background: "#000000",
            text: "#FFFFFF",
            primary: "#FFFC00",
            secondary: "#FFE933",
            accent: "#33B5E5",
        },
        {
            id: "13",
            name: "WhatsApp",
            background: "#FFFFFF",
            text: "#000000",
            primary: "#25D366",
            secondary: "#128C7E",
            accent: "#66DDAA",
        },
        {
            id: "14",
            name: "Telegram",
            background: "#FFFFFF",
            text: "#000000",
            primary: "#0088CC",
            secondary: "#2AABEE",
            accent: "#6FB3D6",
        },
        {
            id: "15",
            name: "Twitch",
            background: "#18181B",
            text: "#FFFFFF",
            primary: "#9146FF",
            secondary: "#A970FF",
            accent: "#EFEFF1",
        },
        {
            id: "16",
            name: "Spotify",
            background: "#191414",
            text: "#FFFFFF",
            primary: "#1DB954",
            secondary: "#1ED760",
            accent: "#FFFFFF",
        },
        {
            id: "17",
            name: "Medium",
            background: "#12100E",
            text: "#FFFFFF",
            primary: "#02B875",
            secondary: "#00AB6B",
            accent: "#FFFFFF",
        },
        {
            id: "18",
            name: "Quora",
            background: "#FFFFFF",
            text: "#1A1A1B",
            primary: "#B92B27",
            secondary: "#E06D6A",
            accent: "#2B6DAD",
        },
        {
            id: "19",
            name: "Vimeo",
            background: "#162221",
            text: "#FFFFFF",
            primary: "#1AB7EA",
            secondary: "#57CFF5",
            accent: "#FFFFFF",
        },
        {
            id: "20",
            name: "Flickr",
            background: "#FFFFFF",
            text: "#000000",
            primary: "#F40083",
            secondary: "#FF1981",
            accent: "#006ADD",
        },
        {
            id: "21",
            name: "SoundCloud",
            background: "#FFFFFF",
            text: "#1A1A1A",
            primary: "#FF5500",
            secondary: "#FF7700",
            accent: "#FFD9B3",
        },
        {
            id: "22",
            name: "Etsy",
            background: "#FDF9F3",
            text: "#222222",
            primary: "#F16521",
            secondary: "#E54F1C",
            accent: "#C9D5CD",
        },
        {
            id: "23",
            name: "Behance",
            background: "#FFFFFF",
            text: "#191919",
            primary: "#0057FF",
            secondary: "#006CFF",
            accent: "#A3A3A3",
        },
        {
            id: "24",
            name: "Dribbble",
            background: "#F4F6F9",
            text: "#292929",
            primary: "#EA4C89",
            secondary: "#EB6397",
            accent: "#C2C4C6",
        },
        {
            id: "25",
            name: "DeviantArt",
            background: "#141C1E",
            text: "#E5E5E5",
            primary: "#05CC47",
            secondary: "#00B239",
            accent: "#4D5B61",
        },
        {
            id: "26",
            name: "Fiverr",
            background: "#FFFFFF",
            text: "#404145",
            primary: "#1DBF73",
            secondary: "#2CDA86",
            accent: "#CCCCCC",
        },
        {
            id: "27",
            name: "Upwork",
            background: "#F1F2F4",
            text: "#1A1A1A",
            primary: "#6ACA26",
            secondary: "#80D94A",
            accent: "#CCCCCC",
        },
        {
            id: "28",
            name: "CodePen",
            background: "#293238",
            text: "#E9F1F6",
            primary: "#48A3C5",
            secondary: "#63BEDE",
            accent: "#20252B",
        },
        {
            id: "29",
            name: "GitHub",
            background: "#FFFFFF",
            text: "#24292E",
            primary: "#24292E",
            secondary: "#444D56",
            accent: "#6A737D",
        },
        {
            id: "30",
            name: "Stack Overflow",
            background: "#FFFFFF",
            text: "#232629",
            primary: "#F48024",
            secondary: "#F7A859",
            accent: "#B3B3B3",
        },
        {
            id: "31",
            name: "Wikipedia",
            background: "#FFFFFF",
            text: "#000000",
            primary: "#4C84C3",
            secondary: "#6FAEDF",
            accent: "#A9C1DC",
        },
        {
            id: "42",
            name: "Product Hunt",
            background: "#FFFFFF",
            text: "#333333",
            primary: "#DA5A30",
            secondary: "#EA6D45",
            accent: "#FFC0B2",
        },
        {
            id: "44",
            name: "Mix (formerly StumbleUpon)",
            background: "#FFFFFF",
            text: "#1A1A1A",
            primary: "#33C7B2",
            secondary: "#57D2C0",
            accent: "#CCCCCC",
        },
        {
            id: "45",
            name: "BuzzFeed",
            background: "#FFFFFF",
            text: "#222222",
            primary: "#EE3322",
            secondary: "#FF5544",
            accent: "#C42B1D",
        },
        {
            id: "47",
            name: "Unsplash",
            background: "#000000",
            text: "#FFFFFF",
            primary: "#FFFFFF",
            secondary: "#F3F3F3",
            accent: "#888888",
        },
        {
            id: "48",
            name: "Imgur",
            background: "#1C1C1C",
            text: "#DCDCDC",
            primary: "#85BF25",
            secondary: "#94D13C",
            accent: "#FFFFFF",
        },
        {
            id: "49",
            name: "Meetup",
            background: "#FFFFFF",
            text: "#333333",
            primary: "#ED1C40",
            secondary: "#F24765",
            accent: "#565656",
        },
        {
            id: "50",
            name: "Bandcamp",
            background: "#1B1B1B",
            text: "#FFFFFF",
            primary: "#629AA2",
            secondary: "#85B4BE",
            accent: "#E89E3A",
        },
        {
            id: "51",
            name: "Giphy",
            background: "#000000",
            text: "#FFFFFF",
            primary: "#D442FF",
            secondary: "#DE66FF",
            accent: "#FFBF00",
        },
        {
            id: "52",
            name: "Patreon",
            background: "#FFFFFF",
            text: "#111111",
            primary: "#FF424D",
            secondary: "#FF666E",
            accent: "#999999",
        },
        {
            id: "53",
            name: "Fandom",
            background: "#F9F9F9",
            text: "#000000",
            primary: "#064082",
            secondary: "#0B60C4",
            accent: "#C4266C",
        },
        {
            id: "54",
            name: "eBay",
            background: "#FFFFFF",
            text: "#333333",
            primary: "#E53238",
            secondary: "#E96464",
            accent: "#0064D2",
        },
        {
            id: "55",
            name: "Zillow",
            background: "#FFFFFF",
            text: "#2D2D2D",
            primary: "#0074E4",
            secondary: "#288DF0",
            accent: "#3D7A41",
        },
        {
            id: "56",
            name: "Duolingo",
            background: "#FFFFFF",
            text: "#222222",
            primary: "#58CC02",
            secondary: "#7CD438",
            accent: "#FFC800",
        },
        {
            id: "57",
            name: "Slack",
            background: "#4A154B",
            text: "#FFFFFF",
            primary: "#36C5F0",
            secondary: "#58D1F6",
            accent: "#E01E5A",
        },
        {
            id: "58",
            name: "Khan Academy",
            background: "#F5F5F5",
            text: "#212121",
            primary: "#1480B2",
            secondary: "#2890C0",
            accent: "#FFC800",
        },

        {
            id: "59",
            name: "Rotten Tomatoes",
            background: "#FFFFFF",
            text: "#222222",
            primary: "#9C201C",
            secondary: "#B43F3A",
            accent: "#61A92B",
        },
        {
            id: "60",
            name: "IMDb",
            background: "#000000",
            text: "#FFFFFF",
            primary: "#E6B91E",
            secondary: "#F5D154",
            accent: "#3366CC",
        },
        {
            id: "61",
            name: "Goodreads",
            background: "#F4F1E9",
            text: "#333333",
            primary: "#63432C",
            secondary: "#836746",
            accent: "#D4CCB8",
        },
        {
            id: "62",
            name: "Stack Exchange",
            background: "#FFFFFF",
            text: "#242424",
            primary: "#F48024",
            secondary: "#F7A859",
            accent: "#CCCCCC",
        },
        {
            id: "63",
            name: "GitLab",
            background: "#2E2E31",
            text: "#FFFFFF",
            primary: "#FC6D26",
            secondary: "#FD874D",
            accent: "#FFC0CB",
        },
        {
            id: "64",
            name: "GoFundMe",
            background: "#FFFFFF",
            text: "#222222",
            primary: "#4294F4",
            secondary: "#68A8F7",
            accent: "#89D9D2",
        },
        {
            id: "65",
            name: "IndieGoGo",
            background: "#F9F9F9",
            text: "#333333",
            primary: "#E01E5A",
            secondary: "#EB4E7B",
            accent: "#999999",
        },
        {
            id: "66",
            name: "Wix",
            background: "#F0F4F7",
            text: "#2B2A33",
            primary: "#54198D",
            secondary: "#6F3BA2",
            accent: "#99A1A8",
        },
        {
            id: "67",
            name: "Squarespace",
            background: "#F5F5F5",
            text: "#222222",
            primary: "#222222",
            secondary: "#444444",
            accent: "#00A3A3",
        },
        {
            id: "68",
            name: "Canva",
            background: "#FFFFFF",
            text: "#333333",
            primary: "#00C4CC",
            secondary: "#2CD9DF",
            accent: "#9F65D6",
        },
        {
            id: "69",
            name: "Reddit",
            background: "#FFFFFF",
            text: "#1A1A1B",
            primary: "#FF4500",
            secondary: "#FF6A33",
            accent: "#0079D3",
        },
        {
            id: "70",
            name: "WeChat",
            background: "#F9F9F9",
            text: "#1D1D1D",
            primary: "#09B83E",
            secondary: "#42C963",
            accent: "#AAAAAA",
        },
        {
            id: "71",
            name: "Weibo",
            background: "#FFFFFF",
            text: "#333333",
            primary: "#E6162D",
            secondary: "#FF4C5A",
            accent: "#F9C924",
        },
        {
            id: "72",
            name: "Line",
            background: "#FFFFFF",
            text: "#111111",
            primary: "#00C300",
            secondary: "#33D633",
            accent: "#666666",
        },
        {
            id: "73",
            name: "VK (VKontakte)",
            background: "#FFFFFF",
            text: "#222222",
            primary: "#4C75A3",
            secondary: "#6B91C0",
            accent: "#A8C4E1",
        },
        {
            id: "74",
            name: "QQ",
            background: "#FFFFFF",
            text: "#1C1C1C",
            primary: "#12B7F5",
            secondary: "#32C7F6",
            accent: "#FFD700",
        },
        {
            id: "75",
            name: "Messenger",
            background: "#FFFFFF",
            text: "#111111",
            primary: "#006AFF",
            secondary: "#00B2FF",
            accent: "#00E5FF",
        },
        {
            id: "76",
            name: "Clubhouse",
            background: "#F1F1F1",
            text: "#121212",
            primary: "#FFDD00",
            secondary: "#FFE44D",
            accent: "#000000",
        },
        {
            id: "77",
            name: "Mastodon",
            background: "#313543",
            text: "#FFFFFF",
            primary: "#6364FF",
            secondary: "#8C8DFF",
            accent: "#2E2F3E",
        },
        {
            id: "78",
            name: "OnlyFans",
            background: "#F9F9F9",
            text: "#111111",
            primary: "#00AFF0",
            secondary: "#29BFF7",
            accent: "#FF4081",
        },
        {
            id: "79",
            name: "Kick",
            background: "#0F0F0F",
            text: "#FFFFFF",
            primary: "#53FC18",
            secondary: "#76FF4D",
            accent: "#CCCCCC",
        },
        {
            id: "80",
            name: "Rumble",
            background: "#FFFFFF",
            text: "#1A1A1A",
            primary: "#85C742",
            secondary: "#A5DA6E",
            accent: "#333333",
        },
        // {
        //     id: "81",
        //     name: "Threads",
        //     background: "#000000",
        //     text: "#FFFFFF",
        //     primary: "#FFFFFF", // opposite of black background
        //     secondary: "#AAAAAA", // softer gray for hierarchy
        //     accent: "#833AB4", // subtle Instagram link (Meta family)
        // },
        {
            id: "82",
            name: "Bluesky",
            background: "#FFFFFF",
            text: "#000000",
            primary: "#1185FE",
            secondary: "#56A8FF",
            accent: "#9FCBFF",
        },
        {
            id: "83",
            name: "Truth Social",
            background: "#FFFFFF",
            text: "#111111",
            primary: "#1877F2",
            secondary: "#566FFF",
            accent: "#FF2C55",
        },
        {
            id: "84",
            name: "Lemon8",
            background: "#FFFFFF",
            text: "#111111",
            primary: "#FFDC00",
            secondary: "#FFE84D",
            accent: "#000000",
        },
        {
            id: "85",
            name: "Hive Social",
            background: "#F8F8F8",
            text: "#222222",
            primary: "#1DA1F2",
            secondary: "#FF3D71",
            accent: "#FFDD00",
        },
        {
            id: "86",
            name: "Club Penguin Rewritten (Fan)",
            background: "#003366",
            text: "#FFFFFF",
            primary: "#0099FF",
            secondary: "#66CCFF",
            accent: "#FFCC00",
        },
        {
            id: "87",
            name: "Koo",
            background: "#FFFFFF",
            text: "#111111",
            primary: "#FFCC00",
            secondary: "#FFD633",
            accent: "#333333",
        },
        {
            id: "88",
            name: "Gab",
            background: "#FFFFFF",
            text: "#000000",
            primary: "#21CF7A",
            secondary: "#4AD98F",
            accent: "#999999",
        },
        {
            id: "89",
            name: "Parler",
            background: "#FFFFFF",
            text: "#222222",
            primary: "#C51F25",
            secondary: "#D64549",
            accent: "#999999",
        },
        {
            id: "90",
            name: "GETTR",
            background: "#FFFFFF",
            text: "#111111",
            primary: "#FF0000",
            secondary: "#FF4D4D",
            accent: "#1E1E1E",
        },
        {
            id: "91",
            name: "Peach",
            background: "#FDF6F6",
            text: "#222222",
            primary: "#FF9B9B",
            secondary: "#FFB5B5",
            accent: "#FFD580",
        },
        {
            id: "92",
            name: "Ello",
            background: "#000000",
            text: "#FFFFFF",
            primary: "#FFFFFF",
            secondary: "#CCCCCC",
            accent: "#666666",
        },
        {
            id: "93",
            name: "KakaoTalk",
            background: "#FFFFFF",
            text: "#111111",
            primary: "#FFE812",
            secondary: "#FFD633",
            accent: "#3C1E1E",
        },
        {
            id: "94",
            name: "Douyin (TikTok China)",
            background: "#000000",
            text: "#FFFFFF",
            primary: "#FE2C55",
            secondary: "#2AF0EA",
            accent: "#20D5EC",
        },
        {
            id: "95",
            name: "Odnoklassniki (OK.ru)",
            background: "#FFFFFF",
            text: "#222222",
            primary: "#EE8208",
            secondary: "#F29B36",
            accent: "#999999",
        },
        {
            id: "96",
            name: "Baidu Tieba",
            background: "#F9F9F9",
            text: "#222222",
            primary: "#2932E1",
            secondary: "#4F57E9",
            accent: "#FF5C38",
        },
        {
            id: "97",
            name: "Vero",
            background: "#1D1F21",
            text: "#FFFFFF",
            primary: "#00C4B3",
            secondary: "#00D1BF",
            accent: "#999999",
        },
        {
            id: "98",
            name: "Minds",
            background: "#FFFFFF",
            text: "#1C1C1C",
            primary: "#FCD000",
            secondary: "#FFE352",
            accent: "#666666",
        },
        {
            id: "99",
            name: "Dailymotion",
            background: "#FFFFFF",
            text: "#111111",
            primary: "#0066DC",
            secondary: "#3385E5",
            accent: "#00B8F4",
        },
        {
            id: "100",
            name: "Peertube",
            background: "#FDFDFD",
            text: "#202020",
            primary: "#F1680D",
            secondary: "#F4883D",
            accent: "#5C9EFF",
        },
        {
            id: "101",
            name: "Bilibili",
            background: "#FFFFFF",
            text: "#333333",
            primary: "#00A1D6",
            secondary: "#23B6E7",
            accent: "#FF6EB6",
        },
        {
            id: "102",
            name: "Weverse",
            background: "#FFFFFF",
            text: "#111111",
            primary: "#20C997",
            secondary: "#3DD8B0",
            accent: "#9F65D6",
        },
        {
            id: "103",
            name: "Kickstarter",
            background: "#FFFFFF",
            text: "#222222",
            primary: "#2BDE73",
            secondary: "#4AE88B",
            accent: "#999999",
        },
        {
            id: "104",
            name: "AngelList",
            background: "#000000",
            text: "#FFFFFF",
            primary: "#FFFFFF",
            secondary: "#DDDDDD",
            accent: "#666666",
        },
        {
            id: "105",
            name: "ResearchGate",
            background: "#F5F5F5",
            text: "#111111",
            primary: "#00CCBB",
            secondary: "#33D6C6",
            accent: "#007777",
        },
        {
            id: "106",
            name: "KakaoStory",
            background: "#FFF8DC",
            text: "#111111",
            primary: "#FFCD00",
            secondary: "#FFD633",
            accent: "#333333",
        },
        {
            id: "107",
            name: "Amino",
            background: "#FFFFFF",
            text: "#000000",
            primary: "#20C997",
            secondary: "#38D9A9",
            accent: "#FF6B6B",
        },
        {
            id: "108",
            name: "Ravelry",
            background: "#FFFFFF",
            text: "#111111",
            primary: "#DE2C6C",
            secondary: "#F25C8D",
            accent: "#333333",
        },
        {
            id: "109",
            name: "Letterboxd",
            background: "#14181C",
            text: "#FFFFFF",
            primary: "#00D735",
            secondary: "#40E163",
            accent: "#FF8000",
        },
        {
            id: "110",
            name: "Last.fm",
            background: "#FFFFFF",
            text: "#222222",
            primary: "#D51007",
            secondary: "#FF4C40",
            accent: "#888888",
        },
        {
            id: "111",
            name: "Gaia Online",
            background: "#4B2466",
            text: "#FFFFFF",
            primary: "#FFB347",
            secondary: "#FFD580",
            accent: "#E0BBE4",
        },
        {
            id: "11832",
            name: "BlackPlanet",
            background: "#000000",
            text: "#FFFFFF",
            primary: "#FFD700",
            secondary: "#FFDD44",
            accent: "#999999",
        },
        {
            id: "113",
            name: "Care2",
            background: "#FFFFFF",
            text: "#111111",
            primary: "#78BE20",
            secondary: "#99D642",
            accent: "#FF9933",
        },
        {
            id: "114",
            name: "Viadeo",
            background: "#FFFFFF",
            text: "#222222",
            primary: "#F07355",
            secondary: "#F48F76",
            accent: "#888888",
        },
        {
            id: "1152124",
            name: "Xanga",
            background: "#FDFDFD",
            text: "#222222",
            primary: "#003399",
            secondary: "#3366CC",
            accent: "#FFCC00",
        },
        {
            id: "111",
            name: "Gaia Online 2",
            background: "#FFFFFF",
            text: "#222222",
            primary: "#6A5ACD",
            secondary: "#836FFF",
            accent: "#FFD700",
        },
        {
            id: "112",
            name: "Newgrounds",
            background: "#1A1A1A",
            text: "#FFFFFF",
            primary: "#FFCC00",
            secondary: "#FFD633",
            accent: "#FF6600",
        },
        {
            id: "113321",
            name: "Kik",
            background: "#FFFFFF",
            text: "#000000",
            primary: "#82BC23",
            secondary: "#A4D24F",
            accent: "#6B6B6B",
        },
        {
            id: "12314",
            name: "ICQ",
            background: "#FFFFFF",
            text: "#111111",
            primary: "#24C100",
            secondary: "#3ED633",
            accent: "#FF2C55",
        },
        {
            id: "115",
            name: "MSN Messenger (Classic)",
            background: "#F2F9FF",
            text: "#111111",
            primary: "#0078D7",
            secondary: "#4AA6FF",
            accent: "#00A300",
        },
        {
            id: "116",
            name: "Yahoo Messenger (Legacy)",
            background: "#FFFFFF",
            text: "#111111",
            primary: "#720E9E",
            secondary: "#9A3FBA",
            accent: "#FFD700",
        },
        {
            id: "117",
            name: "Friendster (Legacy)",
            background: "#F8F8F8",
            text: "#222222",
            primary: "#0091D5",
            secondary: "#33ABE3",
            accent: "#F58220",
        },
        {
            id: "118",
            name: "Hi5",
            background: "#FFFFFF",
            text: "#1A1A1A",
            primary: "#FF8C00",
            secondary: "#FFA733",
            accent: "#555555",
        },
        {
            id: "119",
            name: "Orkut (Legacy)",
            background: "#F9F9F9",
            text: "#222222",
            primary: "#ED2590",
            secondary: "#F46AB6",
            accent: "#7B1FA2",
        },
        {
            id: "120",
            name: "MySpace",
            background: "#FFFFFF",
            text: "#000000",
            primary: "#003399",
            secondary: "#3366CC",
            accent: "#FF9900",
        },
        {
            id: "121",
            name: "Grab",
            background: "#FFFFFF",
            text: "#111111",
            primary: "#00B14F",
            secondary: "#1DD75B",
            accent: "#FFD600",
        },
        {
            id: "122",
            name: "Foodpanda",
            background: "#FFFFFF",
            text: "#111111",
            primary: "#D70F64",
            secondary: "#FF408C",
            accent: "#FFD600",
        },
        {
            id: "123",
            name: "Lalamove",
            background: "#FFFFFF",
            text: "#111111",
            primary: "#F36F21",
            secondary: "#FF914D",
            accent: "#FFD600",
        },
        {
            id: "124",
            name: "Shopee",
            background: "#FFFFFF",
            text: "#111111",
            primary: "#EE4D2D",
            secondary: "#FF6A4C",
            accent: "#FFD600",
        },
        {
            id: "125",
            name: "Lazada",
            background: "#FFFFFF",
            text: "#111111",
            primary: "#1A9CF0",
            secondary: "#3BB4FF",
            accent: "#F36F21",
        },
        {
            id: "126",
            name: "GCash",
            background: "#FFFFFF",
            text: "#111111",
            primary: "#0072CE",
            secondary: "#3399FF",
            accent: "#00C853",
        },
        {
            id: "127",
            name: "Maya (formerly PayMaya)",
            background: "#FFFFFF",
            text: "#111111",
            primary: "#00C853",
            secondary: "#33D17A",
            accent: "#0072CE",
        },
        {
            id: "128",
            name: "Coins.ph",
            background: "#FFFFFF",
            text: "#111111",
            primary: "#2A71FF",
            secondary: "#5C94FF",
            accent: "#FFB600",
        },
        {
            id: "129",
            name: "Angkas",
            background: "#FFFFFF",
            text: "#111111",
            primary: "#00BFFF",
            secondary: "#4DD9FF",
            accent: "#333333",
        },
        {
            id: "130",
            name: "JoyRide",
            background: "#FFFFFF",
            text: "#111111",
            primary: "#004AAD",
            secondary: "#006DFF",
            accent: "#FFB600",
        },
        {
            id: "131",
            name: "HBO Max",
            background: "#121212",
            text: "#FFFFFF",
            primary: "#FFFFFF", // stands out on dark bg
            secondary: "#AAAAAA",
            accent: "#5A2D82", // HBO purple
        },
        {
            id: "132",
            name: "ESPN",
            background: "#FFFFFF",
            text: "#000000",
            primary: "#000000", // sharp on white bg
            secondary: "#666666",
            accent: "#CC0000", // ESPN red
        },
        {
            id: "133",
            name: "CNN",
            background: "#FFFFFF",
            text: "#000000",
            primary: "#000000",
            secondary: "#555555",
            accent: "#CC0000", // CNN red
        },
        {
            id: "134",
            name: "Fox News",
            background: "#0A0A0A",
            text: "#FFFFFF",
            primary: "#FFFFFF",
            secondary: "#999999",
            accent: "#003366", // Fox deep blue
        },
        {
            id: "135",
            name: "The New York Times",
            background: "#FFFFFF",
            text: "#000000",
            primary: "#000000",
            secondary: "#444444",
            accent: "#1A1A1A", // iconic NYT black
        },
        {
            id: "136",
            name: "Bloomberg",
            background: "#FFFFFF",
            text: "#000000",
            primary: "#000000",
            secondary: "#555555",
            accent: "#3A16C4", // Bloomberg purple
        },
    ]);

    // Search state for templates
    const [templateSearchQuery, setTemplateSearchQuery] = useState("");
    const [filteredTemplates, setFilteredTemplates] = useState<any[]>([]);

    // Filter templates based on search query
    useEffect(() => {
        if (!templateSearchQuery.trim()) {
            setFilteredTemplates(templates);
        } else {
            const filtered = templates.filter((template) =>
                template.name
                    .toLowerCase()
                    .includes(templateSearchQuery.toLowerCase())
            );
            setFilteredTemplates(filtered);
        }
    }, [templateSearchQuery, templates]);

    // Handle scroll events to track if container is at top
    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;

        const handleScroll = () => {
            const scrollTop = scrollContainer.scrollTop;
            const scrollHeight = scrollContainer.scrollHeight;
            const clientHeight = scrollContainer.clientHeight;

            console.log("Scroll debug:", {
                scrollTop,
                scrollHeight,
                clientHeight,
                isScrollable: scrollHeight > clientHeight,
            });

            setIsAtTop(scrollTop <= 10); // Small threshold for better UX
        };

        scrollContainer.addEventListener("scroll", handleScroll);

        // Initial check
        handleScroll();

        return () => {
            scrollContainer.removeEventListener("scroll", handleScroll);
        };
    }, [filteredTemplates]); // Re-run when templates change

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

    // Function to check if there are any changes
    const hasChanges = () => {
        if (id === "create") {
            // For new items, check if any field has content

            return (
                title.trim() !== "" ||
                description.trim() !== "" ||
                image !== null ||
                externalURLs.length > 0 ||
                userAlias !== null
            );
        }

        // For existing items, compare with original values
        const titleChanged = title !== originalTitle;
        const descriptionChanged = description !== originalDescription;
        const imageChanged = image !== originalImage;
        const privacyChanged = isPrivate !== originalIsPrivate;
        const templateChanged = template !== originalTemplate;
        const userAliasChanged =
            JSON.stringify(originalUserAlias) !== JSON.stringify(userAlias);

        // Check if external URLs have changed (length, content, or order)
        const urlsChanged =
            externalURLs.length !== originalExternalURLs.length ||
            externalURLs.some((url, index) => {
                const originalUrl = originalExternalURLs[index];
                return (
                    !originalUrl ||
                    url.title !== originalUrl.title ||
                    url.url !== originalUrl.url ||
                    url.sequence !== originalUrl.sequence ||
                    url.image !== originalUrl.image
                );
            });

        return (
            titleChanged ||
            descriptionChanged ||
            imageChanged ||
            privacyChanged ||
            templateChanged ||
            userAliasChanged ||
            urlsChanged
        );
    };

    const handleAddURL = async () => {
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
            let newImageUrl = getFaviconUrl(newUrl.trim()); // Default to favicon

            // If there's a file selected, use its preview URL for display
            if (newUrlImage?.file) {
                newImageUrl = newUrlImage.preview;
            }

            // Store the file reference instead of converting to base64
            const newURLItem = {
                _id: Date.now().toString(),
                title: newUrlTitleString,
                url: newUrl.trim(),
                updatedAt: new Date().toISOString(),
                sequence: externalURLs.length + 1,
                image: newImageUrl,
                imageFile: newUrlImage?.file || null, // Store the file reference
            };

            setExternalUrls((prev) => [...prev, newURLItem]);
            setNewUrlTitle("");
            setNewUrl("");
            setNewUrlImage(null); // Clear the image state
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
            setEditUrlImage({
                preview: urlToEdit.image || getFaviconUrl(urlToEdit.url),
                file: null as any,
            });
            setActiveId(id);
            setEditURLModal(true);
        }
    };

    const handleUpdateURL = async () => {
        let newUrlTitleString = "";
        if (newUrlTitle.trim()) {
            newUrlTitleString = newUrlTitle.trim();
        } else {
            newUrlTitleString = (() => {
                const url = new URL(newUrl.trim());
                const parts = url.hostname.split(".");
                // Handle localhost and similar single-part hostnames
                if (parts.length === 1) {
                    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
                }
                // Handle normal domains
                const domain = parts.slice(-2, -1)[0];
                return domain.charAt(0).toUpperCase() + domain.slice(1);
            })();
        }

        let newImageUrl = getFaviconUrl(newUrl.trim()); // Default to favicon

        // Handle image updates - store file reference instead of converting to base64
        if (editUrlImage?.file) {
            newImageUrl = editUrlImage.preview; // Use preview for display
        } else if (editUrlImage?.preview && !editUrlImage?.file) {
            // If there's a preview but no file, it means it's the existing image or favicon
            newImageUrl = editUrlImage.preview;
        }

        setExternalUrls((prev) => {
            const updated = prev.map((url) =>
                url._id === activeId
                    ? {
                          ...url,
                          title: newUrlTitleString,
                          url: newUrl,
                          image: newImageUrl,
                          imageFile: editUrlImage?.file || null, // Store the file reference
                      }
                    : url
            );
            return updated;
        });
        setEditURLModal(false);
        setNewUrlTitle("");
        setNewUrl("");
        setEditUrlImage(null); // Clear the image state
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

                // Process external URLs and separate files from data
                const externalURLsData = externalURLs.map((url, index) => {
                    const { imageFile, ...urlData } = url;
                    return urlData;
                });
                formData.append(
                    "externalURLs",
                    JSON.stringify(externalURLsData)
                );

                // Append external URL image files separately
                externalURLs.forEach((url, index) => {
                    if (url.imageFile) {
                        formData.append(
                            `externalUrlImage_${index}`,
                            url.imageFile
                        );
                    }
                });

                formData.append("public", (!isPrivate).toString());
                formData.append("template", JSON.stringify(template));
                formData.append("userAlias", JSON.stringify(userAlias));

                // If image is a base64 string, convert it back to a file
                if (image) {
                    formData.append("image", image);
                }

                // If userAlias has an imageFile, append it as userAliasImage
                if (userAlias?.imageFile) {
                    formData.append("userAliasImage", userAlias.imageFile);
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
                setOriginalUserAlias(userAlias);
                router.push(`${response.data._id}`);
                setIsSaving(false);
                setUrlPreviewMode(false);
            }
        } catch (error: any) {
            console.log("Save error:", error);
            // toast.error("Failed to update URL. Please try again.");
            const errorMessage =
                error?.response?.data?.error?.message ||
                error?.response?.data?.message ||
                error?.message ||
                "Failed to save URL. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
            setOnSave(false);
            setIsLoading(false);
        }
    };

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            if (!title) {
                toast.error("Please enter a title");
                return;
            }

            setIsSaving(true);

            // Create FormData for file upload
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);

            // Process external URLs and separate files from data
            const externalURLsData = externalURLs.map((url, index) => {
                const { imageFile, ...urlData } = url;
                return urlData;
            });
            formData.append("externalURLs", JSON.stringify(externalURLsData));

            // Append external URL image files separately
            externalURLs.forEach((url, index) => {
                if (url.imageFile) {
                    formData.append(`externalUrlImage_${index}`, url.imageFile);
                }
            });

            formData.append("public", (!isPrivate).toString());
            formData.append("template", JSON.stringify(template));
            formData.append("userAlias", JSON.stringify(userAlias));
            // If image is a base64 string, convert it back to a file
            if (image) {
                formData.append("image", image);
            } else {
                if (image === null) {
                    formData.append("image", null as any);
                }
            }

            if (userAlias?.imageFile) {
                formData.append("userAliasImage", userAlias.imageFile);
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
            setOriginalUserAlias(userAlias);
            setIsSaving(false);
            setUrlPreviewMode(false);
            setPreviewMode(false);
            setOnSave(false);
        } catch (error: any) {
            console.log("Update error:", error);
            // toast.error("Failed to update URL. Please try again.");
            const errorMessage =
                error?.response?.data?.error?.message ||
                error?.response?.data?.message ||
                error?.message ||
                "Failed to update URL. Please try again.";
            toast.error(errorMessage);
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

    const generateTitle = async () => {
        try {
            setIsGeneratingTitle(true);

            const response = await api.post(`/api/gemini/text`, {
                method: "POST",
                prompt: `Create 10 titles separated by commas (,,). Titles may have spaces. ${
                    externalURLs.length &&
                    `The titles must be related to ${externalURLs
                        .map((url) => `${url.title} (${url.url})`)
                        .join(", ")}`
                }. Provide the answer directly with no extra text.`,
            });

            const titles = response.data.split(",,");

            setGeneratedTitles(titles);
            setIsGeneratingTitle(false);
        } catch (error) {
            setIsGeneratingTitle(false);
            console.log("Error generating title:", error);
            toast.error("Failed to generate title. Please try again.");
        } finally {
            setIsGeneratingTitle(false);
        }

        // --------------- For image generation ---------------
        // const config = {
        //     responseModalities: ["IMAGE", "TEXT"],
        // };
        // const model = "gemini-2.5-flash-image-preview";
        // const contents = [
        //     {
        //         role: "user",
        //         parts: [
        //             {
        //                 text: `Create an image of animated cat.`,
        //             },
        //         ],
        //     },
        // ];

        // const response2 = await ai.models.generateContentStream({
        //     model,
        //     config,
        //     contents,
        // });

        // console.log("Response 2:", response2);
    };

    const generateDescription = async () => {
        try {
            setIsGeneratingDescription(true);
            const response = await api.post(`/api/gemini/text`, {
                method: "POST",
                prompt: `Create 10 descriptions 300 characters max each separated by commas (,,). Descriptions may have spaces. ${
                    externalURLs.length &&
                    `The descriptions must be related to ${externalURLs
                        .map((url) => `${url.title} (${url.url})`)
                        .join(", ")}`
                }. Provide the answer directly with no extra text.`,
            });
            const descriptions = response.data.split(",,");
            setGeneratedDescriptions(descriptions);
            setIsGeneratingDescription(false);
        } catch (error) {
            setIsGeneratingDescription(false);
            console.log("Error generating description:", error);
            toast.error("Failed to generate description. Please try again.");
        } finally {
            setIsGeneratingDescription(false);
        }
    };

    const setNewTitle = (title: string) => {
        console.log("Setting new title:", title);
        setTitle(title);
        setTitleEdit(false);
        setShowTitleDropdown(false);
    };

    const setNewDescription = (description: string) => {
        setDescription(description);
        setDescriptionEdit(false);
        setShowDescriptionDropdown(false);
    };

    const selectNewTemplate = (template: any) => {
        setUrlTemplate(template);
        setTemplate(template);
    };

    // Function to scroll to the selected template
    const scrollToSelectedTemplate = () => {
        if (!template) {
            // If no template is selected, scroll to the default template (first item)
            const defaultElement = templateRefs.current["default"];
            if (defaultElement && scrollContainerRef.current) {
                const containerRect =
                    scrollContainerRef.current.getBoundingClientRect();
                const templateRect = defaultElement.getBoundingClientRect();

                const scrollTop =
                    scrollContainerRef.current.scrollTop +
                    (templateRect.top - containerRect.top) -
                    containerRect.height / 2 +
                    templateRect.height / 2;

                scrollContainerRef.current.scrollTo({
                    top: Math.max(0, scrollTop),
                    behavior: "smooth",
                });
            } else {
                scrollContainerRef.current?.scrollTo({
                    top: 0,
                    behavior: "smooth",
                });
            }
            return;
        }

        const templateElement = templateRefs.current[template.id];
        if (templateElement && scrollContainerRef.current) {
            const containerRect =
                scrollContainerRef.current.getBoundingClientRect();
            const templateRect = templateElement.getBoundingClientRect();

            // Calculate the position to scroll to center the template in the container
            const scrollTop =
                scrollContainerRef.current.scrollTop +
                (templateRect.top - containerRect.top) -
                containerRect.height / 2 +
                templateRect.height / 2;

            scrollContainerRef.current.scrollTo({
                top: Math.max(0, scrollTop),
                behavior: "smooth",
            });
        }
    };

    // Auto-scroll to selected template when template changes
    useEffect(() => {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
            scrollToSelectedTemplate();
        }, 100);
    }, [template]);

    useEffect(() => {
        const fetchUrl = async () => {
            if (id !== "create") {
                setIsLoading(true);
                const response = await api.get(`/api/url/${id}`);

                setTitle(response.data.url.title);
                setDescription(response.data.url.description);
                setImage(response.data.url.image);
                setImagePreview(response.data.url.image);
                // Initialize external URLs with imageFile property
                const externalUrlsWithImageFile =
                    response.data.externalUrls.map((url: any) => ({
                        ...url,
                        imageFile: null, // Initialize imageFile as null for existing URLs
                    }));
                setExternalUrls(externalUrlsWithImageFile);
                setIsPrivate(!response.data.url.public);
                setEditMode(true);
                setPreviewMode(false);
                setTemplate(response.data.url.template);
                setUrlTemplate(response.data.url.template);
                console.log(response.data.url.userAlias);

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
                setOriginalExternalURLs(externalUrlsWithImageFile);
                setOriginalTemplate(response.data.url.template);
                if (response.data.url.userAlias) {
                    setOriginalUserAlias({
                        name: response.data.url.userAlias.name,
                        image: response.data.url.userAlias.imageFile,
                        imageFile: response.data.url.userAlias.imageFile,
                    });
                }
                if (response.data.url.userId === userDetails?.user?.id) {
                    setIsFromUser(true);
                }

                setIsUrlFound(true);
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
                setUserAlias(null);
            }
            setIsLoading(false);
        };
        fetchUrl();
    }, [id, userDetails]);

    useEffect(() => {
        const refreshUserToken = async () => {
            // setIsLoading(true);
            if (accessToken && !userDetails) {
                setUserDetails(decodeToken(accessToken));
            } else {
                // let res = await refreshToken();
                // if (res === null) {
                //     router.push("/");
                // }
            }
            // setIsLoading(false);
        };
        refreshUserToken();
    }, [accessToken, refreshToken]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showTitleDropdown) {
                const target = event.target as Element;
                if (!target.closest(".title-dropdown-container")) {
                    setShowTitleDropdown(false);
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showTitleDropdown]);

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

    // Template panel puller drag handlers
    const handlePanelDragStartTemplate = (e: React.MouseEvent) => {
        setIsDraggingTemplate(true);
        setDragStartYTemplate(e.clientY);
        e.preventDefault();
    };

    const handlePanelDragMoveTemplate = (e: MouseEvent) => {
        if (!isDraggingTemplate) return;

        const deltaY = e.clientY - dragStartYTemplate;
        const threshold = 50; // Minimum drag distance to trigger toggle

        if (Math.abs(deltaY) > threshold) {
            setIsPanelOpenTemplate(deltaY < 0); // Open if dragged up, close if dragged down
            setIsDraggingTemplate(false);
        }
    };

    const handlePanelDragEndTemplate = () => {
        setIsDraggingTemplate(false);
    };

    const togglePanelTemplate = () => {
        setIsPanelOpenTemplate(!isPanelOpenTemplate);
    };

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

    // Add event listeners for template panel drag
    React.useEffect(() => {
        if (isDraggingTemplate) {
            document.addEventListener("mousemove", handlePanelDragMoveTemplate);
            document.addEventListener("mouseup", handlePanelDragEndTemplate);
            return () => {
                document.removeEventListener(
                    "mousemove",
                    handlePanelDragMoveTemplate
                );
                document.removeEventListener(
                    "mouseup",
                    handlePanelDragEndTemplate
                );
            };
        }
    }, [isDraggingTemplate, dragStartYTemplate]);

    // Close panels on small screens
    React.useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                // md breakpoint
                setIsPanelOpen(false);
                setIsPanelOpenTemplate(false);
            }
        };

        // Check initial screen size
        handleResize();

        // Add event listener
        window.addEventListener("resize", handleResize);

        // Cleanup
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

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
                                                <span className="text-xs text-gray-800">
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
                                                <div className="md:relative flex gap-4 title-dropdown-container">
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
                                                        onClick={() => {
                                                            generateTitle();
                                                            setShowTitleDropdown(
                                                                !showTitleDropdown
                                                            );
                                                        }}
                                                    >
                                                        <Magicpen />
                                                    </span>

                                                    <span
                                                        className="text-gray-700 hover:text-gray-400 cursor-pointer"
                                                        onClick={() =>
                                                            setTitleEdit(false)
                                                        }
                                                    >
                                                        <CloseCircle />
                                                    </span>
                                                    {showTitleDropdown && (
                                                        <div className="z-20 absolute top-full left-0 mt-1 w-full bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg shadow-xl backdrop-blur-sm">
                                                            <div className="p-2">
                                                                <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-purple-600 font-medium border-b border-purple-100 mb-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse"></div>
                                                                        AI
                                                                        Generated
                                                                        Titles
                                                                    </div>
                                                                    <span
                                                                        className="text-gray-700 hover:text-gray-400 cursor-pointer"
                                                                        onClick={() => {
                                                                            generateTitle();
                                                                        }}
                                                                    >
                                                                        <ArrowRotateRight />
                                                                    </span>
                                                                </div>
                                                                {isGeneratingTitle ? (
                                                                    <div className="flex items-center justify-center gap-3 px-3 py-4 text-sm text-purple-600 font-medium">
                                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-400 border-t-transparent"></div>
                                                                        <span>
                                                                            Generating
                                                                            AI
                                                                            Titles...
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="space-y-1 max-h-48 overflow-y-auto">
                                                                        {generatedTitles.map(
                                                                            (
                                                                                generatedTitle,
                                                                                index
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 cursor-pointer rounded-md transition-all duration-200 hover:shadow-sm border border-transparent hover:border-purple-200"
                                                                                    onClick={() => {
                                                                                        console.log(
                                                                                            "Title clicked:",
                                                                                            generatedTitle
                                                                                        );
                                                                                        setNewTitle(
                                                                                            generatedTitle
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    <div className="flex items-center gap-2">
                                                                                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                                                                                        {
                                                                                            generatedTitle
                                                                                        }
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                )}
                                                                <div className="mt-2 px-3 py-1 text-xs text-gray-500 italic border-t border-purple-100">
                                                                    Powered by
                                                                    Gemini
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
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
                                        <div className="flex items-center sm:justify-start justify-center gap-4">
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
                                                        {userDetails?.user
                                                            ?.userImage ? (
                                                            <img
                                                                src={
                                                                    userDetails
                                                                        ?.user
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
                                                        <span
                                                            className="text-sm"
                                                            style={{
                                                                color:
                                                                    template?.secondary ||
                                                                    "#111827",
                                                            }}
                                                        >
                                                            {
                                                                userDetails
                                                                    ?.user
                                                                    ?.firstName
                                                            }{" "}
                                                            {
                                                                userDetails
                                                                    ?.user
                                                                    ?.lastName
                                                            }
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            {!previewMode && (
                                                <span
                                                    className="text-gray-700 hover:text-gray-400 cursor-pointer text-sm"
                                                    onClick={() =>
                                                        setUserAliasEdit(true)
                                                    }
                                                >
                                                    <Edit />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {isPrivate ? (
                                    previewMode && (
                                        <>
                                            {/* ----- for large screen ----- */}
                                            <span className="hidden sm:flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                Private
                                            </span>
                                            {/* ----- for small screen ----- */}
                                            <span
                                                className={`absolute ${
                                                    imagePreview === ""
                                                        ? "-top-10"
                                                        : "top-0"
                                                } right-0 sm:hidden flex justify-center items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800`}
                                            >
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                Private
                                            </span>
                                        </>
                                    )
                                ) : (
                                    <>
                                        {/* ----- for large screen ----- */}
                                        {previewMode && (
                                            <div
                                                className="hidden px-2 py-1 rounded-2xl sm:flex items-center gap-2 y cursor-pointer hover:text-gray-400 text-primary transition-all duration-300 hover:drop-shadow-lg hover:shadow-lg"
                                                style={{
                                                    color:
                                                        template?.accent ||
                                                        "#6b7280",
                                                    filter: "drop-shadow(0 0 0 transparent)",
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.filter = `drop-shadow(0 0 8px ${
                                                        template?.accent ||
                                                        "#6b7280"
                                                    })`;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.filter =
                                                        "drop-shadow(0 0 0 transparent)";
                                                }}
                                            >
                                                <span className="flex text-sm">
                                                    Share
                                                </span>
                                                <span className="text-sm cursor-pointer">
                                                    <Share />
                                                </span>
                                            </div>
                                        )}

                                        {/* ----- for small screen ----- */}
                                        {previewMode && (
                                            <div
                                                className={`absolute ${
                                                    imagePreview === ""
                                                        ? "-top-10"
                                                        : "top-0"
                                                } px-2 py-1 rounded-2xl right-0 gap-2 y cursor-pointer hover:text-gray-400 flex justify-center items-center text-primary sm:hidden`}
                                                style={{
                                                    color:
                                                        template?.accent ||
                                                        "#6b7280",
                                                }}
                                            >
                                                <span className="flex text-sm">
                                                    Share
                                                </span>
                                                <span className="text-sm cursor-pointer">
                                                    <Share />
                                                </span>
                                            </div>
                                        )}
                                    </>
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
                                {!previewMode && !descriptionEdit && (
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
                                    <div className="flex gap-4 relative">
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
                                            rows={3}
                                            style={{
                                                color:
                                                    template?.text || "#000000",
                                            }}
                                        />

                                        <span
                                            className="text-gray-700 hover:text-gray-400 cursor-pointer"
                                            onClick={() => {
                                                generateDescription();
                                                setShowDescriptionDropdown(
                                                    !showDescriptionDropdown
                                                );
                                            }}
                                        >
                                            <Magicpen />
                                        </span>
                                        <span
                                            className="text-gray-700 hover:text-gray-400 cursor-pointer text-sm"
                                            onClick={() =>
                                                setDescriptionEdit(false)
                                            }
                                        >
                                            <CloseCircle />
                                        </span>
                                        {showDescriptionDropdown && (
                                            <div className="z-20 absolute top-full left-0 mt-1 w-full bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg shadow-xl backdrop-blur-sm">
                                                <div className="p-2">
                                                    <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-purple-600 font-medium border-b border-purple-100 mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse"></div>
                                                            AI Generated
                                                            Descriptions
                                                        </div>
                                                        <span
                                                            className="text-gray-700 hover:text-gray-400 cursor-pointer"
                                                            onClick={() => {
                                                                generateDescription();
                                                            }}
                                                        >
                                                            <ArrowRotateRight />
                                                        </span>
                                                    </div>
                                                    {isGeneratingDescription ? (
                                                        <div className="flex items-center justify-center gap-3 px-3 py-4 text-sm text-purple-600 font-medium">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-400 border-t-transparent"></div>
                                                            <span>
                                                                Generating AI
                                                                Descriptions...
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-1 max-h-48 overflow-y-auto">
                                                            {generatedDescriptions.map(
                                                                (
                                                                    generatedDescription,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="px-3 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 cursor-pointer rounded-md transition-all duration-200 hover:shadow-sm border border-transparent hover:border-purple-200"
                                                                        onClick={() => {
                                                                            setNewDescription(
                                                                                generatedDescription
                                                                            );
                                                                        }}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-1.5 min-w-1.5 h-1.5 min-h-1.5 bg-purple-400 rounded-full"></div>
                                                                            {
                                                                                generatedDescription
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="mt-2 px-3 py-1 text-xs text-gray-500 italic border-t border-purple-100">
                                                        Powered by Gemini
                                                    </div>
                                                </div>
                                            </div>
                                        )}
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
                                            {description ? (
                                                <>{description}</>
                                            ) : (
                                                !previewMode && (
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
                                                )
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
                                    <div
                                        className={`grid grid-cols-2 sm:grid-cols-3 gap-x-2 ${
                                            previewMode ? "gap-y-4" : "gap-y-10"
                                        }`}
                                    >
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
                                                        image={url.image}
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

            {/* menu */}
            {editMode && isFromUser && (
                <div
                    className={`z-20 fixed top-1/2 -translate-y-1/2 right-0 transition-transform duration-300 ease-in-out ${
                        isPanelOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                >
                    {/* Puller Handle */}
                    <div
                        className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 w-6 h-16 ${
                            !hasChanges() ? "bg-gray-600" : "bg-primary"
                        }  hover:bg-gray-300 rounded-l-lg cursor-pointer flex items-center justify-center group transition-colors duration-200`}
                        onMouseDown={handlePanelDragStart}
                        onClick={togglePanel}
                    >
                        {isPanelOpen ? (
                            <ArrowRight2 className="text-white" />
                        ) : (
                            <ArrowLeft2 className="text-white" />
                        )}
                    </div>

                    <div
                        className="w-fit bg-white rounded-xl shadow-md p-4"
                        style={{ backgroundColor: "#ffffff" }}
                    >
                        <div className="flex justify-center flex-col gap-4">
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
                                            onChange={() => {
                                                setPreviewMode(!previewMode);
                                                setUrlPreviewMode(!previewMode);
                                                setTitleEdit(false);
                                                setDescriptionEdit(false);
                                                setShowTitleDropdown(false);
                                                setShowDescriptionDropdown(
                                                    false
                                                );

                                                if (!previewMode) {
                                                    togglePanel();
                                                    setIsPanelOpenTemplate(
                                                        false
                                                    );
                                                } else {
                                                    setIsPanelOpenTemplate(
                                                        true
                                                    );
                                                }
                                            }}
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

                            <div className="flex justify-start gap-2 y cursor-pointer hover:text-gray-400">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            value={isPrivate.toString()}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 focus:ring-2"
                                            onChange={() =>
                                                setIsPrivate(!isPrivate)
                                            }
                                            defaultChecked={!isPrivate}
                                        />
                                        <label className="ms-2 text-sm font-medium text-gray-900">
                                            Make Public
                                        </label>
                                    </div>
                                    {!hasChanges() && id !== "create" && (
                                        <div className="flex items-center">
                                            <span
                                                className="text-sm flex items-center gap-1 underline text-gray-500 hover:text-primary cursor-pointer"
                                                onClick={() => {
                                                    window.open(
                                                        `/share/${id}`,
                                                        "_blank"
                                                    );
                                                }}
                                            >
                                                Visit <Link21 />
                                            </span>
                                        </div>
                                    )}
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
                                    disabled={!hasChanges()}
                                />
                                {!hasChanges() && (
                                    <p className="text-xs text-gray-500 text-center mt-2">
                                        No changes to save
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* templates */}
            {editMode && isFromUser && (
                <div
                    className={`z-20 fixed h-[75vh] bottom-0 left-0 transition-transform duration-300 ease-in-out ${
                        isPanelOpenTemplate
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }`}
                >
                    {/* Puller Handle */}
                    <div
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-6 h-16 bg-gray-600 hover:bg-gray-300 rounded-r-lg cursor-pointer flex items-center justify-center group transition-colors duration-200"
                        onMouseDown={handlePanelDragStartTemplate}
                        onClick={togglePanelTemplate}
                    >
                        {!isPanelOpenTemplate ? (
                            <ArrowRight2 className="text-white" />
                        ) : (
                            <ArrowLeft2 className="text-white" />
                        )}
                    </div>

                    <div
                        className="w-[250px] h-full bg-red-500 rounded-xl shadow-md p-4 flex flex-col"
                        style={{ backgroundColor: "#ffffff" }}
                    >
                        <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 mb-3 flex-shrink-0">
                            <ul className="flex flex-wrap ">
                                <li className="w-full">
                                    <a
                                        href="#"
                                        className="w-full inline-block p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active"
                                        aria-current="page"
                                    >
                                        Templates
                                    </a>
                                </li>

                                {/* <li className="me-2">
                                    <a
                                        href="#"
                                        className="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300"
                                    >
                                        Customize
                                    </a>
                                </li> */}
                            </ul>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-4 flex-shrink-0">
                            <div className="relative">
                                <SearchNormal1 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search templates..."
                                    value={templateSearchQuery}
                                    onChange={(e) =>
                                        setTemplateSearchQuery(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>
                        </div>

                        <div
                            ref={scrollContainerRef}
                            className="flex flex-col gap-4 overflow-y-auto relative flex-1 min-h-0"
                        >
                            <div
                                ref={(el) => {
                                    templateRefs.current["default"] = el;
                                }}
                                className={`relative rounded-lg shadow-lg p-1 hover:shadow-xl transition-all duration-300 cursor-pointer ${
                                    template ? "bg-white" : "bg-primary"
                                }`}
                                onClick={() => {
                                    selectNewTemplate(null);
                                    setUrlTemplate(null);
                                }}
                            >
                                <div className="rounded-lg flex h-[100px] justify-center items-center bg-gray-200">
                                    {/* <div className="border-2 border-gray-400 rounded-full w-12 h-12">
                                        <div >

                                        </div>
                                    </div> */}

                                    <span>
                                        <CloseCircle className="text-gray-400 w-12 h-12" />
                                    </span>
                                </div>

                                <span className="absolute top-0 left-0 p-3 text-xs text-gray-600">
                                    Default
                                </span>
                            </div>
                            {filteredTemplates.map((templateItem, index) => (
                                <div
                                    key={index}
                                    ref={(el) => {
                                        templateRefs.current[templateItem.id] =
                                            el;
                                    }}
                                    className={`relative rounded-lg shadow-lg p-1 hover:shadow-xl transition-all duration-300 cursor-pointer ${
                                        template
                                            ? template.id === templateItem.id
                                                ? "bg-primary"
                                                : "bg-white"
                                            : "bg-white"
                                    }`}
                                    onClick={() =>
                                        selectNewTemplate(templateItem)
                                    }
                                >
                                    <div
                                        className="rounded-lg flex h-[100px] justify-center items-center"
                                        style={{
                                            backgroundColor:
                                                templateItem.background,
                                        }}
                                    >
                                        <div className="flex items-center justify-center">
                                            <div
                                                className="w-12 h-12 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        templateItem.text,
                                                }}
                                            ></div>

                                            <div
                                                className="w-12 h-12 rounded-full -ml-3"
                                                style={{
                                                    backgroundColor:
                                                        templateItem.primary,
                                                }}
                                            ></div>

                                            <div
                                                className="w-12 h-12 rounded-full -ml-3"
                                                style={{
                                                    backgroundColor:
                                                        templateItem.secondary,
                                                }}
                                            ></div>

                                            <div
                                                className="w-12 h-12 rounded-full -ml-3"
                                                style={{
                                                    backgroundColor:
                                                        templateItem.accent,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <span
                                        className="absolute top-0 left-0 p-3 text-xs"
                                        style={{
                                            color: templateItem.text,
                                        }}
                                    >
                                        {templateItem.name}
                                    </span>
                                </div>
                            ))}

                            {!isAtTop && (
                                <div className="fixed bottom-7 right-10 px-3 py-2 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                                    <span
                                        className="text-xs text-gray-600 flex items-center gap-2 cursor-pointer"
                                        onClick={() => {
                                            scrollContainerRef.current?.scrollTo(
                                                {
                                                    top: 0,
                                                    behavior: "smooth",
                                                }
                                            );
                                        }}
                                    >
                                        Top <ArrowUp />
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* add modal */}
            {addURLModal && (
                <Modal
                    title="Add URL"
                    onClose={() => {
                        setNewUrl("");
                        setNewUrlTitle("");
                        setAddURLModal(false);
                    }}
                    onSave={handleAddURL}
                    content={
                        <div className="flex flex-col gap-4">
                            {newUrl !== "" && (
                                <div className="flex items-center justify-center">
                                    <div className="relative w-20 h-20 rounded-sm">
                                        <input
                                            id="newUrlImageInput"
                                            type="file"
                                            accept="image/*"
                                            className="hidden w-full shadow-sm rounded-md px-2 hover:cursor-pointer hover:color-primary"
                                            onChange={(e) => {
                                                const file =
                                                    e.target.files?.[0];
                                                if (file) {
                                                    setNewUrlImage({
                                                        preview:
                                                            URL.createObjectURL(
                                                                file
                                                            ),
                                                        file: file,
                                                    });
                                                }
                                            }}
                                        />
                                        {newUrlImage?.preview ? (
                                            <div className="w-20 h-20 rounded-sm border border-gray-200">
                                                <img
                                                    src={newUrlImage?.preview}
                                                    alt="URL Image"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 rounded-sm border border-gray-200">
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
                                                    <span className="text-sm">
                                                        No Image
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <div
                                            className="absolute -top-5 -right-2 rounded-full bg-white group hover:bg-gray-200 cursor-pointer shadow-md h-9 w-9 text-center flex justify-center items-center"
                                            onClick={() => {
                                                if (newUrlImage?.file == null) {
                                                    document
                                                        .getElementById(
                                                            "newUrlImageInput"
                                                        )
                                                        ?.click();
                                                } else {
                                                    setNewUrlImage({
                                                        preview:
                                                            getFaviconUrl(
                                                                newUrl
                                                            ),
                                                        file: null as any,
                                                    });
                                                }
                                            }}
                                        >
                                            <span className="text-xs text-gray-800">
                                                {/* {newUrlImage?.preview ? (
                                                <CloseCircle />
                                            ) : (
                                                <Edit />
                                            )} */}

                                                {newUrlImage?.file == null ? (
                                                    <Edit />
                                                ) : (
                                                    <CloseCircle />
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <TextField
                                placeholder="URL"
                                type="text"
                                value={newUrl}
                                onChange={(e) => {
                                    setNewUrl(e.target.value);
                                    // Only update the preview if no file is selected
                                    if (!newUrlImage?.file) {
                                        setNewUrlImage({
                                            preview: getFaviconUrl(
                                                e.target.value
                                            ),
                                            file: null as any,
                                        });
                                    }
                                }}
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
                    onClose={() => {
                        setNewUrl("");
                        setNewUrlTitle("");
                        setEditUrlImage(null);
                        setEditURLModal(false);
                    }}
                    onSave={handleUpdateURL}
                    content={
                        <div className="flex flex-col gap-4">
                            {newUrl !== "" && (
                                <div className="flex items-center justify-center">
                                    <div className="relative w-20 h-20 rounded-sm">
                                        <input
                                            id="editUrlImageInput"
                                            type="file"
                                            accept="image/*"
                                            className="hidden w-full shadow-sm rounded-md px-2 hover:cursor-pointer hover:color-primary"
                                            onChange={(e) => {
                                                const file =
                                                    e.target.files?.[0];
                                                if (file) {
                                                    setEditUrlImage({
                                                        preview:
                                                            URL.createObjectURL(
                                                                file
                                                            ),
                                                        file: file,
                                                    });
                                                }
                                            }}
                                        />
                                        {editUrlImage?.preview ? (
                                            <div className="w-20 h-20 rounded-sm border border-gray-200">
                                                <img
                                                    src={editUrlImage?.preview}
                                                    alt="URL Image"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 rounded-sm border border-gray-200">
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
                                                    <span className="text-sm">
                                                        No Image
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <div
                                            className="absolute -top-5 -right-2 rounded-full bg-white group hover:bg-gray-200 cursor-pointer shadow-md h-9 w-9 text-center flex justify-center items-center"
                                            onClick={() => {
                                                if (
                                                    editUrlImage?.file == null
                                                ) {
                                                    document
                                                        .getElementById(
                                                            "editUrlImageInput"
                                                        )
                                                        ?.click();
                                                } else {
                                                    setEditUrlImage({
                                                        preview:
                                                            getFaviconUrl(
                                                                newUrl
                                                            ),
                                                        file: null as any,
                                                    });
                                                }
                                            }}
                                        >
                                            <span className="text-xs text-gray-800">
                                                {editUrlImage?.file == null ? (
                                                    <Edit />
                                                ) : (
                                                    <CloseCircle />
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <TextField
                                placeholder="URL"
                                type="text"
                                value={newUrl}
                                onChange={(e) => {
                                    setNewUrl(e.target.value);
                                    // Only update the preview if no file is selected
                                    if (!editUrlImage?.file) {
                                        setEditUrlImage({
                                            preview: getFaviconUrl(
                                                e.target.value
                                            ),
                                            file: null as any,
                                        });
                                    }
                                }}
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

            {/* user alias modal */}
            {userAliasEdit && (
                <Modal
                    title="User Alias"
                    onClose={() => {
                        setUserAliasOnEdit({
                            name: "",
                            image: "",
                            imageFile: null,
                        });
                        setUserAliasEdit(false);
                    }}
                    onSave={() => {
                        if (
                            userAliasOnEdit?.name &&
                            userAliasOnEdit.name.length >= 5
                        ) {
                            setUserAlias(userAliasOnEdit);
                            setUserAliasOnEdit({
                                name: "",
                                image: "",
                                imageFile: null,
                            });
                            setUserAliasEdit(false);
                        } else {
                            toast.error("Name must be at least 5 characters");
                        }
                    }}
                    content={
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-center">
                                <div className="relative w-15 h-15">
                                    <input
                                        id="userAliasImageInput"
                                        type="file"
                                        accept="image/*"
                                        className="hidden w-full shadow-sm rounded-md px-2 hover:cursor-pointer hover:color-primary"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                // Create a preview URL for the image
                                                const imageUrl =
                                                    URL.createObjectURL(file);
                                                setUserAliasOnEdit({
                                                    name:
                                                        userAliasOnEdit?.name ||
                                                        "",
                                                    image: imageUrl,
                                                    imageFile: file,
                                                });
                                            }
                                        }}
                                    />
                                    {userAliasOnEdit?.image ? (
                                        <div className="w-15 h-15 rounded-full">
                                            <img
                                                src={userAliasOnEdit?.image}
                                                alt="User Alias"
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex justify-center items-center relative">
                                            <div className="w-15 h-15 rounded-full bg-gray-200 flex items-center justify-center">
                                                <User className="w-8 h-8 text-gray-500" />
                                            </div>
                                        </div>
                                    )}

                                    <div
                                        className="absolute -top-5 -right-2 rounded-full bg-white group hover:bg-gray-200 cursor-pointer shadow-md h-9 w-9 text-center flex justify-center items-center"
                                        onClick={() => {
                                            if (userAliasOnEdit?.image) {
                                                setUserAliasOnEdit({
                                                    name:
                                                        userAliasOnEdit?.name ||
                                                        "",
                                                    image: "",
                                                    imageFile: null,
                                                });
                                            } else {
                                                document
                                                    .getElementById(
                                                        "userAliasImageInput"
                                                    )
                                                    ?.click();
                                            }
                                        }}
                                    >
                                        <span className="text-xs text-gray-800">
                                            {userAliasOnEdit?.image ? (
                                                <CloseCircle />
                                            ) : (
                                                <Edit />
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <TextField
                                placeholder="User Alias"
                                type="text"
                                value={userAliasOnEdit?.name}
                                onChange={(e) =>
                                    setUserAliasOnEdit({
                                        name: e.target.value,
                                        image: userAliasOnEdit?.image || "",
                                        imageFile:
                                            userAliasOnEdit?.imageFile || null,
                                    })
                                }
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
                            <span className="text-2xl text-black text-center">
                                Are you sure you want to save?
                            </span>
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
