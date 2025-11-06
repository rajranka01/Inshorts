import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

// GET login
router.get("/login", (req, res) => {
  const message = req.query.message || null;
  res.render("login", { message });
});

// GET signup
router.get("/signup", (req, res) => {
  const message = req.query.message || null;
  res.render("signup", { message });
});

// POST signup
router.post("/signup", async (req, res) => {
  try {
    let { username, email, password } = req.body;
    username = username.trim().toLowerCase();
    email = email.trim().toLowerCase();
    password = password.trim();

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.redirect("/signup?message=User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.redirect("/login?message=Signup successful! Please login.");
  } catch (err) {
    console.error(err);
    res.redirect("/signup?message=Signup failed, try again.");
  }
});

// POST login
router.post("/login", async (req, res) => {
  try {
    let { username, password } = req.body;
    username = username.trim().toLowerCase();
    password = password.trim();

    const user = await User.findOne({ username });
    if (!user) return res.redirect("/login?message=User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.redirect("/login?message=Invalid password");

    req.session.user = { id: user._id, username: user.username, email: user.email };
    res.redirect("/news");
  } catch (err) {
    console.error(err);
    res.redirect("/login?message=Login failed");
  }
});

// GET logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.redirect("/login");
  });
});

export default router;