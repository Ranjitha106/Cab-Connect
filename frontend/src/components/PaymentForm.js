"use client"

import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { useState } from "react"
import api from "../services/api"
import { useSocket } from "../context/SocketContext"

export default function PaymentForm({ fare, rideId, onSuccess }) {

  const stripe = useStripe()
  const elements = useElements()
  const socket = useSocket()

  const [loading,setLoading] = useState(false)

  const handleSubmit = async (e) => {

    e.preventDefault()

    if(!stripe || !elements) return

    setLoading(true)

    try{

      // 1️⃣ ask backend to create payment intent
      const {data} = await api.post("/rides/create-payment-intent",{
        amount: fare,
        rideId
      })

      // 2️⃣ confirm payment
      const result = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method:{
            card: elements.getElement(CardElement)
          }
        }
      )

      if(result.error){

        alert(result.error.message)

      }else if(result.paymentIntent.status==="succeeded"){

  socket.emit("confirmPayment",{
    rideId
  })

  onSuccess()

}

    }catch(err){

      console.error(err)
      alert("Payment failed")

    }

    setLoading(false)

  }

  return (

    <form onSubmit={handleSubmit} className="space-y-6">

      <div className="p-4 border rounded-xl bg-gray-50">
        <CardElement options={{style:{base:{fontSize:"16px"}}}} />
      </div>

      <button
        disabled={loading}
        className="w-full bg-black text-white p-4 rounded-xl font-bold"
      >
        {loading ? "Processing..." : `Pay ₹${fare}`}
      </button>

    </form>

  )

}