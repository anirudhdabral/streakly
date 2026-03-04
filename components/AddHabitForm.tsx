"use client";

import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { FileDownloadOutlined, FileUploadOutlined, MoreVert } from "@mui/icons-material";
import type { HabitFrequency, HabitInput } from "@/types/habit";

interface AddHabitFormProps {
  onAddHabit: (input: HabitInput) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AddHabitForm({ onAddHabit, onExport, onImport }: AddHabitFormProps) {
  const [habitName, setHabitName] = useState("");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");
  const [weeklyDays, setWeeklyDays] = useState<number[]>([new Date().getDay()]);
  const [monthlyDay, setMonthlyDay] = useState<number>(new Date().getDate());
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const monthDays = useMemo(() => Array.from({ length: 31 }, (_, index) => index + 1), []);
  const menuOpen = Boolean(menuAnchor);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = habitName.trim();
    if (!trimmedName) {
      return;
    }

    onAddHabit({
      name: trimmedName,
      frequency,
      weeklyDays: frequency === "weekly" ? weeklyDays : [],
      monthlyDay: frequency === "monthly" ? monthlyDay : undefined,
    });

    setHabitName("");
    setFrequency("daily");
    setWeeklyDays([new Date().getDay()]);
    setMonthlyDay(new Date().getDate());
  };

  const handleImportChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    onImport(file);
    event.target.value = "";
  };

  return (
    <Stack component="form" gap={1.25} onSubmit={handleSubmit}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">Create Habit</Typography>
        <IconButton size="small" aria-label="More options" onClick={(event) => setMenuAnchor(event.currentTarget)}>
          <MoreVert fontSize="small" />
        </IconButton>
      </Stack>
      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => {
            onExport();
            setMenuAnchor(null);
          }}
        >
          <ListItemIcon>
            <FileDownloadOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export JSON</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            importInputRef.current?.click();
            setMenuAnchor(null);
          }}
        >
          <ListItemIcon>
            <FileUploadOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>Import JSON</ListItemText>
        </MenuItem>
      </Menu>
      <input
        ref={importInputRef}
        hidden
        type="file"
        accept="application/json"
        onChange={handleImportChange}
      />

      <TextField
        fullWidth
        size="small"
        label="Habit name"
        placeholder="Drink water"
        value={habitName}
        onChange={(event) => setHabitName(event.target.value)}
      />

      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
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
      </Box>

      {frequency === "weekly" ? (
        <Stack gap={0.5}>
          <Typography variant="caption" color="text.secondary">
            Active weekdays
          </Typography>
          <ToggleButtonGroup
            size="small"
            value={weeklyDays}
            fullWidth
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
          <InputLabel id="monthly-day">Day of month</InputLabel>
          <Select
            labelId="monthly-day"
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
      ) : null}

      <Button type="submit" variant="contained" size="large">
        Add habit
      </Button>
    </Stack>
  );
}
