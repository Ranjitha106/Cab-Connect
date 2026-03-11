"use client";
import { useState } from 'react';
import { Star } from 'lucide-react';
import api from '../../services/api';

export default function RatingModal({ rideId, onClose }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  const submitRating = async () => {
    if (rating === 0) return alert("Please select a rating");
    try {
      await api.post('/ratings/addRating', { ride_id: rideId, rating });
      alert("Feedback submitted!");
      onClose();
    } catch (err) { alert("Submission failed"); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center">
        <h2 className="text-2xl font-black mb-2">Rate your Driver</h2>
        <p className="text-gray-500 mb-8">How was your trip?</p>
        
        <div className="flex justify-center gap-2 mb-10">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={36}
              className={`cursor-pointer transition ${ (hover || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
            />
          ))}
        </div>

        <button onClick={submitRating} className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-zinc-800 transition">
          Submit
        </button>
      </div>
    </div>
  );
}