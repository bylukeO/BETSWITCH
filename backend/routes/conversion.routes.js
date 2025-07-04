const express = require("express");
const {
  convertBetCode,
  getConversionHistory,
} = require("../controllers/conversion.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/", protect, convertBetCode);
router.get("/", protect, getConversionHistory);

module.exports = router;
