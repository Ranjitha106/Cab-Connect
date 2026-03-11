"use client";
import { useState } from 'react';
import api from '../../services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'rider'
  });

  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/signup', formData);
      alert("Account created successfully!");
      router.push('/login');
    } catch (err) {
      alert("Signup failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl">
        
        <h1 className="text-4xl font-black italic mb-2 tracking-tighter text-white">
          UBER
        </h1>

        <p className="text-zinc-400 mb-8">
          Create your account to start riding
        </p>

        <form onSubmit={handleSignup} className="space-y-4">

          <input
            type="text"
            placeholder="Full Name"
            required
            className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-white focus:bg-zinc-800 transition"
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />

          <input
            type="email"
            placeholder="Email Address"
            required
            className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-white focus:bg-zinc-800 transition"
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            required
            className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-white focus:bg-zinc-800 transition"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          <div className="flex bg-zinc-800 p-1 rounded-xl border border-zinc-700">
            
            <button
              type="button"
              className={`flex-1 py-3 rounded-lg font-bold transition ${
                formData.role === "rider"
                  ? "bg-white text-black"
                  : "text-zinc-400"
              }`}
              onClick={() =>
                setFormData({ ...formData, role: "rider" })
              }
            >
              Rider
            </button>

            <button
              type="button"
              className={`flex-1 py-3 rounded-lg font-bold transition ${
                formData.role === "driver"
                  ? "bg-white text-black"
                  : "text-zinc-400"
              }`}
              onClick={() =>
                setFormData({ ...formData, role: "driver" })
              }
            >
              Driver
            </button>

          </div>

          <button className="w-full bg-white text-black p-4 rounded-xl font-black text-lg hover:bg-zinc-200 transition-all active:scale-95">
            SIGN UP
          </button>

        </form>

        <p className="mt-8 text-center text-zinc-500 text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-white font-bold underline"
          >
            Log In
          </Link>
        </p>

      </div>
    </div>
  );
}