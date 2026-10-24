import { Router, Response } from "express";
import { Types } from "mongoose";
import { Commitment, CommitmentDocument } from "../models/commitment";
import { auth, AuthRequest } from "../middleware/auth";

const router = Router();

function serialize(doc: CommitmentDocument) {
  return {
    id: doc._id.toString(),
    category: doc.category,
    maxCount: doc.maxCount,
    period: doc.period,
    createdAt: doc.createdAt.toISOString(),
  };
}

router.get("/", auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!.id);
    const commitments = await Commitment.find({ userId }).sort({ createdAt: -1 });
    res.json(commitments.map(serialize));
  } catch {
    res.status(500).json({ error: "Failed to fetch commitments" });
  }
});

router.post("/", auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!.id);
    const { category, maxCount, period } = req.body;

    if (!category || !maxCount || maxCount <= 0 || !period) {
      return res.status(400).json({
        error: "category, maxCount (> 0), and period ('day' | 'week') are required",
      });
    }
    if (period !== "day" && period !== "week") {
      return res.status(400).json({ error: "period must be 'day' or 'week'" });
    }

    const commitment = await Commitment.create({ userId, category, maxCount, period });
    res.status(201).json(serialize(commitment));
  } catch {
    res.status(500).json({ error: "Failed to create commitment" });
  }
});

router.delete("/:id", auth, async (req: AuthRequest, res: Response) => {
  const idParam = req.params.id;

  if (typeof idParam !== "string" || !Types.ObjectId.isValid(idParam)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  try {
    const userId = new Types.ObjectId(req.user!.id);
    const commitmentId = new Types.ObjectId(idParam);

    const commitment = await Commitment.findOneAndDelete({ _id: commitmentId, userId });
    if (!commitment) {
      return res.status(404).json({ error: "Commitment not found" });
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete commitment" });
  }
});

export default router;