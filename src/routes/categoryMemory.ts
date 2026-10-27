import { Router, Response } from "express";
import { Types } from "mongoose";
import { CategoryMemory } from "../models/CategoryMemory";
import { auth, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/category-memory -> { [keyword]: { category, count } }
// Shaped to match the frontend's Record<string, MemoryEntry> exactly.
router.get("/", auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!.id);
    const entries = await CategoryMemory.find({ userId });

    const memory: Record<string, { category: string; count: number }> = {};
    entries.forEach((e) => {
      memory[e.keyword] = { category: e.category, count: e.count };
    });

    res.json(memory);
  } catch {
    res.status(500).json({ error: "Failed to fetch category memory" });
  }
});

// POST /api/category-memory/learn -> same logic as the frontend's learn() action:
// same category seen again -> count++, different category -> reset count to 1
router.post("/learn", auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!.id);
    const { keyword, category } = req.body;

    if (!keyword || typeof keyword !== "string" || !category) {
      return res.status(400).json({ error: "keyword and category are required" });
    }

    const key = keyword.trim().toLowerCase();
    if (!key) {
      return res.status(400).json({ error: "keyword cannot be empty" });
    }

    const existing = await CategoryMemory.findOne({ userId, keyword: key });

    if (existing && existing.category === category) {
      existing.count += 1;
      await existing.save();
    } else if (existing) {
      existing.category = category;
      existing.count = 1;
      await existing.save();
    } else {
      await CategoryMemory.create({ userId, keyword: key, category, count: 1 });
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to update category memory" });
  }
});

export default router;