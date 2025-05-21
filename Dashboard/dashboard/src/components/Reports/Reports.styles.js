import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";

export const SectionTitle = styled(Typography)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  color: theme.palette.primary.neon,
  fontWeight: "bold",
  marginBottom: "1rem",
}));
