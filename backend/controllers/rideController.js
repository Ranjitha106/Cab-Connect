const pool = require("../config/db")

// Create Ride
exports.createRide = async (req,res)=>{

  try{

    const rider_id = req.user.id

    const {pickup,destination,pickupCoords,destCoords,fare} = req.body

    if(!pickup || !destination){
      return res.status(400).json({error:"Pickup and destination required"})
    }

    if(!pickupCoords || !destCoords){
      return res.status(400).json({error:"Coordinates are missing"})
    }

    const result = await pool.query(
      "INSERT INTO rides (rider_id,pickup,destination,status,pickup_lat,pickup_lng,dest_lat,dest_lng,fare) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
      [
        rider_id,
        pickup,
        destination,
        "requested",
        pickupCoords?.[0],
        pickupCoords?.[1],
        destCoords?.[0],
        destCoords?.[1],
        fare
      ]
    )

    const ride = result.rows[0]

    const rideWithCoords = {
      ...ride,
      pickupCoords: [ride.pickup_lat, ride.pickup_lng],
      destCoords: [ride.dest_lat, ride.dest_lng]
    }

    req.io.emit("newRide", rideWithCoords)

    res.json(rideWithCoords)

  }catch(err){
    console.error(err)
    res.status(500).json({error:"Server error"})
  }

}


// Get available rides for drivers
exports.getAvailableRides = async (req, res) => {

  const result = await pool.query(
    "SELECT * FROM rides WHERE status='requested'"
  )

  const rides = result.rows.map(ride => ({
    ...ride,
    pickupCoords: [ride.pickup_lat, ride.pickup_lng],
    destCoords: [ride.dest_lat, ride.dest_lng]
  }))

  res.json(rides)

}


// Accept Ride
exports.acceptRide = async (req, res) => {

  try {

    const driver_id = req.user.id
    const { ride_id } = req.body

    const result = await pool.query(
      "UPDATE rides SET driver_id=$1,status='accepted' WHERE id=$2 AND status='requested' RETURNING *",
      [driver_id, ride_id]
    )

    const ride = result.rows[0]

    if(!ride){
      return res.status(400).json({error:"Ride already accepted"})
    }

    // get driver name
    const driverResult = await pool.query(
      "SELECT name FROM users WHERE id=$1",
      [driver_id]
    )

    const driverName = driverResult.rows[0].name

    const payload = {
      ...ride,
      name: driverName, // ✅ FIX: send as "name" for frontend
      pickupCoords: [ride.pickup_lat, ride.pickup_lng],
      destCoords: [ride.dest_lat, ride.dest_lng]
    }

    // notify driver dashboards
    req.io.emit("rideAccepted", payload)

    // remove ride from other drivers
    req.io.emit("removeRide", { ride_id })

    // notify rider
    req.io.emit("driverFound", payload)

    res.json(payload)

  } catch (err) {

    console.error(err)
    res.status(500).json("Error accepting ride")

  }

}


// Complete Ride
exports.completeRide = async (req, res) => {

  const { rideId } = req.body

  try {

    const result = await pool.query(
      "UPDATE rides SET status='completed' WHERE id=$1 RETURNING *",
      [rideId]
    )

    const ride = result.rows[0]

    req.io.emit("rideCompleted", {
      rideId: rideId
    })

    res.json({
      success: true,
      ride
    })

  } catch (err) {

    console.error(err)

    res.status(500).json({
      error: "Failed to complete ride"
    })

  }

}


// Update driver location
exports.updateDriverLocation = async (req, res) => {

  try {

    const driver_id = req.user.id
    const { lat, lng } = req.body

    const result = await pool.query(
      "UPDATE users SET latitude=$1, longitude=$2 WHERE id=$3 RETURNING *",
      [lat, lng, driver_id]
    )

    req.io.emit("driverLocationUpdate", {
      lat,
      lng
    })

    res.json(result.rows[0])

  } catch (err) {

    console.error(err)
    res.status(500).json("Location update failed")

  }

}



// Cancel Ride
exports.cancelRide = async (req, res) => {

  const { ride_id } = req.body

  try {

    const result = await pool.query(
      "UPDATE rides SET status='cancelled' WHERE id=$1 RETURNING *",
      [ride_id]
    )

    // ⭐ notify drivers to remove the ride request
    req.io.emit("removeRide", { ride_id })

    res.json(result.rows[0])

  } catch (err) {

    console.error(err)

    res.status(500).json({
      error: "Failed to cancel ride"
    })

  }

}

// Get Ride History
exports.getRideHistory = async (req, res) => {

  try {

    const user_id = req.user.id

    const result = await pool.query(
      `
      SELECT 
        rides.id,
        rides.pickup,
        rides.destination,
        rides.fare,
        rides.created_at,
        users.name AS other_name
      FROM rides
      JOIN users ON users.id = rides.driver_id
      WHERE rides.rider_id = $1
      AND rides.status = 'completed'
      ORDER BY rides.created_at DESC
      `,
      [user_id]
    )

    res.json(result.rows)

  } catch (err) {

    console.error(err)
    res.status(500).json({ error: "Failed to fetch ride history" })

  }

}