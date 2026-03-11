"use client";
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

export default function ProfilePage() {

  const [user, setUser] = useState(null);

  useEffect(() => {

    const fetchProfile = async () => {

      try {

        const res = await api.get("/auth/profile");

        setUser(res.data);

      } catch (err) {

        console.error("Profile fetch error", err);

      }

    };

    fetchProfile();

  }, []);

  if (!user) {
    return (
      <div className="bg-black h-screen flex items-center justify-center text-white">
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      <main className="flex-1 flex flex-col items-center justify-center p-8 ml-20">

        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-10 shadow-2xl">

          <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-zinc-700">
            <span className="text-4xl">👤</span>
          </div>

          <h1 className="text-3xl font-black italic text-center mb-8 tracking-tighter uppercase">
            Account Info
          </h1>

          <div className="space-y-6">

            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Full Name
              </label>
              <p className="text-lg font-bold">
                {user.name}
              </p>
            </div>

            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Email Address
              </label>
              <p className="text-lg font-bold">
                {user.email}
              </p>
            </div>

            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Account Role
              </label>

              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    user.role === "driver"
                      ? "bg-emerald-500 text-black"
                      : "bg-white text-black"
                  }`}
                >
                  {user.role}
                </span>
              </div>

            </div>

          </div>

          <button
            onClick={() => window.history.back()}
            className="w-full mt-10 py-4 bg-zinc-800 hover:bg-zinc-700 transition rounded-2xl font-black text-sm uppercase tracking-widest"
          >
            Go Back
          </button>

        </div>

      </main>
    </div>
  );
}