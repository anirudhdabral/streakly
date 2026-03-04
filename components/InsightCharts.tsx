"use client";

import { Box, LinearProgress, Paper, Stack, Typography } from "@mui/material";
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

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6">Insights</Typography>

        <Stack direction="row" gap={1}>
          <Paper sx={{ flex: 1, p: 1, borderRadius: 2, bgcolor: "#e0f2ef" }}>
            <Typography variant="caption" color="text.secondary">
              DONE
            </Typography>
            <Typography fontWeight={700}>{donePct}%</Typography>
          </Paper>
          <Paper sx={{ flex: 1, p: 1, borderRadius: 2, bgcolor: "#ffedd5" }}>
            <Typography variant="caption" color="text.secondary">
              SKIP
            </Typography>
            <Typography fontWeight={700}>{skipPct}%</Typography>
          </Paper>
          <Paper sx={{ flex: 1, p: 1, borderRadius: 2, bgcolor: "#fee2e2" }}>
            <Typography variant="caption" color="text.secondary">
              NOT DONE
            </Typography>
            <Typography fontWeight={700}>{notDonePct}%</Typography>
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
                  sx={{ height: 9, borderRadius: 99, backgroundColor: "#dbe9e8" }}
                />
              </Box>
            ))
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
