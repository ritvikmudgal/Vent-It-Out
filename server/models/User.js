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
      required: true,
    },
    // User stats will be computed dynamically or updated here
    totalPosts: { type: Number, default: 0 },
    repliesGiven: { type: Number, default: 0 },
    likesReceived: { type: Number, default: 0 },
    wordsWritten: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
