"use client";

import {
  addMonth,
  getCalendarMonthCells,
  isFutureDate,
  toDateKey,
} from "@/lib/date";
import { getHabitStatus, isHabitTrackedOnDate } from "@/lib/habits";
import type { Habit, HabitStatus } from "@/types/habit";
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Select,
  Stack,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useMemo, useState } from "react";
import AnimatedToggleButton from "@/components/AnimatedToggleButton";

interface CalendarViewProps {
  habits: Habit[];
  selectedHabitId: string;
  targetMonth: Date;
  onChangeMonth: (nextMonth: Date) => void;
  onSelectHabit: (habitId: string) => void;
  onSetDateStatus: (
    habitId: string,
    dateKey: string,
    status: HabitStatus,
  ) => void;
}

const STATUS_LABELS: Record<HabitStatus, string> = {
  done: "Done",
  skip: "Skip",
  not_done: "Not done",
};

const STATUS_COLORS: Record<HabitStatus, string> = {
  done: "#0f766e",
  skip: "#ea580c",
  not_done: "#dc2626",
};

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarView({
  habits,
  selectedHabitId,
  targetMonth,
  onChangeMonth,
  onSelectHabit,
  onSetDateStatus,
}: CalendarViewProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [paintStatus, setPaintStatus] = useState<HabitStatus>("done");

  const selectedHabit = useMemo(
    () => habits.find((habit) => habit.id === selectedHabitId) ?? null,
    [habits, selectedHabitId],
  );

  const monthCells = getCalendarMonthCells(targetMonth);
  const monthLabel = targetMonth.toLocaleDateString(undefined, {
    month: "short",
  });
  const activeYear = targetMonth.getFullYear();
  const currentYear = new Date().getFullYear();
  const minHabitYear = habits.length
    ? Math.min(
        ...habits.map((habit) => new Date(habit.createdAt).getFullYear()),
      )
    : currentYear - 2;
  const yearOptions = Array.from(
    { length: currentYear + 3 - minHabitYear + 1 },
    (_, index) => minHabitYear + index,
  );

  const legendStyle = (status: HabitStatus) => ({
    bgcolor: isDark
      ? alpha(STATUS_COLORS[status], status === "done" ? 0.32 : 0.34)
      : status === "done"
        ? "#e0f2ef"
        : status === "skip"
          ? "#ffedd5"
          : "#fee2e2",
    color: isDark
      ? status === "done"
        ? "#bdf7ef"
        : status === "skip"
          ? "#ffd8b3"
          : "#ffd1d1"
      : status === "done"
        ? "#123a34"
        : status === "skip"
          ? "#4a280f"
          : "#4a1515",
  });

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">Calendar</Typography>
          <Stack direction="row" gap={1}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => onChangeMonth(addMonth(targetMonth, -1))}
            >
              Prev
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => onChangeMonth(addMonth(targetMonth, 1))}
            >
              Next
            </Button>
          </Stack>
        </Stack>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          gap={1}
          flexWrap="wrap"
        >
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography color="text.secondary">{monthLabel}</Typography>
            <Select
              size="small"
              value={activeYear}
              onChange={(event) =>
                onChangeMonth(
                  new Date(
                    Number(event.target.value),
                    targetMonth.getMonth(),
                    1,
                  ),
                )
              }
              sx={{ minWidth: 92 }}
            >
              {yearOptions.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </Stack>

          <Stack
            direction="row"
            gap={0.75}
            flexWrap="wrap"
            justifyContent="flex-end"
          >
            <Chip size="small" label="Done" sx={legendStyle("done")} />
            <Chip size="small" label="Skip" sx={legendStyle("skip")} />
            <Chip size="small" label="Not done" sx={legendStyle("not_done")} />
          </Stack>
        </Stack>

        <Select
          fullWidth
          size="small"
          value={selectedHabitId}
          disabled={habits.length === 0}
          onChange={(event) => onSelectHabit(event.target.value)}
          displayEmpty
        >
          {habits.length === 0 ? (
            <MenuItem value="" disabled>
              No habits available
            </MenuItem>
          ) : null}
          {habits.map((habit) => (
            <MenuItem key={habit.id} value={habit.id}>
              {habit.name}
            </MenuItem>
          ))}
        </Select>

        <ToggleButtonGroup
          fullWidth
          size="small"
          value={paintStatus}
          exclusive
          onChange={(_, value: HabitStatus | null) => {
            if (value) setPaintStatus(value);
          }}
        >
          {(["done", "skip", "not_done"] as HabitStatus[]).map((status) => (
            <AnimatedToggleButton key={status} value={status}>
              Paint: {STATUS_LABELS[status]}
            </AnimatedToggleButton>
          ))}
        </ToggleButtonGroup>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            gap: 0.75,
          }}
        >
          {WEEK_DAYS.map((dayName) => (
            <Typography
              key={dayName}
              variant="caption"
              textAlign="center"
              color="text.secondary"
            >
              {dayName}
            </Typography>
          ))}

          {monthCells.map(({ date, inCurrentMonth }, index) => {
            const dateKey = toDateKey(date);
            const inFuture = isFutureDate(date);
            const isTracked = selectedHabit
              ? isHabitTrackedOnDate(selectedHabit, dateKey)
              : false;
            const disabled =
              !selectedHabit || !inCurrentMonth || inFuture || !isTracked;
            const status =
              selectedHabit && isTracked
                ? getHabitStatus(selectedHabit, dateKey)
                : "not_done";

            return (
              <Button
                key={`${dateKey}-${index}`}
                size="small"
                variant="outlined"
                disabled={disabled}
                onClick={() => {
                  if (!selectedHabit) return;
                  onSetDateStatus(selectedHabit.id, dateKey, paintStatus);
                }}
                sx={{
                  minWidth: 0,
                  px: 0,
                  py: 0.9,
                  borderRadius: 2,
                  opacity: inCurrentMonth ? 1 : 0.35,
                  borderColor: isTracked ? STATUS_COLORS[status] : "divider",
                  color: isTracked ? STATUS_COLORS[status] : "text.disabled",
                  fontWeight: status === "done" ? 700 : 500,
                }}
              >
                {date.getDate()}
              </Button>
            );
          })}
        </Box>
      </Stack>
    </Paper>
  );
}
