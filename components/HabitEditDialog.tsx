"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import type { Habit, HabitFrequency, HabitInput } from "@/types/habit";

interface HabitEditDialogProps {
  open: boolean;
  habit: Habit | null;
  onClose: () => void;
  onSave: (habitId: string, input: HabitInput) => void;
}

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function HabitEditDialog({ open, habit, onClose, onSave }: HabitEditDialogProps) {
  const [habitName, setHabitName] = useState(() => habit?.name ?? "");
  const [frequency, setFrequency] = useState<HabitFrequency>(() => habit?.frequency ?? "daily");
  const [weeklyDays, setWeeklyDays] = useState<number[]>(() => habit?.weeklyDays ?? [new Date().getDay()]);
  const [monthlyDay, setMonthlyDay] = useState<number>(() => habit?.monthlyDay ?? new Date().getDate());

  const monthDays = useMemo(() => Array.from({ length: 31 }, (_, index) => index + 1), []);

  const handleSave = () => {
    if (!habit) {
      return;
    }

    const trimmedName = habitName.trim();
    if (!trimmedName) {
      return;
    }

    onSave(habit.id, {
      name: trimmedName,
      frequency,
      weeklyDays: frequency === "weekly" ? weeklyDays : [],
      monthlyDay: frequency === "monthly" ? monthlyDay : undefined,
    });

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Edit habit</DialogTitle>
      <DialogContent>
        <Stack gap={1.25} sx={{ mt: 0.5 }}>
          <TextField
            fullWidth
            size="small"
            label="Habit name"
            value={habitName}
            onChange={(event) => setHabitName(event.target.value)}
          />

          <Typography variant="caption" color="text.secondary">
            Frequency
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            fullWidth
            value={frequency}
            onChange={(_, value: HabitFrequency | null) => {
              if (value) {
                setFrequency(value);
              }
            }}
          >
            <ToggleButton value="daily">Daily</ToggleButton>
            <ToggleButton value="weekly">Weekly</ToggleButton>
            <ToggleButton value="monthly">Monthly</ToggleButton>
          </ToggleButtonGroup>

          {frequency === "weekly" ? (
            <Stack gap={0.5}>
              <Typography variant="caption" color="text.secondary">
                Active weekdays
              </Typography>
              <ToggleButtonGroup
                size="small"
                fullWidth
                value={weeklyDays}
                onChange={(_, value: number[]) => {
                  if (value.length > 0) {
                    setWeeklyDays(value);
                  }
                }}
              >
                {WEEK_DAYS.map((label, index) => (
                  <ToggleButton key={label} value={index}>
                    {label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Stack>
          ) : null}

          {frequency === "monthly" ? (
            <FormControl size="small">
              <InputLabel id="edit-monthly-day">Day of month</InputLabel>
              <Select
                labelId="edit-monthly-day"
                value={monthlyDay}
                label="Day of month"
                onChange={(event) => setMonthlyDay(Number(event.target.value))}
              >
                {monthDays.map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
