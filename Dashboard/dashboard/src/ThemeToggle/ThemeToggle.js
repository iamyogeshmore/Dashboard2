// ThemeToggle.js
import { useThemeContext } from "../context/ThemeContext";
import { Box, Switch, styled } from "@mui/material";
import { WbSunny, NightsStay } from "@mui/icons-material";
import { motion } from "framer-motion";

const StyledSwitch = styled(Switch)(({ theme, checked }) => ({
  width: 60,
  height: 30,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 2,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(28px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        background: checked
          ? "linear-gradient(45deg, #166534, #22C55E)"
          : "linear-gradient(45deg, #10B981, #34D399)",
        opacity: 1,
        border: 0,
      },
    },
  },
  "& .MuiSwitch-thumb": {
    width: 24,
    height: 24,
    background: checked
      ? "linear-gradient(45deg, #14532D, #15803D)"
      : "linear-gradient(45deg, #059669, #10B981)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },
  "& .MuiSwitch-track": {
    borderRadius: 30 / 2,
    background: checked
      ? "linear-gradient(45deg, #14532D, #15803D)"
      : "linear-gradient(45deg, #059669, #10B981)",
    opacity: 1,
    transition: "background 0.4s ease",
    backdropFilter: "blur(6px)",
  },
}));

const ThemeToggle = () => {
  const { mode, toggleTheme } = useThemeContext();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        background:
          mode === "light"
            ? "rgba(52, 211, 153, 0.1)"
            : "rgba(34, 197, 94, 0.1)",
        borderRadius: "24px",
        padding: "4px",
        backdropFilter: "blur(10px)",
        boxShadow: `0 4px 12px ${
          mode === "light"
            ? "rgba(16, 185, 129, 0.15)"
            : "rgba(22, 101, 52, 0.15)"
        }`,
        transition: "all 0.3s ease",
      }}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <StyledSwitch
          checked={mode === "dark"}
          onChange={toggleTheme}
          icon={<WbSunny sx={{ color: "#DCFCE7", fontSize: 18, m: "3px" }} />}
          checkedIcon={
            <NightsStay sx={{ color: "#DCFCE7", fontSize: 18, m: "3px" }} />
          }
        />
      </motion.div>
    </Box>
  );
};

export default ThemeToggle;
