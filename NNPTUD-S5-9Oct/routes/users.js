var express = require("express");
var router = express.Router();
let users = require("../schemas/users");
let roles = require("../schemas/roles");
let { Response } = require("../utils/responseHandler"); // ✅ import Response

// ------------------ ROUTES ------------------

// Lấy danh sách user (populate role name)
router.get("/", async function (req, res) {
  try {
    let allUsers = await users.find({ isDeleted: false }).populate({
      path: "role",
      select: "name",
    });
    Response(res, 200, true, allUsers);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// Lấy user theo ID
router.get("/:id", async function (req, res) {
  try {
    let getUser = await users.findById(req.params.id);
    if (!getUser || getUser.isDeleted)
      return Response(res, 404, false, "User not found");

    Response(res, 200, true, getUser);
  } catch (error) {
    Response(res, 400, false, error.message);
  }
});

// Tạo mới user
router.post("/", async function (req, res) {
  try {
    // Nếu không truyền role → mặc định USER
    let roleName = req.body.role ? req.body.role : "USER";
    let role = await roles.findOne({ name: roleName });
    if (!role) return Response(res, 404, false, "Role not found");

    let newUser = new users({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      role: role._id,
    });

    await newUser.save();
    Response(res, 201, true, newUser);
  } catch (error) {
    Response(res, 400, false, error.message);
  }
});

// Cập nhật user
router.put("/:id", async function (req, res) {
  try {
    let user = await users.findById(req.params.id);
    if (!user || user.isDeleted)
      return Response(res, 404, false, "User not found");

    // Cập nhật các trường có thay đổi
    user.email = req.body.email ?? user.email;
    user.fullName = req.body.fullName ?? user.fullName;
    user.password = req.body.password ?? user.password;

    await user.save();
    Response(res, 200, true, user);
  } catch (error) {
    Response(res, 400, false, error.message);
  }
});

module.exports = router;
