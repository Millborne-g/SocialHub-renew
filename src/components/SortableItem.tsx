import { useSortable } from "@dnd-kit/sortable";
import React from "react";

const SortableItem = (props: any) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: props.id });
    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
        width: "100px",
        height: "100px",
        border: "2px solid red",
        backgroundColor: "#cccccc",
        margin: "10px",
        zIndex: isDragging ? "100" : "auto",
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div>
            <div ref={setNodeRef} style={style}>
                <div>
                    <button {...listeners} {...attributes}>
                        Drag handle
                    </button>
                    <div
                        style={{
                            minWidth: "30px",
                            minHeight: "20px",
                            border: "1px solid balck",
                            borderColor: "black",
                        }}
                    >
                        {props.value}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SortableItem;
