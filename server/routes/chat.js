const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");
const Group = require("../models/Group");
const GroupMessage = require("../models/GroupMessage");
const { protect } = require("../middleware/auth");

// ══════════════ USER SEARCH (for starting new chats) ══════════════

router.get("/search-users", protect, async (req, res) => {
  try {
    const q = req.query.q || "";
    if (!q.trim()) return res.json([]);

    const users = await User.find({
      username: { $regex: q, $options: "i" },
      _id: { $ne: req.user.id },
      isVerified: true,
    })
      .select("_id username avatarId profilePicture")
      .limit(15);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ══════════════ DM CONVERSATIONS ══════════════

// Get recent DM conversations
router.get("/conversations", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    }).sort({ createdAt: -1 });

    const userIds = new Set();
    messages.forEach((msg) => {
      if (msg.sender.toString() !== userId) userIds.add(msg.sender.toString());
      if (msg.receiver.toString() !== userId) userIds.add(msg.receiver.toString());
    });

    const populatedUsers = await User.find({ _id: { $in: Array.from(userIds) } })
      .select("username _id avatarId profilePicture");
    res.json(populatedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get chat history with a specific user
router.get("/dm/:otherUserId", protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.otherUserId },
        { sender: req.params.otherUserId, receiver: req.user.id },
      ],
    }).sort({ createdAt: 1 });

    await Message.updateMany(
      { sender: req.params.otherUserId, receiver: req.user.id, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ══════════════ GROUP CHATS ══════════════

// Create group
router.post("/groups/create", protect, async (req, res) => {
  try {
    const { name, memberIds } = req.body;
    if (!name) return res.status(400).json({ message: "Group name is required" });

    const members = [req.user.id, ...(memberIds || [])];
    const uniqueMembers = [...new Set(members)];

    const group = await Group.create({
      name,
      members: uniqueMembers,
      creator: req.user.id,
    });

    const populated = await Group.findById(group._id)
      .populate("members", "username _id avatarId profilePicture")
      .populate("creator", "username _id");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's groups
router.get("/groups", protect, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id })
      .populate("members", "username _id avatarId profilePicture")
      .populate("creator", "username _id")
      .sort({ updatedAt: -1 });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get group messages
router.get("/groups/:groupId/messages", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!group.members.some((m) => m.toString() === req.user.id)) {
      return res.status(403).json({ message: "Not a member" });
    }

    const messages = await GroupMessage.find({ group: req.params.groupId })
      .populate("sender", "username _id avatarId")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send group message (REST fallback, main path is socket)
router.post("/groups/:groupId/messages", protect, async (req, res) => {
  try {
    const { text } = req.body;
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!group.members.some((m) => m.toString() === req.user.id)) {
      return res.status(403).json({ message: "Not a member" });
    }

    const msg = await GroupMessage.create({
      group: req.params.groupId,
      sender: req.user.id,
      text,
    });

    const populated = await GroupMessage.findById(msg._id)
      .populate("sender", "username _id avatarId");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
