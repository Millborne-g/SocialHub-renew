import React from "react";

const LoadingScreen = () => {
    return (
        <div className="flex items-center justify-center h-screen z-50 bg-black/50 fixed top-0 left-0 right-0 bottom-0">
            <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
            </div>
        </div>
    );
};

export default LoadingScreen;
