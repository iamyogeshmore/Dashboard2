import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import { Balance } from "@mui/icons-material";
import { SectionTitle, MetricCard } from "./Screens.styles";

const RealTimePowerBalance = () => {
  return (
    <Box sx={{ p: 3 }}>
      <SectionTitle>
        <Balance sx={{ mr: 1 }} /> Real-time Power Balance
      </SectionTitle>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <MetricCard>
            <CardContent>
              <Typography variant="h6">Supply</Typography>
              <Typography variant="h5">500 MW</Typography>
            </CardContent>
          </MetricCard>
        </Grid>
        <Grid item xs={12} sm={6}>
          <MetricCard>
            <CardContent>
              <Typography variant="h6">Demand</Typography>
              <Typography variant="h5">480 MW</Typography>
            </CardContent>
          </MetricCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RealTimePowerBalance;
