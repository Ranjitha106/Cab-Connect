const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");
const pool = require("../config/db");

// Signup route
router.post("/signup", authController.signup);

// Login route
router.post("/login", authController.login);

// Get logged-in user profile (requires JWT token)
router.get("/profile", verifyToken, async (req, res) => {
  try {

    const result = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);

  } catch (err) {

    console.error(err.message);
    res.status(500).send("Server Error");

  }
});

module.exports = router;