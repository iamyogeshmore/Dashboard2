import { styled } from "@mui/material/styles";
import { Typography, Box } from "@mui/material";

export const FooterContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 24px",
  minHeight: "48px",
  background:
    theme.palette.mode === "light"
      ? "rgba(16, 185, 129, 0.1)"
      : "rgba(34, 197, 94, 0.1)",
  backdropFilter: "blur(10px)",
  borderTop: `1px solid ${theme.palette.primary.light}`,
  boxShadow: `0 -2px 8px ${
    theme.palette.mode === "light"
      ? "rgba(16, 185, 129, 0.1)"
      : "rgba(22, 101, 52, 0.15)"
  }`,
  transition: "all 0.3s ease",
}));

export const FooterText = styled(Typography)(({ theme }) => ({
  fontSize: "0.9rem",
  fontWeight: 400,
  color: theme.palette.text.secondary,
  transition: "color 0.3s ease",
}));
