// var express = require('express');
// var router = express.Router();

// /* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const User = require("../schemas/user");

// CREATE
router.post("/", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL (có filter theo username hoặc fullName)
router.get("/", async (req, res) => {
  try {
    const { username, fullName } = req.query;
    let filter = { isDelete: false };

    if (username) filter.username = { $regex: username, $options: "i" };
    if (fullName) filter.fullName = { $regex: fullName, $options: "i" };

    const users = await User.find(filter).populate("role");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("role");
    if (!user || user.isDelete)
      return res.status(404).json({ error: "Not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ by username
router.get("/find/by-username/:username", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
      isDelete: false,
    }).populate("role");
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE (xoá mềm)
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isDelete: true },
      { new: true }
    );
    res.json({ message: "Deleted (soft)", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN API - update status = true nếu email + username đúng
router.post("/login", async (req, res) => {
  try {
    const { email, username } = req.body;

    // Tìm user theo email + username (chưa bị xoá mềm)
    const user = await User.findOne({ email, username, isDelete: false });

    if (!user) {
      return res.status(404).json({ error: "Invalid credentials" });
    }

    // Cập nhật status + tăng số lần login
    user.status = true;
    user.loginCount += 1;
    await user.save();

    res.json({ message: "Login success", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
