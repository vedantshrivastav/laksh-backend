import mongoose, { Schema, Document, Types } from "mongoose";

export type NotificationType =
  | "budget"
  | "goal"
  | "commitment"
  | "weekly_report"
  | "pattern"
  | "frequency"
  | "general";

const TYPE_VALUES: NotificationType[] = [
  "budget",
  "goal",
  "commitment",
  "weekly_report",
  "pattern",
  "frequency",
  "general",
];

export interface NotificationDocument extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    type: { type: String, required: true, enum: TYPE_VALUES },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<NotificationDocument>(
  "Notification",
  NotificationSchema
);