import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Express's Request has no `user` field by default — this extends it
// so route handlers get proper typing on req.user after auth() runs.
export interface AuthRequest extends Request {
  user?: { id: string };
}

interface JwtPayload {
  userId: string;
}

export function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const token = header.split(" ")[1]!;

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not set in environment");

    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = { id: decoded.userId };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}