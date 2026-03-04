"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Container,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useConfirm } from "material-ui-confirm";
import AddHabitForm from "@/components/AddHabitForm";
import CalendarView from "@/components/CalendarView";
import HabitCard from "@/components/HabitCard";
import HabitEditDialog from "@/components/HabitEditDialog";
import InsightCharts from "@/components/InsightCharts";
import { getTodayKey } from "@/lib/date";
import {
  getHabitStatus,
  isHabitTrackedOnDate,
  setHabitStatus,
} from "@/lib/habits";
import {
  exportHabits,
  getHabits,
  importHabits,
  saveHabits,
} from "@/lib/storage";
import type { Habit, HabitInput, HabitStatus } from "@/types/habit";

function formatDisplayDate(date: Date): string {
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";

  const month = date.toLocaleDateString(undefined, { month: "long" });
  const year = date.getFullYear();
  return `${day}${suffix} ${month}, ${year}`;
}

function normalizeEntriesForSchedule(habit: Habit): Habit {
  const filteredEntries = Object.fromEntries(
    Object.entries(habit.entries).filter(([dateKey]) =>
      isHabitTrackedOnDate(habit, dateKey),
    ),
  );

  return {
    ...habit,
    entries: filteredEntries,
  };
}

export default function HomePage() {
  const confirm = useConfirm();
  const [habits, setHabits] = useState<Habit[]>(() => getHabits());
  const [habitListTab, setHabitListTab] = useState<"today" | "all">("today");
  const [selectedHabitId, setSelectedHabitId] = useState<string>(
    () => getHabits()[0]?.id ?? "",
  );
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [targetMonth, setTargetMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const today = useMemo(() => getTodayKey(), []);
  const todayLabel = useMemo(() => formatDisplayDate(new Date()), []);
  const editingHabit =
    habits.find((habit) => habit.id === editingHabitId) ?? null;
  const visibleHabits =
    habitListTab === "today"
      ? habits.filter((habit) => isHabitTrackedOnDate(habit, today))
      : habits;

  const persistHabits = (nextHabits: Habit[], preferredSelectedId?: string) => {
    setHabits(nextHabits);
    saveHabits(nextHabits);

    setSelectedHabitId((currentSelectedId) => {
      if (preferredSelectedId !== undefined) {
        return preferredSelectedId;
      }

      if (nextHabits.some((habit) => habit.id === currentSelectedId)) {
        return currentSelectedId;
      }

      return nextHabits[0]?.id ?? "";
    });
  };

  const addHabit = (input: HabitInput) => {
    setError("");
    setMessage("");

    const now = new Date();
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: input.name,
      entries: {},
      createdAt: now.toISOString(),
      frequency: input.frequency,
      weeklyDays:
        input.frequency === "weekly" ? input.weeklyDays : [now.getDay()],
      monthlyDay:
        input.frequency === "monthly"
          ? (input.monthlyDay ?? now.getDate())
          : now.getDate(),
    };

    persistHabits([newHabit, ...habits], newHabit.id);
  };

  const updateHabit = (habitId: string, input: HabitInput) => {
    const nextHabits = habits.map((habit) => {
      if (habit.id !== habitId) {
        return habit;
      }

      const updatedHabit: Habit = {
        ...habit,
        name: input.name,
        frequency: input.frequency,
        weeklyDays:
          input.frequency === "weekly" ? input.weeklyDays : habit.weeklyDays,
        monthlyDay:
          input.frequency === "monthly"
            ? (input.monthlyDay ?? habit.monthlyDay)
            : habit.monthlyDay,
      };

      return normalizeEntriesForSchedule(updatedHabit);
    });

    persistHabits(nextHabits);
    setMessage("Habit updated.");
    setError("");
  };

  const setTodayStatus = (habitId: string, status: HabitStatus) => {
    const nextHabits = habits.map((habit) =>
      habit.id === habitId ? setHabitStatus(habit, today, status) : habit,
    );
    persistHabits(nextHabits);
  };

  const setDateStatus = (
    habitId: string,
    dateKey: string,
    status: HabitStatus,
  ) => {
    const nextHabits = habits.map((habit) =>
      habit.id === habitId ? setHabitStatus(habit, dateKey, status) : habit,
    );

    persistHabits(nextHabits);
  };

  const deleteHabit = async (habitId: string) => {
    const target = habits.find((habit) => habit.id === habitId);
    if (!target) return;
    const { confirmed } = await confirm({
      title: "Delete habit?",
      description: `Delete "${target.name}"? This action cannot be undone.`,
    });
    if (!confirmed) return;
    const nextHabits = habits.filter((habit) => habit.id !== habitId);
    persistHabits(nextHabits);
    setMessage("Habit deleted.");
    setError("");
  };

  const handleExport = () => {
    setError("");
    setMessage("");

    const jsonText = exportHabits(habits);
    const blob = new Blob([jsonText], { type: "application/json" });
    const objectUrl = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = objectUrl;
    downloadLink.download = `habit-tracker-${today}.json`;
    downloadLink.click();

    URL.revokeObjectURL(objectUrl);
    setMessage("Habit data exported.");
  };

  const handleImport = async (file: File) => {
    setError("");
    setMessage("");

    try {
      const text = await file.text();
      const importedHabits = importHabits(text).map(
        normalizeEntriesForSchedule,
      );
      persistHabits(importedHabits, importedHabits[0]?.id ?? "");
      setMessage(`Imported ${importedHabits.length} habit(s).`);
    } catch {
      setError("Could not import JSON. Check file format and try again.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Stack spacing={2.5}>
        <Stack>
          <Typography variant="h4">Streakly</Typography>
          <Typography color="text.secondary">
            Build consistency, one day at a time. Today: {todayLabel}
          </Typography>
        </Stack>

        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            <AddHabitForm
              onAddHabit={addHabit}
              onExport={handleExport}
              onImport={handleImport}
            />
          </Stack>
        </Paper>

        {message ? <Alert severity="success">{message}</Alert> : null}
        {error ? <Alert severity="error">{error}</Alert> : null}

        <Stack spacing={1.25}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6">
              Habits ({visibleHabits.length})
            </Typography>
            <Tabs
              value={habitListTab}
              onChange={(_, value: "today" | "all") => setHabitListTab(value)}
              sx={{
                minHeight: 36,
                "& .MuiTab-root": { minHeight: 36, px: 1.5 },
              }}
            >
              <Tab value="today" label="Today" />
              <Tab value="all" label="All" />
            </Tabs>
          </Stack>
          {visibleHabits.length === 0 ? (
            <Paper sx={{ p: 2 }}>
              <Typography color="text.secondary">
                {habitListTab === "today"
                  ? "No habits scheduled for today."
                  : "No habits yet. Add your first one above."}
              </Typography>
            </Paper>
          ) : (
            visibleHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                todayStatus={getHabitStatus(habit, today)}
                isTrackedToday={isHabitTrackedOnDate(habit, today)}
                onSetTodayStatus={setTodayStatus}
                onEditHabit={setEditingHabitId}
                onDeleteHabit={deleteHabit}
              />
            ))
          )}
        </Stack>

        <CalendarView
          habits={habits}
          selectedHabitId={selectedHabitId}
          targetMonth={targetMonth}
          onChangeMonth={setTargetMonth}
          onSelectHabit={setSelectedHabitId}
          onSetDateStatus={setDateStatus}
        />

        <InsightCharts habits={habits} targetMonth={targetMonth} />
      </Stack>

      <HabitEditDialog
        key={editingHabit?.id ?? "none"}
        open={Boolean(editingHabit)}
        habit={editingHabit}
        onClose={() => setEditingHabitId(null)}
        onSave={updateHabit}
      />
    </Container>
  );
}

