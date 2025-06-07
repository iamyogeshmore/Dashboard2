import { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Popover,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  FormControlLabel,
  Switch,
  Modal,
} from "@mui/material";
import {
  Delete,
  Settings,
  CompareArrows,
  Fullscreen,
  FullscreenExit,
} from "@mui/icons-material";
import { useThemeContext } from "../../../context/ThemeContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  GridLineOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import DeleteConfirmationDialog from "../Helper/DeleteConfirmationDialog";
import WidgetSettingsDialog from "../Helper/WidgetSettingsDialog";
import { SketchPicker } from "react-color";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

const GraphWidget = ({ terminal, measurand, data, widgetId, onDelete }) => {
  const { mode } = useThemeContext();
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem(`widgetSettings_${widgetId}`);
    return savedSettings
      ? JSON.parse(savedSettings)
      : {
          fontFamily: "'Inter', 'Roboto', sans-serif",
          fontSize: "1rem",
          backgroundColor: mode === "light" ? "#FFFFFF" : "#1F2937",
          textColor: null,
          measurandColor: null,
          compareMeasurands: [],
          resetInterval: "15min",
          xAxisRecords: 10,
          showXAxis: true,
        };
  });

  const [tempSettings, setTempSettings] = useState(settings);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [normalChartInstance, setNormalChartInstance] = useState(null);
  const [fullScreenChartInstance, setFullScreenChartInstance] = useState(null);
  const chartRef = useRef(null);
  const [compareAnchorEl, setCompareAnchorEl] = useState(null);
  const [selectedMeasurand, setSelectedMeasurand] = useState("");
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const unit = measurand.match(/\((.*?)\)/)?.[1] || "";

  const getColor = () => {
    if (measurand.includes("Voltage")) return "#3B82F6";
    if (measurand.includes("Current")) return "#F59E0B";
    if (measurand.includes("Power")) return "#22C55E";
    if (measurand.includes("Frequency")) return "#EC4899";
    return "#6366F1";
  };

  const measurandColor = settings.measurandColor || getColor();
  const textColor = settings.textColor || measurandColor;

  const gradients = {
    primary:
      mode === "light"
        ? "linear-gradient(45deg, #1E40AF, #3B82F6)"
        : "linear-gradient(45deg, #166534, #22C55E)",
    hover:
      mode === "light"
        ? "linear-gradient(45deg, #1E3A8A, #2563EB)"
        : "linear-gradient(45deg, #14532D, #16A34A)",
  };

  const handleSaveSettings = () => {
    setSettings(tempSettings);
    localStorage.setItem(
      `widgetSettings_${widgetId}`,
      JSON.stringify(tempSettings)
    );
    handleCompareClose();
  };

  const handleDeleteConfirm = () => {
    onDelete(widgetId);
    setDeleteDialogOpen(false);
  };

  const handleCompareClick = (event) => {
    setCompareAnchorEl(event.currentTarget);
  };

  const handleCompareClose = () => {
    setCompareAnchorEl(null);
  };

  const handleAddCompareMeasurand = () => {
    if (selectedMeasurand && tempSettings.compareMeasurands.length < 10) {
      const newCompareMeasurands = [
        ...tempSettings.compareMeasurands,
        { name: selectedMeasurand, color: selectedColor },
      ];
      setTempSettings({
        ...tempSettings,
        compareMeasurands: newCompareMeasurands,
      });
      setSelectedMeasurand("");
      setSelectedColor("#000000");
    }
  };

  const handleRemoveCompareMeasurand = (index) => {
    const newCompareMeasurands = tempSettings.compareMeasurands.filter(
      (_, i) => i !== index
    );
    setTempSettings({
      ...tempSettings,
      compareMeasurands: newCompareMeasurands,
    });
  };

  const handleResetIntervalChange = (event) => {
    setTempSettings({
      ...tempSettings,
      resetInterval: event.target.value,
    });
  };

  const handleXAxisRecordsChange = (event) => {
    const value = parseInt(event.target.value);
    if (value > 0) {
      setTempSettings({
        ...tempSettings,
        xAxisRecords: value,
      });
    }
  };

  const handleToggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleCloseFullScreen = () => {
    setIsFullScreen(false);
  };

  const handleToggleXAxis = () => {
    setTempSettings({
      ...tempSettings,
      showXAxis: !tempSettings.showXAxis,
    });
  };

  const chartData = {
    labels: data.slice(-tempSettings.xAxisRecords).map((item) => item.time),
    datasets: [
      {
        label: measurand,
        data: data.slice(-tempSettings.xAxisRecords).map((item) => item.value),
        borderColor: measurandColor,
        backgroundColor: `${measurandColor}40`,
        fill: true,
        pointBackgroundColor: (context) => {
          const index = context.dataIndex;
          return data[index]?.isLatest ? "red" : measurandColor;
        },
        pointRadius: (context) => {
          const index = context.dataIndex;
          return data[index]?.isLatest ? 6 : 4;
        },
        tension: 0.4,
        borderWidth: 2,
        pointBorderWidth: 2,
        pointHoverRadius: 8,
        pointHoverBorderWidth: 3,
        pointHoverBackgroundColor: measurandColor,
        pointHoverBorderColor: "#fff",
      },
      ...tempSettings.compareMeasurands.map((compare) => ({
        label: compare.name,
        data: data
          .slice(-tempSettings.xAxisRecords)
          .map((item) => item.value * (0.8 + Math.random() * 0.4)), // Mock data for comparison
        borderColor: compare.color,
        backgroundColor: `${compare.color}40`,
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointBorderWidth: 2,
        pointHoverRadius: 8,
        pointHoverBorderWidth: 3,
        pointHoverBackgroundColor: compare.color,
        pointHoverBorderColor: "#fff",
      })),
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: textColor,
          font: {
            family: settings.fontFamily,
            size: parseInt(settings.fontSize) * 0.8,
          },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: `${measurandColor}90`,
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: measurandColor,
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y}${unit}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: tempSettings.showXAxis,
        grid: {
          color: `${measurandColor}15`,
          drawBorder: false,
        },
        ticks: {
          color: textColor,
          maxRotation: 45,
          minRotation: 45,
          maxTicksLimit: tempSettings.xAxisRecords,
        },
      },
      y: {
        grid: {
          color: `${measurandColor}15`,
          drawBorder: false,
        },
        ticks: {
          color: textColor,
          callback: (value) => `${value}${unit}`,
          padding: 10,
        },
        beginAtZero: true,
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 4,
        hitRadius: 10,
        hoverRadius: 8,
      },
    },
  };

  useEffect(() => {
    return () => {
      if (normalChartInstance) {
        normalChartInstance.destroy();
      }
      if (fullScreenChartInstance) {
        fullScreenChartInstance.destroy();
      }
    };
  }, [normalChartInstance, fullScreenChartInstance]);

  const handleNormalChartRef = (ref) => {
    if (ref) {
      setNormalChartInstance(ref);
    }
  };

  const handleFullScreenChartRef = (ref) => {
    if (ref) {
      setFullScreenChartInstance(ref);
    }
  };

  const isComparePopoverOpen = Boolean(compareAnchorEl);
  const comparePopoverId = isComparePopoverOpen ? "compare-popover" : undefined;

  return (
    <>
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
            <Tooltip title={isFullScreen ? "Exit Full Screen" : "Full Screen"}>
              <IconButton
                size="small"
                onClick={handleToggleFullScreen}
                sx={{ color: textColor }}
              >
                {isFullScreen ? (
                  <FullscreenExit fontSize="small" />
                ) : (
                  <Fullscreen fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Graph Settings">
              <IconButton
                size="small"
                onClick={handleCompareClick}
                sx={{ color: textColor }}
              >
                <CompareArrows fontSize="small" />
              </IconButton>
            </Tooltip>
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
            flex: 1,
            padding: "12px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {!isFullScreen && (
              <Line
                data={chartData}
                options={chartOptions}
                ref={handleNormalChartRef}
              />
            )}
          </Box>
        </Box>
      </Paper>

      <Modal
        open={isFullScreen}
        onClose={handleCloseFullScreen}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "rgba(0, 0, 0, 0.8)",
          margin: 0,
          padding: 0,
        }}
      >
        <Paper
          elevation={24}
          sx={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            borderRadius: 0,
            overflow: "hidden",
            background: settings.backgroundColor,
            border: `1px solid ${measurandColor}25`,
            boxShadow: `0 4px 12px ${measurandColor}20`,
            margin: 0,
            padding: 0,
          }}
        >
          <Box
            sx={{
              background: `${measurandColor}15`,
              padding: "12px 16px",
              borderBottom: `1px solid ${measurandColor}25`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: textColor,
                  fontFamily: settings.fontFamily,
                }}
              >
                {measurand}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  color: textColor,
                  opacity: 0.7,
                  fontFamily: settings.fontFamily,
                }}
              >
                {terminal}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Exit Full Screen">
                <IconButton
                  size="large"
                  onClick={handleCloseFullScreen}
                  sx={{ color: textColor }}
                >
                  <FullscreenExit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Graph Settings">
                <IconButton
                  size="large"
                  onClick={handleCompareClick}
                  sx={{ color: textColor }}
                >
                  <CompareArrows />
                </IconButton>
              </Tooltip>
              <Tooltip title="Settings">
                <IconButton
                  size="large"
                  onClick={() => setSettingsDialogOpen(true)}
                  sx={{ color: textColor }}
                >
                  <Settings />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              padding: "16px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {isFullScreen && (
                <Line
                  data={chartData}
                  options={{
                    ...chartOptions,
                    maintainAspectRatio: false,
                    responsive: true,
                  }}
                  ref={handleFullScreenChartRef}
                />
              )}
            </Box>
          </Box>
        </Paper>
      </Modal>

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

      <Popover
        id={comparePopoverId}
        open={isComparePopoverOpen}
        anchorEl={compareAnchorEl}
        onClose={handleCompareClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box
          sx={{
            p: 2,
            width: 300,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="subtitle1">Graph Settings</Typography>

          {/* Compare Measurands Section */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Compare Measurands
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Measurand</InputLabel>
                <Select
                  value={selectedMeasurand}
                  onChange={(e) => setSelectedMeasurand(e.target.value)}
                  label="Measurand"
                >
                  {[
                    "Voltage (V)",
                    "Current (A)",
                    "Power (kW)",
                    "Frequency (Hz)",
                  ].map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ position: "relative" }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  sx={{
                    minWidth: "40px",
                    height: "40px",
                    backgroundColor: selectedColor,
                    borderColor: selectedColor,
                    "&:hover": {
                      borderColor: selectedColor,
                      backgroundColor: selectedColor,
                    },
                  }}
                />
                {showColorPicker && (
                  <Box sx={{ position: "absolute", zIndex: 2, mt: 1 }}>
                    <Box
                      sx={{
                        position: "fixed",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                      }}
                      onClick={() => setShowColorPicker(false)}
                    />
                    <SketchPicker
                      color={selectedColor}
                      onChange={(color) => setSelectedColor(color.hex)}
                    />
                  </Box>
                )}
              </Box>
              <Button
                variant="contained"
                size="small"
                onClick={handleAddCompareMeasurand}
                disabled={
                  !selectedMeasurand ||
                  tempSettings.compareMeasurands.length >= 10
                }
              >
                Add
              </Button>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {tempSettings.compareMeasurands.map((compare, index) => (
                <Chip
                  key={index}
                  label={compare.name}
                  onDelete={() => handleRemoveCompareMeasurand(index)}
                  sx={{
                    backgroundColor: compare.color,
                    color: "#fff",
                    "& .MuiChip-deleteIcon": {
                      color: "#fff",
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Reset Interval Section */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Reset Interval
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={tempSettings.resetInterval}
                onChange={handleResetIntervalChange}
              >
                <MenuItem value="15min">15 Minutes</MenuItem>
                <MenuItem value="1hr">1 Hour</MenuItem>
                <MenuItem value="8hr">8 Hours</MenuItem>
                <MenuItem value="24hr">24 Hours</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* X-axis Records Section */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              X-axis Records
            </Typography>
            <TextField
              type="number"
              size="small"
              fullWidth
              value={tempSettings.xAxisRecords}
              onChange={handleXAxisRecordsChange}
              inputProps={{ min: 1 }}
              helperText="Number of latest records to display"
            />
          </Box>

          {/* X-axis Visibility Toggle */}
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={tempSettings.showXAxis}
                  onChange={handleToggleXAxis}
                  color="primary"
                />
              }
              label="Show X-axis"
            />
          </Box>

          {/* Save Button */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleSaveSettings}
            sx={{
              mt: 1,
              background: gradients.primary,
              "&:hover": { background: gradients.hover },
            }}
          >
            Save Settings
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default GraphWidget;
