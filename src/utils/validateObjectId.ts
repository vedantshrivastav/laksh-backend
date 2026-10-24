import { Types } from "mongoose";
import { Response } from "express";

export function parseObjectId(idParam: unknown, res: Response): Types.ObjectId | null {
  if (typeof idParam !== "string" || !Types.ObjectId.isValid(idParam)) {
    res.status(400).json({ error: "Invalid id" });
    return null;
  }
  return new Types.ObjectId(idParam);
}