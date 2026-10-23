"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const expense_1 = require("../models/expense");
const auth_1 = require("../middleware/auth");
const mongoose_1 = require("mongoose");
const router = (0, express_1.Router)();
// Maps Mongo's _id to id and keeps the shape matching the RN app's Expense type
function serialize(doc) {
    return {
        id: doc._id.toString(),
        amount: doc.amount,
        category: doc.category,
        label: doc.label,
        note: doc.note,
        date: doc.date.toISOString(),
        goalId: doc.goalId,
    };
}
router.get("/", auth_1.auth, async (req, res) => {
    try {
        const userId = new mongoose_1.Types.ObjectId(req.user.id);
        const expenses = await expense_1.Expense.find({ userId: userId }).sort({ date: -1 });
        res.json(expenses.map(serialize));
    }
    catch {
        res.status(500).json({ error: "Failed to fetch expenses" });
    }
});
router.post("/", auth_1.auth, async (req, res) => {
    try {
        const { amount, category, label, note, date, goalId } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Amount must be greater than 0" });
        }
        if (!category || !label || !date) {
            return res.status(400).json({ error: "category, label, and date are required" });
        }
        const expense = await expense_1.Expense.create({
            userId: req.user.id,
            amount,
            category,
            label,
            note,
            date: new Date(date),
            goalId,
        });
        res.status(201).json(serialize(expense));
    }
    catch {
        res.status(500).json({ error: "Failed to create expense" });
    }
});
router.patch("/:id", auth_1.auth, async (req, res) => {
    try {
        const userId = new mongoose_1.Types.ObjectId(req.user.id);
        const expense = await expense_1.Expense.findOne({ _id: userId, userId: req.user.id });
        if (!expense) {
            return res.status(404).json({ error: "Expense not found" });
        }
        const { amount, category, label, note, date, goalId } = req.body;
        if (amount !== undefined) {
            if (amount <= 0)
                return res.status(400).json({ error: "Amount must be greater than 0" });
            expense.amount = amount;
        }
        if (category !== undefined)
            expense.category = category;
        if (label !== undefined)
            expense.label = label;
        if (note !== undefined)
            expense.note = note;
        if (date !== undefined)
            expense.date = new Date(date);
        if (goalId !== undefined)
            expense.goalId = goalId;
        await expense.save();
        res.json(serialize(expense));
    }
    catch {
        res.status(500).json({ error: "Failed to update expense" });
    }
});
router.delete("/:id", auth_1.auth, async (req, res) => {
    try {
        const userId = new mongoose_1.Types.ObjectId(req.user.id);
        const expense = await expense_1.Expense.findOneAndDelete({ _id: userId, userId: req.user.id });
        if (!expense) {
            return res.status(404).json({ error: "Expense not found" });
        }
        res.json({ success: true });
    }
    catch {
        res.status(500).json({ error: "Failed to delete expense" });
    }
});
exports.default = router;
//# sourceMappingURL=expenses.js.map