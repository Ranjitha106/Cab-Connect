// const express = require("express")
// const cors = require("cors")
// const http = require("http")
// const { Server } = require("socket.io")
// require("dotenv").config()

// const rideRoutes = require("./routes/rideRoutes")
// const authRoutes = require("./routes/authRoutes")
// const paymentRoutes = require("./routes/paymentRoutes")
// const ratingRoutes = require("./routes/ratingRoutes")

// const app = express()

// app.use(cors())
// app.use(express.json())

// const server = http.createServer(app)

// const io = new Server(server, {
//   cors: {
//     origin: "*"
//   }
// })

// io.on("connection", (socket) => {

//   console.log("User connected:", socket.id)

//   // 🧑‍🦱 JOIN RIDER ROOM
//   socket.on("joinRider",(data)=>{
//     socket.join(`rider_${data.riderId}`)
//   })

//   // 🚗 DRIVER LOCATION UPDATE
//   socket.on("driver_location_update", (data) => {

//     console.log("Driver location:", data)

//     // Send location to all riders
//     io.emit("driverLocationUpdate", data)

//   })

//   // 💳 PAYMENT CONFIRMATION RELAY
//   socket.on("confirmPayment",(data)=>{

//     io.emit("paymentConfirmed",{
//       rideId:data.rideId
//     })

//   })

//   socket.on("disconnect", () => {

//     console.log("User disconnected")

//   })

// })


// // Middleware to pass socket instance to routes/controllers
// app.use((req, res, next) => {

//   req.io = io
//   next()

// })


// // ROUTES
// app.use("/rides", rideRoutes)
// app.use("/auth", authRoutes)
// app.use("/payment", paymentRoutes)
// app.use("/ratings", ratingRoutes)


// app.get("/", (req, res) => {

//   res.send("Uber Clone Backend Running")

// })


// const PORT = process.env.PORT || 5000

// server.listen(PORT, () => {

//   console.log(`Server running on ${PORT}`)

// })


const express = require("express")
const cors = require("cors")
const http = require("http")
const { Server } = require("socket.io")
require("dotenv").config()

const rideRoutes = require("./routes/rideRoutes")
const authRoutes = require("./routes/authRoutes")
const paymentRoutes = require("./routes/paymentRoutes")
const ratingRoutes = require("./routes/ratingRoutes")

const app = express()

app.use(cors())
app.use(express.json())

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: "*"
  }
})

io.on("connection", (socket) => {

  console.log("User connected:", socket.id)

  // 🧑‍🦱 JOIN RIDER ROOM
  socket.on("joinRider",(data)=>{
    socket.join(`rider_${data.riderId}`)
  })

  // 🚗 DRIVER LOCATION UPDATE
  socket.on("driver_location_update", (data) => {

    console.log("Driver location:", data)

    // Send location to all riders
    io.emit("driverLocationUpdate", data)

  })

  // 💳 PAYMENT CONFIRMATION RELAY
  socket.on("confirmPayment",(data)=>{

    io.emit("paymentConfirmed",{
      rideId:data.rideId
    })

  })

  // ⭐ REVIEW EVENT RELAY
  socket.on("new_review_submitted", (data) => {

    console.log("Review submitted:", data)

    // Broadcast review to drivers
    io.emit("new_review_submitted", data)

  })

  socket.on("disconnect", () => {

    console.log("User disconnected")

  })

})


// Middleware to pass socket instance to routes/controllers
app.use((req, res, next) => {

  req.io = io
  next()

})


// ROUTES
app.use("/rides", rideRoutes)
app.use("/auth", authRoutes)
app.use("/payment", paymentRoutes)
app.use("/ratings", ratingRoutes)


app.get("/", (req, res) => {

  res.send("Uber Clone Backend Running")

})


const PORT = process.env.PORT || 5000

server.listen(PORT, () => {

  console.log(`Server running on ${PORT}`)

})