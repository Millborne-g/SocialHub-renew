import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">This is Landing page</h1>
      <Link href="/testing" className="text-blue-500">Testing</Link>
      <Link href="/todo" className="text-blue-500">Todo</Link>
    </div>
  );
}
