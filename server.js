import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";
import path from "path";
import https from "https"; // ✅ keep server alive on Render

import authRoutes from "./routes/auth.js";
import newsRoutes from "./routes/news.js";

dotenv.config();
const app = express();
const __dirname = path.resolve();

// ✅ View engine setup
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// ✅ Static files
app.use(express.static(path.join(__dirname, "public")));

// ✅ Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: false,
  })
);

// ✅ Make session available in all EJS templates
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.error("MongoDB error:", err));

// ✅ Routes
app.use("/", authRoutes);
app.use("/news", newsRoutes);

// ✅ Root redirect
app.get("/", (req, res) => res.redirect("/login"));

// ✅ Keep server alive on Render (prevents 502 when idle)
if (process.env.RENDER) {
  setInterval(() => {
    https.get(`https://${process.env.RENDER_EXTERNAL_URL || "inshorts-ckqf.onrender.com"}`);
  }, 5 * 60 * 1000); // every 5 min
}

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});