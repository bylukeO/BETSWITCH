const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
} = require("../controllers/auth.controller");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout); // Changed from POST to GET to match client implementation
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resetToken", resetPassword);

// Protected routes
router.get("/me", protect, getMe);

module.exports = router;
