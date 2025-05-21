import { useState, useEffect, useRef } from "react";
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
  Checkbox,
  ListItemText,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  useTheme,
  alpha,
  Paper,
  FormControlLabel,
} from "@mui/material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-date-fns";
import CloseIcon from "@mui/icons-material/Close";
import TimelineIcon from "@mui/icons-material/Timeline";
import DownloadIcon from "@mui/icons-material/Download";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { enUS } from "date-fns/locale";

// Register Chart.js components and zoom plugin
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin
);

const MeasurandGraphDialog = ({
  open,
  onClose,
  rows,
  measurand,
  availableMeasurands,
  mode,
}) => {
  const theme = useTheme();
  const [selectedMeasurands, setSelectedMeasurands] = useState(
    measurand ? [measurand] : []
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeRange, setTimeRange] = useState("all");
  const [showStats, setShowStats] = useState(true);
  const chartRef = useRef(null);

  // Process data and calculate statistics
  const processedData = {};
  selectedMeasurands.forEach((m) => {
    const values = rows.map((row) => parseFloat(row[m]) || 0);
    processedData[m] = {
      avg: values.length
        ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
        : 0,
      max: values.length ? Math.max(...values).toFixed(2) : 0,
      min: values.length ? Math.min(...values).toFixed(2) : 0,
      current: values.length ? values[values.length - 1].toFixed(2) : 0,
    };
  });

  // Define vibrant color palette
  const colorPalette = [
    { background: "rgba(99, 102, 241, 0.5)", border: "rgba(79, 70, 229, 1)" }, // Indigo
    { background: "rgba(16, 185, 129, 0.5)", border: "rgba(5, 150, 105, 1)" }, // Emerald
    { background: "rgba(239, 68, 68, 0.5)", border: "rgba(220, 38, 38, 1)" }, // Red
    { background: "rgba(245, 158, 11, 0.5)", border: "rgba(217, 119, 6, 1)" }, // Amber
    { background: "rgba(139, 92, 246, 0.5)", border: "rgba(124, 58, 237, 1)" }, // Purple
    { background: "rgba(14, 165, 233, 0.5)", border: "rgba(3, 105, 161, 1)" }, // Sky
    { background: "rgba(236, 72, 153, 0.5)", border: "rgba(219, 39, 119, 1)" }, // Pink
    { background: "rgba(20, 184, 166, 0.5)", border: "rgba(15, 118, 110, 1)" }, // Teal
  ];

  // Filter data based on time range
  const filteredRows = (() => {
    if (timeRange === "all") return rows;

    const now = new Date();
    let cutoff = new Date();

    switch (timeRange) {
      case "1h":
        cutoff.setHours(now.getHours() - 1);
        break;
      case "6h":
        cutoff.setHours(now.getHours() - 6);
        break;
      case "24h":
        cutoff.setDate(now.getDate() - 1);
        break;
      case "7d":
        cutoff.setDate(now.getDate() - 7);
        break;
      default:
        return rows;
    }

    return rows.filter((row) => new Date(row.timestamp) >= cutoff);
  })();

  // Prepare data for the chart with gradients for area effect
  const labels = filteredRows.map((row) => new Date(row.timestamp).getTime());
  const datasets = selectedMeasurands.map((m, index) => {
    const colorSet = colorPalette[index % colorPalette.length];
    return {
      label: m,
      data: filteredRows.map((row) => parseFloat(row[m]) || 0),
      borderColor: colorSet.border,
      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return colorSet.background;
        const gradient = ctx.createLinearGradient(
          0,
          chartArea.bottom,
          0,
          chartArea.top
        );
        gradient.addColorStop(0, alpha(colorSet.background, 0.05));
        gradient.addColorStop(1, alpha(colorSet.background, 0.5));
        return gradient;
      },
      fill: "start",
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
      borderWidth: 2,
    };
  });

  const chartData = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          padding: 20,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: 500,
          },
          color: mode === "light" ? "#1F2937" : "#F3F4F6",
        },
      },
      tooltip: {
        backgroundColor:
          mode === "light" ? alpha("#FFFFFF", 0.9) : alpha("#111827", 0.95),
        titleColor: mode === "light" ? "#1F2937" : "#F3F4F6",
        bodyColor: mode === "light" ? "#374151" : "#E5E7EB",
        borderColor: mode === "light" ? "#E5E7EB" : "#374151",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
          weight: 600,
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 13,
        },
        callbacks: {
          title: function (context) {
            const date = new Date(context[0].parsed.x);
            return date.toLocaleString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          },
        },
        displayColors: true,
        boxPadding: 6,
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.1,
          },
          pinch: {
            enabled: true,
          },
          mode: "xy",
        },
        pan: {
          enabled: true,
          mode: "xy",
        },
        limits: {
          x: { min: "original", max: "original" },
          y: { min: "original", max: "original" },
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit:
            timeRange === "1h"
              ? "minute"
              : timeRange === "6h"
              ? "hour"
              : timeRange === "24h"
              ? "hour"
              : timeRange === "7d"
              ? "day"
              : "hour",
          displayFormats: {
            minute: "HH:mm",
            hour: "MMM d, HH:mm",
            day: "MMM d",
          },
          tooltipFormat: "MMM d, yyyy HH:mm",
          adapter: "date-fns",
          locale: enUS,
        },
        ticks: {
          color: mode === "light" ? "#4B5563" : "#9CA3AF",
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
          maxRotation: 30,
        },
        grid: {
          color:
            mode === "light" ? alpha("#E5E7EB", 0.7) : alpha("#374151", 0.5),
          drawBorder: false,
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: false,
        ticks: {
          color: mode === "light" ? "#4B5563" : "#9CA3AF",
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
          padding: 8,
        },
        grid: {
          color:
            mode === "light" ? alpha("#E5E7EB", 0.7) : alpha("#374151", 0.5),
          drawBorder: false,
        },
        border: {
          display: false,
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 0,
      },
    },
    animation: {
      duration: 700,
      easing: "easeOutQuart",
    },
  };

  const handleMeasurandChange = (event) => {
    const value = event.target.value;
    setSelectedMeasurands(typeof value === "string" ? value.split(",") : value);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownloadChart = () => {
    const canvas = document.querySelector(".chart-container canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `${selectedMeasurands.join("-")}-chart.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleZoomIn = () => {
    if (chartRef.current) {
      chartRef.current.zoom(1.1);
    }
  };

  const handleZoomOut = () => {
    if (chartRef.current) {
      chartRef.current.zoom(0.9);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={isFullscreen ? false : "lg"}
      fullWidth={!isFullscreen}
      fullScreen={isFullscreen}
      sx={{
        "& .MuiDialog-paper": {
          background: mode === "light" ? "#FFFFFF" : "#111827",
          boxShadow:
            mode === "light"
              ? "0 10px 25px rgba(30, 64, 175, 0.15)"
              : "0 10px 25px rgba(0, 0, 0, 0.5)",
          overflow: "hidden",
          maxWidth: isFullscreen ? "100%" : "1280px",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background:
            mode === "light"
              ? "linear-gradient(135deg, #EEF2FF 0%, #E0F2FE 100%)"
              : "linear-gradient(135deg, #1E3A8A 0%, #065F46 100%)",
          borderBottom: `1px solid ${
            mode === "light" ? alpha("#6366F1", 0.2) : alpha("#22C55E", 0.2)
          }`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <TimelineIcon
            sx={{
              mr: 1,
              color: mode === "light" ? "#4F46E5" : "#10B981",
              fontSize: 24,
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: mode === "light" ? "#1E40AF" : "#ECFDF5",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Data Visualization
          </Typography>
          {selectedMeasurands.length > 0 && (
            <Chip
              label={
                selectedMeasurands.length === 1
                  ? selectedMeasurands[0]
                  : `${selectedMeasurands.length} Measurands`
              }
              size="small"
              sx={{
                ml: 1.5,
                fontWeight: 500,
                background:
                  mode === "light"
                    ? alpha("#6366F1", 0.1)
                    : alpha("#10B981", 0.2),
                color: mode === "light" ? "#4F46E5" : "#10B981",
                border: `1px solid ${
                  mode === "light"
                    ? alpha("#6366F1", 0.3)
                    : alpha("#10B981", 0.3)
                }`,
              }}
            />
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            onClick={handleZoomIn}
            size="small"
            sx={{
              color: mode === "light" ? "#4F46E5" : "#10B981",
            }}
          >
            <ZoomInIcon />
          </IconButton>
          <IconButton
            onClick={handleZoomOut}
            size="small"
            sx={{
              color: mode === "light" ? "#4F46E5" : "#10B981",
            }}
          >
            <ZoomOutIcon />
          </IconButton>
          <IconButton
            onClick={handleFullscreenToggle}
            size="small"
            sx={{
              color: mode === "light" ? "#4F46E5" : "#10B981",
            }}
          >
            <FullscreenIcon />
          </IconButton>
          <IconButton
            onClick={handleDownloadChart}
            size="small"
            sx={{
              color: mode === "light" ? "#4F46E5" : "#10B981",
            }}
          >
            <DownloadIcon />
          </IconButton>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: mode === "light" ? "#4F46E5" : "#10B981",
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          p: { xs: 1.5, sm: 2 },
          background:
            mode === "light"
              ? "linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)"
              : "linear-gradient(180deg, #111827 0%, #0F172A 100%)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            gap: 1.5,
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flex: 1,
              mt: 2,
            }}
          >
            <FormControl sx={{ flex: 1, maxWidth: { xs: "100%", sm: 600 } }}>
              <InputLabel
                id="measurand-select-label"
                sx={{ color: mode === "light" ? "#4F46E5" : "#10B981" }}
              >
                Select Measurand
              </InputLabel>
              <Select
                labelId="measurand-select-label"
                label="Select Measurand"
                multiple
                value={selectedMeasurands}
                onChange={handleMeasurandChange}
                renderValue={(selected) => (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                      maxHeight: 40,
                      overflow: "hidden",
                    }}
                  >
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        size="small"
                        sx={{
                          background:
                            mode === "light"
                              ? alpha("#6366F1", 0.1)
                              : alpha("#10B981", 0.2),
                          color: mode === "light" ? "#4F46E5" : "#10B981",
                        }}
                      />
                    ))}
                  </Box>
                )}
                sx={{
                  background: mode === "light" ? "#FFFFFF" : "#1F2937",
                  borderRadius: 1,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor:
                      mode === "light"
                        ? alpha("#6366F1", 0.3)
                        : alpha("#10B981", 0.3),
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: mode === "light" ? "#6366F1" : "#10B981",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: mode === "light" ? "#6366F1" : "#10B981",
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 300,
                      overflowY: "auto",
                    },
                  },
                  MenuListProps: {
                    sx: {
                      padding: 0,
                    },
                  },
                }}
              >
                {availableMeasurands.map((m) => (
                  <MenuItem
                    key={m}
                    value={m}
                    sx={{
                      height: 36,
                      padding: "8px 16px",
                      "& .MuiListItemText-root": {
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 300,
                      },
                    }}
                  >
                    <Checkbox
                      checked={selectedMeasurands.includes(m)}
                      sx={{
                        color: mode === "light" ? "#6366F1" : "#10B981",
                        "&.Mui-checked": {
                          color: mode === "light" ? "#6366F1" : "#10B981",
                        },
                        padding: "0 8px 0 0",
                      }}
                    />
                    <ListItemText
                      primary={m}
                      primaryTypographyProps={{
                        sx: {
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        },
                      }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showStats}
                  onChange={(e) => setShowStats(e.target.checked)}
                  sx={{
                    color: mode === "light" ? "#6366F1" : "#10B981",
                    "&.Mui-checked": {
                      color: mode === "light" ? "#6366F1" : "#10B981",
                    },
                  }}
                />
              }
              label="Show Statistics"
              sx={{
                color: mode === "light" ? "#4B5563" : "#9CA3AF",
                "& .MuiTypography-root": {
                  fontSize: "0.85rem",
                },
              }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {["1h", "6h", "24h", "7d", "all"].map((range) => (
              <Button
                key={range}
                size="small"
                variant={timeRange === range ? "contained" : "outlined"}
                onClick={() => handleTimeRangeChange(range)}
                sx={{
                  minWidth: 40,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  ...(timeRange === range
                    ? {
                        bgcolor: mode === "light" ? "#6366F1" : "#10B981",
                        color: "#FFFFFF",
                        "&:hover": {
                          bgcolor: mode === "light" ? "#4F46E5" : "#059669",
                        },
                      }
                    : {
                        color: mode === "light" ? "#6366F1" : "#10B981",
                        borderColor:
                          mode === "light"
                            ? alpha("#6366F1", 0.5)
                            : alpha("#10B981", 0.5),
                        "&:hover": {
                          borderColor: mode === "light" ? "#6366F1" : "#10B981",
                          bgcolor:
                            mode === "light"
                              ? alpha("#6366F1", 0.1)
                              : alpha("#10B981", 0.1),
                        },
                      }),
                }}
              >
                {range === "all" ? "All" : range}
              </Button>
            ))}
          </Box>
        </Box>

        {showStats && selectedMeasurands.length > 0 && (
          <Box
            sx={{
              display: "flex",
              gap: 1,

              "&::-webkit-scrollbar": {
                height: "8px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: mode === "light" ? "#B0B8C1" : "#4B5563",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-track": {
                background: mode === "light" ? "#E5E7EB" : "#1F2937",
              },
            }}
          >
            {selectedMeasurands.map((m, index) => (
              <Paper
                key={m}
                sx={{
                  p: 1,
                  borderRadius: 1,

                  border: `1px solid ${
                    mode === "light"
                      ? alpha(
                          colorPalette[index % colorPalette.length].border,
                          0.3
                        )
                      : alpha(
                          colorPalette[index % colorPalette.length].border,
                          0.3
                        )
                  }`,
                  background:
                    mode === "light"
                      ? alpha(
                          colorPalette[index % colorPalette.length].background,
                          0.15
                        )
                      : alpha(
                          colorPalette[index % colorPalette.length].background,
                          0.15
                        ),
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: mode === "light" ? "#4B5563" : "#9CA3AF",
                    display: "block",
                    fontSize: "0.65rem",
                    fontWeight: 500,
                  }}
                >
                  {m}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: colorPalette[index % colorPalette.length].border,
                    fontWeight: 600,
                    fontSize: "0.85rem",
                  }}
                >
                  {processedData[m].current}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    fontSize: "0.65rem",
                    flexWrap: "wrap",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: mode === "light" ? "#4B5563" : "#9CA3AF",
                      fontSize: "0.65rem",
                    }}
                  >
                    Avg: <b>{processedData[m].avg}</b>
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: mode === "light" ? "#4B5563" : "#9CA3AF",
                      fontSize: "0.65rem",
                    }}
                  >
                    Min: <b>{processedData[m].min}</b>
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: mode === "light" ? "#4B5563" : "#9CA3AF",
                      fontSize: "0.65rem",
                    }}
                  >
                    Max: <b>{processedData[m].max}</b>
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        )}

        <Box
          className="chart-container"
          sx={{
            width: "100%",
            maxWidth: isFullscreen ? "100%" : "1200px",
            height: "100%",
            minHeight: 400,
            position: "relative",
            p: 1.5,
            borderRadius: 2,
            bgcolor: mode === "light" ? "#FFFFFF" : "#1F2937",
            border: `1px solid ${mode === "light" ? "#E5E7EB" : "#374151"}`,
            boxShadow:
              mode === "light"
                ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                : "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.18)",
            overflow: "hidden",
          }}
        >
          {selectedMeasurands.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                opacity: 0.7,
              }}
            >
              <InfoOutlinedIcon
                sx={{
                  fontSize: 40,
                  color: mode === "light" ? "#6B7280" : "#9CA3AF",
                  mb: 1.5,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: mode === "light" ? "#6B7280" : "#9CA3AF",
                  textAlign: "center",
                  fontSize: "0.9rem",
                }}
              >
                Select Measurand to visualize data
              </Typography>
            </Box>
          ) : filteredRows.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                opacity: 0.7,
              }}
            >
              <InfoOutlinedIcon
                sx={{
                  fontSize: 40,
                  color: mode === "light" ? "#6B7280" : "#9CA3AF",
                  mb: 1.5,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: mode === "light" ? "#6B7280" : "#9CA3AF",
                  textAlign: "center",
                  fontSize: "0.9rem",
                }}
              >
                No data available for the selected time range
              </Typography>
            </Box>
          ) : (
            <Line ref={chartRef} data={chartData} options={options} />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default MeasurandGraphDialog;
