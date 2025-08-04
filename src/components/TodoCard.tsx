"use client";
import React from "react";
import { useRouter } from "next/navigation";

const TodoCard = (props: { _id: string; title: string; description: string, completed: boolean }) => {
    const router = useRouter();

    const handleDelete = async () => {
        const response = await fetch(`http://localhost:3000/api/todo/${props._id}`, {
            method: "DELETE",
        });
        const data = await response.json();
        console.log(data);
        router.refresh();
    };

    const handleUpdate = async () => {
        const response = await fetch(`http://localhost:3000/api/todo/${props._id}`, {
            method: "PUT",
            body: JSON.stringify({completed: !props.completed}),
        });
        const data = await response.json();
        console.log(data);
        router.refresh();
    };

    return (
        <div className="flex gap-2 bg-amber-100 w-full p-2 rounded-md justify-between">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 w-full">
                    <input type="checkbox" checked={props.completed} onChange={handleUpdate}/>
                    <p className="text-lg font-bold">{props.title}</p>
                </div>
                <div className="flex items-center gap-2 w-full">
                    <p className="text-sm">{props.description}</p>
                </div>
            </div>
            <div className="flex">
                <button className="bg-red-500 text-white p-2 rounded-md" onClick={handleDelete}>
                    Delete
                </button>
            </div>
        </div>
    );
};

export default TodoCard;
