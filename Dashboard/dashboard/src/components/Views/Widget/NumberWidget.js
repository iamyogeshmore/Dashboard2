import { useState, useEffect } from "react";
import { Box, Paper, Typography, IconButton, Tooltip } from "@mui/material";
import { Delete, Settings } from "@mui/icons-material";
import { useThemeContext } from "../../../context/ThemeContext";
import DeleteConfirmationDialog from "../Helper/DeleteConfirmationDialog";
import WidgetSettingsDialog from "../Helper/WidgetSettingsDialog";

const NumberWidget = ({
  terminal,
  measurand,
  value,
  timestamp,
  widgetId,
  onDelete,
}) => {
  const { mode } = useThemeContext();
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem(`widgetSettings_${widgetId}`);
    return savedSettings
      ? JSON.parse(savedSettings)
      : {
          fontFamily: "'Inter', 'Roboto', sans-serif",
          fontSize: "1rem",
          backgroundColor: mode === "light" ? "#FFFFFF" : "#1F2937",
          textColor: null, // Null means use default measurand-based color
          measurandColor: null, // Null means use default getColor logic
        };
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  // Extract unit from measurand (e.g., "Voltage (V)" -> "V")
  const unit = measurand.match(/\((.*?)\)/)?.[1] || "";

  // Determine default color based on measurand type
  const getColor = () => {
    if (measurand.includes("Voltage")) return "#3B82F6";
    if (measurand.includes("Current")) return "#F59E0B";
    if (measurand.includes("Power")) return "#22C55E";
    if (measurand.includes("Frequency")) return "#EC4899";
    return "#6366F1";
  };

  // Use user-defined measurandColor if set, otherwise fallback to getColor
  const measurandColor = settings.measurandColor || getColor();
  // Use user-defined textColor if set, otherwise fallback to measurandColor for text elements
  const textColor = settings.textColor || measurandColor;

  const handleSaveSettings = (widgetId, newSettings) => {
    setSettings(newSettings);
    localStorage.setItem(
      `widgetSettings_${widgetId}`,
      JSON.stringify(newSettings)
    );
  };

  const handleDeleteConfirm = () => {
    onDelete(widgetId);
    setDeleteDialogOpen(false);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        overflow: "hidden",
        background: settings.backgroundColor,
        border: `1px solid ${measurandColor}25`,
        boxShadow: `0 4px 12px ${measurandColor}20`,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 6px 16px ${measurandColor}30`,
        },
      }}
    >
      <Box
        sx={{
          background: `${measurandColor}15`,
          padding: "8px 12px",
          borderBottom: `1px solid ${measurandColor}25`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: textColor,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontFamily: settings.fontFamily,
              fontSize: settings.fontSize,
            }}
          >
            {measurand}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: textColor,
              opacity: 0.7,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontFamily: settings.fontFamily,
              fontSize: `calc(${settings.fontSize} * 0.75)`,
            }}
          >
            {terminal}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Settings">
            <IconButton
              size="small"
              onClick={() => setSettingsDialogOpen(true)}
              sx={{ color: textColor }}
            >
              <Settings fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Widget">
            <IconButton
              size="small"
              onClick={() => setDeleteDialogOpen(true)}
              sx={{ color: textColor }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          padding: "12px 8px",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "baseline" }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: textColor,
              lineHeight: 1,
              fontFamily: settings.fontFamily,
              fontSize: `calc(${settings.fontSize} * 2)`,
            }}
          >
            {value}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 500,
              color: textColor,
              opacity: 0.8,
              ml: 0.5,
              fontFamily: settings.fontFamily,
              fontSize: settings.fontSize,
            }}
          >
            {unit}
          </Typography>
        </Box>

        <Typography
          variant="caption"
          sx={{
            color: mode === "light" ? "text.secondary" : "text.primary",
            opacity: 0.6,
            mt: 1,
            fontFamily: settings.fontFamily,
            fontSize: `calc(${settings.fontSize} * 0.75)`,
          }}
        >
          {timestamp}
        </Typography>
      </Box>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        measurand={measurand}
        terminal={terminal}
      />
      <WidgetSettingsDialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        onSave={handleSaveSettings}
        widgetId={widgetId}
        initialSettings={settings}
        defaultMeasurandColor={getColor()}
      />
    </Paper>
  );
};

export default NumberWidget;
