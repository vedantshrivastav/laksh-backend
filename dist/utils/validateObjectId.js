"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseObjectId = parseObjectId;
const mongoose_1 = require("mongoose");
function parseObjectId(idParam, res) {
    if (typeof idParam !== "string" || !mongoose_1.Types.ObjectId.isValid(idParam)) {
        res.status(400).json({ error: "Invalid id" });
        return null;
    }
    return new mongoose_1.Types.ObjectId(idParam);
}
//# sourceMappingURL=validateObjectId.js.map