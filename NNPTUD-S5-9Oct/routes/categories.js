var express = require("express");
var router = express.Router();
let Category = require("../schemas/categories");
let { Response } = require("../utils/responseHandler");
let { Authentication, Authorization } = require("../utils/authHandler");

// ------------------ ROUTES ------------------

// 📋 Lấy danh sách category (USER, MOD, ADMIN)
router.get(
  "/",
  Authentication,
  Authorization("USER", "MOD", "ADMIN"),
  async (req, res) => {
    try {
      const categories = await Category.find({ isDeleted: false });
      Response(res, 200, true, categories);
    } catch (error) {
      Response(res, 500, false, error.message);
    }
  }
);

// 🔍 Lấy category theo ID (USER, MOD, ADMIN)
router.get(
  "/:id",
  Authentication,
  Authorization("USER", "MOD", "ADMIN"),
  async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);
      if (!category || category.isDeleted)
        return Response(res, 404, false, "Category not found");
      Response(res, 200, true, category);
    } catch (error) {
      Response(res, 400, false, error.message);
    }
  }
);

// ➕ Tạo mới category (MOD, ADMIN)
router.post(
  "/",
  Authentication,
  Authorization("MOD", "ADMIN"),
  async (req, res) => {
    try {
      const newCategory = new Category({
        name: req.body.name,
        description: req.body.description,
      });
      await newCategory.save();
      Response(res, 201, true, newCategory);
    } catch (error) {
      Response(res, 400, false, error.message);
    }
  }
);

// ✏️ Cập nhật category (MOD, ADMIN)
router.put(
  "/:id",
  Authentication,
  Authorization("MOD", "ADMIN"),
  async (req, res) => {
    try {
      let category = await Category.findById(req.params.id);
      if (!category || category.isDeleted)
        return Response(res, 404, false, "Category not found");

      category.name = req.body.name ?? category.name;
      category.description = req.body.description ?? category.description;

      await category.save();
      Response(res, 200, true, category);
    } catch (error) {
      Response(res, 400, false, error.message);
    }
  }
);

// 🗑️ Xóa mềm category (ADMIN)
router.delete(
  "/:id",
  Authentication,
  Authorization("ADMIN"),
  async (req, res) => {
    try {
      let category = await Category.findById(req.params.id);
      if (!category || category.isDeleted)
        return Response(res, 404, false, "Category not found");

      category.isDeleted = true;
      await category.save();
      Response(res, 200, true, "Category deleted successfully");
    } catch (error) {
      Response(res, 400, false, error.message);
    }
  }
);

module.exports = router;
