"use client";
import Link from 'next/link';

export default function Home() {
  return (
    <main className="h-screen w-full flex flex-col items-center justify-center bg-black text-white px-6">
      {/* Logo */}
      <h1 className="text-7xl font-black italic mb-12 tracking-tighter select-none">
        UBER
      </h1>

      {/* Action Buttons */}
      <div className="flex flex-col w-full max-w-sm gap-4">
        <Link 
          href="/login" 
          className="bg-white text-black text-center py-4 rounded-lg font-bold text-lg hover:bg-gray-200 transition-all active:scale-95"
        >
          Sign In
        </Link>
        
        <Link 
          href="/signup" 
          className="border border-zinc-700 bg-zinc-900 text-white text-center py-4 rounded-lg font-bold text-lg hover:bg-zinc-800 transition-all active:scale-95"
        >
          Create Account
        </Link>
      </div>

      {/* Decorative footer text */}
      <p className="absolute bottom-10 text-zinc-500 text-sm font-medium">
        Ride safely with the Uber Clone
      </p>
    </main>
  );
}