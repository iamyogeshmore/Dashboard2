import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";

export const SectionTitle = styled(Typography)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  color: theme.palette.primary.neon,
  fontWeight: "bold",
  marginBottom: "1rem",
}));

export const MetricCard = styled("Card")(({ theme }) => ({
  background:
    theme.palette.mode === "light"
      ? "linear-gradient(45deg, #bbdefb, #e3f2fd)"
      : "linear-gradient(45deg, #37474f, #263238)",
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
