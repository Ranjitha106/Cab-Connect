"use client";

import Link from 'next/link';
import { User, LogOut, Map, History, DollarSign, LifeBuoy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Sidebar() {

  const router = useRouter();
  const [dashboardLink, setDashboardLink] = useState("/rider-dashboard");
  const [isRider, setIsRider] = useState(false); // ✅ Track if rider

  useEffect(() => {

    // ✅ Read from sessionStorage (per-tab storage)
    const storedUser = sessionStorage.getItem("user");

    if (storedUser) {
      const user = JSON.parse(storedUser);

      setDashboardLink(
        user.role === "driver" ? "/driver-dashboard" : "/rider-dashboard"
      );

      setIsRider(user.role === "rider"); // ✅ Only riders see support
    }

  }, []);

  const handleLogout = () => {

    // ✅ Clear session storage
    sessionStorage.clear();

    // optional safety
    localStorage.clear();

    window.location.href = "/login";

  };

  return (
    <div className="fixed left-0 top-0 h-full w-20 bg-zinc-950 border-r border-zinc-900 flex flex-col items-center py-8 z-[2000]">

      <div className="flex-1 space-y-8">

        {/* Dynamic Dashboard Link */}
        <Link href={dashboardLink} className="text-zinc-500 hover:text-white transition block">
          <Map size={24} />
        </Link>

        <Link href="/history" className="text-zinc-500 hover:text-white transition block">
          <History size={24} />
        </Link>

      </div>

      <div className="space-y-8 pb-4">

        {/* ✅ SUPPORT BUTTON (Only for Riders) */}
        {isRider && (
          <Link href="/support" className="text-zinc-500 hover:text-white transition block group relative">
            <LifeBuoy size={24} />
            <span className="absolute left-14 bg-white text-black text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
              SUPPORT
            </span>
          </Link>
        )}

        <Link href="/profile" className="text-zinc-500 hover:text-white transition block group relative">
          <User size={24} />
          <span className="absolute left-14 bg-white text-black text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
            PROFILE
          </span>
        </Link>

        <button
          onClick={handleLogout}
          className="text-zinc-500 hover:text-red-500 transition block group relative"
        >
          <LogOut size={24} />
          <span className="absolute left-14 bg-red-500 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
            LOGOUT
          </span>
        </button>

      </div>

    </div>
  );
}