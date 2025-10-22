const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const upload = require("../utils/uploadAvatar");
const authHandler = require("../utils/authHandler");
const Authentication =
  authHandler && authHandler.Authentication
    ? authHandler.Authentication
    : authHandler;
const User = require("../schemas/users");

/* GET users listing. */
router.get("/", async function (req, res, next) {
  let allUsers = await users.find({ isDeleted: false }).populate({
    path: "role",
    select: "name",
  });
  res.send({
    success: true,
    data: allUsers,
  });
});
router.get("/:id", async function (req, res, next) {
  try {
    let getUser = await users.findById(req.params.id);
    getUser = getUser.isDeleted ? new Error("ID not found") : getUser;
    res.send({
      success: true,
      data: getUser,
    });
  } catch (error) {
    res.send({
      success: true,
      data: error,
    });
  }
});

router.post("/", async function (req, res, next) {
  let role = req.body.role ? req.body.role : "USER";
  let roleId;
  role = await roles.findOne({ name: role });
  roleId = role._id;
  let newUser = new users({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    role: roleId,
  });
  await newUser.save();
  res.send({
    success: true,
    data: newUser,
  });
});
router.put("/:id", async function (req, res, next) {
  let user = await users.findById(req.params.id);
  user.email = req.body.email ? req.body.email : user.email;
  user.fullName = req.body.fullName ? req.body.fullName : user.fullName;
  user.password = req.body.password ? req.body.password : user.password;
  await user.save();
  res.send({
    success: true,
    data: user,
  });
});

// PUT /api/users/me/avatar  (upload 1 file)
router.put(
  "/me/avatar",
  Authentication,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file)
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });

      const userId = req.userId;
      if (!userId) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {}
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const user = await User.findById(userId);
      if (!user) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {}
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // remove old avatar if exists
      if (user.avatar) {
        const oldPath = path.join(__dirname, "..", user.avatar);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (e) {}
        }
      }

      const relPath = path.join(
        "resources",
        "images",
        "avatars",
        req.file.filename
      );
      user.avatar = relPath;
      await user.save();

      return res.json({
        success: true,
        message: "Avatar updated",
        avatar: relPath,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
);

// POST /api/users/me/avatars  (upload multiple files)
router.post(
  "/me/avatars",
  Authentication,
  upload.array("avatars", 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0)
        return res
          .status(400)
          .json({ success: false, message: "No files uploaded" });

      const userId = req.userId;
      if (!userId) {
        req.files.forEach((f) => {
          try {
            fs.unlinkSync(f.path);
          } catch (e) {}
        });
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const user = await User.findById(userId);
      if (!user) {
        req.files.forEach((f) => {
          try {
            fs.unlinkSync(f.path);
          } catch (e) {}
        });
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      user.avatars = Array.isArray(user.avatars) ? user.avatars : [];
      const newPaths = req.files.map((f) =>
        path.join("resources", "images", "avatars", f.filename)
      );
      user.avatars = user.avatars.concat(newPaths);
      await user.save();

      return res.json({
        success: true,
        message: "Avatars uploaded",
        avatars: newPaths,
      });
    } catch (err) {
      if (req.files)
        req.files.forEach((f) => {
          try {
            fs.unlinkSync(f.path);
          } catch (e) {}
        });
      return res.status(500).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;
