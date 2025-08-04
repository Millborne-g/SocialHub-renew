"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const TodoForm = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (!title.trim() || !description.trim()) {
            alert("Please fill in both title and description");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/todo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title, description }),
            });

            if (response.ok) {
                // Clear the form
                setTitle("");
                setDescription("");

                // Refresh the page to show the new todo
                router.refresh();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || "Failed to create todo"}`);
            }
        } catch (error) {
            alert("Error creating todo. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex gap-2 w-full">
            <div className="flex flex-col gap-2 w-full">
                <input
                    type="text"
                    placeholder="Add Title"
                    className="flex-1 p-2 rounded-md border border-gray-300"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting}
                />
                <input
                    type="text"
                    placeholder="Add Description"
                    className="flex-1 p-2 rounded-md border border-gray-300"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isSubmitting}
                />
            </div>
            <button
                className={`bg-blue-500 text-white p-2 rounded-md ${
                    isSubmitting
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-blue-600"
                }`}
                onClick={(e) => handleSubmit(e)}
                disabled={isSubmitting}
            >
                {isSubmitting ? "Adding..." : "Add"}
            </button>
        </div>
    );
};

export default TodoForm;
