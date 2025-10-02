const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true }, // hash sau này nhé
    email: { type: String, required: true, unique: true },
    fullName: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    status: { type: Boolean, default: false }, // online/offline
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" }, // liên kết Role
    loginCount: { type: Number, default: 0, min: 0 },
    isDelete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
