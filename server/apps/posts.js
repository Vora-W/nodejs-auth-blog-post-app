import { ObjectId } from "mongodb";
import { Router } from "express";
import { db } from "../utils/db.js";
import { protect } from "../middlewares/protect.js";
import { posts as seedPosts } from "../data/posts.js";

const postRouter = Router();

// 🐨 Todo: Exercise #5
// นำ Middleware `protect` มาใช้กับ `postRouter` ด้วย Function `app.use`
postRouter.use(protect);

// 🐨 Seed ข้อมูลเริ่มต้นจาก server/data/posts.js เข้าสู่ MongoDB
async function seedInitialPosts() {
  const collection = db.collection("posts");
  const count = await collection.countDocuments();
  if (count > 0) {
    return;
  }

  const now = new Date();
  const docs = seedPosts.map((post) => ({
    title: post.title,
    content: post.content,
    status: "published",
    likes: post.likes,
    created_at: now,
    updated_at: now,
    published_at: now,
  }));

  await collection.insertMany(docs);
}

// เรียก seed ตอนโหลดโมดูล (จะทำงานครั้งเดียวตอน server start)
seedInitialPosts().catch((err) => {
  console.error("Failed to seed initial posts:", err);
});

postRouter.get("/", async (req, res) => {
  const status = req.query.status;
  const keywords = req.query.keywords;
  const page = req.query.page;

  const PAGE_SIZE = 5;
  const skip = PAGE_SIZE * (page - 1);

  const query = {};

  if (status) {
    query.status = status;
  } else if (keywords) {
    query.title = new RegExp(`${keywords}`, "i");
  }

  const collection = db.collection("posts");
  const posts = await collection
    .find(query)
    .sort({ published_at: -1 })
    .skip(skip)
    .limit(5)
    .toArray();

  const count = await collection.countDocuments(query);
  const totalPages = Math.ceil(count / PAGE_SIZE);

  return res.json({
    data: posts,
    total_pages: totalPages,
  });
});

postRouter.get("/:id", async (req, res) => {
  const postId = ObjectId(req.params.id);
  const collection = db.collection("posts");
  const post = await collection.find({ _id: postId }).toArray();
  return res.json({
    data: post[0],
  });
});

postRouter.post("/", async (req, res) => {
  const hasPublished = req.body.status === "published";
  const newPost = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
    published_at: hasPublished ? new Date() : null,
  };

  const collection = db.collection("posts");
  await collection.insertOne(newPost);

  return res.json({
    message: "Post has been created.",
  });
});

postRouter.put("/:id", async (req, res) => {
  const hasPublished = req.body.status === "published";

  const updatedPost = {
    ...req.body,
    updated_at: new Date(),
    published_at: hasPublished ? new Date() : null,
  };
  const postId = ObjectId(req.params.id);
  const collection = db.collection("posts");
  await collection.updateOne(
    { _id: postId },
    {
      $set: updatedPost,
    }
  );
  return res.json({
    message: `Post ${postId} has been updated.`,
  });
});

postRouter.delete("/:id", async (req, res) => {
  const postId = ObjectId(req.params.id);
  const collection = db.collection("posts");
  await collection.deleteOne({ _id: postId });
  return res.json({
    message: `Post ${postId} has been deleted.`,
  });
});

export default postRouter;
