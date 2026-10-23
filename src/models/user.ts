import mongoose, { Schema, Document } from "mongoose";

export interface UserDocument extends Document {
  phone: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    phone: { type: String, required: true, unique: true },
    name: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model<UserDocument>("User", UserSchema);