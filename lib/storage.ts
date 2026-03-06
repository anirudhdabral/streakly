import { toDateKey } from "@/lib/date";
import type {
  Habit,
  HabitExportPayload,
  HabitFrequency,
  HabitStatus,
} from "@/types/habit";

const STORAGE_KEY = "habit-tracker-data";
const VALID_STATUSES: HabitStatus[] = ["done", "skip", "not_done"];
const VALID_FREQUENCIES: HabitFrequency[] = ["daily", "weekly", "monthly"];

interface LegacyHabit {
  id: string;
  name: string;
  completedDates: string[];
  createdAt: string;
}

function isStatus(value: unknown): value is HabitStatus {
  return (
    typeof value === "string" && VALID_STATUSES.includes(value as HabitStatus)
  );
}

function normalizeWeeklyDays(value: unknown, fallbackDay: number): number[] {
  if (!Array.isArray(value)) {
    return [fallbackDay];
  }

  const days = value
    .filter(
      (day): day is number => typeof day === "number" && day >= 0 && day <= 6,
    )
    .map((day) => Math.floor(day));

  return days.length > 0 ? Array.from(new Set(days)) : [fallbackDay];
}

function normalizeHabit(candidate: unknown): Habit | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const raw = candidate as Partial<Habit> & Partial<LegacyHabit>;

  if (
    typeof raw.id !== "string" ||
    typeof raw.name !== "string" ||
    typeof raw.createdAt !== "string"
  ) {
    return null;
  }

  const createdDate = new Date(raw.createdAt);
  const createdWeekDay = createdDate.getDay();
  const createdMonthDay = createdDate.getDate();

  const frequency = VALID_FREQUENCIES.includes(raw.frequency as HabitFrequency)
    ? (raw.frequency as HabitFrequency)
    : "daily";

  const weeklyDays = normalizeWeeklyDays(raw.weeklyDays, createdWeekDay);
  const monthlyDay =
    typeof raw.monthlyDay === "number" &&
    raw.monthlyDay >= 1 &&
    raw.monthlyDay <= 31
      ? Math.floor(raw.monthlyDay)
      : createdMonthDay;

  const entries: Record<string, HabitStatus> = {};

  if (
    raw.entries &&
    typeof raw.entries === "object" &&
    !Array.isArray(raw.entries)
  ) {
    for (const [key, value] of Object.entries(raw.entries)) {
      if (isStatus(value) && key >= toDateKey(createdDate)) {
        entries[key] = value;
      }
    }
  }

  if (Array.isArray(raw.completedDates)) {
    for (const dateKey of raw.completedDates) {
      if (typeof dateKey === "string" && dateKey >= toDateKey(createdDate)) {
        entries[dateKey] = "done";
      }
    }
  }

  return {
    id: raw.id,
    name: raw.name,
    createdAt: raw.createdAt,
    frequency,
    weeklyDays,
    monthlyDay,
    entries,
  };
}

function normalizeHabits(value: unknown): Habit[] {
  if (!Array.isArray(value)) return [];

  return value
    .map(normalizeHabit)
    .filter((habit): habit is Habit => Boolean(habit));
}

export function getHabits(): Habit[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    return normalizeHabits(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function saveHabits(habits: Habit[]): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

export function exportHabits(habits: Habit[]): string {
  const payload: HabitExportPayload = {
    version: 4,
    exportedAt: new Date().toISOString(),
    habits,
  };

  return JSON.stringify(payload, null, 2);
}

export function importHabits(jsonText: string): Habit[] {
  const parsed = JSON.parse(jsonText) as unknown;

  if (Array.isArray(parsed)) {
    return normalizeHabits(parsed);
  }

  if (parsed && typeof parsed === "object" && "habits" in parsed) {
    return normalizeHabits((parsed as { habits: unknown }).habits);
  }

  throw new Error("Unsupported import file format.");
}
