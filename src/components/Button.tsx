import React from "react";

const Button = (props: {
    text: string;
    onClick?: () => void;
    className?: string;
    variant?: "primary" | "secondary" | "tertiary" | "ghost";
    width?: "full" | "auto";
    type?: "button" | "submit" | "reset";
    icon?: React.ReactNode;
    rounded?: "sm" | "md" | "lg" | "full";
    size?: "sm" | "md" | "lg";
}) => {
    return (
        <button
            type={props.type || "button"}
            onClick={props.onClick}
            className={`${
                props.className
                    ? props.className
                    : `py-2 px-4 font-display cursor-pointer text-base ${
                          props.width === "full" ? "w-full" : "w-auto"
                      } ${
                          props.variant === "primary"
                              ? "bg-primary hover:bg-primary/80 active:bg-primary/90 text-white"
                              : props.variant === "secondary"
                              ? "bg-gray-500 hover:bg-gray-500/80 active:bg-gray-500/90 text-white"
                              : props.variant === "tertiary"
                              ? "bg-gray-500 hover:bg-gray-500/80 active:bg-gray-500/90 text-white"
                              : "bg-transparent hover:bg-black/10 active:bg-black/20 text-black"
                      } ${
                          props.rounded === "sm"
                              ? "rounded-sm"
                              : props.rounded === "md"
                              ? "rounded-md"
                              : props.rounded === "full"
                              ? "rounded-full"
                              : "rounded-lg"
                      } ${
                          props.size === "sm"
                              ? "text-sm py-1 px-2"
                              : props.size === "md"
                              ? "text-base py-2 px-4"
                              : props.size === "lg"
                              ? "text-lg py-3 px-6"
                              : ""
                      } ${props.icon ? "flex items-center gap-2" : ""}`
            }
            } `}
        >
            {props.icon && props.icon}
            {props.text}
        </button>
    );
};

export default Button;
