const express = require("express");
const router = express.Router();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "supersecretventitoutkey", { expiresIn: "30d" });
};

// ── Configure Google Strategy ──
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists by googleId
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Check by email
          user = await User.findOne({ email: profile.emails[0].value });
          if (user) {
            // Link google to existing account
            user.googleId = profile.id;
            await user.save();
          } else {
            // Create new user
            const baseUsername = profile.displayName.replace(/\s+/g, "").toLowerCase();
            let username = baseUsername;
            let counter = 1;
            while (await User.findOne({ username })) {
              username = `${baseUsername}${counter++}`;
            }

            user = await User.create({
              googleId: profile.id,
              email: profile.emails[0].value,
              username,
              isVerified: true,
            });
          }
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// ── Routes ──

// Start Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/auth" }),
  (req, res) => {
    const token = generateToken(req.user.id);
    const userData = {
      _id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      avatarId: req.user.avatarId,
      bio: req.user.bio,
      pronouns: req.user.pronouns,
      profilePicture: req.user.profilePicture,
    };
    // Redirect to frontend with token and user data
    const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
    const params = new URLSearchParams({
      token,
      user: JSON.stringify(userData),
    });
    res.redirect(`${clientURL}/auth/callback?${params.toString()}`);
  }
);

module.exports = router;
