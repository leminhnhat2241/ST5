var express = require("express");
var router = express.Router();
let productModel = require("../schemas/product");

/* GET users listing. */
router.get("/", async function (req, res, next) {
  let products = await productModel.find({});
  res.send({
    success: true,
    data: products,
  });
});
router.get("/:id", async function (req, res, next) {
  try {
    let item = await productModel.findById(req.params.id);
    res.send({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      data: error,
    });
  }
});
router.post("/", async function (req, res, next) {
  try {
    let newItem = new productModel({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
    });
    await newItem.save();
    res.send({
      success: true,
      data: newItem,
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      data: error,
    });
  }
});
router.put("/:id", async function (req, res, next) {
  let updatedItem = await productModel.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
    },
    {
      new: true,
    }
  );
  res.send({
    success: true,
    data: updatedItem,
  });

  // let item = await productModel.findById(req.params.id);
  // item.name = req.body.name?req.body.name:item.name;
  // item.price = req.body.price?req.body.price:item.price;
  // item.description = req.body.description?req.body.description:item.description;
  // item.category = req.body.category?req.body.category:item.category;
  // await item.save();
  // res.send({
  //   success: true,
  //   data:item
  // })
});

// DELETE: Đánh dấu isDelete là true (soft delete)
router.delete("/:id", async function (req, res, next) {
  try {
    let deletedItem = await productModel.findByIdAndUpdate(
      req.params.id,
      { isDelete: true },
      { new: true }
    );

    if (!deletedItem) {
      return res.status(404).send({
        success: false,
        message: "Khong tim thay san pham",
      });
    }

    res.send({
      success: true,
      data: deletedItem,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
