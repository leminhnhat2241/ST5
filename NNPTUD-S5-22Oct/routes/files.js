const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

router.get("/:filename", function (req, res) {
  const fname = req.params.filename;
  const pathFileFiles = path.join(__dirname, "../resources/files/", fname);
  const pathFileImages = path.join(__dirname, "../resources/images/", fname);
  let pathFile = null;

  if (fs.existsSync(pathFileFiles)) pathFile = pathFileFiles;
  else if (fs.existsSync(pathFileImages)) pathFile = pathFileImages;

  if (pathFile) {
    return res.status(200).sendFile(pathFile);
  }

  return res.status(404).json({ success: false, message: "File not found" });
});

module.exports = router;
