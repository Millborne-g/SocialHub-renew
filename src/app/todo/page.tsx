import React from "react";
import TodoForm from "../../components/TodoForm";
import TodoList from "../../components/TodoList";

const Todo = () => {
    return (
        <div className="flex items-center h-screen p-4 flex-col w-md mx-auto gap-2">
            <h1 className="text-2xl font-bold">Todo</h1>
            {/* add todo form */}
            <TodoForm />
            <TodoList />
        </div>
    );
};

export default Todo;
