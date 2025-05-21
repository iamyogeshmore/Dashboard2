import { Box } from "@mui/material";
import { useThemeContext } from "../../context/ThemeContext";
import CurrentDataDisplaySV from "./ScriptView/CurrentDataDisplaySV";

const ScriptView = () => {
  const { mode } = useThemeContext();

  const getContainerGradients = () => ({
    background:
      mode === "light"
        ? "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)"
        : "linear-gradient(135deg, #022C22 0%, #064E3B 100%)",
  });

  const gradients = getContainerGradients();

  return (
    <Box
      sx={{
        p: 2,
        minHeight: "80vh",
        background: gradients.background,
        borderRadius: 2,
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
      }}
    >
      <CurrentDataDisplaySV />
    </Box>
  );
};

export default ScriptView;
