import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans dark:bg-black min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <main className="flex flex-col items-center justify-center gap-8 px-4">
        <h1 className="text-4xl font-bold text-black dark:text-zinc-50">
          College Details Viewer
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 text-center max-w-md">
          View detailed information about PSG College of Technology including programs, fees, placements, and more.
        </p>
        <Link
          href="/college-details/PSG%20College%20of%20Technology"
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-8 text-white font-semibold text-lg transition-colors hover:bg-blue-700 md:w-[200px]"
        >
          View College Details
        </Link>
      </main>
    </div>
  );
}
