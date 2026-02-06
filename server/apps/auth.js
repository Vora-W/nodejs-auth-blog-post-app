import { Router } from "express";
import { db } from "../utils/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const authRouter = Router();

// 🐨 Todo: Exercise #1
// ให้สร้าง API เพื่อเอาไว้ Register ตัว User แล้วเก็บข้อมูลไว้ใน Database ตามตารางที่ออกแบบไว้
authRouter.post("/register", async (req, res) => {
  const { username, password, firstName, lastName } = req.body;
  const user = { username, password, firstName, lastName };
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  user.password = hashedPassword;

  const collection = db.collection("users");
  await collection.insertOne(user);
  res.status(201).json({
    message: "User has been created successfully",
    user: user,
  });
});

// 🐨 Todo: Exercise #3
// ให้สร้าง API เพื่อเอาไว้ Login ตัว User ตามตารางที่ออกแบบไว้
authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const collection = db.collection("users");
  const user = await collection.findOne({ username });
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  const token = jwt.sign(
    //payload
    { id: user._id, firstName: user.firstName, lastName: user.lastName },
    //secret key
    process.env.SECRET_KEY,
    //options
    { expiresIn: "1h" },
  );
  return res.json({
    message: "login successfully",
    token: token,
  });
});

export default authRouter;
