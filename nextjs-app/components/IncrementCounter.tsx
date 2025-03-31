"use client";
// components/IncrementCounter.tsx
import { useState } from "react";

// Define the types for fetched data
interface FetchedData {
    // Adjust the type according to your actual API response structure
    id: number;
    name: string;
}

const IncrementCounter = () => {
    const [count, setCount] = useState<number>(0);
    const [doubledCount, setDoubledCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<FetchedData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const increment = () => {
        setCount(count + 1);
        setDoubledCount((count + 1) * 2);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch("https://jsonplaceholder.typicode.com/todos/1"); // Replace with your API endpoint
            const result: FetchedData = await response.json();
            setData(result);
            setError(null);
        } catch {
            setError("Failed to fetch data");
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto flex w-fit flex-1 flex-col items-center justify-center">
            <button onClick={increment} className="cursor-pointer rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-black">
                Increment
            </button>

            <p className="mt-4 text-lg">
                Count: <span className="font-semibold">{count}</span>
            </p>
            <p className="mt-2 text-lg">
                Doubled Count: <span className="font-semibold">{doubledCount}</span>
            </p>

            <button onClick={fetchData} className="mt-4 cursor-pointer rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-black">
                Fetch Data
            </button>

            {loading && <p className="mt-4">Loading...</p>}
            {error && <p className="mt-4 text-red-500">Error: {error}</p>}
            {data && (
                <div className="mt-4">
                    Data: <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default IncrementCounter;
