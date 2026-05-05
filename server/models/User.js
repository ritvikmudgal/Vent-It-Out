const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false, // Optional for Google/OTP users
    },
    googleId: {
      type: String,
      default: null,
    },

    // OTP fields
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },

    // Profile fields
    bio: { type: String, default: "", maxlength: 300 },
    pronouns: { type: String, default: "" },
    avatarId: { type: String, default: "classic" }, // ID from avatar pack
    profilePicture: { type: String, default: null }, // base64 for custom uploads

    // Stats
    totalPosts: { type: Number, default: 0 },
    repliesGiven: { type: Number, default: 0 },
    likesReceived: { type: Number, default: 0 },
    wordsWritten: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
