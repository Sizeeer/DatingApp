import { Router } from "express";

const router = Router();

router.get("/users", async (req, res) => {
  res.json({ message: "Hello" });
});

export default router;
