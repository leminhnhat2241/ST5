var express = require("express");
var router = express.Router();
let Product = require("../schemas/products");
let Category = require("../schemas/categories");
let { Response } = require("../utils/responseHandler");
let { Authentication, Authorization } = require("../utils/authHandler"); // 👈 import auth

// ------------------ ROUTES ------------------

// 📦 Lấy danh sách product (USER, MOD, ADMIN)
router.get(
  "/",
  Authentication,
  Authorization("USER", "MOD", "ADMIN"),
  async (req, res) => {
    try {
      const products = await Product.find({ isDeleted: false }).populate({
        path: "category",
        select: "name",
      });
      Response(res, 200, true, products);
    } catch (error) {
      Response(res, 500, false, error.message);
    }
  }
);

// 🔍 Lấy product theo ID (USER, MOD, ADMIN)
router.get(
  "/:id",
  Authentication,
  Authorization("USER", "MOD", "ADMIN"),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id).populate(
        "category"
      );
      if (!product || product.isDeleted)
        return Response(res, 404, false, "Product not found");
      Response(res, 200, true, product);
    } catch (error) {
      Response(res, 400, false, error.message);
    }
  }
);

// ➕ Thêm product mới (MOD, ADMIN)
router.post(
  "/",
  Authentication,
  Authorization("MOD", "ADMIN"),
  async (req, res) => {
    try {
      const category = await Category.findById(req.body.category);
      if (!category || category.isDeleted)
        return Response(res, 404, false, "Category not found");

      const newProduct = new Product({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        category: category._id,
      });

      await newProduct.save();
      Response(res, 201, true, newProduct);
    } catch (error) {
      Response(res, 400, false, error.message);
    }
  }
);

// ✏️ Cập nhật product (MOD, ADMIN)
router.put(
  "/:id",
  Authentication,
  Authorization("MOD", "ADMIN"),
  async (req, res) => {
    try {
      let product = await Product.findById(req.params.id);
      if (!product || product.isDeleted)
        return Response(res, 404, false, "Product not found");

      // Cập nhật các field nếu có
      product.name = req.body.name ?? product.name;
      product.price = req.body.price ?? product.price;
      product.description = req.body.description ?? product.description;
      if (req.body.category) product.category = req.body.category;

      await product.save();
      Response(res, 200, true, product);
    } catch (error) {
      Response(res, 400, false, error.message);
    }
  }
);

// 🗑️ Xóa mềm product (ADMIN)
router.delete(
  "/:id",
  Authentication,
  Authorization("ADMIN"),
  async (req, res) => {
    try {
      let product = await Product.findById(req.params.id);
      if (!product || product.isDeleted)
        return Response(res, 404, false, "Product not found");

      product.isDeleted = true;
      await product.save();
      Response(res, 200, true, "Product deleted successfully");
    } catch (error) {
      Response(res, 400, false, error.message);
    }
  }
);

module.exports = router;
