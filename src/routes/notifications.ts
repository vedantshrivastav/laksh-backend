import { Router, Response } from "express";
import { Types } from "mongoose";
import { Notification, NotificationDocument } from "../models/notification";
import { auth, AuthRequest } from "../middleware/auth";
import { parseObjectId } from "../utils/validateObjectId";

const router = Router();

function serialize(doc: NotificationDocument) {
  return {
    id: doc._id.toString(),
    type: doc.type,
    title: doc.title,
    message: doc.message,
    read: doc.read,
    createdAt: doc.createdAt.toISOString(),
  };
}

// GET /api/notifications -> newest first, capped at 100
router.get("/", auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!.id);
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(notifications.map(serialize));
  } catch {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// POST /api/notifications -> create one (called when an agent event fires)
router.post("/", auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!.id);
    const { type, title, message } = req.body;

    if (!type || !title || !message) {
      return res.status(400).json({ error: "type, title, and message are required" });
    }

    const notification = await Notification.create({ userId, type, title, message });
    res.status(201).json(serialize(notification));
  } catch {
    res.status(500).json({ error: "Failed to create notification" });
  }
});

// PATCH /api/notifications/:id/read -> mark one as read
router.patch("/:id/read", auth, async (req: AuthRequest, res: Response) => {
  const notificationId = parseObjectId(req.params.id, res);
  if (!notificationId) return;

  try {
    const userId = new Types.ObjectId(req.user!.id);
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.json(serialize(notification));
  } catch {
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// PATCH /api/notifications/read-all -> mark all as read
router.patch("/read-all", auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!.id);
    await Notification.updateMany({ userId, read: false }, { read: true });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to mark all as read" });
  }
});

// DELETE /api/notifications -> clear all
router.delete("/", auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!.id);
    await Notification.deleteMany({ userId });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to clear notifications" });
  }
});

export default router;