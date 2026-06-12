const express = require("express");

const router = express.Router();



const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  testEmail,
} = require("../controllers/auth.controller");

router.post("/signup", signup);

router.post("/login", login);

router.delete("/logout", logout);

router.post("/forgot-password", forgotPassword);

router.put("/reset-password/:token", resetPassword);

router.get("/test-email", testEmail);

module.exports = router;