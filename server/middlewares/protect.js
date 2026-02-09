// 🐨 Todo: Exercise #5
// สร้าง Middleware ขึ้นมา 1 อันชื่อ Function ว่า `protect`
// เพื่อเอาไว้ตรวจสอบว่า Client แนบ Token มาใน Header ของ Request หรือไม่

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export const protect = (req, res, next) => {
  // ดึง token จาก header: Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ "message": "Token has invalid format" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // เก็บข้อมูล user จาก token ไว้ใน req.user เผื่อใช้ต่อ
    req.user = decoded.user || null;
    next(); //execute next middleware or go tocontroller function
  } catch (error) {
    console.error(error);
    return res.status(401).json({ "message": "Token is invalid" });
  }
};