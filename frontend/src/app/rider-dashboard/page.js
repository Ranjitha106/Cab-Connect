"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import { useSocket } from "../../context/SocketContext";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "../../components/PaymentForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

const Map = dynamic(() => import("../../components/Map"), { ssr: false });

export default function RiderDashboard() {

const socket = useSocket();

/* JOIN RIDER ROOM */
useEffect(() => {

  if(!socket) return;

  const riderId = localStorage.getItem("userId");

  if(riderId){
    socket.emit("joinRider",{ riderId:riderId });
  }

},[socket]);

const [pickup,setPickup] = useState("");
const [destination,setDestination] = useState("");

const [pickupCoords,setPickupCoords] = useState(null);
const [destCoords,setDestCoords] = useState(null);

const [center,setCenter] = useState([28.6139,77.209]);

const [driverLocation,setDriverLocation] = useState(null);

const [fare,setFare] = useState(null);

/* ⭐ PROMO STATES */
const [promoCode,setPromoCode] = useState("");
const [discountApplied,setDiscountApplied] = useState(false);
const [originalFare,setOriginalFare] = useState(0);

const [rideStatus,setRideStatus] = useState("idle");
const [driverInfo,setDriverInfo] = useState(null);

/* ⭐ KEEP TRACK OF RIDE ID */
const [rideId,setRideId] = useState(null);

/* ⭐ RATING STATES */
const [showRating,setShowRating] = useState(false);
const [rating,setRating] = useState(0);
const [comment,setComment] = useState("");

/* 🆘 SOS STATE */
const [sosSent,setSosSent] = useState(false);

const handleSOS = () => {

  setSosSent(true);

  setTimeout(()=>{
    setSosSent(false);
  },5000);

};

/* ⭐ CALCULATE FARE */
const calculateFare = () => {

  const baseFare = Math.floor(Math.random()*(500-100+1)+100);

  setOriginalFare(baseFare);
  setFare(baseFare);

};

/* ⭐ AUTO CALCULATE WHEN LOCATIONS CHANGE */

useEffect(()=>{

if(pickupCoords && destCoords){
  calculateFare();
}

},[pickupCoords,destCoords]);

/* ⭐ APPLY PROMO */

const applyPromo = ()=>{

if(promoCode.toUpperCase()==="SAVE50"){

const discountedPrice = Math.floor(originalFare * 0.5);

setFare(discountedPrice);
setDiscountApplied(true);

alert("Promo applied! 50% discount added.");

}else{

alert("Invalid promo code");

setFare(originalFare);
setDiscountApplied(false);

}

};

/* SOCKET EVENTS */

useEffect(()=>{

if(!socket) return;

/* DRIVER ACCEPTED */

socket.on("driverFound",(data)=>{

console.log("Driver found:",data);

setDriverInfo({
  name: data.name,
  id: data.driver_id || data.driverId
});

setRideStatus("inRide");

});

/* DRIVER LOCATION */

socket.on("driverLocationUpdate",(data)=>{

setDriverLocation({
lat:data.lat,
lng:data.lng
});

});

/* RIDE COMPLETED */

socket.on("rideCompleted",()=>{

console.log("Ride completed");

setRideStatus("payment");

});

return ()=>{

socket.off("driverFound");
socket.off("driverLocationUpdate");
socket.off("rideCompleted");

};

},[socket]);

/* SEARCH LOCATION */

const handleSearch = async(query,type)=>{

if(!query) return;

try{

const res = await fetch(
`https://nominatim.openstreetmap.org/search?format=json&q=${query}`
);

const data = await res.json();

if(data.length>0){

const {lat,lon,display_name} = data[0];

const coords = [parseFloat(lat),parseFloat(lon)];

setCenter(coords);

if(type==="pickup"){

setPickup(display_name);
setPickupCoords(coords);

}else{

setDestination(display_name);
setDestCoords(coords);

}

}

}catch(err){

console.error(err);

}

};

/* REQUEST RIDE */

const requestRide = async()=>{

if(!pickupCoords || !destCoords){

alert("Please select pickup and destination");
return;

}

try{

setRideStatus("searching");

const res = await api.post("/rides/requestRide",{

pickup,
destination,
pickupCoords,
destCoords,
fare:fare

});

setRideId(res.data.id);

}catch(err){

console.error(err);
alert("Ride request failed");

setRideStatus("idle");

}

};

/* ⭐ CANCEL RIDE */

const handleCancelRide = async () => {

try{

await api.post("/rides/cancelRide",{ ride_id:rideId });

socket.emit("cancelRide",{ rideId:rideId });

setRideStatus("idle");
setRideId(null);

alert("Ride canceled successfully");

}catch(err){

console.error(err);
alert("Error canceling ride");

}

};

/* ⭐ PAYMENT SUCCESS → OPEN RATING */

const handlePaymentSuccess = () => {

socket.emit("confirmPayment",{ rideId:1 });

setShowRating(true);

setRideStatus("idle");

};

/* ⭐ UPDATED SUBMIT REVIEW */

const submitReview = async () => {
  try {

    const storedUserRaw =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;

    const userName = storedUser?.name || "Anonymous Rider";

    const reviewPayload = {
      driverId: driverInfo?.id,
      rating: rating,
      comment: comment,
      userName: userName
    };

    if (!reviewPayload.driverId) {
      console.error("Driver ID missing for review");
      return;
    }

    await api.post("/rides/submit-review", reviewPayload);

    socket.emit("new_review_submitted", reviewPayload);

    setShowRating(false);

    alert("Thank you for your feedback!");

  } catch (err) {

    console.error("Review failed", err);
    alert("Could not submit feedback at this time.");

  }
};

return(

<div className="flex h-screen bg-black overflow-hidden font-sans">

<Sidebar/>

<div className="flex-1 relative ml-20">

{/* 🆘 SOS BUTTON */}

{rideStatus==="inRide" && (
<>
<button 
onClick={handleSOS}
className="absolute top-6 right-6 z-[2000] bg-red-600 hover:bg-red-700 text-white font-black px-6 py-3 rounded-full shadow-2xl animate-pulse flex items-center gap-2 transition-transform active:scale-90"
>
<span className="text-xl">🚨</span> SOS
</button>

{sosSent && (
<div className="absolute top-24 right-6 z-[2000] bg-zinc-900 border border-red-500/50 p-4 rounded-2xl shadow-2xl">
<p className="text-white text-sm font-bold flex items-center gap-2">
<span className="text-emerald-500 text-lg">✔</span>
Live location sent to emergency contact!
</p>
</div>
)}
</>
)}

{/* IDLE PANEL */}

{rideStatus==="idle" && (

<div className="absolute top-6 left-6 z-[1000] bg-white p-6 rounded-2xl shadow-2xl w-96 border border-gray-100">

<h2 className="text-2xl font-black italic mb-6 text-black tracking-tighter">
UBER
</h2>

<div className="space-y-4">

<div>

<label className="text-xs font-bold text-gray-500">
Pickup
</label>

<input
type="text"
placeholder="Enter pickup location"
onBlur={(e)=>handleSearch(e.target.value,"pickup")}
className="w-full mt-1 p-4 bg-white border border-gray-300 rounded-xl text-black"
/>

</div>

<div>

<label className="text-xs font-bold text-gray-500">
Destination
</label>

<input
type="text"
placeholder="Where to?"
onBlur={(e)=>handleSearch(e.target.value,"dest")}
className="w-full mt-1 p-4 bg-white border border-gray-300 rounded-xl text-black"
/>

</div>

{/* ⭐ ESTIMATED FARE */}

<div className="pt-4 border-t border-gray-100">

<div className="flex justify-between items-center mb-2">

<span className="text-xs font-bold text-gray-400 uppercase">
Estimated Fare
</span>

<span className={`font-black ${discountApplied ? "text-emerald-500":"text-black"}`}>
₹{fare || "--"}
</span>

</div>

<div className="flex gap-2 mb-4">

<input
type="text"
placeholder="Promo Code (SAVE50)"
className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black uppercase outline-none focus:border-black"
onChange={(e)=>setPromoCode(e.target.value)}
/>

<button
onClick={applyPromo}
className="px-4 bg-zinc-100 hover:bg-zinc-200 text-black text-xs font-bold rounded-xl transition"
>
APPLY
</button>

</div>

</div>

<button
onClick={requestRide}
className="w-full bg-black text-white p-4 rounded-xl font-bold hover:bg-zinc-800"
>

Request Ride

</button>

</div>

</div>

)}

{/* SEARCHING PANEL */}

{rideStatus==="searching" && (

<div className="absolute top-6 left-6 z-[1000] bg-white p-8 rounded-2xl shadow-2xl w-96 text-center border border-zinc-100">

<div className="animate-spin h-10 w-10 border-4 border-black border-t-transparent rounded-full mx-auto mb-4"></div>

<p className="font-bold text-black mb-6">
Searching for drivers...
</p>

<button 
onClick={handleCancelRide}
className="w-full bg-red-500 text-white p-3 rounded-xl font-bold hover:bg-red-600 transition"
>
Cancel Request
</button>

</div>

)}

{/* IN RIDE PANEL */}

{rideStatus==="inRide" && (

<div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] bg-white p-6 rounded-3xl shadow-2xl w-[420px]">

<h3 className="text-xl font-black text-black mb-2">
Your driver is "{driverInfo?.name || "Driver"}"
</h3>

<p className="text-gray-600 mb-4 font-semibold">
You're in cab
</p>

<div className="bg-gray-100 p-4 rounded-xl flex justify-between mb-4">

<span className="text-gray-500 font-semibold">
Estimated Fare
</span>

<span className="font-bold text-black">
₹{fare}
</span>

</div>

<p className="text-center text-sm text-gray-500">
Enjoy your ride
</p>

</div>

)}

{/* PAYMENT PANEL */}

{rideStatus==="payment" && (

<div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[2000]">

<div className="bg-white p-10 rounded-3xl w-full max-w-sm text-center shadow-2xl">

<h2 className="text-3xl font-black italic mb-4">
Payment
</h2>

<p className="text-gray-500 mb-6">
Ride Completed
</p>

<div className="text-4xl font-bold mb-6">
₹{fare}
</div>

<Elements stripe={stripePromise}>

<PaymentForm
fare={fare}
rideId={1}
onSuccess={handlePaymentSuccess}
/>

</Elements>

</div>

</div>

)}

{/* ⭐ RATING MODAL */}

{showRating && (

<div className="absolute inset-0 z-[3000] bg-black/90 flex items-center justify-center p-6 backdrop-blur-md">

<div className="bg-white p-8 rounded-3xl w-full max-w-sm text-center">

<h2 className="text-2xl font-black italic mb-2">
RATE YOUR RIDE
</h2>

<p className="text-gray-500 mb-6 text-sm">
How was your trip with {driverInfo?.name}?
</p>

<div className="flex justify-center gap-2 mb-6">

{[1,2,3,4,5].map((star)=>(

<button
key={star}
onClick={()=>setRating(star)}
className={`text-3xl ${rating>=star ? "text-yellow-400":"text-gray-300"}`}
>
★
</button>

))}

</div>

<textarea
placeholder="Write a quick review..."
className="w-full p-4 bg-gray-100 border border-gray-300 rounded-xl mb-6 text-sm text-black placeholder-gray-400 outline-none focus:ring-2 focus:ring-black"
onChange={(e)=>setComment(e.target.value)}
/>

<button
onClick={submitReview}
className="w-full bg-black text-white p-4 rounded-xl font-bold uppercase tracking-widest"
>
Submit Feedback
</button>

</div>

</div>

)}

{/* MAP */}

<div className="h-full w-full">

<Map
center={center}
zoom={13}
pickupCoords={pickupCoords}
destCoords={destCoords}
driverLocation={driverLocation}
/>

</div>

</div>

</div>

);

}