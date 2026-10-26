"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = require("mongoose");
const commitment_1 = require("../models/commitment");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
function serialize(doc) {
    return {
        id: doc._id.toString(),
        category: doc.category,
        maxCount: doc.maxCount,
        period: doc.period,
        createdAt: doc.createdAt.toISOString(),
    };
}
router.get("/", auth_1.auth, async (req, res) => {
    try {
        const userId = new mongoose_1.Types.ObjectId(req.user.id);
        const commitments = await commitment_1.Commitment.find({ userId }).sort({ createdAt: -1 });
        res.json(commitments.map(serialize));
    }
    catch {
        res.status(500).json({ error: "Failed to fetch commitments" });
    }
});
router.post("/", auth_1.auth, async (req, res) => {
    try {
        const userId = new mongoose_1.Types.ObjectId(req.user.id);
        const { category, maxCount, period } = req.body;
        if (!category || !maxCount || maxCount <= 0 || !period) {
            return res.status(400).json({
                error: "category, maxCount (> 0), and period ('day' | 'week') are required",
            });
        }
        if (period !== "day" && period !== "week") {
            return res.status(400).json({ error: "period must be 'day' or 'week'" });
        }
        const commitment = await commitment_1.Commitment.create({ userId, category, maxCount, period });
        res.status(201).json(serialize(commitment));
    }
    catch {
        res.status(500).json({ error: "Failed to create commitment" });
    }
});
router.delete("/:id", auth_1.auth, async (req, res) => {
    const idParam = req.params.id;
    if (typeof idParam !== "string" || !mongoose_1.Types.ObjectId.isValid(idParam)) {
        return res.status(400).json({ error: "Invalid id" });
    }
    try {
        const userId = new mongoose_1.Types.ObjectId(req.user.id);
        const commitmentId = new mongoose_1.Types.ObjectId(idParam);
        const commitment = await commitment_1.Commitment.findOneAndDelete({ _id: commitmentId, userId });
        if (!commitment) {
            return res.status(404).json({ error: "Commitment not found" });
        }
        res.json({ success: true });
    }
    catch {
        res.status(500).json({ error: "Failed to delete commitment" });
    }
});
exports.default = router;
//# sourceMappingURL=commitments.js.map