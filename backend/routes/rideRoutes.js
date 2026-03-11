const express = require("express")
const router = express.Router()

const rideController = require("../controllers/rideController")
const auth = require("../middleware/authMiddleware")

// Stripe
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

router.post("/requestRide", auth, rideController.createRide)

router.get("/availableRides", auth, rideController.getAvailableRides)

router.post("/acceptRide", auth, rideController.acceptRide)

router.post("/completeRide", auth, rideController.completeRide)

router.post("/updateDriverLocation", auth, rideController.updateDriverLocation)

router.post("/cancelRide", auth, rideController.cancelRide)



/* ⭐ SUBMIT REVIEW ROUTE */

router.post("/submit-review", auth, async (req, res) => {

  const { rideId, driverId, rating, comment } = req.body

  try {

    const pool = require("../config/db")

    await pool.query(
      "INSERT INTO reviews (ride_id, driver_id, rating, comment) VALUES ($1, $2, $3, $4)",
      [rideId, driverId, rating, comment]
    )

    res.json({ success: true })

  } catch (err) {

    console.error(err)
    res.status(500).json({ error: err.message })

  }

})



/* ⭐ RIDE HISTORY ROUTE */

router.get("/history", auth, async (req, res) => {

  try {

    const pool = require("../config/db")

    const userId = req.user.id
    const role = req.user.role

    let query

    if (role === "driver") {

      // Driver sees rider names
      query = `
        SELECT r.*, u.name as other_name
        FROM rides r
        JOIN users u ON r.rider_id = u.id
        WHERE r.driver_id = $1 AND r.status = 'completed'
        ORDER BY r.created_at DESC
      `

    } else {

      // Rider sees driver names
      query = `
        SELECT r.*, u.name as other_name
        FROM rides r
        JOIN users u ON r.driver_id = u.id
        WHERE r.rider_id = $1 AND r.status = 'completed'
        ORDER BY r.created_at DESC
      `

    }

    const result = await pool.query(query, [userId])

    res.json(result.rows)

  } catch (err) {

    console.error(err)
    res.status(500).send("Server Error")

  }

})



// Stripe Payment Intent Route
router.post("/create-payment-intent", async (req, res) => {

  const { amount, rideId } = req.body

  try {

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "inr",
      metadata: { rideId }
    })

    res.json({
      clientSecret: paymentIntent.client_secret
    })

  } catch (err) {

    console.error(err)
    res.status(500).json({ error: "Payment intent failed" })

  }

})

module.exports = router