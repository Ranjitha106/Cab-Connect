const pool = require("../config/db")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const SECRET = "uber_secret_key"

// Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await pool.query(
      "INSERT INTO users (name,email,password,role) VALUES ($1,$2,$3,$4) RETURNING id,name,email,role",
      [name, email, hashedPassword, role]
    )

    res.json(result.rows[0])

  } catch (err) {
    console.error(err)
    res.status(500).json("Signup failed")
  }
}


// Login
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body

//     const result = await pool.query(
//       "SELECT * FROM users WHERE email=$1",
//       [email]
//     )

//     const user = result.rows[0]

//     if (!user) {
//       return res.status(400).json("User not found")
//     }

//     const validPassword = await bcrypt.compare(password, user.password)

//     if (!validPassword) {
//       return res.status(400).json("Invalid password")
//     }

//     const token = jwt.sign(
//       { id: user.id, role: user.role },
//       SECRET,
//       { expiresIn: "1d" }
//     )

//     // Clean response for frontend
//     res.json({
//       token: token,
//       role: user.role,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email
//       }
//     })

//   } catch (err) {
//     console.error(err)
//     res.status(500).json("Login failed")
//   }
// }
// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    )

    const user = result.rows[0]

    if (!user) {
      return res.status(400).json("User not found")
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(400).json("Invalid password")
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      SECRET,
      { expiresIn: "1d" }
    )

    // ✅ FIXED RESPONSE
    res.json({
  token: token,
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  }
})
  } catch (err) {
    console.error(err)
    res.status(500).json("Login failed")
  }
}

// Get Logged-in User Profile
exports.getProfile = async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT id,name,email,role FROM users WHERE id=$1",
      [req.user.id]
    )

    res.json(result.rows[0])

  } catch (err) {

    console.error(err)
    res.status(500).json("Failed to fetch profile")

  }

}