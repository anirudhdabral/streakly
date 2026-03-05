"use client";

import ReminderTimeSelect from "@/components/ReminderTimeSelect";
import AnimatedToggleButton from "@/components/AnimatedToggleButton";
import type { HabitFrequency, HabitInput } from "@/types/habit";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useMemo, useState } from "react";

interface AddHabitFormProps {
  onAddHabit: (input: HabitInput) => void;
}

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AddHabitForm({
  onAddHabit,
}: AddHabitFormProps) {
  const [habitName, setHabitName] = useState("");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");
  const [weeklyDays, setWeeklyDays] = useState<number[]>([new Date().getDay()]);
  const [monthlyDay, setMonthlyDay] = useState<number>(new Date().getDate());
  const [notificationTime, setNotificationTime] = useState<string>("09:00");

  const monthDays = useMemo(
    () => Array.from({ length: 31 }, (_, index) => index + 1),
    [],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = habitName.trim();
    if (!trimmedName) return;

    onAddHabit({
      name: trimmedName,
      frequency,
      weeklyDays: frequency === "weekly" ? weeklyDays : [],
      monthlyDay: frequency === "monthly" ? monthlyDay : undefined,
      notificationTime,
    });

    setHabitName("");
    setFrequency("daily");
    setWeeklyDays([new Date().getDay()]);
    setMonthlyDay(new Date().getDate());
    setNotificationTime("09:00");
  };

  return (
    <Stack component="form" gap={1.5} onSubmit={handleSubmit}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack spacing={0.1}>
          <Typography variant="h6">Create Habit</Typography>
          <Typography variant="caption" color="text.secondary">
            Set schedule and reminder in one step.
          </Typography>
        </Stack>
      </Stack>

      <TextField
        fullWidth
        size="small"
        label="Habit name"
        placeholder="Drink water"
        value={habitName}
        onChange={(event) => setHabitName(event.target.value)}
        sx={{ "& .MuiInputBase-root": { borderRadius: 2 } }}
      />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        gap={1}
        alignItems={{ xs: "stretch", sm: "flex-end" }}
      >
        <Box sx={{ flex: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 0.5, display: "block" }}
          >
            Frequency
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            fullWidth
            value={frequency}
            sx={{ "& .MuiToggleButton-root": { py: 0.95 } }}
            onChange={(_, value: HabitFrequency | null) => {
              if (value) setFrequency(value);
            }}
          >
            <AnimatedToggleButton value="daily">Daily</AnimatedToggleButton>
            <AnimatedToggleButton value="weekly">Weekly</AnimatedToggleButton>
            <AnimatedToggleButton value="monthly">Monthly</AnimatedToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Box sx={{ flex: 1, minWidth: { sm: 170 } }}>
          <ReminderTimeSelect
            id="add-reminder-time"
            label="Reminder time"
            value={notificationTime}
            onChange={setNotificationTime}
          />
        </Box>
      </Stack>

      <AnimatePresence initial={false} mode="wait">
        {frequency === "weekly" ? (
          <motion.div
            key="weekly"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <Stack gap={0.5} sx={{ p: 1, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Active weekdays
              </Typography>
              <ToggleButtonGroup
                size="small"
                value={weeklyDays}
                fullWidth
                sx={{ "& .MuiToggleButton-root": { py: 0.7 } }}
                onChange={(_, value: number[]) => {
                  if (value.length > 0) setWeeklyDays(value);
                }}
              >
                {WEEK_DAYS.map((label, index) => (
                  <AnimatedToggleButton key={label} value={index}>
                    {label}
                  </AnimatedToggleButton>
                ))}
              </ToggleButtonGroup>
            </Stack>
          </motion.div>
        ) : frequency === "monthly" ? (
          <motion.div
            key="monthly"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <FormControl size="small" fullWidth sx={{ mt: 1 }}>
              <InputLabel id="monthly-day">Day of month</InputLabel>
              <Select
                labelId="monthly-day"
                value={monthlyDay}
                label="Day of month"
                MenuProps={{ PaperProps: { sx: { maxHeight: 280 } } }}
                onChange={(event) => setMonthlyDay(Number(event.target.value))}
              >
                {monthDays.map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Button type="submit" variant="contained" size="large" sx={{ borderRadius: 2 }}>
        Add habit
      </Button>
    </Stack>
  );
}
