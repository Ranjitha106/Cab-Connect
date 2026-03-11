"use client";
import { useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function SupportPage() {
  const [issue, setIssue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [category, setCategory] = useState("Payment Issue");

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you'd send issue/category/userId to your PostgreSQL table 'tickets'
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <main className="flex-1 flex flex-col items-center justify-center p-8 ml-20">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-10 shadow-2xl">
          <h1 className="text-3xl font-black italic text-center mb-2 tracking-tighter uppercase">Help Center</h1>
          <p className="text-zinc-500 text-center text-sm mb-8 font-bold uppercase tracking-widest">Submit a Ticket</p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-2 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-white outline-none"
                >
                  <option>Payment Issue</option>
                  <option>Lost Item</option>
                  <option>Driver Feedback</option>
                  <option>App Bug</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Describe Issue</label>
                <textarea 
                  required
                  placeholder="Tell us what happened..."
                  className="w-full mt-2 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm h-32 outline-none focus:ring-1 focus:ring-white"
                  onChange={(e) => setIssue(e.target.value)}
                />
              </div>

              <button className="w-full py-4 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-zinc-200 transition">
                Submit Issue
              </button>
            </form>
          ) : (
            <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl text-emerald-500">✓</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Issue Received!</h2>
              <p className="text-zinc-400 text-sm mb-8 px-4">
                Your ticket has been generated. Our team will look into it and get back to you shortly.
              </p>
              <button 
                onClick={() => window.history.back()}
                className="text-xs font-bold underline text-zinc-500 hover:text-white uppercase tracking-tighter"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}