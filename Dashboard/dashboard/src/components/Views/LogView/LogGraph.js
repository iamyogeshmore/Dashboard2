import { useMemo, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  useTheme,
  alpha,
  IconButton,
  Popover,
  Typography,
  FormControlLabel,
  Switch,
  Tooltip,
} from "@mui/material";
import {
  Settings,
  Fullscreen,
  FullscreenExit,
  Save as SaveIcon,
} from "@mui/icons-material";
import { parseISO, format } from "date-fns";
import Chart from "chart.js/auto";
import zoomPlugin from "chartjs-plugin-zoom";
import { useThemeContext } from "../../../context/ThemeContext";

// Register zoom plugin
Chart.register(zoomPlugin);

const LogGraph = ({
  open,
  onClose,
  logs,
  measurandNames,
  selectedMeasurand,
  compareMeasurands,
  onCompareChange,
  mode,
}) => {
  const theme = useTheme();
  const { mode: themeMode } = useThemeContext();
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const [graphType, setGraphType] = useState("line");
  const [hideXAxis, setHideXAxis] = useState(false);

  // Define vibrant color palette for datasets
  const colors = [
    "#10B981", // Green
    "#EC4899", // Pink
    "#22D3EE", // Cyan
    "#F59E0B", // Amber
    "#10B981", // Emerald
    "#8B5CF6", // Purple
  ];

  // Prepare chart data
  const chartData = useMemo(() => {
    if (
      !logs ||
      !logs.length ||
      !compareMeasurands ||
      !compareMeasurands.length
    )
      return null;

    const labels = logs.map((log) =>
      format(parseISO(log.timestamp), "HH:mm:ss")
    );
    const datasets = compareMeasurands.map((measurand, index) => ({
      label: measurand,
      data: logs.map((log) => log[measurand] ?? null),
      borderColor: colors[index % colors.length],
      backgroundColor: alpha(
        colors[index % colors.length],
        graphType === "line" ? 0.2 : 0.5
      ),
      fill: graphType === "area",
      tension: 0.3,
      pointRadius: 0, // Remove dots
      pointHoverRadius: 0, // Remove hover dots
    }));

    return {
      labels,
      datasets,
    };
  }, [logs, compareMeasurands, graphType, themeMode]);

  // Initialize and update chart
  useEffect(() => {
    if (!canvasRef.current || !chartData) return;

    // Destroy existing chart if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Create new chart
    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: "easeOutCubic",
        },
        plugins: {
          zoom: {
            zoom: {
              wheel: { enabled: true },
              pinch: { enabled: true },
              mode: "xy",
            },
          },
          tooltip: {
            backgroundColor: themeMode === "light" ? "#FFFFFF" : "#1F2937",
            titleColor: themeMode === "light" ? "#1F2937" : "#F3F4F6",
            bodyColor: themeMode === "light" ? "#1F2937" : "#F3F4F6",
            borderColor: themeMode === "light" ? "#E5E7EB" : "#4B5563",
            borderWidth: 1,
            cornerRadius: 8,
            padding: 10,
          },
        },
        scales: {
          x: {
            display: !hideXAxis,
            title: {
              display: true,
              text: "Timestamp",
              color: themeMode === "light" ? "#1F2937" : "#F3F4F6",
              font: { size: 14, weight: "600", family: "'Inter', sans-serif" },
            },
            ticks: {
              color: themeMode === "light" ? "#1F2937" : "#F3F4F6",
              maxRotation: 45,
              minRotation: 45,
            },
            grid: {
              color: themeMode === "light" ? "#E5E7EB" : "#374151",
              lineWidth: 1,
            },
          },
          y: {
            title: {
              color: themeMode === "light" ? "#1F2937" : "#F3F4F6",
              font: { size: 14, weight: "600", family: "'Inter', sans-serif" },
            },
            ticks: {
              color: themeMode === "light" ? "#1F2937" : "#F3F4F6",
              stepSize: 1,
            },
            grid: {
              color: themeMode === "light" ? "#E5E7EB" : "#374151",
              lineWidth: 1,
            },
            beginAtZero: true,
          },
        },
      },
    });

    // Cleanup on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [chartData, themeMode, hideXAxis]);

  // Handle settings popover
  const handleSettingsClick = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  // Handle save chart as PNG
  const handleSaveChart = () => {
    if (chartRef.current) {
      const link = document.createElement("a");
      link.href = chartRef.current.toBase64Image();
      link.download = `measurand_graph_${new Date().toISOString()}.png`;
      link.click();
    }
    handleSettingsClose();
  };

  // Toggle full screen
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const isSettingsPopoverOpen = Boolean(settingsAnchorEl);
  const settingsPopoverId = isSettingsPopoverOpen
    ? "settings-popover"
    : undefined;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={isFullScreen ? false : "lg"}
      fullWidth={!isFullScreen}
      fullScreen={isFullScreen}
      PaperProps={{
        sx: {
          borderRadius: isFullScreen ? 0 : 4,
          background:
            themeMode === "light"
              ? "linear-gradient(145deg, #F8FAFC, #E5E7EB)"
              : "linear-gradient(145deg, #1F2937, #111827)",
          boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.25)}`,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          background:
            themeMode === "light"
              ? "linear-gradient(45deg, #10B981, #34D399)"
              : "linear-gradient(45deg, #166534, #22C55E)",
          color: "#FFFFFF",
          fontWeight: 700,
          fontFamily: "'Inter', sans-serif",
          fontSize: "1.5rem",
          borderRadius: isFullScreen ? 0 : "4px 4px 0 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
        }}
      >
        Measurand Analysis
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title={isFullScreen ? "Exit Full Screen" : "Full Screen"}>
            <IconButton
              onClick={toggleFullScreen}
              sx={{
                color: "#FFFFFF",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s ease",
              }}
            >
              {isFullScreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Graph Settings">
            <IconButton
              onClick={handleSettingsClick}
              sx={{
                color: "#FFFFFF",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <Settings />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{
          padding: 3,
          backgroundColor: themeMode === "light" ? "#F9FAFB" : "#111827",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <FormControl fullWidth>
            <InputLabel
              id="compare-measurands-label"
              sx={{ fontWeight: 600, fontFamily: "'Inter', sans-serif" }}
            >
              Compare Measurands
            </InputLabel>
            <Select
              labelId="compare-measurands-label"
              multiple
              value={compareMeasurands}
              onChange={onCompareChange}
              label="Compare Measurands"
              sx={{
                borderRadius: 2,
                backgroundColor: themeMode === "light" ? "#FFFFFF" : "#1F2937",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
                "& .MuiSelect-select": {
                  padding: "12px 16px",
                  fontWeight: 500,
                  fontFamily: "'Inter', sans-serif",
                },
                boxShadow: `0 4px 12px ${alpha(
                  theme.palette.primary.main,
                  0.1
                )}`,
              }}
            >
              {measurandNames.map((name) => (
                <MenuItem
                  key={name}
                  value={name}
                  sx={{ fontWeight: 500, fontFamily: "'Inter', sans-serif" }}
                >
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box
            sx={{
              height: isFullScreen ? "70vh" : 450,
              padding: 2,
              background:
                themeMode === "light"
                  ? "linear-gradient(145deg, #FFFFFF, #F3F4F6)"
                  : "linear-gradient(145deg, #1F2937, #111827)",
              borderRadius: 3,
              boxShadow: `inset 0 2px 8px ${alpha(
                theme.palette.primary.main,
                0.15
              )}`,
            }}
          >
            <canvas ref={canvasRef} />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ padding: "16px 24px" }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            borderColor: theme.palette.text.secondary,
            color: theme.palette.text.primary,
            fontWeight: 600,
            padding: "8px 16px",
            fontFamily: "'Inter', sans-serif",
            "&:hover": {
              borderColor: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              transform: "scale(1.05)",
            },
            transition: "all 0.2s ease",
          }}
        >
          Close
        </Button>
      </DialogActions>
      <Popover
        id={settingsPopoverId}
        open={isSettingsPopoverOpen}
        anchorEl={settingsAnchorEl}
        onClose={handleSettingsClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            width: 300,
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
            background:
              themeMode === "light"
                ? "linear-gradient(145deg, #FFFFFF, #F3F4F6)"
                : "linear-gradient(145deg, #1F2937, #111827)",
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          },
        }}
      >
        <Box
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: themeMode === "light" ? "#1F2937" : "#F3F4F6",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Graph Settings
          </Typography>
          <FormControl fullWidth>
            <InputLabel
              id="graph-type-label"
              sx={{ fontWeight: 600, fontFamily: "'Inter', sans-serif" }}
            >
              Graph Type
            </InputLabel>
            <Select
              labelId="graph-type-label"
              value={graphType}
              onChange={(e) => setGraphType(e.target.value)}
              label="Graph Type"
              sx={{
                borderRadius: 2,
                backgroundColor: themeMode === "light" ? "#F8FAFC" : "#1F2937",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
                "& .MuiSelect-select": {
                  fontWeight: 500,
                  fontFamily: "'Inter', sans-serif",
                },
              }}
            >
              <MenuItem value="line" sx={{ fontWeight: 500 }}>
                Line
              </MenuItem>
              <MenuItem value="area" sx={{ fontWeight: 500 }}>
                Area
              </MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={hideXAxis}
                onChange={(e) => setHideXAxis(e.target.checked)}
                color="primary"
              />
            }
            label="Hide X-Axis"
            sx={{
              color: themeMode === "light" ? "#1F2937" : "#F3F4F6",
              fontWeight: 500,
              fontFamily: "'Inter', sans-serif",
            }}
          />
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveChart}
            sx={{
              background:
                themeMode === "light"
                  ? "linear-gradient(45deg, #10B981, #34D399)"
                  : "linear-gradient(45deg, #166534, #22C55E)",
              borderRadius: 2,
              fontWeight: 600,
              padding: "8px 16px",
              fontFamily: "'Inter', sans-serif",
              "&:hover": {
                background:
                  themeMode === "light"
                    ? "linear-gradient(45deg, #059669, #10B981)"
                    : "linear-gradient(45deg, #14532D, #16A34A)",
                transform: "translateY(-2px)",
                boxShadow: `0 6px 16px ${alpha(
                  theme.palette.primary.main,
                  0.4
                )}`,
              },
              "&:active": { transform: "translateY(0)" },
              transition: "all 0.2s ease",
            }}
          >
            Save as PNG
          </Button>
        </Box>
      </Popover>
    </Dialog>
  );
};

export default LogGraph;
