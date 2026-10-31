import { Router, Request, Response } from "express";
import { Types } from "mongoose";
import jwt from "jsonwebtoken";
import { User } from "../models/user";
import { auth, AuthRequest } from "../middleware/auth";

const router = Router();

// Mock OTP: swap this for a real SMS provider (Twilio, MSG91) later.
// Kept in env so it's one line to change when you do.
const MOCK_OTP = process.env.MOCK_OTP_CODE || "1234";

// Accepts "9876543210", "919876543210", or "+919876543210" and
// normalizes to "+919876543210". Returns null if it isn't a valid Indian mobile number.
function normalizeIndianPhone(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const digits = raw.replace(/[^\d]/g, "");

  const tenDigits =
    digits.length === 12 && digits.startsWith("91")
      ? digits.slice(2)
      : digits.length === 10
        ? digits
        : null;

  if (!tenDigits || !/^[6-9]\d{9}$/.test(tenDigits)) return null;
  return `+91${tenDigits}`;
}

function signToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set in environment");
  return jwt.sign({ userId }, secret, { expiresIn: "30d" });
}

// POST /api/auth/send-otp
// Body: { phone }
router.post("/send-otp", async (req: Request, res: Response) => {
  const phone = normalizeIndianPhone(req.body?.phone);
  if (!phone) {
    return res.status(400).json({ error: "Enter a valid 10-digit Indian mobile number" });
  }

  // Real implementation: generate a random code, store it with an expiry,
  // and send it via SMS. For now we just acknowledge.
  res.json({ success: true, phone });
});

// POST /api/auth/verify-otp
// Body: { phone, otp } -> { token, isNewUser, user }
router.post("/verify-otp", async (req: Request, res: Response) => {
  try {
    const phone = normalizeIndianPhone(req.body?.phone);
    const otp = req.body?.otp;

    if (!phone) {
      return res.status(400).json({ error: "Enter a valid 10-digit Indian mobile number" });
    }
    if (typeof otp !== "string" || otp !== MOCK_OTP) {
      return res.status(401).json({ error: "Incorrect OTP" });
    }

    let user = await User.findOne({ phone });
    const isNewUser = !user;
    if (!user) {
      user = await User.create({ phone });
    }

    const token = signToken(user._id.toString());

    res.json({
      token,
      isNewUser,
      user: {
        id: user._id.toString(),
        phone: user.phone,
        name: user.name ?? null,
        hasOnboarded: user.hasOnboarded,
      },
    });
  } catch {
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});

// GET /api/auth/me -> lets the app check on launch whether its saved token is still valid
router.get("/me", auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(new Types.ObjectId(req.user!.id));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user._id.toString(),
      phone: user.phone,
      name: user.name ?? null,
      hasOnboarded: user.hasOnboarded,
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

export default router;