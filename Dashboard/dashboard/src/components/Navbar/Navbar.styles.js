import { styled } from "@mui/material/styles";
import { Typography, Button } from "@mui/material";

export const EnergyLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 400,
  fontSize: "1.7rem",
  display: "flex",
  alignItems: "center",
  color: theme.palette.mode === "light" ? "#ffffff" : "#ffffff",
  textShadow: `0 0 12px ${
    theme.palette.mode === "light" ? "#0288d1" : "#22c55e"
  }70`,
  position: "relative",
  cursor: "pointer",
  textDecoration: "none",
  transition: "transform 0.3s ease, text-shadow 0.3s ease",
  "&:hover": {
    transform: "scale(1.05) translateY(-1px)",
    textShadow: `0 0 20px ${
      theme.palette.mode === "light" ? "#0288d1" : "#22c55e"
    }`,
  },
  "&:after": {
    content: '""',
    position: "absolute",
    width: "50%",
    height: "3px",
    bottom: "-6px",
    left: "0",
    background: `linear-gradient(90deg, ${
      theme.palette.mode === "light" ? "#0288d1" : "#22c55e"
    }, ${theme.palette.secondary.main})`,
    transition: "width 0.4s ease-in-out, box-shadow 0.3s ease",
  },
  "&:hover:after": {
    width: "100%",
    boxShadow: `0 0 10px ${
      theme.palette.mode === "light" ? "#0288d1" : "#22c55e"
    }80`,
  },
}));

export const NavButton = styled(Button)(({ theme }) => ({
  color: "#fff",
  margin: "0 8px",
  fontWeight: 200,
  fontSize: "1rem",
  padding: "8px 16px",
  borderRadius: "20px",
  textTransform: "none",
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(5px)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: theme.palette.primary.neon,
    color: "#000",
    transform: "scale(1.1) translateY(-2px)",
    boxShadow: `0 0 15px ${theme.palette.primary.neon}80`,
  },
  "&.active": {
    background: theme.palette.primary.neon,
    color: "#000",
    boxShadow: `0 0 10px ${theme.palette.primary.neon}50`,
  },
}));

export const TimeDisplay = styled(Typography)(({ theme }) => ({
  marginLeft: "16px",
  color: "#fff",
  fontSize: "1rem",
  fontWeight: 400,
  padding: "6px 12px",
  borderRadius: "12px",
  background: "rgba(255, 255, 255, 0.15)",
  animation: "pulse 2s infinite",
  "@keyframes pulse": {
    "0%": { boxShadow: `0 0 5px ${theme.palette.primary.neon}30` },
    "50%": { boxShadow: `0 0 15px ${theme.palette.primary.neon}70` },
    "100%": { boxShadow: `0 0 5px ${theme.palette.primary.neon}30` },
  },
}));
