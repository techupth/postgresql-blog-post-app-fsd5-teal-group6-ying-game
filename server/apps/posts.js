import { Router } from "express";
import { pool } from "../utils/db.js";

const postRouter = Router();

postRouter.get("/", async (req, res) => {
  const status = req.query.status||""
  const keywords = req.query.keywords||""
  const page = req.query.page;

  let query = "";
  let values = [];

  if (status && keywords) {
    query = `select * from posts where status=$1 and title like $2 order by post_id asc limit 5`;
    values = [status, keywords];
  } else if (status) {
    query = `select * from posts where status=$1 order by post_id asc limit 5`;
    values = [status];
  } else if (keywords) {
    query = `select * from posts where title=$1 order by post_id asc limit 5`;
    values = [keywords];
  }else if (!status&&!keywords) {
    query = `select * from posts order by post_id asc limit 5`;
    values=[]
    }

  try {
    const result = await pool.query(query, values);
    return res.json({
      data: result.rows,
    });
  } catch (error) {
    console.log("Error in getting the posts : ", error);
  }
});

postRouter.get("/:id", async (req, res) => {
  const postId = req.params.id;
  let query = `select * from posts where post_id=$1`;
  let values = [postId];
  try {
    const result = await pool.query(query, values);
    return res.json({
      data: result.rows[0],
    });
  } catch (error) {
    console.log(error);
  }
});

postRouter.post("/", async (req, res) => {
  const hasPublished = req.body.status === "published";
  const newPost = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
    published_at: hasPublished ? new Date() : null,
  }
try{
await pool.query ( `INSERT INTO posts (title,content,likes, category,user_id,status,created_at,updated_at,published_at)
  values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`
,[newPost.title,
  newPost.content,
  newPost.likes,
  newPost.category,
  newPost.user_id,
  newPost.status,
  newPost.created_at,
  newPost.updated_at,
  newPost.published_at
])
  return res.json({
    message: "Post has been created.",
  });}
  catch(error){
    return res.status(400).json({message: "Post has been created."})
  }
});

postRouter.put("/:id", async (req, res) => {
  const hasPublished = req.body.status === "published";

  const updatedPost = {
    ...req.body,
    updated_at: new Date(),
    published_at: hasPublished ? new Date() : null,
  };
  const postId = req.params.id;
try{
  await pool.query(`UPDATE posts
  SET title=$1,content=$2,category=$3,status=$4,updated_at=$5,published_at=$6
  WHERE post_id=$7`,[
    updatedPost.title,
    updatedPost.content,
    updatedPost.category,
    updatedPost.status,
    updatedPost.updated_at,
    updatedPost.published_at,
    postId
  ])

  return res.json({
    message: `Post ${postId} has been updated.`,
  });
}
  catch(error){
    console.log("Error in updating the Post"+" "+error);
  }
});

postRouter.delete("/:id", async (req, res) => {
  const postId = req.params.id;
await pool.query(`DELETE FROM posts WHERE post_id=$1;`,[postId])
  return res.json({
    message: `Post ${postId} has been deleted.`,
  });
});

export default postRouter;
