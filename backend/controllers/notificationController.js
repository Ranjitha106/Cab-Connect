const pool = require("../config/db")

exports.getNotifications = async (req,res)=>{

 const {user_id} = req.params

 const result = await pool.query(
  "SELECT * FROM notifications WHERE user_id=$1",
  [user_id]
 )

 res.json(result.rows)

}