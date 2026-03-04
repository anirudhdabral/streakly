"use client";

import { ChangeEvent } from "react";
import { Button, Stack, Typography } from "@mui/material";

interface DataToolsProps {
  onExport: () => void;
  onImport: (file: File) => void;
}

export default function DataTools({ onExport, onImport }: DataToolsProps) {
  const handleImportChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    onImport(file);
    event.target.value = "";
  };

  return (
    <Stack gap={0.75}>
      <Typography variant="caption" color="text.secondary">
        Backup
      </Typography>
      <Stack direction="row" gap={1}>
        <Button variant="outlined" fullWidth onClick={onExport}>
          Export JSON
        </Button>
        <Button variant="outlined" component="label" fullWidth>
          Import JSON
          <input hidden type="file" accept="application/json" onChange={handleImportChange} />
        </Button>
      </Stack>
    </Stack>
  );
}
