let { Response } = require("./responseHandler");
let jwt = require("jsonwebtoken");
let users = require("../schemas/users");

module.exports = {
  // 🧩 Kiểm tra xác thực
  Authentication: async function (req, res, next) {
    try {
      // Lấy token từ header hoặc cookie
      let token = req.headers.authorization?.startsWith("Bearer")
        ? req.headers.authorization.split(" ")[1]
        : req.cookies?.token;

      if (!token) {
        return Response(res, 403, false, "User chưa đăng nhập");
      }

      // Xác minh token hợp lệ
      const decoded = jwt.verify(token, "NNPTUD");

      if (!decoded || !decoded._id) {
        return Response(res, 403, false, "Token không hợp lệ");
      }

      // Gắn userId vào request
      req.userId = decoded._id;
      next();
    } catch (error) {
      return Response(
        res,
        403,
        false,
        "Phiên đăng nhập hết hạn hoặc token không hợp lệ"
      );
    }
  },

  // 🧱 Kiểm tra quyền hạn
  Authorization: function (...rolesRequired) {
    return async function (req, res, next) {
      try {
        const user = await users.findById(req.userId).populate({
          path: "role",
          select: "name",
        });

        if (!user || !user.role) {
          return Response(
            res,
            403,
            false,
            "Không tìm thấy thông tin người dùng"
          );
        }

        const userRole = user.role.name.toUpperCase();

        if (rolesRequired.includes(userRole)) {
          next();
        } else {
          Response(res, 403, false, "Bạn không đủ quyền truy cập");
        }
      } catch (error) {
        Response(res, 500, false, "Lỗi xác thực quyền truy cập");
      }
    };
  },
};
