"use client";
import { useEffect, useState } from 'react';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';

export default function DriverEarnings() {
  const [stats, setStats] = useState({ totalEarnings: 0, totalRides: 0, rating: 4.8 });

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-24 p-8 w-full bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-black">Earnings Overview</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-black">
            <p className="text-gray-500 text-sm font-bold uppercase">Total Balance</p>
            <p className="text-4xl font-black mt-2">${stats.totalEarnings}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <p className="text-gray-500 text-sm font-bold uppercase">Trips Completed</p>
            <p className="text-4xl font-black mt-2">{stats.totalRides}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <p className="text-gray-500 text-sm font-bold uppercase">Driver Rating</p>
            <p className="text-4xl font-black mt-2 text-yellow-500">★ {stats.rating}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border">
          <h2 className="font-bold text-lg mb-4">Recent Payouts</h2>
          <div className="text-gray-400 text-center py-10">No recent payouts to show.</div>
        </div>
      </div>
    </div>
  );
}