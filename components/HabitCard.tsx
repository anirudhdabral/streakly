"use client";

import type { Habit, HabitStatus } from "@/types/habit";
import {
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { BiSolidPencil } from "react-icons/bi";
import { FaTrash } from "react-icons/fa";

interface HabitCardProps {
  habit: Habit;
  todayStatus: HabitStatus;
  isTrackedToday: boolean;
  onSetTodayStatus: (habitId: string, status: HabitStatus) => void;
  onEditHabit: (habitId: string) => void;
  onDeleteHabit: (habitId: string) => void;
}

const STATUS_LABELS: Record<HabitStatus, string> = {
  done: "DONE",
  skip: "SKIP",
  not_done: "NOT DONE",
};

function getScheduleText(habit: Habit): string {
  if (habit.frequency === "weekly") {
    const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return `${[...habit.weeklyDays]
      .sort()
      .map((day) => labels[day])
      .join(", ")}`;
  }
  return `Day ${habit.monthlyDay}`;
}

function getTypeLabel(habit: Habit): string {
  if (habit.frequency === "daily") {
    return "DAILY";
  }

  if (habit.frequency === "weekly") {
    return "WEEKLY";
  }

  return "MONTHLY";
}

function getTypeColor(habit: Habit): string {
  if (habit.frequency === "daily") {
    return "#0f766e";
  }

  if (habit.frequency === "weekly") {
    return "#2563eb";
  }

  return "#7c3aed";
}

function StatusSwitcher({
  value,
  disabled,
  onChange,
}: {
  value: HabitStatus;
  disabled: boolean;
  onChange: (status: HabitStatus) => void;
}) {
  return (
    <ToggleButtonGroup
      exclusive
      fullWidth
      size="small"
      value={value}
      disabled={disabled}
      sx={{ "& .MuiToggleButton-root": { py: 0.2 } }}
      onChange={(_, nextValue: HabitStatus | null) => {
        if (nextValue) {
          onChange(nextValue);
        }
      }}
    >
      {(["done", "skip", "not_done"] as HabitStatus[]).map((status) => (
        <ToggleButton key={status} value={status}>
          {STATUS_LABELS[status]}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

export default function HabitCard({
  habit,
  todayStatus,
  isTrackedToday,
  onSetTodayStatus,
  onEditHabit,
  onDeleteHabit,
}: HabitCardProps) {
  return (
    <Card elevation={0} sx={{ overflow: "hidden" }}>
      <Stack direction="row" sx={{ minHeight: 96 }}>
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{
            width: 30,
            pr: 1,
            flexShrink: 0,
            bgcolor: getTypeColor(habit),
            color: "#ffffff",
            position: "relative",
            zIndex: 0,
          }}
        >
          <Typography
            component="span"
            sx={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.12em",
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            {getTypeLabel(habit)}
          </Typography>
        </Stack>

        <Stack sx={{ flex: 1, pl: 0 }}>
          <Stack
            sx={{
              height: "100%",
              ml: -1.2,
              borderTopLeftRadius: 12,
              borderBottomLeftRadius: 12,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 2px 8px rgba(11, 35, 31, 0.08)",
              position: "relative",
              zIndex: 1,
            }}
          >
            <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
              <Stack spacing={0.75}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={1}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                    {habit.name}
                  </Typography>

                  <Stack direction="row" gap={0.5} alignItems="center">
                    {habit.frequency !== "daily" && (
                      <Chip
                        size="small"
                        label={getScheduleText(habit)}
                        sx={{
                          bgcolor: "#edf7f5",
                          color: "primary.dark",
                          height: 18,
                          fontSize: 11,
                        }}
                      />
                    )}
                    <IconButton
                      size="small"
                      aria-label={`Edit ${habit.name}`}
                      onClick={() => onEditHabit(habit.id)}
                    >
                      <BiSolidPencil fontSize={16} />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      aria-label={`Delete ${habit.name}`}
                      onClick={() => onDeleteHabit(habit.id)}
                    >
                      <FaTrash fontSize={14} />
                    </IconButton>
                  </Stack>
                </Stack>

                <StatusSwitcher
                  value={todayStatus}
                  disabled={!isTrackedToday}
                  onChange={(status) => onSetTodayStatus(habit.id, status)}
                />

                {!isTrackedToday ? (
                  <Typography variant="caption" color="text.secondary">
                    Not scheduled for today.
                  </Typography>
                ) : null}
              </Stack>
            </CardContent>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}
