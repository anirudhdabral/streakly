"use client";

import { ToggleButton, ToggleButtonProps } from "@mui/material";
import { motion } from "framer-motion";

export default function AnimatedToggleButton(props: ToggleButtonProps) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 520, damping: 30, mass: 0.6 }}
      style={{ display: "inline-flex", flex: 1 }}
    >
      <ToggleButton {...props} sx={{ width: "100%", ...(props.sx ?? {}) }} />
    </motion.div>
  );
}
