"use client";

import { Box, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { getHabitCompletionPercent, getMonthInsightCounts } from "@/lib/habits";
import type { Habit } from "@/types/habit";

interface InsightChartsProps {
  habits: Habit[];
  targetMonth: Date;
}

const COLORS = {
  done: "#0f766e",
  skip: "#ea580c",
  not_done: "#dc2626",
};

export default function InsightCharts({ habits, targetMonth }: InsightChartsProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const counts = getMonthInsightCounts(habits, targetMonth);

  const donePct = counts.total ? Math.round((counts.done / counts.total) * 100) : 0;
  const skipPct = counts.total ? Math.round((counts.skip / counts.total) * 100) : 0;
  const notDonePct = counts.total ? Math.round((counts.not_done / counts.total) * 100) : 0;
  const adherencePct = counts.total ? Math.round(((counts.done + counts.skip) / counts.total) * 100) : 0;

  const perHabit = habits.map((habit) => ({
    id: habit.id,
    name: habit.name,
    percent: getHabitCompletionPercent(habit, targetMonth),
  }));

  const bestHabit = perHabit.length
    ? perHabit.reduce((best, current) => (current.percent > best.percent ? current : best))
    : null;

  const needsAttentionHabit = perHabit.length
    ? perHabit.reduce((worst, current) => (current.percent < worst.percent ? current : worst))
    : null;

  const statCardStyles = {
    done: {
      bgcolor: isDark ? alpha(COLORS.done, 0.32) : "#e0f2ef",
      labelColor: isDark ? alpha("#ffffff", 0.85) : "#355c56",
      valueColor: isDark ? "#bdf7ef" : "#123a34",
    },
    skip: {
      bgcolor: isDark ? alpha(COLORS.skip, 0.34) : "#ffedd5",
      labelColor: isDark ? alpha("#ffffff", 0.87) : "#6a3b14",
      valueColor: isDark ? "#ffd8b3" : "#4a280f",
    },
    notDone: {
      bgcolor: isDark ? alpha(COLORS.not_done, 0.34) : "#fee2e2",
      labelColor: isDark ? alpha("#ffffff", 0.87) : "#6a1f1f",
      valueColor: isDark ? "#ffd1d1" : "#4a1515",
    },
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6">Insights</Typography>

        <Stack direction="row" gap={1}>
          <Paper sx={{ flex: 1, p: 1, borderRadius: 2, bgcolor: statCardStyles.done.bgcolor }}>
            <Typography variant="caption" sx={{ color: statCardStyles.done.labelColor }}>
              DONE
            </Typography>
            <Typography fontWeight={700} sx={{ color: statCardStyles.done.valueColor }}>{donePct}%</Typography>
          </Paper>
          <Paper sx={{ flex: 1, p: 1, borderRadius: 2, bgcolor: statCardStyles.skip.bgcolor }}>
            <Typography variant="caption" sx={{ color: statCardStyles.skip.labelColor }}>
              SKIP
            </Typography>
            <Typography fontWeight={700} sx={{ color: statCardStyles.skip.valueColor }}>{skipPct}%</Typography>
          </Paper>
          <Paper sx={{ flex: 1, p: 1, borderRadius: 2, bgcolor: statCardStyles.notDone.bgcolor }}>
            <Typography variant="caption" sx={{ color: statCardStyles.notDone.labelColor }}>
              NOT DONE
            </Typography>
            <Typography fontWeight={700} sx={{ color: statCardStyles.notDone.valueColor }}>{notDonePct}%</Typography>
          </Paper>
        </Stack>

        <Stack direction="row" gap={1}>
          <Paper sx={{ flex: 1, p: 1, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              TRACKED ACTIONS
            </Typography>
            <Typography fontWeight={700}>{counts.total}</Typography>
          </Paper>
          <Paper sx={{ flex: 1, p: 1, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              ADHERENCE
            </Typography>
            <Typography fontWeight={700}>{adherencePct}%</Typography>
          </Paper>
        </Stack>

        <Stack direction="row" gap={1}>
          <Paper sx={{ flex: 1, p: 1, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              TOP HABIT
            </Typography>
            <Typography variant="body2" fontWeight={700} noWrap>
              {bestHabit ? `${bestHabit.name} (${bestHabit.percent}%)` : "-"}
            </Typography>
          </Paper>
          <Paper sx={{ flex: 1, p: 1, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              NEEDS ATTENTION
            </Typography>
            <Typography variant="body2" fontWeight={700} noWrap>
              {needsAttentionHabit ? `${needsAttentionHabit.name} (${needsAttentionHabit.percent}%)` : "-"}
            </Typography>
          </Paper>
        </Stack>

        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Month breakdown
          </Typography>
          <Stack direction="row" sx={{ width: "100%", height: 14, borderRadius: 20, overflow: "hidden" }}>
            <Box sx={{ width: `${donePct}%`, backgroundColor: COLORS.done }} />
            <Box sx={{ width: `${skipPct}%`, backgroundColor: COLORS.skip }} />
            <Box sx={{ width: `${notDonePct}%`, backgroundColor: COLORS.not_done }} />
          </Stack>
        </Box>

        <Stack spacing={1.25}>
          <Typography variant="body2">Per habit completion</Typography>
          {perHabit.length === 0 ? (
            <Typography variant="caption" color="text.secondary">
              Add habits to unlock insights.
            </Typography>
          ) : (
            perHabit.map((habit) => (
              <Box key={habit.id}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="caption" noWrap>
                    {habit.name}
                  </Typography>
                  <Typography variant="caption">{habit.percent}%</Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={habit.percent}
                  sx={{
                    height: 9,
                    borderRadius: 99,
                    backgroundColor: isDark ? alpha("#ffffff", 0.14) : "#dbe9e8",
                  }}
                />
              </Box>
            ))
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
