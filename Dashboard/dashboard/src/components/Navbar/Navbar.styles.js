import { styled } from "@mui/material/styles";
import { Typography, Button, IconButton } from "@mui/material";

export const EnergyLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  fontSize: "1.4rem",
  display: "flex",
  alignItems: "center",
  color: "#FFFFFF",
  textShadow: `0 0 12px rgba(255, 255, 255, 0.4)`,
  position: "relative",
  cursor: "pointer",
  textDecoration: "none",
  transition: "transform 0.3s ease, text-shadow 0.3s ease",
  letterSpacing: "0.5px",
  "&:hover": {
    transform: "scale(1.05) translateY(-1px)",
    textShadow: `0 0 20px rgba(255, 255, 255, 0.6)`,
  },
  "&:after": {
    content: '""',
    position: "absolute",
    width: "50%",
    height: "3px",
    bottom: "-6px",
    left: "0",
    background: `linear-gradient(90deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4))`,
    transition: "width 0.4s ease-in-out, box-shadow 0.3s ease",
  },
  "&:hover:after": {
    width: "100%",
    boxShadow: `0 0 10px rgba(255, 255, 255, 0.4)`,
  },
}));

export const AnimatedEnergiSpeak = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  fontSize: "1.5rem",
  display: "flex",
  alignItems: "center",
  color: "#ffffff",
  position: "relative",
  cursor: "pointer",
  textDecoration: "none",
}));

export const NavButton = styled(Button)(({ theme }) => ({
  color: "#FFFFFF",
  fontWeight: 500,
  fontSize: "0.95rem",
  padding: "10px 18px",
  borderRadius: "12px",
  textTransform: "none",
  background: "rgba(255, 255, 255, 0.08)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  letterSpacing: "0.5px",
  "&:hover": {
    background: "rgba(255, 255, 255, 0.15)",
    color: "#000000",
    transform: "translateY(-2px)",
    boxShadow: `0 8px 25px rgba(255, 255, 255, 0.2)`,
    border: "1px solid rgba(255, 255, 255, 0.25)",
  },
  "&.active": {
    background: (theme) =>
      theme.palette.mode === "light"
        ? "rgba(0, 0, 0, 0.2)"
        : "rgba(255, 255, 255, 0.25)",

    boxShadow: (theme) =>
      theme.palette.mode === "light"
        ? "0 6px 20px rgba(0, 0, 0, 0.2)"
        : "0 6px 20px rgba(255, 255, 255, 0.2)",

    fontWeight: 600,
    color: "#FFFF00",
    border: "1px solid #006400",
    transform: "translateY(-1px)",
    "&:hover": {
      background: (theme) =>
        theme.palette.mode === "light"
          ? "rgba(0, 0, 0, 0.25)"
          : "rgba(255, 255, 255, 0.3)",

      boxShadow: (theme) =>
        theme.palette.mode === "light"
          ? "0 8px 25px rgba(0, 0, 0, 0.25)"
          : "0 8px 25px rgba(255, 255, 255, 0.25)",
      transform: "translateY(-3px)",
    },
  },
  "& .MuiButton-startIcon": {
    color: "rgba(255, 255, 255, 0.9)",
    transition: "all 0.3s ease",
  },
  "& .MuiButton-endIcon": {
    color: "rgba(255, 255, 255, 0.8)",
    transition: "all 0.3s ease",
  },
  "&:hover .MuiButton-startIcon": {
    color: "#FFFFFF",
    transform: "scale(1.1)",
  },
  "&:hover .MuiButton-endIcon": {
    color: "#FFFFFF",
    transform: "rotate(180deg)",
  },
  "&.active .MuiButton-startIcon": {
    color: (theme) => (theme.palette.mode === "light" ? "#000000" : "#FFFFFF"),
  },
  "&.active .MuiButton-endIcon": {
    color: (theme) => (theme.palette.mode === "light" ? "#000000" : "#FFFFFF"),
  },
  // Ensure the button text itself is black when active in light theme
  "&.active .MuiButton-label": {
    color: (theme) => (theme.palette.mode === "light" ? "#000000" : "#FFFFFF"),
  },
  // Additional specificity for text color
  "&.active span": {
    color: (theme) => (theme.palette.mode === "light" ? "#000000" : "#FFFFFF"),
  },
  "&.active div": {
    color: (theme) => (theme.palette.mode === "light" ? "#000000" : "#FFFFFF"),
  },
}));

export const TimeDisplay = styled(Typography)(({ theme }) => ({
  color: "#FFFFFF",
  fontSize: "0.9rem",
  fontWeight: 500,
  textAlign: "center",
  letterSpacing: "0.5px",
  textShadow: "0 0 8px rgba(255, 255, 255, 0.3)",
  transition: "all 0.3s ease",
  "&:hover": {
    textShadow: "0 0 12px rgba(255, 255, 255, 0.5)",
  },
}));

// New styled component for the user icon button
export const UserIconButton = styled(IconButton)(({ theme }) => ({
  color: "#fff",
  background: "rgba(255, 255, 255, 0.12)",
  backdropFilter: "blur(8px)",
  borderRadius: "50%",
  width: "40px",
  height: "40px",
  padding: "0",
  border: `2px solid ${
    theme.palette.mode === "light"
      ? "rgba(255, 255, 255, 0.3)"
      : "rgba(34, 197, 94, 0.3)"
  }`,
  boxShadow: `0 0 8px ${
    theme.palette.mode === "light"
      ? "rgba(16, 185, 129, 0.5)"
      : "rgba(34, 197, 94, 0.5)"
  }`,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  overflow: "hidden",
  "&:hover": {
    background: "rgba(255, 255, 255, 0.2)",
    transform: "scale(1.1) rotate(5deg)",
    boxShadow: `0 0 15px ${
      theme.palette.mode === "light"
        ? "rgba(16, 185, 129, 0.8)"
        : "rgba(34, 197, 94, 0.8)"
    }`,
    border: `2px solid ${
      theme.palette.mode === "light"
        ? "rgba(255, 255, 255, 0.6)"
        : "rgba(34, 197, 94, 0.6)"
    }`,
  },
  "&:active": {
    transform: "scale(0.95)",
  },
  "& .MuiBadge-badge": {
    backgroundColor:
      theme.palette.mode === "light"
        ? theme.palette.success.main
        : theme.palette.success.light,
    boxShadow: `0 0 6px ${
      theme.palette.mode === "light"
        ? theme.palette.success.light
        : theme.palette.success.main
    }`,
  },
  "& .MuiAvatar-root": {
    background: "transparent",
  },
}));
