const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 50 },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", GroupSchema);
