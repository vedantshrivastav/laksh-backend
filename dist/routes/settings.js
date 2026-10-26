"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = require("mongoose");
const user_1 = require("../models/user");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/settings -> { monthlyBudget, hasOnboarded }
router.get("/", auth_1.auth, async (req, res) => {
    try {
        const userId = new mongoose_1.Types.ObjectId(req.user.id);
        const user = await user_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({
            monthlyBudget: user.monthlyBudget,
            hasOnboarded: user.hasOnboarded,
        });
    }
    catch {
        res.status(500).json({ error: "Failed to fetch settings" });
    }
});
// PATCH /api/settings -> update either field, both optional
router.patch("/", auth_1.auth, async (req, res) => {
    try {
        const userId = new mongoose_1.Types.ObjectId(req.user.id);
        const { monthlyBudget, hasOnboarded } = req.body;
        const update = {};
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
        const user = await user_1.User.findByIdAndUpdate(userId, update, { new: true });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({
            monthlyBudget: user.monthlyBudget,
            hasOnboarded: user.hasOnboarded,
        });
    }
    catch {
        res.status(500).json({ error: "Failed to update settings" });
    }
});
exports.default = router;
//# sourceMappingURL=settings.js.map