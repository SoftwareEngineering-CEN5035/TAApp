"use client";

import { useRouter } from "next/navigation";

const HomePage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col items-center justify-center">
      <header className="text-center">
        <h1 className="text-5xl font-bold text-blue-800 mb-6">
          Welcome to the TA Assistant App
        </h1>
      </header>

      <div className="flex space-x-6">
        {/* Login Button */}
        <button
          onClick={() => router.push("/login")}
          className="px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg shadow-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200"
        >
          Log In
        </button>

        {/* Signup Button */}
        <button
          onClick={() => router.push("/signup")}
          className="px-6 py-3 bg-green-600 text-white text-lg font-medium rounded-lg shadow-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition-all duration-200"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default HomePage;