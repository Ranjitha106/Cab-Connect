"use client";
import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import Sidebar from '../components/Sidebar';

export default function DriverPage() {
  const socket = useSocket();
  const [online, setOnline] = useState(false);

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 p-10 ml-20">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-6">
          <h1 className="text-4xl font-black italic tracking-tighter">DRIVER DASHBOARD</h1>
          <button 
            onClick={() => setOnline(!online)}
            className={`px-10 py-3 rounded-full font-bold transition-all ${online ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}
          >
            {online ? 'ONLINE' : 'GO ONLINE'}
          </button>
        </div>
        
        <div className="mt-20 text-center">
          {!online && <p className="text-zinc-600 italic">You are currently offline. Tap "Go Online" to see ride requests.</p>}
        </div>
      </div>
    </div>
  );
}