import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";
import path from "path";

import authRoutes from "./routes/auth.js";
import newsRoutes from "./routes/news.js";

dotenv.config();
const app = express();
const __dirname = path.resolve();

// Set EJS template engine
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// ✅ Serve Static Files from /public
app.use(express.static(path.join(__dirname, "public")));

// ✅ Make session available in EJS
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.error("MongoDB error:", err));

// Routes
app.use("/", authRoutes);
app.use("/news", newsRoutes);

// Default redirect
app.get("/", (req, res) => res.redirect("/login"));

// Start server
app.listen(process.env.PORT || 3000, () => {
  console.log(`✅ Server running at http://localhost:${process.env.PORT || 3000}`);
});