import { Card, CardContent, Typography } from "@mui/material";
import { CardTitle } from "../Dashboard.styles";

const NumberWidget = ({ data }) => {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <CardTitle>{data.title}</CardTitle>
        <Typography
          variant="h5"
          sx={{ mt: 2, color: (theme) => theme.palette.energy.green }}
        >
          {data.value || "N/A"} {data.unit}
        </Typography>
        <Typography color="textSecondary" sx={{ mt: 1, fontSize: "0.9rem" }}>
          Plant: {data.plant}
        </Typography>
        <Typography color="textSecondary" sx={{ fontSize: "0.9rem" }}>
          Terminal: {data.terminal}
        </Typography>
        <Typography color="textSecondary" sx={{ fontSize: "0.9rem" }}>
          Measurand: {data.measurand}
        </Typography>
        <Typography color="textSecondary" sx={{ fontSize: "0.9rem" }}>
          Decimal Unit: {data.decimalUnit}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default NumberWidget;
