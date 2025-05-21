import { Box, Typography, TextField, Button } from "@mui/material";
import { AddCircle } from "@mui/icons-material";
import { SectionTitle } from "./Screens.styles";

const ScheduleEntry = () => {
  return (
    <Box sx={{ p: 3 }}>
      <SectionTitle>
        <AddCircle sx={{ mr: 1 }} /> Schedule Entry
      </SectionTitle>
      <TextField
        label="Time"
        type="time"
        fullWidth
        sx={{ mb: 2 }}
        InputLabelProps={{ shrink: true }}
      />
      <TextField label="Power (MW)" type="number" fullWidth sx={{ mb: 2 }} />
      <Button variant="contained" color="primary" startIcon={<AddCircle />}>
        Add Entry
      </Button>
    </Box>
  );
};

export default ScheduleEntry;
