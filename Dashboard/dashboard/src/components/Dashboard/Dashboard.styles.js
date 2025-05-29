import { styled } from "@mui/material/styles";
import {
  Typography,
  Button,
  IconButton,
  AppBar,
  Dialog,
  TextField,
  Select,
  Switch,
} from "@mui/material";

export const CardTitle = styled(Typography)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  fontWeight: "bold",
  color: theme.palette.primary.main,
}));

// Styled AppBar with glassmorphism and vibrant gradient
export const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.primary.dark}cc, ${theme.palette.primary.light}cc)`,
  backdropFilter: "blur(12px)",
  borderRadius: "0 0 12px 12px",
  boxShadow: `0 6px 20px ${
    theme.palette.mode === "light"
      ? "rgba(30, 64, 175, 0.2)"
      : "rgba(22, 101, 52, 0.3)"
  }`,
  border: `1px solid ${
    theme.palette.mode === "light"
      ? "rgba(59, 130, 246, 0.3)"
      : "rgba(34, 197, 94, 0.3)"
  }`,
  transition: "all 0.4s ease",
  "&:hover": {
    boxShadow: `0 8px 24px ${
      theme.palette.mode === "light"
        ? "rgba(30, 64, 175, 0.3)"
        : "rgba(22, 101, 52, 0.4)"
    }`,
  },
}));

// Styled Dashboard Title with glowing text effect
export const DashboardTitle = styled(Typography)(({ theme }) => ({
  flexGrow: 1,
  textAlign: "center",
  fontWeight: 700,
  letterSpacing: "0.5px",
  color: theme.palette.primary.contrastText,
  textShadow: `0 0 12px ${theme.palette.primary.light}80`,
  transition: "text-shadow 0.3s ease, transform 0.3s ease",
  "&:hover": {
    textShadow: `0 0 20px ${theme.palette.primary.light}b3`,
    transform: "scale(1.03)",
  },
}));

// Styled Widget Icon Button with hover scale and glow
export const WidgetIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  background: `linear-gradient(45deg, ${theme.palette.primary.dark}33, ${theme.palette.primary.light}33)`,
  backdropFilter: "blur(10px)",
  borderRadius: "12px",
  padding: "8px",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
    transform: "scale(1.15) translateY(-3px)",
    boxShadow: `0 0 20px ${theme.palette.primary.light}b3`,
  },
  "&:active": {
    transform: "scale(0.95)",
  },
}));

// Styled Action Button with gradient and hover lift
export const ActionButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  borderRadius: "10px",
  padding: "8px 16px",
  fontSize: "0.85rem",
  fontWeight: 500,
  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.light})`,
  color: theme.palette.primary.contrastText,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    transform: "translateY(-3px)",
    boxShadow: `0 6px 16px ${theme.palette.primary.light}b3`,
  },
  "&:active": {
    transform: "translateY(0)",
  },
}));

// Styled Edit Mode Switch with smaller size and gradient thumb
export const EditModeSwitch = styled(Switch)(({ theme }) => ({
  width: 36, // Reduced width
  height: 20, // Reduced height
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 2, // Reduced padding
    margin: 1, // Reduced margin
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)", // Adjusted for smaller width
      color: theme.palette.primary.contrastText,
      "& + .MuiSwitch-track": {
        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.light})`,
        opacity: 1,
        border: 0,
      },
      "& .MuiSwitch-thumb": {
        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
      },
    },
    "&:not(.Mui-checked)": {
      "& .MuiSwitch-thumb": {
        background: `linear-gradient(45deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.light})`,
      },
    },
  },
  "& .MuiSwitch-thumb": {
    width: 14, // Smaller thumb
    height: 14, // Smaller thumb
    boxShadow: "0 1px 4px rgba(0,0,0,0.15)", // Adjusted shadow for smaller size
    transition: "background 0.3s ease",
  },
  "& .MuiSwitch-track": {
    borderRadius: 20 / 2, // Adjusted for smaller height
    background: `linear-gradient(45deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
    opacity: 1,
    transition: "background 0.3s ease",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)", // Adjusted shadow
  },
}));

// Styled Dialog for Widget Creation with glassmorphism
export const StyledWidgetDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    background: `linear-gradient(135deg, ${theme.palette.background.paper}dd, ${theme.palette.background.default}cc)`,
    backdropFilter: "blur(12px)",
    borderRadius: "16px",
    border: `1px solid ${
      theme.palette.mode === "light"
        ? "rgba(59, 130, 246, 0.3)"
        : "rgba(34, 197, 94, 0.3)"
    }`,
    boxShadow: `0 8px 24px ${
      theme.palette.mode === "light"
        ? "rgba(30, 64, 175, 0.2)"
        : "rgba(22, 101, 52, 0.3)"
    }`,
    padding: theme.spacing(2),
    transition: "all 0.3s ease",
  },
}));

// Styled TextField with icon support and validation animation
export const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    background: `linear-gradient(135deg, ${theme.palette.background.paper}ee, ${theme.palette.background.default}dd)`,
    transition: "all 0.3s ease",
    "&:hover": {
      background: `linear-gradient(135deg, ${theme.palette.background.paper}ff, ${theme.palette.background.default}ee)`,
    },
    "&.Mui-focused": {
      boxShadow: `0 0 12px ${theme.palette.primary.light}80`,
    },
    "&.Mui-error": {
      boxShadow: `0 0 12px ${theme.palette.error.light}80`,
    },
  },
  "& .MuiInputLabel-root": {
    color: theme.palette.text.secondary,
    fontWeight: 500,
    "&.Mui-focused": {
      color: theme.palette.primary.main,
    },
  },
}));

// Styled Select with gradient border on focus
export const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: "10px",
  background: `linear-gradient(135deg, ${theme.palette.background.paper}ee, ${theme.palette.background.default}dd)`,
  transition: "all 0.3s ease",
  "&:hover": {
    background: `linear-gradient(135deg, ${theme.palette.background.paper}ff, ${theme.palette.background.default}ee)`,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: `rgba(${theme.palette.primary.main}, 0.3)`,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 12px ${theme.palette.primary.light}80`,
  },
}));
