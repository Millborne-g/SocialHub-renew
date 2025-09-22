import React from "react";

interface CustomButtonProps {
    text: string;
    onClick?: () => void;
    className?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
    text,
    onClick,
    className = "",
    icon,
    disabled = false,
}) => {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={` cursor-pointer
                group relative inline-flex items-center gap-2 px-6 py-3 
                text-lg font-medium text-white bg-primary rounded-full
                transition-all duration-300 ease-in-out
                transform hover:scale-105 hover:shadow-xl hover:shadow-primary/25
                active:scale-95 active:shadow-lg
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                overflow-hidden
                ${className}
            `}
        >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />

            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">
                {icon && (
                    <span className=" transition-transform duration-300">
                        {icon}
                    </span>
                )}
                {text}
            </span>

            {/* Ripple effect on click */}
            <div className="absolute inset-0 rounded-full bg-white/30 scale-0 group-active:scale-100 transition-transform duration-150" />
        </button>
    );
};

export default CustomButton;
