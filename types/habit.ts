export type HabitStatus = "done" | "skip" | "not_done";

export type HabitFrequency = "daily" | "weekly" | "monthly";

export interface Habit {
  id: string;
  name: string;
  entries: Record<string, HabitStatus>;
  createdAt: string;
  frequency: HabitFrequency;
  weeklyDays: number[];
  monthlyDay: number;
}

export interface HabitInput {
  name: string;
  frequency: HabitFrequency;
  weeklyDays: number[];
  monthlyDay?: number;
}

export interface HabitExportPayload {
  version: 3;
  exportedAt: string;
  habits: Habit[];
}
