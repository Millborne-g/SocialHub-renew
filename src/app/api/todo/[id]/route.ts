import connectMongo from "../../../../lib/mongodb";
import Todo from "../../../../schema/todo";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function DELETE(request: NextRequest, {params}: {params: {id: string}}) {
  try{
    const {id} = params;
    await connectMongo();
    await Todo.findByIdAndDelete(id);
    revalidatePath("/todo");
    return NextResponse.json({message: "Todo deleted successfully"}, {status: 200});
  } catch(error){
    return NextResponse.json({error: "Failed to delete todo"}, {status: 500});
  }
}

export async function PUT(request: NextRequest, {params}: {params: {id: string}}) {
  try{
    const {id} = params;
    const {completed} = await request.json();
    await connectMongo();
    await Todo.findByIdAndUpdate(id, {completed: completed});
    revalidatePath("/todo");
    return NextResponse.json({message: "Todo updated successfully"}, {status: 200});
  } catch(error){
    return NextResponse.json({error: "Failed to update todo"}, {status: 500});
  }
}