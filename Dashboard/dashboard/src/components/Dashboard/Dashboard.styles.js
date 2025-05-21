import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";

export const CardTitle = styled(Typography)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  fontWeight: "bold",
  color: theme.palette.primary.main,
}));
