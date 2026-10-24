import mongoose, { Schema, Document, Types } from "mongoose";
import type { Category } from "./expense";

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

export type Period = "day" | "week";

export interface CommitmentDocument extends Document {
  userId: Types.ObjectId;
  category: Category;
  maxCount: number;
  period: Period;
  createdAt: Date;
  updatedAt: Date;
}

const CommitmentSchema = new Schema<CommitmentDocument>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    category: { type: String, required: true, enum: CATEGORY_VALUES },
    maxCount: { type: Number, required: true, min: 1 },
    period: { type: String, required: true, enum: ["day", "week"] },
  },
  { timestamps: true }
);

export const Commitment = mongoose.model<CommitmentDocument>(
  "Commitment",
  CommitmentSchema
);