// Backend/middleware/Auth.js
import jwt from "jsonwebtoken";

/**
 * 🔐 REQUIRE AUTH (JWT)
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // ❌ No header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // ✅ attach user
    next();
  } catch (err) {
    console.error("❌ JWT Error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * 👑 SUPERADMIN ONLY
 */
export const requireSuperadmin = (req, res, next) => {
  if (!req.user || req.user.role !== "superadmin") {
    return res.status(403).json({ error: "Superadmin only" });
  }

  next();
};

/**
 * 🧑‍💼 ADMIN (ADMIN + SUPERADMIN)
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || !["admin", "superadmin"].includes(req.user.role)) {
    return res.status(403).json({ error: "Admin only" });
  }

  next();
};