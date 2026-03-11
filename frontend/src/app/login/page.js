"use client";
import { useState } from "react";
import api from "../../services/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {

      const res = await api.post("/auth/login", {
        email,
        password
      });

      // ✅ Store token and user PER TAB
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));

      const role = res.data?.user?.role;

      // Redirect based on role
      if (role === "driver") {
        router.push("/driver-dashboard");
      } else {
        router.push("/rider-dashboard");
      }

    } catch (err) {
      alert("Login failed. Check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl">

        <h1 className="text-4xl font-black italic mb-6 text-white">
          UBER
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="email"
            placeholder="Email Address"
            required
            className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:ring-1 focus:ring-white"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            required
            className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:ring-1 focus:ring-white"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full bg-white text-black p-4 rounded-xl font-black hover:bg-zinc-200 transition">
            LOG IN
          </button>

        </form>

        <p className="mt-6 text-center text-zinc-500 text-sm">
          New here?{" "}
          <Link href="/signup" className="text-white font-bold underline">
            Create account
          </Link>
        </p>

      </div>
    </div>
  );
}