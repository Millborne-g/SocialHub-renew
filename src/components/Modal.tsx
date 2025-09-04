import { CloseCircle } from "iconsax-reactjs";
import React, { ReactNode } from "react";
import Button from "./Button";

const Modal = (props: {
    title: string;
    onClose: () => void;
    onSave: () => void;
    content: ReactNode;
}) => {
    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold">{props.title}</h2>
                    <span
                        className="text-gray-700 hover:text-gray-400 cursor-pointer"
                        onClick={props.onClose}
                    >
                        <CloseCircle />
                    </span>
                </div>
                <div className="p-4">{props.content}</div>
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
            </div>
        </div>
    );
};

export default Modal;
