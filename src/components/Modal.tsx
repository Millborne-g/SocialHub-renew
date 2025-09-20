import { CloseCircle } from "iconsax-reactjs";
import React, { ReactNode } from "react";
import Button from "./Button";

const Modal = (props: {
    title: string;
    onClose: () => void;
    onSave: () => void;
    content: ReactNode;
    noButtons?: boolean;
    template?: any;
}) => {
    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 h-screen overflow-y-auto sm:h-auto p-3 sm:p-0">
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-md"
                style={{
                    background:
                        `color-mix(in srgb, ${props.template?.background} 80%, white 20%)` ||
                        "#FFFFFF",
                }}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2
                        className="text-xl font-semibol"
                        style={{ color: props.template?.text || "#000000" }}
                    >
                        {props.title}
                    </h2>
                    <span
                        className="text-gray-700 hover:text-gray-400 cursor-pointer"
                        onClick={props.onClose}
                        style={{
                            color: props.template?.text || "#000000",
                        }}
                        onMouseEnter={(e) => {
                            if (props.template?.text) {
                                e.currentTarget.style.opacity = "0.8";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (props.template?.text) {
                                e.currentTarget.style.opacity = "1";
                            }
                        }}
                    >
                        <CloseCircle />
                    </span>
                </div>
                <div className="p-4 h-full overflow-y-auto">
                    {props.content}
                </div>
                {!props.noButtons && (
                    <div className="flex justify-end p-4 border-t border-gray-200 gap-2">
                        <Button
                            variant="secondary"
                            text="Cancel"
                            size="sm"
                            onClick={props.onClose}
                        />
                        <Button
                            variant="primary"
                            text="Save"
                            size="sm"
                            onClick={props.onSave}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
