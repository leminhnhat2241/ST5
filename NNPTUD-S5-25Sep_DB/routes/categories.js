const express = require("express");
const router = express.Router();
const categoryModel = require("../schemas/categories");

// CREATE - TTao danh muc moi
router.post("/", async (req, res) => {
  try {
    const newCategory = new categoryModel({
      name: req.body.name,
    });

    await newCategory.save();
    res.status(201).send({
      success: true,
      data: newCategory,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
});

// READ - Lay tat ca danh muc
router.get("/", async (req, res) => {
  try {
    const categories = await categoryModel.find();
    res.send({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
});

// READ - Lay 1 danh muc theo ID
router.get("/:id", async (req, res) => {
  try {
    const category = await categoryModel.findById(req.params.id);
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }
    res.send({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
});

// UPDATE - Cap nhat danh muc theo ID
router.put("/:id", async (req, res) => {
  try {
    const updatedCategory = await categoryModel.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).send({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    res.send({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
});

// DELETE - Xoa danh mucc theo ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedCategory = await categoryModel.findByIdAndDelete(
      req.params.id
    );
    if (!deletedCategory) {
      return res.status(404).send({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    res.send({
      success: true,
      data: deletedCategory,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
