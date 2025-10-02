const express = require("express");
const router = express.Router();
const Role = require("../schemas/role");

// CREATE
router.post("/", async (req, res) => {
  try {
    const role = new Role(req.body);
    await role.save();
    res.json(role);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL (chỉ lấy role chưa bị xoá mềm)
router.get("/", async (req, res) => {
  try {
    const roles = await Role.find({ isDelete: false });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE (by ID)
router.get("/:id", async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role || role.isDelete)
      return res.status(404).json({ error: "Not found" });
    res.json(role);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(role);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE (xoá mềm)
router.delete("/:id", async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { isDelete: true },
      { new: true }
    );
    res.json({ message: "Deleted (soft)", role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
