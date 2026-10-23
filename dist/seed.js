"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("./models/user");
const expense_1 = require("./models/expense");
dotenv_1.default.config();
const TEST_PHONE = "9999999999";
function randomPastDate(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(Math.floor(Math.random() * 12) + 8, 0, 0, 0);
    return d;
}
async function seed() {
    const mongoUri = process.env.MONGO_URI;
    const jwtSecret = process.env.JWT_SECRET;
    if (!mongoUri || !jwtSecret) {
        throw new Error("MONGO_URI and JWT_SECRET must be set in .env");
    }
    await mongoose_1.default.connect(mongoUri);
    console.log("Connected to MongoDB");
    // Clear previous test data so this script is safe to re-run
    await user_1.User.deleteMany({ phone: TEST_PHONE });
    const existingTestUser = await user_1.User.findOne({ phone: TEST_PHONE });
    if (existingTestUser) {
        await expense_1.Expense.deleteMany({ userId: existingTestUser._id });
    }
    const user = await user_1.User.create({
        phone: TEST_PHONE,
        name: "Test User",
    });
    console.log("Created test user:", user._id.toString());
    const sampleExpenses = [
        { amount: 50, category: "chai", label: "Chai", note: "morning chai", daysAgo: 0 },
        { amount: 320, category: "food", label: "Food", note: "swiggy dinner", daysAgo: 0 },
        { amount: 180, category: "transport", label: "Cab", note: "uber to office", daysAgo: 1 },
        { amount: 90, category: "chai", label: "Chai", note: "chai with friends", daysAgo: 1 },
        { amount: 450, category: "food", label: "Food", note: "swiggy lunch", daysAgo: 2 },
        { amount: 1200, category: "shopping", label: "Shopping", note: "amazon order", daysAgo: 3 },
        { amount: 210, category: "transport", label: "Cab", note: "ola ride", daysAgo: 4 },
        { amount: 60, category: "chai", label: "Chai", note: "evening chai", daysAgo: 5 },
        { amount: 380, category: "food", label: "Food", note: "zomato order", daysAgo: 6 },
        { amount: 1500, category: "bills", label: "Bills", note: "electricity bill", daysAgo: 7 },
        { amount: 140, category: "transport", label: "Cab", note: "uber ride", daysAgo: 8 },
        { amount: 75, category: "chai", label: "Chai", note: "chai break", daysAgo: 9 },
        { amount: 600, category: "food", label: "Food", note: "swiggy dinner", daysAgo: 10 },
        { amount: 220, category: "others", label: "More", note: "misc purchase", daysAgo: 12 },
        { amount: 95, category: "chai", label: "Chai", note: "chai", daysAgo: 14 },
    ];
    const docs = sampleExpenses.map((e) => ({
        userId: user._id,
        amount: e.amount,
        category: e.category,
        label: e.label,
        note: e.note,
        date: randomPastDate(e.daysAgo),
    }));
    await expense_1.Expense.insertMany(docs);
    console.log(`Seeded ${docs.length} expenses`);
    const token = jsonwebtoken_1.default.sign({ userId: user._id.toString() }, jwtSecret, {
        expiresIn: "30d",
    });
    console.log("\nTest JWT (valid 30 days) — use this in your curl/app requests:\n");
    console.log(token);
    await mongoose_1.default.disconnect();
    console.log("\nDone. Disconnected from MongoDB.");
}
seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map