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
  unit,
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
  const [isUpdating, setIsUpdating] = useState(false);

  // Update indicator when value changes
  useEffect(() => {
    setIsUpdating(true);
    const timer = setTimeout(() => setIsUpdating(false), 2000); // Show updating for 2 seconds
    return () => clearTimeout(timer);
  }, [value]);

  // Determine default color based on unit
  const getColor = () => {
    if (typeof unit !== "string") return "#6366F1";
    const normalizedUnit = unit.trim().toUpperCase();
    if (["A", "AMP", "AMPS", "AMPERE", "AMPERES"].includes(normalizedUnit)) return "#F59E0B"; // Orange for Current
    if (["V", "VOLT", "VOLTS", "VOLTAGE"].includes(normalizedUnit)) return "#10B981"; // Green for Voltage
    if (["W", "WATT", "WATTS", "KW", "KILOWATT", "KILOWATTS"].includes(normalizedUnit)) return "#6366F1"; // Indigo for Power
    if (["HZ", "HERTZ"].includes(normalizedUnit)) return "#06B6D4"; // Cyan for Frequency
    if (["%", "PERCENT", "PERCENTAGE"].includes(normalizedUnit)) return "#8B5CF6"; // Violet for Percent
    return "#6366F1"; // Default Indigo
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

  // Helper function to format timestamp for tooltip
  const formatTimestampForTooltip = (timestamp) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting timestamp for tooltip:", error);
      return "Invalid Date";
    }
  };

  // Helper function to format value for display
  const formatValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === "N/A" ||
      value === "Error"
    ) {
      return value;
    }

    // If it's a number, format it nicely
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      // Format with appropriate decimal places
      if (Number.isInteger(numValue)) {
        return numValue.toString();
      } else {
        return numValue.toFixed(2);
      }
    }

    return value;
  };

  // Determine if value is in error state
  const isErrorState =
    value === "Error" ||
    value === "N/A" ||
    value === null ||
    value === undefined;

  return (
    <Tooltip
      title={`Last Updated: ${formatTimestampForTooltip(timestamp)}`}
      placement="top"
      arrow
    >
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
          border: `1px solid ${isErrorState ? "#EF4444" : measurandColor}25`,
          boxShadow: `0 4px 12px ${
            isErrorState ? "#EF4444" : measurandColor
          }20`,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: `0 6px 16px ${
              isErrorState ? "#EF4444" : measurandColor
            }30`,
          },
          cursor: "pointer",
        }}
      >
        <Box
          sx={{
            background: `${isErrorState ? "#EF4444" : measurandColor}15`,
            padding: "8px 12px",
            borderBottom: `1px solid ${
              isErrorState ? "#EF4444" : measurandColor
            }25`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: isErrorState ? "#EF4444" : textColor,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontFamily: settings.fontFamily,
              fontSize: settings.fontSize,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            {measurand}
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: isUpdating
                  ? "#10B981"
                  : isErrorState
                  ? "#EF4444"
                  : "#6B7280",
                animation: isUpdating ? "pulse 1s infinite" : "none",
                "@keyframes pulse": {
                  "0%": { opacity: 1 },
                  "50%": { opacity: 0.5 },
                  "100%": { opacity: 1 },
                },
              }}
            />
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title="Settings">
              <IconButton
                size="small"
                onClick={() => setSettingsDialogOpen(true)}
                sx={{ color: isErrorState ? "#EF4444" : textColor }}
              >
                <Settings fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Widget">
              <IconButton
                size="small"
                onClick={() => setDeleteDialogOpen(true)}
                sx={{ color: isErrorState ? "#EF4444" : textColor }}
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
                color: isErrorState ? "#EF4444" : textColor,
                lineHeight: 1,
                fontFamily: settings.fontFamily,
                fontSize: `calc(${settings.fontSize} * 2)`,
                transition: "all 0.3s ease",
                transform: isUpdating ? "scale(1.05)" : "scale(1)",
                textShadow: isUpdating
                  ? `0 0 10px ${isErrorState ? "#EF4444" : textColor}40`
                  : "none",
              }}
            >
              {formatValue(value)}
            </Typography>
            {typeof unit === "string" &&
              unit.trim() !== "" &&
              unit !== "undefined" &&
              unit !== "N/A" &&
              !isErrorState && (
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 500,
                    color: isErrorState ? "#EF4444" : textColor,
                    opacity: 0.8,
                    ml: 0.5,
                    fontFamily: settings.fontFamily,
                    fontSize: settings.fontSize,
                  }}
                >
                  {unit}
                </Typography>
              )}
          </Box>
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
    </Tooltip>
  );
};

export default NumberWidget;
