var express = require("express");
var router = express.Router();
let users = require("../schemas/users");
let roles = require("../schemas/roles");
let bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");
let { Response } = require("../utils/responseHandler");
let { Authentication, Authorization } = require("../utils/authHandler");

router.post("/register", async function (req, res, next) {
  let role = await roles.findOne({ name: "USER" });
  role = role._id;
  let newUser = new users({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    role: role,
  });
  await newUser.save();
  Response(res, 200, true, "dang ki thanh cong");
});

router.post("/login", async function (req, res, next) {
  try {
    let { username, password } = req.body;

    let user = await users.findOne({ username }).populate({
      path: "role",
      select: "name",
    });

    if (!user) return Response(res, 404, false, "user khong ton tai");

    let result = bcrypt.compareSync(password, user.password);
    if (!result) return Response(res, 403, false, "user sai password");

    // ✅ tạo token có role và hết hạn đúng chuẩn
    let token = jwt.sign({ _id: user._id, role: user.role.name }, "NNPTUD", {
      expiresIn: "15m",
    });

    // ✅ set cookie
    res.cookie("token", "Bearer " + token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    Response(res, 200, true, token);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

router.post("/logout", function (req, res, next) {
  try {
    res.cookie("token", "");
    Response(res, 200, true, "logout thanh cong");
  } catch (error) {
    Response(res, 404, false, "token sai");
  }
});
router.get(
  "/me",
  Authentication,
  Authorization("ADMIN", "MOD", "USER"),
  async function (req, res, next) {
    let user = await users
      .findById(req.userId)
      .select("username email fullname avatarURL")
      .populate({
        path: "role",
        select: "name",
      });
    Response(res, 200, true, user);
  }
);

module.exports = router;
