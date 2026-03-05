"use client";

import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

interface ReminderTimeSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function toDayjsTime(value: string): Dayjs {
  const parsed = dayjs(value, "HH:mm", true);
  if (parsed.isValid()) {
    return parsed;
  }

  return dayjs("09:00", "HH:mm", true);
}

export default function ReminderTimeSelect({
  id,
  label,
  value,
  onChange,
}: ReminderTimeSelectProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
        ampm
        format="hh:mm A"
        timeSteps={{ minutes: 5 }}
        label={label}
        value={toDayjsTime(value)}
        onChange={(nextValue) => {
          if (!nextValue || !nextValue.isValid()) {
            return;
          }
          onChange(nextValue.format("HH:mm"));
        }}
        slotProps={{
          textField: {
            id,
            fullWidth: true,
            size: "small",
            sx: { "& .MuiInputBase-root": { borderRadius: 2 } },
          },
        }}
      />
    </LocalizationProvider>
  );
}
