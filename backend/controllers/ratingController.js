const pool = require("../config/db")

exports.addRating = async (req,res)=>{

 const {ride_id,driver_id,rating,review} = req.body

 const result = await pool.query(
   "INSERT INTO ratings (ride_id,driver_id,rating,review) VALUES ($1,$2,$3,$4) RETURNING *",
   [ride_id,driver_id,rating,review]
 )

 res.json(result.rows[0])
}