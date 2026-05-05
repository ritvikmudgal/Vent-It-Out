const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { protect } = require("../middleware/auth");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "supersecretventitoutkey", { expiresIn: "30d" });
};

// ──── Email transporter ────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ══════════════ PASSWORD AUTH ══════════════

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      isVerified: true,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        avatarId: user.avatarId,
        bio: user.bio,
        pronouns: user.pronouns,
        profilePicture: user.profilePicture,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // If user has no password (OAuth/OTP user), can't login with password
    if (!user.password) {
      return res.status(401).json({ message: "This account uses Google or OTP login" });
    }

    if (await bcrypt.compare(password, user.password)) {
      res.json({
        _id: user.id,
        username: user.username,
        email: user.email,
        avatarId: user.avatarId,
        bio: user.bio,
        pronouns: user.pronouns,
        profilePicture: user.profilePicture,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ══════════════ EMAIL OTP AUTH ══════════════

// Send OTP
router.post("/email/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    let user = await User.findOne({ email });

    if (user) {
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      // Store OTP temporarily — user will be fully created on verify
      user = await User.create({
        email,
        username: `user_${crypto.randomBytes(4).toString("hex")}`, // temp username
        otp,
        otpExpires,
        isVerified: false,
      });
    }

    // Send email
    await transporter.sendMail({
      from: `"VentItOut 💌" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your VentItOut Login Code",
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 400px; margin: 0 auto; padding: 2rem; text-align: center;">
          <h1 style="color: #E8739A; font-size: 2rem;">VentItOut</h1>
          <p style="color: #666; margin-bottom: 1.5rem;">Here's your one-time login code:</p>
          <div style="background: linear-gradient(135deg, #FFE4EE, #FFF0F5); border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem;">
            <span style="font-size: 2.5rem; font-weight: 800; letter-spacing: 8px; color: #E8739A;">${otp}</span>
          </div>
          <p style="color: #999; font-size: 0.85rem;">This code expires in 5 minutes. Don't share it with anyone.</p>
        </div>
      `,
    });

    res.json({ message: "OTP sent to your email", isNewUser: !user.isVerified });
  } catch (error) {
    console.error("OTP send error:", error);
    res.status(500).json({ message: "Failed to send OTP. Check email configuration." });
  }
});

// Verify OTP
router.post("/email/verify-otp", async (req, res) => {
  try {
    const { email, otp, username } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpires < new Date()) return res.status(400).json({ message: "OTP has expired" });

    // Clear OTP
    user.otp = null;
    user.otpExpires = null;

    // If new user, set username
    if (!user.isVerified) {
      if (username) {
        const taken = await User.findOne({ username, _id: { $ne: user._id } });
        if (taken) return res.status(400).json({ message: "Username already taken" });
        user.username = username;
      }
      user.isVerified = true;
    }

    await user.save();

    res.json({
      _id: user.id,
      username: user.username,
      email: user.email,
      avatarId: user.avatarId,
      bio: user.bio,
      pronouns: user.pronouns,
      profilePicture: user.profilePicture,
      token: generateToken(user.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ══════════════ PROFILE ══════════════

// Get own profile
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp -otpExpires");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile
router.put("/profile/update", protect, async (req, res) => {
  try {
    const { bio, pronouns, avatarId, profilePicture, username } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (bio !== undefined) user.bio = bio.substring(0, 300);
    if (pronouns !== undefined) user.pronouns = pronouns;
    if (avatarId !== undefined) user.avatarId = avatarId;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (username && username !== user.username) {
      const taken = await User.findOne({ username, _id: { $ne: user._id } });
      if (taken) return res.status(400).json({ message: "Username already taken" });
      user.username = username;
    }

    await user.save();
    const updated = user.toObject();
    delete updated.password;
    delete updated.otp;
    delete updated.otpExpires;
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public profile
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select("-password -otp -otpExpires");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search users by username
router.get("/search/:query", async (req, res) => {
  try {
    const users = await User.find({
      username: { $regex: req.params.query, $options: "i" },
      isVerified: true,
    })
      .select("_id username avatarId profilePicture")
      .limit(20);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
