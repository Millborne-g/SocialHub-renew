import React from "react";
import TodoCard from "./TodoCard";

const getTodos = async () => {
    try {
        const response = await fetch("http://localhost:3000/api/todo", {
            cache: "no-store", // This ensures fresh data on each request
        });

        if (!response.ok) {
            throw new Error("Failed to fetch todos");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.log("Error fetching todos:", error);
        return [];
    }
};

const TodoList = async () => {
    const todos = await getTodos();

    return (
        <div className="flex flex-col gap-2 w-full">
            {/* Todo card */}
            {todos.map((todo: any) => (
                <div key={todo._id}>
                    <TodoCard
                        _id={todo._id}
                        title={todo.title}
                        description={todo.description}
                        completed={todo.completed}
                    />
                </div>
            ))}
        </div>
    );
};

export default TodoList;
