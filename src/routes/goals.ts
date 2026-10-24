import { Router, Response } from "express";
import { Types } from "mongoose";
import { Goal, GoalDocument } from "../models/goal";
import { User } from "../models/user";
import { auth, AuthRequest } from "../middleware/auth";
import { parseObjectId } from "../utils/validateObjectId";

const router = Router();

function serialize(doc: GoalDocument) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    emoji: doc.emoji,
    targetAmount: doc.targetAmount,
    savedAmount: doc.savedAmount,
    startDate: doc.startDate.toISOString(),
    targetDate: doc.targetDate.toISOString(),
    isCompleted: doc.isCompleted,
  };
}

// GET /api/goals -> { goals: Goal[], activeGoalId: string | null }
router.get("/", auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!.id);
    const [goals, user] = await Promise.all([
      Goal.find({ userId }).sort({ createdAt: 1 }),
      User.findById(userId),
    ]);

    res.json({
      goals: goals.map(serialize),
      activeGoalId: user?.activeGoalId ? user.activeGoalId.toString() : null,
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch goals" });
  }
});

// POST /api/goals -> create a goal; first goal for a user becomes active automatically
router.post("/", auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!.id);
    const { name, emoji, targetAmount, startDate, targetDate } = req.body;

    if (!name || !targetAmount || targetAmount <= 0 || !startDate || !targetDate) {
      return res.status(400).json({
        error: "name, targetAmount (> 0), startDate, and targetDate are required",
      });
    }

    const goal = await Goal.create({
      userId,
      name,
      emoji: emoji || "🎯",
      targetAmount,
      savedAmount: 0,
      startDate: new Date(startDate),
      targetDate: new Date(targetDate),
      isCompleted: false,
    });

    const user = await User.findById(userId);
    if (user && !user.activeGoalId) {
      user.activeGoalId = goal._id as Types.ObjectId;
      await user.save();
    }

    res.status(201).json(serialize(goal));
  } catch {
    res.status(500).json({ error: "Failed to create goal" });
  }
});

// DELETE /api/goals/:id -> delete; reassigns active goal if the deleted one was active
router.delete("/:id", auth, async (req: AuthRequest, res: Response) => {
  const goalId = parseObjectId(req.params.id, res);
  if (!goalId) return;

  try {
    const userId = new Types.ObjectId(req.user!.id);
    const goal = await Goal.findOneAndDelete({ _id: goalId, userId });
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    const user = await User.findById(userId);
    if (user && user.activeGoalId?.toString() === goalId.toString()) {
      const nextGoal = await Goal.findOne({ userId }).sort({ createdAt: 1 });
      user.activeGoalId = nextGoal ? (nextGoal._id as Types.ObjectId) : null;
      await user.save();
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete goal" });
  }
});

// PATCH /api/goals/:id/activate -> set this goal as the user's active goal
router.patch("/:id/activate", auth, async (req: AuthRequest, res: Response) => {
  const goalId = parseObjectId(req.params.id, res);
  if (!goalId) return;

  try {
    const userId = new Types.ObjectId(req.user!.id);
    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    await User.findByIdAndUpdate(userId, { activeGoalId: goal._id });
    res.json({ success: true, activeGoalId: goal._id.toString() });
  } catch {
    res.status(500).json({ error: "Failed to activate goal" });
  }
});

// POST /api/goals/:id/contribute -> add money, capped at the target
router.post("/:id/contribute", auth, async (req: AuthRequest, res: Response) => {
  const goalId = parseObjectId(req.params.id, res);
  if (!goalId) return;

  try {
    const userId = new Types.ObjectId(req.user!.id);
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Amount must be greater than 0" });
    }

    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    goal.savedAmount = Math.min(goal.savedAmount + amount, goal.targetAmount);
    goal.isCompleted = goal.savedAmount >= goal.targetAmount;
    await goal.save();

    res.json(serialize(goal));
  } catch {
    res.status(500).json({ error: "Failed to contribute to goal" });
  }
});

export default router;