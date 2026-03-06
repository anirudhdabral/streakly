"use client";

import AnimatedToggleButton from "@/components/AnimatedToggleButton";
import type { Habit, HabitFrequency, HabitInput } from "@/types/habit";
import {
  Box,
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
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

interface HabitEditDialogProps {
  open: boolean;
  habit: Habit | null;
  onClose: () => void;
  onSave: (habitId: string, input: HabitInput) => void;
}

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function HabitEditDialog({
  open,
  habit,
  onClose,
  onSave,
}: HabitEditDialogProps) {
  const [habitName, setHabitName] = useState(() => habit?.name ?? "");
  const [frequency, setFrequency] = useState<HabitFrequency>(
    () => habit?.frequency ?? "daily",
  );
  const [weeklyDays, setWeeklyDays] = useState<number[]>(
    () => habit?.weeklyDays ?? [new Date().getDay()],
  );
  const [monthlyDay, setMonthlyDay] = useState<number>(
    () => habit?.monthlyDay ?? new Date().getDate(),
  );

  const monthDays = useMemo(
    () => Array.from({ length: 31 }, (_, index) => index + 1),
    [],
  );

  const handleSave = () => {
    if (!habit) return;

    const trimmedName = habitName.trim();
    if (!trimmedName) return;

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
        <Stack gap={1.5} sx={{ mt: 0.5 }}>
          <TextField
            fullWidth
            size="small"
            label="Habit name"
            value={habitName}
            onChange={(event) => setHabitName(event.target.value)}
            sx={{ "& .MuiInputBase-root": { borderRadius: 2 } }}
          />
          <Box>
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
                  if (value) {
                    setFrequency(value);
                  }
                }}
              >
                <AnimatedToggleButton value="daily">Daily</AnimatedToggleButton>
                <AnimatedToggleButton value="weekly">Weekly</AnimatedToggleButton>
                <AnimatedToggleButton value="monthly">Monthly</AnimatedToggleButton>
              </ToggleButtonGroup>
            </Box>

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
                    fullWidth
                    value={weeklyDays}
                    sx={{ "& .MuiToggleButton-root": { py: 0.7 } }}
                    onChange={(_, value: number[]) => {
                      if (value.length > 0) {
                        setWeeklyDays(value);
                      }
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
                  <InputLabel id="edit-monthly-day">Day of month</InputLabel>
                  <Select
                    labelId="edit-monthly-day"
                    value={monthlyDay}
                    label="Day of month"
                    MenuProps={{
                      PaperProps: {
                        sx: { maxHeight: 280 },
                      },
                    }}
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
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} sx={{ borderRadius: 2 }}>
          Save changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
