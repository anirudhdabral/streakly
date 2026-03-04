import { fromDateKey, getDaysInMonth, getTodayKey, toDateKey } from "@/lib/date";
import type { Habit, HabitStatus } from "@/types/habit";

export const STATUS_OPTIONS: HabitStatus[] = ["done", "skip", "not_done"];

export function getHabitStartKey(habit: Habit): string {
  return toDateKey(new Date(habit.createdAt));
}

export function isHabitTrackedOnDate(habit: Habit, dateKey: string): boolean {
  const date = fromDateKey(dateKey);
  const startDate = fromDateKey(getHabitStartKey(habit));
  startDate.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date < startDate) {
    return false;
  }

  if (habit.frequency === "daily") {
    return true;
  }

  if (habit.frequency === "weekly") {
    return habit.weeklyDays.includes(date.getDay());
  }

  const monthLastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const effectiveMonthlyDay = Math.min(habit.monthlyDay, monthLastDay);
  return date.getDate() === effectiveMonthlyDay;
}

export function getHabitStatus(habit: Habit, dateKey: string): HabitStatus {
  if (!isHabitTrackedOnDate(habit, dateKey)) {
    return "not_done";
  }

  return habit.entries[dateKey] ?? "not_done";
}

export function setHabitStatus(habit: Habit, dateKey: string, status: HabitStatus): Habit {
  if (!isHabitTrackedOnDate(habit, dateKey)) {
    return habit;
  }

  return {
    ...habit,
    entries: {
      ...habit.entries,
      [dateKey]: status,
    },
  };
}

export function getTrackedDateKeysForHabitInMonth(habit: Habit, targetMonth: Date): string[] {
  const todayKey = getTodayKey();

  return getDaysInMonth(targetMonth)
    .map(toDateKey)
    .filter((dateKey) => dateKey <= todayKey && isHabitTrackedOnDate(habit, dateKey));
}

export interface MonthInsightCounts {
  done: number;
  skip: number;
  not_done: number;
  total: number;
}

export function getMonthInsightCounts(habits: Habit[], targetMonth: Date): MonthInsightCounts {
  if (habits.length === 0) {
    return { done: 0, skip: 0, not_done: 0, total: 0 };
  }

  let done = 0;
  let skip = 0;
  let notDone = 0;
  let total = 0;

  for (const habit of habits) {
    const trackedKeys = getTrackedDateKeysForHabitInMonth(habit, targetMonth);

    for (const dateKey of trackedKeys) {
      total += 1;
      const status = getHabitStatus(habit, dateKey);
      if (status === "done") {
        done += 1;
      } else if (status === "skip") {
        skip += 1;
      } else {
        notDone += 1;
      }
    }
  }

  return {
    done,
    skip,
    not_done: notDone,
    total,
  };
}

export function getHabitCompletionPercent(habit: Habit, targetMonth: Date): number {
  const keys = getTrackedDateKeysForHabitInMonth(habit, targetMonth);
  if (keys.length === 0) {
    return 0;
  }

  let done = 0;
  for (const key of keys) {
    if (getHabitStatus(habit, key) === "done") {
      done += 1;
    }
  }

  return Math.round((done / keys.length) * 100);
}
