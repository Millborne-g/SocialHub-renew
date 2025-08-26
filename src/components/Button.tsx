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
    disabled?: boolean;
}) => {
    return (
        <button
            type={props.type || "button"}
            onClick={props.onClick}
            disabled={props.disabled}
            className={`${
                props.className
                    ? props.className
                    : `py-2 px-4 font-display cursor-pointer text-base ${
                          props.width === "full"
                              ? "w-full flex items-center justify-center"
                              : "w-auto"
                      } ${
                          props.variant === "primary"
                              ? props.disabled
                                  ? "bg-gray-400 cursor-not-allowed text-white"
                                  : "bg-primary hover:bg-primary/80 active:bg-primary/90 text-white"
                              : props.variant === "secondary"
                              ? props.disabled
                                  ? "bg-gray-400 cursor-not-allowed text-white"
                                  : "bg-gray-500 hover:bg-gray-500/80 active:bg-gray-500/90 text-white"
                              : props.variant === "tertiary"
                              ? props.disabled
                                  ? "bg-gray-400 cursor-not-allowed text-white"
                                  : "bg-gray-500 hover:bg-gray-500/80 active:bg-gray-500/90 text-white"
                              : props.disabled
                              ? "bg-gray-200 cursor-not-allowed text-gray-500"
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
