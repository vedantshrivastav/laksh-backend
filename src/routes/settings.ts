import { Router, Response } from "express";
import { Types } from "mongoose";
import { User } from "../models/user";
import { auth, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/settings -> { monthlyBudget, hasOnboarded }
router.get("/", auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!.id);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      monthlyBudget: user.monthlyBudget,
      hasOnboarded: user.hasOnboarded,
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// PATCH /api/settings -> update either field, both optional
router.patch("/", auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!.id);
    const { monthlyBudget, hasOnboarded } = req.body;

    const update: Partial<{ monthlyBudget: number; hasOnboarded: boolean }> = {};

    if (monthlyBudget !== undefined) {
      if (typeof monthlyBudget !== "number" || monthlyBudget < 0) {
        return res.status(400).json({ error: "monthlyBudget must be a number >= 0" });
      }
      update.monthlyBudget = monthlyBudget;
    }

    if (hasOnboarded !== undefined) {
      if (typeof hasOnboarded !== "boolean") {
        return res.status(400).json({ error: "hasOnboarded must be a boolean" });
      }
      update.hasOnboarded = hasOnboarded;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      monthlyBudget: user.monthlyBudget,
      hasOnboarded: user.hasOnboarded,
    });
  } catch {
    res.status(500).json({ error: "Failed to update settings" });
  }
});

export default router;