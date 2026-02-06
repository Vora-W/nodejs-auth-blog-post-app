import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../utils/db.js";

const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// 🐨 Todo: Exercise #1 
// ให้สร้าง API เพื่อเอาไว้ Register ตัว User แล้วเก็บข้อมูลไว้ใน Database ตามตารางที่ออกแบบไว้
authRouter.post("/register", async (req, res) => {
    try {
        const { username, password, firstName, lastName } = req.body;

        // 1. validate
        if (!username || !password || !firstName || !lastName) {
            return res.status(400).json({ message: "กรอกข้อมูลไม่ครบ" });
        }

        // 2. connect database
        const usersCollection = db.collection("users");

        // 3. เช็ค username ซ้ำ
        const existingUser = await usersCollection.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: "username ซ้ำ" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. insert document
        await usersCollection.insertOne({
            username,
            password: hashedPassword,
            firstName,
            lastName
        });

        return res.status(201).json({
            message: "User registered successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});

// 🐨 Todo: Exercise #3
// ให้สร้าง API เพื่อเอาไว้ Login ตัว User ตามตารางที่ออกแบบไว้
authRouter.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. validate input
        if (!username || !password) {
            return res.status(400).json({ message: "กรอกข้อมูลไม่ครบ" });
        }

        const usersCollection = db.collection("users");

        // 2. ตรวจสอบ Username ว่ามีใน Database หรือไม่
        const user = await usersCollection.findOne({ username });
        if (!user) {
            return res
                .status(401)
                .json({ message: "Invalid username or password" });
        }

        // 3. ตรวจสอบ Password ว่าถูกต้องหรือไม่ (ใช้ bcrypt.compare)
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res
                .status(401)
                .json({ message: "Invalid username or password" });
        }

        // 4. เมื่อผ่านการตรวจสอบข้อมูลแล้วให้ใช้ jwt.sign เพื่อสร้าง Token
        const payload = {
            username: user.username,
            // แนบ object ที่มี id, firstName, lastName
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

        return res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});

export default authRouter;
