import mongoose, { Schema, Document, Types } from "mongoose";

export interface GoalDocument extends Document {
  userId: Types.ObjectId;
  name: string;
  emoji: string;
  targetAmount: number;
  savedAmount: number;
  startDate: Date;
  targetDate: Date;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<GoalDocument>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    name: { type: String, required: true },
    emoji: { type: String, required: true, default: "🎯" },
    targetAmount: { type: Number, required: true, min: 0.01 },
    savedAmount: { type: Number, required: true, default: 0, min: 0 },
    startDate: { type: Date, required: true },
    targetDate: { type: Date, required: true },
    isCompleted: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

export const Goal = mongoose.model<GoalDocument>("Goal", GoalSchema);