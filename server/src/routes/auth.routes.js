const express = require("express");

const router = express.Router();



const {
  signup,
  login,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require(
  "../controllers/auth.controller"
);

router.post("/signup", signup);

router.post("/login", login);

router.delete("/logout", logout);

router.post("/forgot-password", forgotPassword);

router.post("/verify-otp", verifyOtp);

router.post("/reset-password", resetPassword);

module.exports = router;