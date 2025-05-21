import { Card, CardContent, Typography, Box } from "@mui/material";
import { CardTitle } from "../Dashboard.styles";

const DataGridWidget = ({ data }) => {
  // Placeholder for data grid (e.g., using MUI DataGrid)
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <CardTitle>{data.title}</CardTitle>
        <Typography color="textSecondary" sx={{ mt: 1, fontSize: "0.9rem" }}>
          Columns: {data.columns}
        </Typography>
        <Box
          sx={{
            mt: 2,
            height: 150,
            background: (theme) => theme.palette.background.paper,
            borderRadius: 2,
          }}
        >
          {/* Placeholder for data grid */}
          <Typography color="textSecondary" sx={{ textAlign: "center", pt: 6 }}>
            DataGrid Placeholder
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DataGridWidget;
