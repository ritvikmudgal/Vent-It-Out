const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const crypto = require("crypto");

// Create Post
router.post("/create", protect, async (req, res) => {
  try {
    const { message, toName, isAnonymous, isPublic } = req.body;

    let shareId = null;
    if (!isPublic) {
      shareId = crypto.randomBytes(5).toString("hex"); // e.g. "a1b2c3d4e5"
    }

    const post = await Post.create({
      message,
      toName,
      userId: req.user.id,
      isAnonymous,
      isPublic,
      shareId,
    });

    // Update user stats
    const words = message.split(/\\s+/).length;
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { totalPosts: 1, wordsWritten: words }
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Public Posts
router.get("/public", async (req, res) => {
  try {
    const posts = await Post.find({ isPublic: true })
      .populate("userId", "username")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search Public Posts by "toName"
router.get("/search", async (req, res) => {
  try {
    const { name } = req.query;
    const posts = await Post.find({
      isPublic: true,
      toName: { $regex: name, $options: "i" },
    })
      .populate("userId", "username")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Post by ID
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("userId", "username");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Only return if it's public (unless the author is fetching it, but for simplicity public checks are sufficient for now)
    if (!post.isPublic) {
      return res.status(403).json({ message: "This post is private" });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Private Post by shareId
router.get("/share/:shareId", async (req, res) => {
  try {
    const post = await Post.findOne({ shareId: req.params.shareId })
      .populate("userId", "username");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like a post
router.put("/like/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user already liked
    if (post.likes.includes(req.user.id)) {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
      await User.findByIdAndUpdate(post.userId, { $inc: { likesReceived: -1 } });
    } else {
      post.likes.push(req.user.id);
      await User.findByIdAndUpdate(post.userId, { $inc: { likesReceived: 1 } });
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reply to a post
router.post("/:postId/reply", protect, async (req, res) => {
  try {
    const { message } = req.body;
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findById(req.user.id);
    
    const reply = {
      userId: user._id,
      username: user.username,
      message,
    };

    post.replies.push(reply);
    await post.save();

    await User.findByIdAndUpdate(req.user.id, { $inc: { repliesGiven: 1 } });

    res.Status(201).json(post.replies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get User's Own Posts
router.get("/user/posts", protect, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a post
router.delete("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Make sure user owns post
    if (post.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized" });
    }

    await post.deleteOne();
    
    // Decrement user stats
    const words = post.message.split(/\s+/).length;
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { totalPosts: -1, wordsWritten: -words }
    });

    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
