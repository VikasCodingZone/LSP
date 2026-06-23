const express = require("express");
const cors = require("cors");

const authRoutes =
  require("./routes/auth.routes");
const adminRoutes =
  require("./routes/admin.routes");

const app = express();

app.use(cors());

app.use(express.json());

app.use(
  "/api/v1/auth",
  authRoutes
);

app.use(
  "/api/v1/admin",
  adminRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

module.exports = app;
