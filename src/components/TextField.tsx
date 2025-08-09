import { useState } from "react";
import { Eye, EyeSlash } from "iconsax-reactjs";

const TextField = (props: {
    type:
        | "text"
        | "password"
        | "email"
        | "number"
        | "tel"
        | "url"
        | "search"
        | "date"
        | "time"
        | "datetime-local"
        | "month"
        | "week";
    placeholder: string;
    value: string | undefined;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    width?: "full" | "auto";
    helperText?: string;
    error?: boolean;
}) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <div className={`${props.width === "full" ? "w-full" : "w-auto"}`}>
            <div
                className={`relative ${
                    props.width === "full" ? "w-full" : "w-auto"
                }`}
            >
                <input
                    className={
                        props.className
                            ? props.className
                            : `text-base w-full border border-gray-300 rounded-md p-2 peer placeholder-transparent focus:outline-none focus:border-primary`
                    }
                    type={
                        props.type === "password" && showPassword
                            ? "text"
                            : props.type
                    }
                    placeholder={props.placeholder}
                    value={props.value || ""}
                    onChange={props.onChange}
                    id="floating-input"
                />
                <label
                    htmlFor="floating-input"
                    className="absolute left-2 -top-2 bg-white text-xs text-gray-600 px-0.5 
                    transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 
                    peer-placeholder-shown:text-gray-400 peer-focus:-top-2 peer-focus:text-xs 
                    peer-focus:text-primary font-display peer-focus:bg-white"
                >
                    {props.placeholder}
                </label>

                {/* for password */}
                {props.type === "password" && (
                    <button
                        type="button"
                        className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-primary"
                        onClick={() => {
                            setShowPassword(!showPassword);
                        }}
                    >
                        {showPassword ? (
                            <Eye className="w-4 h-4" />
                        ) : (
                            <EyeSlash className="w-4 h-4" />
                        )}
                    </button>
                )}
            </div>
            {props.helperText && (
                <p className={`text-sm ${props.error ? "text-red-500" : "text-gray-500"}`}>{props.helperText}</p>
            )}
        </div>
    );
};

export default TextField;
