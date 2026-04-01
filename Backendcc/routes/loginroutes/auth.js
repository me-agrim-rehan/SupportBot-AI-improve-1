// Backend/routes/loginroutes/auth.js
import express from "express";
import { pool } from "../../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const router = express.Router();

/**
 * 🔐 LOGIN
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.password, u.role, 
              u.department_id, u.country_id,
              d.name AS department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.email = $1`,
      [ email ]
    );

    const user = result.rows[ 0 ];

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const payload = {
      id: user.id,
      name: user.name,
      role: user.role,
      department_id: user.department_id,
      country_id: user.country_id,
    };

    // 🔐 CREATE TOKEN
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      success: true,
      token,        // 🔥 THIS IS KEY
      user: payload,
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});
/**
 * 👤 GET CURRENT USER
 */
import { requireAuth } from "../../middleware/auth.js";

router.get("/me", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.role, u.department_id, u.country_id,
              d.name AS department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = $1`,
      [ req.user.id ] // ✅ FIXED
    );

    const user = result.rows[ 0 ];

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      name: user.name,
      role: user.role,
      department_id: user.department_id,
      country_id: user.country_id,
      department: user.department_name,
    });
  } catch (err) {
    console.error("❌ /me error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});
/**
 * 🚪 LOGOUT
 */
router.post("/logout", (req, res) => {
  res.json({ success: true });
});

export default router;
