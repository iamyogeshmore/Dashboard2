import { styled } from "@mui/material/styles";
import { Typography, Button, IconButton } from "@mui/material";

export const EnergyLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 400,
  fontSize: "1.5rem",
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

export const AnimatedEnergiSpeak = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: "1.5rem",
  display: "flex",
  alignItems: "center",
  color: "#ffffff",
  position: "relative",
  cursor: "pointer",
  textDecoration: "none",
  transition: "transform 0.3s ease, filter 0.3s ease",
  "&:hover": {
    transform: "scale(1.08) translateY(-2px)",
    filter: `drop-shadow(0 0 15px ${
      theme.palette.mode === "light" ? "#1E40AF" : "#22C55E"
    }80)`,
  },
  "&:active": {
    transform: "scale(0.98)",
  },
  // Add a subtle glow effect
  "&:before": {
    content: '""',
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "120%",
    height: "120%",
    background: `radial-gradient(ellipse, ${
      theme.palette.mode === "light"
        ? "rgba(30, 64, 175, 0.1)"
        : "rgba(34, 197, 94, 0.1)"
    } 0%, transparent 70%)`,
    transform: "translate(-50%, -50%)",
    borderRadius: "50%",
    zIndex: -1,
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  "&:hover:before": {
    opacity: 1,
  },
}));

export const NavButton = styled(Button)(({ theme }) => ({
  color: "#fff",
  fontWeight: 200,
  fontSize: "1rem",
  padding: "8px 16px",
  borderRadius: "20px",
  textTransform: "none",
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(5px)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: theme.palette.primary.light,
    color: "#000",
    transform: "scale(1.1) translateY(-2px)",
    boxShadow: `0 0 15px ${theme.palette.primary.light}80`,
  },
  "&.active": {
    background: theme.palette.primary.light,
    color: "#000",
    boxShadow: `0 0 10px ${theme.palette.primary.light}50`,
  },
}));

export const TimeDisplay = styled(Typography)(({ theme }) => ({
  color: "#fff",
  fontSize: "1rem",
  fontWeight: 400,
  textAlign: "center",
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
      ? "rgba(59, 130, 246, 0.5)"
      : "rgba(34, 197, 94, 0.5)"
  }`,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  overflow: "hidden",
  "&:hover": {
    background: "rgba(255, 255, 255, 0.2)",
    transform: "scale(1.1) rotate(5deg)",
    boxShadow: `0 0 15px ${
      theme.palette.mode === "light"
        ? "rgba(59, 130, 246, 0.8)"
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
