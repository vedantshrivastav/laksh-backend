"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const expenses_1 = __importDefault(require("./routes/expenses"));
const goals_1 = __importDefault(require("./routes/goals"));
const commitments_1 = __importDefault(require("./routes/commitments"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/expenses", expenses_1.default);
app.use("/api/goals", goals_1.default);
app.use("/api/commitments", commitments_1.default);
const PORT = process.env.PORT || 4000;
mongoose_1.default
    .connect(process.env.MONGO_URL)
    .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
    .catch((err) => console.error("MongoDB connection failed:", err));
//# sourceMappingURL=server.js.map