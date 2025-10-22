const path = require("path");
const fs = require("fs");
const multer = require("multer");

const IMAGES_DIR = path.join(__dirname, "..", "resources", "images", "avatars");
fs.mkdirSync(IMAGES_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, IMAGES_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uid = req.userId || "anon";
    const name = `avatar_${uid}_${Date.now()}${ext}`;
    cb(null, name);
  },
});

function fileFilter(req, file, cb) {
  const allowed = /jpeg|jpg|png|gif/;
  const mimetypeOk = allowed.test(file.mimetype);
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  if (mimetypeOk && extOk) cb(null, true);
  else cb(new Error("Only image files are allowed"));
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

module.exports = upload;
