import mongoose, { Schema, Document, Types } from "mongoose";

export type Category =
  | "food"
  | "transport"
  | "shopping"
  | "entertainment"
  | "health"
  | "bills"
  | "others"
  | "chai";

const CATEGORY_VALUES: Category[] = [
  "food",
  "transport",
  "shopping",
  "entertainment",
  "health",
  "bills",
  "others",
  "chai",
];

export interface ExpenseDocument extends Document {
  userId: Types.ObjectId;
  amount: number;
  category: Category;
  label: string;
  note?: string;
  date: Date;
  goalId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<ExpenseDocument>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: String, required: true, enum: CATEGORY_VALUES },
    label: { type: String, required: true },
    note: { type: String },
    date: { type: Date, required: true },
    goalId: { type: String },
  },
  { timestamps: true }
);

export const Expense = mongoose.model<ExpenseDocument>("Expense", ExpenseSchema);