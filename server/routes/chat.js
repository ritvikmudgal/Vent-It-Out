const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

// Get recent conversations for sidebar
router.get("/conversations", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    // Find all users this user has exchanged messages with
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).sort({ createdAt: -1 });

    const userIds = new Set();
    messages.forEach(msg => {
      if(msg.sender.toString() !== userId) userIds.add(msg.sender.toString());
      if(msg.receiver.toString() !== userId) userIds.add(msg.receiver.toString());
    });

    const populatedUsers = await User.find({ _id: { $in: Array.from(userIds) } }).select('username _id');
    res.json(populatedUsers);
  } catch(error) {
    res.status(500).json({ message: error.message });
  }
});

// Get chat history with a specific user
router.get("/:otherUserId", protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.otherUserId },
        { sender: req.params.otherUserId, receiver: req.user.id }
      ]
    }).sort({ createdAt: 1 });
    
    // Auto-mark as read
    await Message.updateMany(
      { sender: req.params.otherUserId, receiver: req.user.id, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch(error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
