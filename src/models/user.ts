import mongoose, { Schema, Document, Types } from "mongoose";

export interface UserDocument extends Document {
  phone: string;
  name?: string;
  activeGoalId: Types.ObjectId | null;
  monthlyBudget: number;
  hasOnboarded: boolean;
  lastSeenWeekKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    phone: { type: String, required: true, unique: true },
    name: { type: String },
    activeGoalId: { type: Schema.Types.ObjectId, ref: "Goal", default: null },
    monthlyBudget: { type: Number, required: true, default: 15000, min: 0 },
    hasOnboarded: { type: Boolean, required: true, default: false },
    lastSeenWeekKey: { type: String, default: null },
  },
  { timestamps: true }
);

export const User = mongoose.model<UserDocument>("User", UserSchema);