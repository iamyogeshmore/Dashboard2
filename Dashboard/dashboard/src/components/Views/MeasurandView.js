// MeasurandView.js
import { useState, useEffect } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { Speed, History } from "@mui/icons-material";
import { motion } from "framer-motion";
import CurrentDataDisplayMV from "./MeasurandView/CurrentDataDisplayMV";
import HistoricalDataDisplayMV from "./MeasurandView/HistoricalDataDisplayMV";
import { useThemeContext } from "../../context/ThemeContext";
import { useLocation } from "react-router-dom";

const MeasurandView = () => {
  const { mode } = useThemeContext();
  const location = useLocation();
  const [tabValue, setTabValue] = useState(0);
  const [savedViews, setSavedViews] = useState([]);

  useEffect(() => {
    const storedViews = localStorage.getItem("measurandSavedViews");
    if (storedViews) {
      setSavedViews(JSON.parse(storedViews));
    }
  }, []);

  useEffect(() => {
    if (location.state?.tab !== undefined) {
      setTabValue(location.state.tab);
    }
  }, [location]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const saveView = (view) => {
    const updatedViews = [...savedViews, view];
    setSavedViews(updatedViews);
    localStorage.setItem("measurandSavedViews", JSON.stringify(updatedViews));
  };

  const deleteView = (viewId) => {
    const updatedViews = savedViews.filter((view) => view.id !== viewId);
    setSavedViews(updatedViews);
    localStorage.setItem("measurandSavedViews", JSON.stringify(updatedViews));
  };

  const getTabGradients = () => ({
    background:
      mode === "light"
        ? "linear-gradient(135deg, #ffffff, #f0f4ff)"
        : "linear-gradient(135deg, #1f2a44, #0a3d2e)",
    selected:
      mode === "light"
        ? "linear-gradient(45deg, #1E40AF, #3B82F6)"
        : "linear-gradient(45deg, #166534, #22C55E)",
    hover:
      mode === "light" ? "rgba(59, 130, 246, 0.2)" : "rgba(34, 197, 94, 0.2)",
  });

  const gradients = getTabGradients();

  return (
    <Box sx={{ p: 1, margin: "0 auto" }}>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        centered
        sx={{
          background: gradients.background,
          boxShadow: (theme) =>
            theme.palette.mode === "light"
              ? "0 4px 12px rgba(30, 64, 175, 0.1)"
              : "0 4px 12px rgba(22, 101, 52, 0.2)",
          overflow: "hidden",
          "& .MuiTabs-flexContainer": {
            display: "flex",
            justifyContent: "center",
            gap: 0,
          },
          "& .MuiTab-root": {
            flex: 1,
            maxWidth: "50%",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "1rem",
            color: (theme) => theme.palette.text.primary,
            padding: "12px 24px",
            minHeight: "30px",
            transition: "all 0.3s ease",
            background: (theme) =>
              theme.palette.mode === "light"
                ? "rgba(255, 255, 255, 0.8)"
                : "rgba(31, 41, 55, 0.8)",
            "&.Mui-selected": {
              color: (theme) => theme.palette.primary.contrastText,
              background: gradients.selected,
              boxShadow: (theme) =>
                theme.palette.mode === "light"
                  ? "0 4px 8px rgba(30, 64, 175, 0.2)"
                  : "0 4px 8px rgba(22, 101, 52, 0.3)",
            },
            "&:hover": {
              background: gradients.hover,
              transform: "translateY(-2px)",
              boxShadow: (theme) =>
                theme.palette.mode === "light"
                  ? "0 4px 8px rgba(30, 64, 175, 0.15)"
                  : "0 4px 8px rgba(22, 101, 52, 0.15)",
            },
          },
          "& .MuiTabs-indicator": {
            display: "none",
          },
        }}
      >
        <Tab
          label="Current Data Display"
          icon={<Speed sx={{ mr: 1, fontSize: "1.4rem", color: "#FF4500" }} />}
          iconPosition="start"
          component={motion.div}
        />
        <Tab
          label="Historical Data Display"
          icon={
            <History sx={{ mr: 1, fontSize: "1.4rem", color: "#FFD700" }} />
          }
          iconPosition="start"
          component={motion.div}
        />
      </Tabs>
      {tabValue === 0 && (
        <CurrentDataDisplayMV
          saveView={saveView}
          savedViews={savedViews}
          deleteView={deleteView}
        />
      )}
      {tabValue === 1 && <HistoricalDataDisplayMV />}
    </Box>
  );
};

export default MeasurandView;
