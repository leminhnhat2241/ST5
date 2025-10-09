var express = require("express");
var router = express.Router();
let roleSchema = require("../schemas/roles");
let { Response } = require("../utils/responseHandler"); // ✅ import Response từ file dùng chung

// ------------------ ROUTES ------------------

// Lấy danh sách roles
router.get("/", async function (req, res) {
  try {
    let roles = await roleSchema.find({ isDeleted: false });
    Response(res, 200, true, roles);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// Lấy role theo ID
router.get("/:id", async function (req, res) {
  try {
    let role = await roleSchema.findById(req.params.id);
    if (!role) return Response(res, 404, false, "Role not found");
    Response(res, 200, true, role);
  } catch (error) {
    Response(res, 400, false, error.message);
  }
});

// Thêm role mới
router.post("/", async function (req, res) {
  try {
    let newRole = new roleSchema({
      name: req.body.name,
    });
    await newRole.save();
    Response(res, 201, true, newRole);
  } catch (error) {
    Response(res, 400, false, error.message);
  }
});

module.exports = router;
