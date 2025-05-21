import { Card, CardContent, Typography, Box } from "@mui/material";
import { CardTitle } from "../Dashboard.styles";

const GraphWidget = ({ data }) => {
  // Placeholder for graph visualization (e.g., using Chart.js or Recharts)
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <CardTitle>{data.title}</CardTitle>
        <Typography color="textSecondary" sx={{ mt: 1, fontSize: "0.9rem" }}>
          Chart Type: {data.chartType}
        </Typography>
        <Box
          sx={{
            mt: 2,
            height: 150,
            background: (theme) => theme.palette.background.paper,
            borderRadius: 2,
          }}
        >
          {/* Placeholder for graph visualization */}
          <Typography color="textSecondary" sx={{ textAlign: "center", pt: 6 }}>
            {data.chartType.charAt(0).toUpperCase() + data.chartType.slice(1)}{" "}
            Chart Placeholder
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GraphWidget;
