const express = require("express");

const router = express.Router();



const {
  signup,
  login,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getProfile,
  updateProfile,
} = require(
  "../controllers/auth.controller"
);
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/signup", signup);

router.post("/login", login);

router.delete("/logout", logout);

router.post("/forgot-password", forgotPassword);

router.post("/verify-otp", verifyOtp);

router.post("/reset-password", resetPassword);

router.get("/profile", authMiddleware, getProfile);

router.put("/profile", authMiddleware, updateProfile);

module.exports = router;
