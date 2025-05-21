import { Card, CardContent, Typography, Box } from "@mui/material";
import { CardTitle } from "../Dashboard.styles";

const GaugeWidget = ({ data }) => {
  // Placeholder for gauge visualization (e.g., using a library like react-gauge-chart)
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <CardTitle>{data.title}</CardTitle>
        <Typography
          variant="h5"
          sx={{ mt: 2, color: (theme) => theme.palette.energy.yellow }}
        >
          {data.value} {data.unit}
        </Typography>
        <Typography color="textSecondary" sx={{ mt: 1, fontSize: "0.9rem" }}>
          Range: {data.min} - {data.max} {data.unit}
        </Typography>
        <Box
          sx={{
            mt: 2,
            height: 100,
            background: (theme) => theme.palette.background.paper,
            borderRadius: 2,
          }}
        >
          {/* Placeholder for gauge visualization */}
          <Typography color="textSecondary" sx={{ textAlign: "center", pt: 4 }}>
            Gauge Placeholder
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GaugeWidget;
