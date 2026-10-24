import mongoose, { Schema, Document, Types } from "mongoose";

export interface UserDocument extends Document {
  phone: string;
  name?: string;
  activeGoalId: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    phone: { type: String, required: true, unique: true },
    name: { type: String },
    activeGoalId: { type: Schema.Types.ObjectId, ref: "Goal", default: null },
  },
  { timestamps: true }
);

export const User = mongoose.model<UserDocument>("User", UserSchema);