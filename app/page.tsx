"use client";

import AddHabitForm from "@/components/AddHabitForm";
import CalendarView from "@/components/CalendarView";
import HabitCard from "@/components/HabitCard";
import HabitEditDialog from "@/components/HabitEditDialog";
import InsightCharts from "@/components/InsightCharts";
import { getTodayKey, toDateKey } from "@/lib/date";
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
import { useColorMode } from "@/theme/ThemeProvider";
import type { Habit, HabitInput, HabitStatus } from "@/types/habit";
import {
  DarkModeRounded,
  FileDownloadOutlined,
  FileUploadOutlined,
  LightModeRounded,
  SettingsRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useConfirm } from "material-ui-confirm";
import {
  ChangeEvent,
  MouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

function parseNotificationTime(value: string): { hours: number; minutes: number } {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) {
    return { hours: 9, minutes: 0 };
  }

  return {
    hours: Number(match[1]),
    minutes: Number(match[2]),
  };
}

function isNotificationsAvailable(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

async function showHabitNotification(habit: Habit): Promise<void> {
  const title = `Reminder: ${habit.name}`;
  const body = `Today's task is waiting. Mark it in Streakly.`;

  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body,
        tag: `habit-${habit.id}`,
      });
      return;
    } catch {
      // Fall back to window notifications.
    }
  }

  new Notification(title, {
    body,
    tag: `habit-${habit.id}`,
  });
}

