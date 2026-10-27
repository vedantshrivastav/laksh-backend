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

export interface CategoryMemoryDocument extends Document {
  userId: Types.ObjectId;
  keyword: string;
  category: Category;
  count: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategoryMemorySchema = new Schema<CategoryMemoryDocument>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    keyword: { type: String, required: true, lowercase: true, trim: true },
    category: { type: String, required: true, enum: CATEGORY_VALUES },
    count: { type: Number, required: true, default: 1, min: 1 },
  },
  { timestamps: true }
);

// One memory entry per keyword per user
CategoryMemorySchema.index({ userId: 1, keyword: 1 }, { unique: true });

export const CategoryMemory = mongoose.model<CategoryMemoryDocument>(
  "CategoryMemory",
  CategoryMemorySchema
);