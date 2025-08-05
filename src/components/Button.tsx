import React from "react";

const Button = (props: {
    text: string;
    onClick: () => void;
    className?: string;
    variant?: "primary" | "secondary" | "tertiary" | "ghost";
}) => {
    return (
        <button
            onClick={props.onClick}
            className={`${
                props.className ??
                `rounded-lg py-2 px-4 font-display cursor-pointer ${
                    props.variant === "primary"
                        ? "bg-primary hover:bg-primary/80 active:bg-primary/90 text-white"
                        : props.variant === "secondary"
                        ? "bg-gray-500 hover:bg-gray-500/80 active:bg-gray-500/90 text-white"
                        : props.variant === "tertiary"
                        ? "bg-gray-500 hover:bg-gray-500/80 active:bg-gray-500/90 text-white"
                        : "bg-transparent hover:bg-black/10 active:bg-black/20 text-black"
                }`
            } `}
        >
            {props.text}
        </button>
    );
};

export default Button;
