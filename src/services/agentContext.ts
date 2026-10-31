import { Types } from "mongoose";
import { Expense } from "../models/expense";
import { Goal } from "../models/goal";
import { User } from "../models/user";

const CATEGORY_LABELS: Record<string, string> = {
  chai: "Chai",
  food: "Food",
  transport: "Transport",
  shopping: "Shopping",
  entertainment: "Entertainment",
  health: "Health",
  bills: "Bills",
  others: "Other",
};

export type AgentSummary = {
  today: string;
  todayTotal: number;
  monthTotal: number;
  monthlyBudget: number;
  categoryTotalsThisMonth: { label: string; amount: number; percent: number }[];
  goals: {
    name: string;
    saved: number;
    target: number;
    daysLeft: number;
    isActive: boolean;
  }[];
  streak: number;
  recentExpenses: { date: string; category: string; amount: number; note?: string | undefined }[];
};

/**
 * Builds a compact snapshot of the user's finances.
 * `tzOffsetMinutes` is JS's Date.getTimezoneOffset() from the client (IST = -330),
 * so "today" and "this month" match the user's day, not the server's (usually UTC).
 */
export async function buildAgentContext(
  userId: Types.ObjectId,
  tzOffsetMinutes = 0
): Promise<AgentSummary> {
  const toLocalKey = (d: Date) =>
    new Date(d.getTime() - tzOffsetMinutes * 60000).toISOString().slice(0, 10);

  const todayKey = toLocalKey(new Date());
  const monthKey = todayKey.slice(0, 7);

  // 120 days is plenty for month totals and streaks, and keeps the query small
  const since = new Date(Date.now() - 120 * 86400000);

  const [expenses, goals, user] = await Promise.all([
    Expense.find({ userId, date: { $gte: since } }).sort({ date: -1 }),
    Goal.find({ userId }).sort({ createdAt: 1 }),
    User.findById(userId),
  ]);

  let todayTotal = 0;
  let monthTotal = 0;
  const categoryMap: Record<string, number> = {};
  const loggedDays = new Set<string>();

  expenses.forEach((e) => {
    const key = toLocalKey(e.date);
    loggedDays.add(key);
    if (key === todayKey) todayTotal += e.amount;
    if (key.slice(0, 7) === monthKey) {
      monthTotal += e.amount;
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
    }
  });

  const categoryTotalsThisMonth = Object.entries(categoryMap)
    .map(([category, amount]) => ({
      label: CATEGORY_LABELS[category] ?? category,
      amount,
      percent: monthTotal > 0 ? Math.round((amount / monthTotal) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Streak: consecutive logged days ending today (or yesterday if nothing logged yet today)
  const prevKey = (key: string) => {
    const d = new Date(`${key}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  };
  let cursor = loggedDays.has(todayKey) ? todayKey : prevKey(todayKey);
  let streak = 0;
  while (loggedDays.has(cursor)) {
    streak++;
    cursor = prevKey(cursor);
  }

  const activeGoalId = user?.activeGoalId?.toString();

  return {
    today: todayKey,
    todayTotal,
    monthTotal,
    monthlyBudget: user?.monthlyBudget ?? 0,
    categoryTotalsThisMonth,
    goals: goals.map((g) => ({
      name: g.name,
      saved: g.savedAmount,
      target: g.targetAmount,
      daysLeft: Math.max(Math.ceil((g.targetDate.getTime() - Date.now()) / 86400000), 0),
      isActive: g._id.toString() === activeGoalId,
    })),
    streak,
    recentExpenses: expenses.slice(0, 8).map((e) => ({
      date: toLocalKey(e.date),
      category: CATEGORY_LABELS[e.category] ?? e.category,
      amount: e.amount,
      note: e.note,
    })),
  };
}