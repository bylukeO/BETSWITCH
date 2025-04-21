const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/user.controller");

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get("/profile", protect, getProfile);

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put("/profile", protect, updateProfile);

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
router.put("/change-password", protect, changePassword);

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
router.delete("/account", protect, deleteAccount);

module.exports = router;
