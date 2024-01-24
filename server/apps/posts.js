import { Router } from "express";
import { connectionPool } from "../utils/db.js";

const postRouter = Router();

postRouter.get("/", async (req, res) => {
  const status = req.query.status;
  const keywords = req.query.keywords;
  const page = req.query.page;

  const result = await connectionPool.query("select * from posts");

  return res.json({
    data: result.rows,
  });
});

postRouter.get("/:id", async (req, res) => {
  const postId = req.params.id;
  try {
    const result = await connectionPool.query(
      `select * from posts where post_id=$1`,
      [postId]
    );
  } catch (err) {
    console.log(err);
  }
  return res.json({
    data: result.rows,
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

  const newData = await connectionPool.query(
    `insert into posts (title, content, status,category,created_at,updated_at, published_at) values($1,$2,$3,$4,$5,$6,$7) `,
    [
      newPost.title,
      newPost.content,
      newPost.status,
      newPost.category,
      newPost.created_at,
      newPost.updated_at,
      newPost.published_at,
    ]
  );

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
  const postId = req.params.id;

  const originalPost = await connectionPool.query(
    `select * from posts where post_id =$1`,
    [postId]
  );

  if (!originalPost.post_id)
    return res.json({ message: "no post found, please check your ID" });

  const title = req.body.title || originalPost.title;
  const content = req.body.content || originalPost.content;
  const status = req.body.status || originalPost.status;
  const category = req.body.category || originalPost.category;

  const newData = await connectionPool.query(
    `update posts set content =$1 , title = $2, status =$3, category = $4 where post_id = $5 returning *`,
    [title, content, status, category, postId]
  );

  return res.json({
    message: `Post ${postId} has been updated.`,
  });
});

postRouter.delete("/:id", async (req, res) => {
  const postId = req.params.id;
  const originalPost = await connectionPool.query(
    `select * from posts where post_id =$1`,
    [postId]
  );

  if (!originalPost.post_id) {
    return res.json({ message: "no post found, please check your ID" });
  }

  const deleteData = await connectionPool.query(
    `delete from posts where post_id = $1`,
    [postId]
  );

  return res.json({
    message: `Post ${postId} has been deleted.`,
  });
});

export default postRouter;
