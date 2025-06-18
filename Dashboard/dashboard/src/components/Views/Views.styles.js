import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";

export const SectionTitle = styled(Typography)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  color: theme.palette.primary.main,
  fontWeight: "bold",
  marginBottom: "1rem",
}));

export const MetricCard = styled("Card")(({ theme }) => ({
  background:
    theme.palette.mode === "light"
      ? "linear-gradient(45deg, #DCFCE7, #F0FDF4)"
      : "linear-gradient(45deg, #064E3B, #022C22)",
}));

export const blinking = `
  .blinking {
    animation: blinker 1s linear infinite;
  }
  @keyframes blinker {
    50% {
      opacity: 0;
    }
  }
`;
