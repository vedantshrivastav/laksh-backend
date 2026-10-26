"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = require("mongoose");
const goal_1 = require("../models/goal");
const user_1 = require("../models/user");
const auth_1 = require("../middleware/auth");
const validateObjectId_1 = require("../utils/validateObjectId");
const router = (0, express_1.Router)();
function serialize(doc) {
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
router.get("/", auth_1.auth, async (req, res) => {
    try {
        const userId = new mongoose_1.Types.ObjectId(req.user.id);
        const [goals, user] = await Promise.all([
            goal_1.Goal.find({ userId }).sort({ createdAt: 1 }),
            user_1.User.findById(userId),
        ]);
        res.json({
            goals: goals.map(serialize),
            activeGoalId: user?.activeGoalId ? user.activeGoalId.toString() : null,
        });
    }
    catch {
        res.status(500).json({ error: "Failed to fetch goals" });
    }
});
// POST /api/goals -> create a goal; first goal for a user becomes active automatically
router.post("/", auth_1.auth, async (req, res) => {
    try {
        const userId = new mongoose_1.Types.ObjectId(req.user.id);
        const { name, emoji, targetAmount, startDate, targetDate } = req.body;
        if (!name || !targetAmount || targetAmount <= 0 || !startDate || !targetDate) {
            return res.status(400).json({
                error: "name, targetAmount (> 0), startDate, and targetDate are required",
            });
        }
        const goal = await goal_1.Goal.create({
            userId,
            name,
            emoji: emoji || "🎯",
            targetAmount,
            savedAmount: 0,
            startDate: new Date(startDate),
            targetDate: new Date(targetDate),
            isCompleted: false,
        });
        const user = await user_1.User.findById(userId);
        if (user && !user.activeGoalId) {
            user.activeGoalId = goal._id;
            await user.save();
        }
        res.status(201).json(serialize(goal));
    }
    catch {
        res.status(500).json({ error: "Failed to create goal" });
    }
});
// DELETE /api/goals/:id -> delete; reassigns active goal if the deleted one was active
router.delete("/:id", auth_1.auth, async (req, res) => {
    const goalId = (0, validateObjectId_1.parseObjectId)(req.params.id, res);
    if (!goalId)
        return;
    try {
        const userId = new mongoose_1.Types.ObjectId(req.user.id);
        const goal = await goal_1.Goal.findOneAndDelete({ _id: goalId, userId });
        if (!goal) {
            return res.status(404).json({ error: "Goal not found" });
        }
        const user = await user_1.User.findById(userId);
        if (user && user.activeGoalId?.toString() === goalId.toString()) {
            const nextGoal = await goal_1.Goal.findOne({ userId }).sort({ createdAt: 1 });
            user.activeGoalId = nextGoal ? nextGoal._id : null;
            await user.save();
        }
        res.json({ success: true });
    }
    catch {
        res.status(500).json({ error: "Failed to delete goal" });
    }
});
// PATCH /api/goals/:id/activate -> set this goal as the user's active goal
router.patch("/:id/activate", auth_1.auth, async (req, res) => {
    const goalId = (0, validateObjectId_1.parseObjectId)(req.params.id, res);
    if (!goalId)
        return;
    try {
        const userId = new mongoose_1.Types.ObjectId(req.user.id);
        const goal = await goal_1.Goal.findOne({ _id: goalId, userId });
        if (!goal) {
            return res.status(404).json({ error: "Goal not found" });
        }
        await user_1.User.findByIdAndUpdate(userId, { activeGoalId: goal._id });
        res.json({ success: true, activeGoalId: goal._id.toString() });
    }
    catch {
        res.status(500).json({ error: "Failed to activate goal" });
    }
});
// POST /api/goals/:id/contribute -> add money, capped at the target
router.post("/:id/contribute", auth_1.auth, async (req, res) => {
    const goalId = (0, validateObjectId_1.parseObjectId)(req.params.id, res);
    if (!goalId)
        return;
    try {
        const userId = new mongoose_1.Types.ObjectId(req.user.id);
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Amount must be greater than 0" });
        }
        const goal = await goal_1.Goal.findOne({ _id: goalId, userId });
        if (!goal) {
            return res.status(404).json({ error: "Goal not found" });
        }
        goal.savedAmount = Math.min(goal.savedAmount + amount, goal.targetAmount);
        goal.isCompleted = goal.savedAmount >= goal.targetAmount;
        await goal.save();
        res.json(serialize(goal));
    }
    catch {
        res.status(500).json({ error: "Failed to contribute to goal" });
    }
});
exports.default = router;
//# sourceMappingURL=goals.js.map