export default function HomePage() {
  const THEME_BRAND_REVEAL_MS = 700;
  const THEME_WAVE_TOTAL_MS = 1250;

  const confirm = useConfirm();
  const { mode, toggleMode } = useColorMode();
  const [themeWave, setThemeWave] = useState<{
    x: number;
    y: number;
    scale: number;
    color: string;
    nextMode: "light" | "dark";
    active: boolean;
    key: number;
  } | null>(null);
  const [isThemeAnimating, setIsThemeAnimating] = useState(false);
  const toggleTimeoutRef = useRef<number | null>(null);
  const clearWaveTimeoutRef = useRef<number | null>(null);
  const notificationTimerIdsRef = useRef<number[]>([]);
  const habitsRef = useRef<Habit[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isHydratingHabits, setIsHydratingHabits] = useState(true);
  const [habitListTab, setHabitListTab] = useState<"today" | "all">("today");
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>(() =>
      isNotificationsAvailable() ? Notification.permission : "default",
    );
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string>("");
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [targetMonth, setTargetMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const settingsOpen = Boolean(settingsAnchor);

  useEffect(() => {
    habitsRef.current = habits;
  }, [habits]);

  useEffect(() => {
    return () => {
      if (toggleTimeoutRef.current) {
        window.clearTimeout(toggleTimeoutRef.current);
      }
      if (clearWaveTimeoutRef.current) {
        window.clearTimeout(clearWaveTimeoutRef.current);
      }
      notificationTimerIdsRef.current.forEach((id) => window.clearTimeout(id));
      notificationTimerIdsRef.current = [];
    };
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const storedHabits = getHabits();
      setHabits(storedHabits);
      setSelectedHabitId(storedHabits[0]?.id ?? "");
      setIsHydratingHabits(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (isNotificationsAvailable() && process.env.NODE_ENV === "development") {
      const notifyInDev = async () => {
        if (Notification.permission === "granted") {
          await showHabitNotification({
            id: "dev-reload",
            name: "Dev reload check",
            createdAt: new Date().toISOString(),
            entries: {},
            frequency: "daily",
            weeklyDays: [],
            monthlyDay: 1,
            notificationTime: "09:00",
          });
        }
      };

      void notifyInDev();
    }
  }, []);

  useEffect(() => {
    notificationTimerIdsRef.current.forEach((id) => window.clearTimeout(id));
    notificationTimerIdsRef.current = [];

    if (!isNotificationsAvailable() || Notification.permission !== "granted") {
      return;
    }

    const getNextRunAt = (habit: Habit, from: Date): Date | null => {
      const { hours, minutes } = parseNotificationTime(habit.notificationTime);

      for (let dayOffset = 0; dayOffset < 370; dayOffset += 1) {
        const candidate = new Date(from);
        candidate.setSeconds(0, 0);
        candidate.setDate(from.getDate() + dayOffset);
        candidate.setHours(hours, minutes, 0, 0);

        if (candidate <= from) {
          continue;
        }

        if (isHabitTrackedOnDate(habit, toDateKey(candidate))) {
          return candidate;
        }
      }

      return null;
    };

    const scheduleHabit = (habitId: string) => {
      const currentHabit = habitsRef.current.find((habit) => habit.id === habitId);
      if (!currentHabit) {
        return;
      }

      const nextRunAt = getNextRunAt(currentHabit, new Date());
      if (!nextRunAt) {
        return;
      }

      const delayMs = nextRunAt.getTime() - Date.now();
      const timeoutId = window.setTimeout(() => {
        const latestHabit = habitsRef.current.find((habit) => habit.id === habitId);
        if (!latestHabit) {
          return;
        }

        const todayKeyNow = getTodayKey();
        if (
          isHabitTrackedOnDate(latestHabit, todayKeyNow) &&
          getHabitStatus(latestHabit, todayKeyNow) !== "done"
        ) {
          void showHabitNotification(latestHabit);
        }

        scheduleHabit(habitId);
      }, Math.max(0, delayMs));

      notificationTimerIdsRef.current.push(timeoutId);
    };

    habits.forEach((habit) => {
      scheduleHabit(habit.id);
    });

    return () => {
      notificationTimerIdsRef.current.forEach((id) => window.clearTimeout(id));
      notificationTimerIdsRef.current = [];
    };
  }, [habits]);

  const today = useMemo(() => getTodayKey(), []);
  const todayLabel = useMemo(() => formatDisplayDate(new Date()), []);
  const editingHabit =
    habits.find((habit) => habit.id === editingHabitId) ?? null;
  const visibleHabits =
    habitListTab === "today"
      ? habits.filter((habit) => isHabitTrackedOnDate(habit, today))
      : habits;
  const showEmptyState = !isHydratingHabits && visibleHabits.length === 0;

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
      notificationTime: input.notificationTime,
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
        notificationTime: input.notificationTime,
      };

      return normalizeEntriesForSchedule(updatedHabit);
    });

    persistHabits(nextHabits);
    setMessage("Habit updated.");
    setError("");
  };

  const handleEnableReminders = async () => {
    if (!isNotificationsAvailable()) {
      setError("This browser does not support notifications.");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === "granted") {
      setMessage("Reminders enabled.");
      setError("");
      if (process.env.NODE_ENV === "development") {
        await showHabitNotification({
          id: "dev-reload",
          name: "Dev reload check",
          createdAt: new Date().toISOString(),
          entries: {},
          frequency: "daily",
          weeklyDays: [],
          monthlyDay: 1,
          notificationTime: "09:00",
        });
      }
      return;
    }

    if (permission === "denied") {
      setError("Notifications are blocked. Enable them in browser/site settings.");
      return;
    }

    setError("Notification permission was not granted.");
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

  const handleImportChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    void handleImport(file);
    event.target.value = "";
  };

  const handleThemeToggle = (event: MouseEvent<HTMLButtonElement>) => {
    if (isThemeAnimating) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const maxX = Math.max(x, window.innerWidth - x);
    const maxY = Math.max(y, window.innerHeight - y);
    const radius = Math.hypot(maxX, maxY);
    const nextMode: "light" | "dark" = mode === "dark" ? "light" : "dark";

    const wave = {
      x,
      y,
      scale: radius / 12,
      color: nextMode === "dark" ? "#0c1413" : "#eef4f3",
      nextMode,
      active: false,
      key: Date.now(),
    };

    setThemeWave(wave);
    setIsThemeAnimating(true);
    requestAnimationFrame(() => {
      setThemeWave((current) =>
        current ? { ...current, active: true } : current,
      );
    });

    toggleTimeoutRef.current = window.setTimeout(() => {
      toggleMode();
    }, THEME_BRAND_REVEAL_MS);

    clearWaveTimeoutRef.current = window.setTimeout(() => {
      setThemeWave(null);
      setIsThemeAnimating(false);
    }, THEME_WAVE_TOTAL_MS);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      {(() => {
        const revealMode = themeWave?.nextMode ?? mode;
        return themeWave ? (
          <>
            <Box
              key={themeWave.key}
              sx={{
                position: "fixed",
                left: themeWave.x,
                top: themeWave.y,
                width: 24,
                height: 24,
                borderRadius: "50%",
                backgroundColor: themeWave.color,
                pointerEvents: "none",
                zIndex: 2000,
                transform: `translate(-50%, -50%) scale(${themeWave.active ? themeWave.scale : 0})`,
                transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
                willChange: "transform",
              }}
            />
            <Box
              sx={{
                position: "fixed",
                left: themeWave.x,
                top: themeWave.y,
                width: 24,
                height: 24,
                borderRadius: "50%",
                backgroundColor:
                  revealMode === "dark"
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.08)",
                pointerEvents: "none",
                zIndex: 1999,
                filter: "blur(6px)",
                transform: `translate(-50%, -50%) scale(${themeWave.active ? themeWave.scale * 1.08 : 0})`,
                transition: "transform 720ms cubic-bezier(0.2, 1, 0.3, 1)",
                willChange: "transform",
              }}
            />
            <Box
              sx={{
                position: "fixed",
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) scale(${themeWave.active ? 1 : 0.9})`,
                opacity: themeWave.active ? 1 : 0,
                transition: "opacity 300ms ease, transform 420ms ease",
                pointerEvents: "none",
                zIndex: 2001,
                textAlign: "center",
                userSelect: "none",
                px: 2,
                py: 1,
                borderRadius: 2,
                backdropFilter: "blur(3px)",
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: 28, sm: 38 },
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: revealMode === "dark" ? "#e7f4f1" : "#0d2724",
                  textShadow:
                    revealMode === "dark"
                      ? "0 10px 28px rgba(0, 0, 0, 0.5)"
                      : "0 8px 24px rgba(15, 43, 40, 0.22)",
                }}
              >
                Streakly
              </Typography>
              <Typography
                sx={{
                  mt: 0.4,
                  fontSize: { xs: 12, sm: 14 },
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  color:
                    revealMode === "dark"
                      ? "rgba(231,244,241,0.9)"
                      : "rgba(13,39,36,0.86)",
                }}
              >
                your private habit tracker
              </Typography>
            </Box>
          </>
        ) : null;
      })()}
      <Stack spacing={2.5}>
        <Stack>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={1}
          >
            <Typography variant="h4">Streakly</Typography>
            <Stack direction="row" alignItems="center" gap={1}>
              <IconButton
                onClick={handleThemeToggle}
                aria-label="Toggle theme"
                disabled={isThemeAnimating}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  width: 40,
                  height: 40,
                  transition: "transform 220ms ease, background-color 200ms ease",
                  "&:hover": {
                    transform: "rotate(10deg) scale(1.04)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "inline-flex",
                    transform: `scale(${isThemeAnimating ? 0.85 : 1})`,
                    transition: "transform 260ms ease",
                  }}
                >
                  {mode === "dark" ? (
                    <LightModeRounded fontSize="small" />
                  ) : (
                    <DarkModeRounded fontSize="small" />
                  )}
                </Box>
              </IconButton>
              <IconButton
                aria-label="Import and export options"
                onClick={(event) => setSettingsAnchor(event.currentTarget)}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  width: 40,
                  height: 40,
                }}
              >
                <SettingsRounded fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
          <Menu
            anchorEl={settingsAnchor}
            open={settingsOpen}
            onClose={() => setSettingsAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{ paper: { sx: { borderRadius: 2, mt: 0.5 } } }}
          >
            <MenuItem
              onClick={() => {
                handleExport();
                setSettingsAnchor(null);
              }}
            >
              <ListItemIcon>
                <FileDownloadOutlined fontSize="small" />
              </ListItemIcon>
              <ListItemText>Export</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                importInputRef.current?.click();
                setSettingsAnchor(null);
              }}
            >
              <ListItemIcon>
                <FileUploadOutlined fontSize="small" />
              </ListItemIcon>
              <ListItemText>Import</ListItemText>
            </MenuItem>
          </Menu>
          <input
            ref={importInputRef}
            hidden
            type="file"
            accept="application/json"
            onChange={handleImportChange}
          />
          <Typography color="text.secondary">
            Build consistency, one day at a time.
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mt: 0.4,
              fontWeight: 600,
              color: "text.primary",
              letterSpacing: "0.01em",
            }}
          >
            Today: {todayLabel}
          </Typography>
          {isNotificationsAvailable() && notificationPermission !== "granted" ? (
            <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 0.8 }}>
              <Button size="small" variant="outlined" onClick={handleEnableReminders}>
                Enable reminders
              </Button>
              <Typography variant="caption" color="text.secondary">
                {notificationPermission === "denied"
                  ? "Blocked. Open browser settings to allow."
                  : "Allow notifications to get daily habit reminders."}
              </Typography>
            </Stack>
          ) : null}
        </Stack>

        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            <AddHabitForm onAddHabit={addHabit} />
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
          <AnimatePresence mode="wait">
            {isHydratingHabits ? (
              <motion.div
                key="habits-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <Stack spacing={1}>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Paper key={`skeleton-${index}`} sx={{ p: 1.2 }}>
                      <Stack spacing={0.9}>
                        <Stack direction="row" justifyContent="space-between" gap={1}>
                          <Skeleton variant="text" width="42%" height={24} />
                          <Skeleton variant="rounded" width={96} height={20} />
                        </Stack>
                        <Skeleton variant="rounded" height={34} />
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </motion.div>
            ) : showEmptyState ? (
              <motion.div
                key="habits-empty"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Paper sx={{ p: 2 }}>
                  <Typography color="text.secondary">
                    {habitListTab === "today"
                      ? "No habits scheduled for today."
                      : "No habits yet. Add your first one above."}
                  </Typography>
                </Paper>
              </motion.div>
            ) : (
              <motion.div
                key="habits-list"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.24 }}
              >
                <Stack spacing={1}>
                  {visibleHabits.map((habit, index) => (
                    <motion.div
                      key={habit.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.04 }}
                    >
                      <HabitCard
                        habit={habit}
                        todayStatus={getHabitStatus(habit, today)}
                        isTrackedToday={isHabitTrackedOnDate(habit, today)}
                        onSetTodayStatus={setTodayStatus}
                        onEditHabit={setEditingHabitId}
                        onDeleteHabit={deleteHabit}
                      />
                    </motion.div>
                  ))}
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>
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

        <Stack alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Private by design; your data stays stored locally, and only you can
            access it.
          </Typography>
        </Stack>
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
