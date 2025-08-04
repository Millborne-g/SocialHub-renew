import connectMongo from "../../../lib/mongodb";
import Todo from "../../../schema/todo";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
    try {
        const { title, description } = await request.json();
        await connectMongo();
        await Todo.create({ title, description, completed: false });

        // Revalidate the todo page to refresh the data
        revalidatePath("/todo");

        return NextResponse.json(
            { message: "Todo created successfully" },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create todo" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        await connectMongo();
        const todos = await Todo.find();
        return NextResponse.json(todos, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to get todos" },
            { status: 500 }
        );
    }
}
