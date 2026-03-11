"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';

const Map = dynamic(() => import("../../components/Map"), { ssr: false });

export default function DriverDashboard() {

  const socket = useSocket();
  const [incomingRide, setIncomingRide] = useState(null);
  const [currentRide, setCurrentRide] = useState(null);

  const [paymentStatus, setPaymentStatus] = useState("idle");

  const [reviewData, setReviewData] = useState(null);

  const [driverLocation, setDriverLocation] = useState(null);

  /* SOCKET EVENTS */

  useEffect(() => {

    if (!socket) return;

    const handleNewRide = (data) => {
      setIncomingRide(data);
    };

    /* ⭐ RIDER CANCELLED REQUEST */
    const handleRemoveRide = (data) => {
      setIncomingRide((prev) => {
        if (prev && prev.id === data.ride_id) {
          return null; // clears ride card
        }
        return prev;
      });
    };

    const handlePayment = () => {
      setPaymentStatus("received");
    };

    const handleReview = (data) => {
      console.log("Review received:", data);
      setReviewData(data);
      setPaymentStatus("idle");
    };

    socket.on('newRide', handleNewRide);
    socket.on("removeRide", handleRemoveRide);
    socket.on("paymentConfirmed", handlePayment);
    socket.on("new_review_submitted", handleReview);

    return () => {
      socket.off('newRide', handleNewRide);
      socket.off('removeRide', handleRemoveRide);
      socket.off("paymentConfirmed", handlePayment);
      socket.off("new_review_submitted", handleReview);
    };

  }, [socket]);


 const handleDismissReview = () => {
  setReviewData(null);
  setPaymentStatus("idle");

  setCurrentRide(null);
};


  /* DRIVER LIVE LOCATION */

  useEffect(() => {

    let watchId;

    if (currentRide && socket) {

      watchId = navigator.geolocation.watchPosition(

        (position) => {

          const { latitude, longitude } = position.coords;

          setDriverLocation([latitude, longitude]);

          socket.emit('driver_location_update', {
            rideId: currentRide.id,
            lat: latitude,
            lng: longitude
          });

          api.post('/rides/updateDriverLocation', {
            lat: latitude,
            lng: longitude
          });

        },

        (error) => console.error(error),

        {
          enableHighAccuracy: true
        }

      );

    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };

  }, [currentRide, socket]);


  /* ACCEPT RIDE */

  const handleAccept = async () => {

    try {

      await api.post('/rides/acceptRide', { ride_id: incomingRide.id });

      setCurrentRide(incomingRide);
      setIncomingRide(null);

      alert("Ride Accepted! Navigate to pickup.");

      socket.emit('driver_accepted', {
        rideId: incomingRide.id
      });

    } catch (err) {

      alert("Error accepting ride.");

    }

  };


  const handleCancelRequest = () => {
    setIncomingRide(null);
  };


const handleCompleteRide = async () => {
  try {

    const rideId = currentRide.id;

    await api.post("/rides/completeRide", { rideId });

    socket.emit("rideCompleted", { rideId });

    setPaymentStatus("waiting");

  } catch (err) {
    console.error(err);
  }
};


  return (

    <div className="flex h-screen bg-black overflow-hidden text-white">

      <Sidebar />

      <div className="flex-1 relative ml-20">

        {/* HEADER PANEL */}
        <div className="absolute top-8 left-8 z-[1000] space-y-4">

          <h1 className="text-3xl font-black italic drop-shadow-md">
            DRIVER MODE
          </h1>

          <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl inline-block">
            <p className="text-emerald-500 font-bold uppercase tracking-widest text-xs">
              ● Status: Active & Online
            </p>
          </div>

        </div>


        {/* CARD PANEL */}
        <div className="absolute top-32 left-8 z-[1000] w-96">

          {reviewData ? (

            <div className="bg-zinc-900/95 backdrop-blur-md p-8 rounded-2xl border border-emerald-500 shadow-2xl">

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Trip Feedback</h2>
                <div className="bg-emerald-500 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase">
                  New
                </div>
              </div>

              <div className="space-y-4 mb-8">

                <div className="flex gap-1 text-yellow-400 text-xl">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>{i < reviewData.rating ? "★" : "☆"}</span>
                  ))}
                </div>

                <p className="text-zinc-300 italic text-sm">
                  "{reviewData.comment || "No comment provided"}"
                </p>

                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                  — {reviewData.userName || "A Rider"}
                </p>

              </div>

              <button
                onClick={handleDismissReview}
                className="w-full bg-white text-black py-4 rounded-xl font-black"
              >
                OK, BACK TO WORK
              </button>

            </div>

          ) : incomingRide ? (

            <div className="bg-zinc-900/95 backdrop-blur-md p-8 rounded-2xl border border-zinc-800 shadow-2xl">

              <h2 className="text-xl font-bold mb-4">
                New Ride Request!
              </h2>

              <div className="space-y-3 text-zinc-400 mb-8 text-sm">

                <p>
                  Pickup:
                  <span className="text-white font-medium ml-2">
                    {incomingRide.pickup}
                  </span>
                </p>

                <p>
                  Destination:
                  <span className="text-white font-medium ml-2">
                    {incomingRide.destination}
                  </span>
                </p>

              </div>

              <div className="space-y-3">

                <button
                  onClick={handleAccept}
                  className="w-full bg-white text-black py-4 rounded-xl font-black"
                >
                  ACCEPT RIDE
                </button>

                <button
                  onClick={handleCancelRequest}
                  className="w-full border border-zinc-700 text-zinc-400 py-3 rounded-xl font-bold"
                >
                  CANCEL RIDE
                </button>

              </div>

            </div>

          ) : currentRide ? (

            <div className="bg-zinc-900/95 backdrop-blur-md p-8 rounded-2xl border border-zinc-800 shadow-2xl">

              <h2 className="text-xl font-bold mb-4">
                Active Ride
              </h2>

              {paymentStatus === "waiting" ? (

                <div className="text-amber-500 font-bold py-4 text-center">
                  ⌛ Waiting for Payment...
                </div>

              ) : paymentStatus === "received" ? (

                <div className="text-emerald-500 font-bold py-4 text-center">
                  ✅ Payment Received!
                </div>

              ) : (

                <>
                  <p className="text-zinc-400 text-sm">
                    Go to:
                    <span className="text-white font-medium ml-2">
                      {currentRide.pickup}
                    </span>
                  </p>

                  <button
                    onClick={handleCompleteRide}
                    className="w-full mt-6 bg-emerald-600 text-white py-4 rounded-xl font-bold"
                  >
                    COMPLETE RIDE
                  </button>
                </>
              )}

            </div>

          ) : (

            <div className="bg-black/50 backdrop-blur-sm p-6 rounded-2xl border border-zinc-800 flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-zinc-800 border-t-white rounded-full animate-spin mb-3"></div>
              <p className="text-zinc-500 text-xs font-medium">
                Waiting for requests...
              </p>
            </div>

          )}

        </div>


        {/* MAP */}
        <div className="h-full w-full">

          <Map
            center={[12.2958, 76.6394]}
            zoom={13}
            pickupCoords={currentRide?.pickupCoords || null}
            destCoords={currentRide?.destCoords || null}
            driverLocation={driverLocation}
          />

        </div>

      </div>

    </div>

  );

}