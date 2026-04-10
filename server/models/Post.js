const mongoose = require("mongoose");

const ReplySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const PostSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    toName: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isAnonymous: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: true },
    shareId: { type: String }, // For private posts
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replies: [ReplySchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
