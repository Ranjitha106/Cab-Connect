"use client";
import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

export default function HistoryPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [userRole, setUserRole] = useState(""); // ⭐ role state

  useEffect(() => {

    // ⭐ get user role
    const storedUser = sessionStorage.getItem("user") || localStorage.getItem("user");
    if (storedUser) {
      setUserRole(JSON.parse(storedUser).role);
    }

    const fetchHistory = async () => {
      try {
        const res = await api.get('/rides/history');
        setTrips(res.data);
      } catch (err) {
        console.error("Failed to fetch history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

  }, []);

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      <main className="flex-1 p-10 ml-20">

        <h1 className="text-4xl font-black italic mb-10 tracking-tighter uppercase">
          Your Trips
        </h1>

        {loading ? (
          <div className="animate-pulse text-zinc-500">
            Loading your journey...
          </div>

        ) : trips.length === 0 ? (

          <div className="text-zinc-500 italic">
            No completed trips found.
          </div>

        ) : (

          <div className="grid gap-6 max-w-4xl">

            {trips.map((trip) => (

              <div
                key={trip.id}
                className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex justify-between items-center hover:border-zinc-600 transition"
              >

                <div className="space-y-1">

                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                    Completed
                  </p>

                  <h3 className="text-lg font-bold">
                    {trip.destination}
                  </h3>

                  <p className="text-zinc-500 text-sm">
                    From: {trip.pickup}
                  </p>

                  <p className="text-zinc-400 text-xs mt-2">
                    With:{" "}
                    <span className="text-white font-medium">
                      {trip.other_name}
                    </span>
                  </p>

                </div>

                <div className="text-right">

                  <p className="text-2xl font-black italic">
                    ₹{trip.fare}
                  </p>

                  <button
                    onClick={() => setSelectedTrip(trip)}
                    className="mt-2 text-[10px] font-black bg-white text-black px-3 py-1 rounded uppercase tracking-tighter"
                  >
                    Receipt
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

        {/* ⭐ RECEIPT MODAL */}
        {selectedTrip && (
          <div className="fixed inset-0 z-[5000] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">

            <div className="bg-white text-black p-8 rounded-3xl w-full max-w-sm shadow-2xl relative">

              <button
                onClick={() => setSelectedTrip(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-black text-xl"
              >
                ✕
              </button>

              <div className="text-center mb-6">
                <h2 className="text-3xl font-black italic tracking-tighter">
                  UBER
                </h2>
                <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">
                  Ride Receipt
                </p>
              </div>

              <div className="space-y-4 border-t border-b border-zinc-100 py-6 mb-6">

                <div className="flex justify-between">
                  <span className="text-zinc-500 text-xs font-bold uppercase">
                    Total Fare
                  </span>
                  <span className="font-black text-lg">
                    ₹{selectedTrip.fare}
                  </span>
                </div>

                {/* ⭐ dynamic label */}
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-xs font-bold uppercase">
                    {userRole === "driver" ? "Rider" : "Driver"}
                  </span>
                  <span className="font-bold">
                    {selectedTrip.other_name}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">
                    Trip Details
                  </p>
                  <p className="text-xs">
                    <b>Pickup:</b> {selectedTrip.pickup}
                  </p>
                  <p className="text-xs">
                    <b>Dropoff:</b> {selectedTrip.destination}
                  </p>
                </div>

              </div>

              <div className="text-center text-[10px] text-zinc-400 font-bold uppercase">
                Date: {new Date(selectedTrip.created_at).toLocaleDateString()}
              </div>

              <button
                onClick={() => window.print()}
                className="w-full mt-6 py-3 bg-zinc-100 text-zinc-500 rounded-xl text-[10px] font-black uppercase hover:bg-zinc-200 transition"
              >
                Download PDF
              </button>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}