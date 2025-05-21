import { Box, TextField, Button, MenuItem } from "@mui/material";
import { Build } from "@mui/icons-material";
import { SectionTitle } from "./Reports.styles";

const GenerateReports = () => {
  return (
    <Box sx={{ p: 3 }}>
      <SectionTitle>
        <Build sx={{ mr: 1 }} /> Generate Reports
      </SectionTitle>
      <TextField
        select
        label="Report Type"
        fullWidth
        sx={{ mb: 2 }}
        defaultValue=""
      >
        <MenuItem value="energy">Energy Consumption</MenuItem>
        <MenuItem value="solar">Solar Output</MenuItem>
      </TextField>
      <TextField
        label="Date Range"
        type="date"
        fullWidth
        sx={{ mb: 2 }}
        InputLabelProps={{ shrink: true }}
      />
      <Button variant="contained" color="primary" startIcon={<Build />}>
        Generate Report
      </Button>
    </Box>
  );
};

export default GenerateReports;
