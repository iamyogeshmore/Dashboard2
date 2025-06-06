import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tooltip,
  IconButton,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Settings, Close, ColorLens } from "@mui/icons-material";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { motion } from "framer-motion";
import { CardTitle } from "../Dashboard.styles";
import { useForm, Controller } from "react-hook-form";
import { ChromePicker } from "react-color";

ChartJS.register(
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  ChartTooltip,
  Legend
);

const mockData = {
  plants: ["Plant A", "Plant B", "Plant C"],
  terminals: {
    "Plant A": ["Terminal A1", "Terminal A2"],
    "Plant B": ["Terminal B1", "Terminal B2"],
    "Plant C": ["Terminal C1", "Terminal C2"],
  },
  measurands: {
    "Terminal A1": ["Temperature", "Pressure"],
    "Terminal A2": ["Flow Rate", "Voltage"],
    "Terminal B1": ["Current", "Power"],
    "Terminal B2": ["Energy", "Frequency"],
    "Terminal C1": ["Humidity", "Level"],
    "Terminal C2": ["Speed", "Torque"],
  },
};

const GraphWidget = ({ data, onUpdate }) => {
  // Add default ranges if not provided
  const defaultRanges = [
    { min: 0, max: 100, color: "#4caf50" },
    { min: 100, max: 200, color: "#ffeb3b" },
    { min: 200, max: 300, color: "#f44336" },
  ];

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: data?.measurand || "Value",
        data: [],
        borderColor: data?.primaryColor || "#2196f3",
        backgroundColor: data?.primaryColor || "#2196f3",
        fill: data?.graphType === "area",
        tension:
          data?.graphType === "area" || data?.graphType === "line" ? 0.4 : 0,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  });
  const [timestamp, setTimestamp] = useState(new Date().toLocaleString());
  const [openSettings, setOpenSettings] = useState(false);
  const [colorPickerField, setColorPickerField] = useState(null);
  const colorPickerRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      graphType: data.graphType || "bar",
      resetInterval: (data.resetInterval || 5000).toString(),
      compareMeasurands: data.compareMeasurands || [],
      measurandColors: data.measurandColors || {},
      primaryColor: data.primaryColor || "#2196f3",
      hideXAxis: data.hideXAxis || false,
      xAxisConfig: (data.xAxisConfig || 10).toString(),
    },
  });

  const compareMeasurands = watch("compareMeasurands");
  const measurandColors = watch("measurandColors");
  const primaryColor = watch("primaryColor");
  const hideXAxis = watch("hideXAxis");

  useEffect(() => {
    reset({
      graphType: data.graphType || "bar",
      resetInterval: (data.resetInterval || 5000).toString(),
      compareMeasurands: data.compareMeasurands || [],
      measurandColors: data.measurandColors || {},
      primaryColor: data.primaryColor || "#2196f3",
      hideXAxis: data.hideXAxis || false,
      xAxisConfig: (data.xAxisConfig || 10).toString(),
    });
  }, [data, reset]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target)
      ) {
        setColorPickerField(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const generateRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const generateRandomData = (min, max) => {
    return Math.random() * (max - min) + min;
  };

  useEffect(() => {
    const updateChartData = () => {
      setChartData((prev) => {
        const newLabel = new Date().toLocaleTimeString();
        const ranges = data?.ranges || defaultRanges;
        const min = Number(ranges[0]?.min) || 0;
        const max = Number(ranges[ranges.length - 1]?.max) || 100;
        const newValue = generateRandomData(min, max);
        const newLabels = [...prev.labels, newLabel].slice(
          -Number(watch("xAxisConfig") || 10)
        );
        const datasets = [
          {
            label: data?.measurand || "Value",
            data: [...prev.datasets[0].data, newValue].slice(
              -Number(watch("xAxisConfig") || 10)
            ),
            borderColor: primaryColor || "#2196f3",
            backgroundColor:
              data?.graphType === "area"
                ? `${primaryColor}80`
                : primaryColor || "#2196f3",
            fill: data?.graphType === "area",
            tension:
              data?.graphType === "area" || data?.graphType === "line"
                ? 0.4
                : 0,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ];

        compareMeasurands.forEach((measurand, index) => {
          const newCompareValue = generateRandomData(min, max);
          datasets.push({
            label: measurand,
            data: [
              ...(prev.datasets[index + 1]?.data || []),
              newCompareValue,
            ].slice(-Number(watch("xAxisConfig") || 10)),
            borderColor: measurandColors[measurand] || generateRandomColor(),
            backgroundColor:
              data?.graphType === "area"
                ? `${measurandColors[measurand] || generateRandomColor()}80`
                : measurandColors[measurand] || generateRandomColor(),
            fill: data?.graphType === "area",
            tension:
              data?.graphType === "area" || data?.graphType === "line"
                ? 0.4
                : 0,
            pointRadius: 4,
            pointHoverRadius: 6,
          });
        });

        return {
          labels: newLabels,
          datasets,
        };
      });
      setTimestamp(new Date().toLocaleString());
    };

    updateChartData();
    const interval = setInterval(
      updateChartData,
      Number(data?.resetInterval) || 5000
    );

    return () => clearInterval(interval);
  }, [data, compareMeasurands, measurandColors, primaryColor, watch]);

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0,0,0,0.8)",
        titleFont: { family: data?.titleFontFamily || "Roboto", size: 14 },
        bodyFont: { family: data?.titleFontFamily || "Roboto", size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const datasetIndex = context.datasetIndex;
            const value = context.parsed.y.toFixed(2);
            const label = context.dataset.label;
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        min: Number((data?.ranges || defaultRanges)[0]?.min) || 0,
        max:
          Number(
            (data?.ranges || defaultRanges)[
              (data?.ranges || defaultRanges).length - 1
            ]?.max
          ) || 100,
        grid: {
          color: "rgba(0,0,0,0.1)",
        },
        ticks: {
          font: {
            family: data?.titleFontFamily || "Roboto",
            size: 12,
          },
          color: data?.titleColor || "#000000",
        },
      },
      x: {
        display: !hideXAxis,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: data?.titleFontFamily || "Roboto",
            size: 12,
          },
          color: data?.titleColor || "#000000",
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutCubic",
    },
  };

  const tooltipContent = (
    <Box>
      <Typography variant="caption">Plant: {data?.plant || "N/A"}</Typography>
      <br />
      <Typography variant="caption">
        Terminal: {data?.terminal || "N/A"}
      </Typography>
      <br />
      <Typography variant="caption">
        Measurand: {data?.measurand || "N/A"}
      </Typography>
      {compareMeasurands?.length > 0 && (
        <>
          <br />
          <Typography variant="caption">
            Compare Measurands: {compareMeasurands.join(", ")}
          </Typography>
        </>
      )}
      <br />
      <Typography variant="caption">Timestamp: {timestamp}</Typography>
      <br />
      <Typography variant="caption">Ranges:</Typography>
      {(data?.ranges || defaultRanges).map((range, index) => (
        <Typography variant="caption" key={index}>
          Range {index + 1}: {range.min} - {range.max} ({range.color})
        </Typography>
      ))}
    </Box>
  );

  const handleOpenSettings = () => {
    setOpenSettings(true);
  };

  const handleCloseSettings = () => {
    setOpenSettings(false);
    reset();
    setColorPickerField(null);
  };

  const handleColorChange = (field, color) => {
    setValue(field, color.hex, { shouldValidate: true });
  };

  const toggleColorPicker = (field) => {
    setColorPickerField(colorPickerField === field ? null : field);
  };

  const onSettingsSubmit = (formData) => {
    const updatedData = {
      ...data,
      graphType: formData.graphType,
      resetInterval: Number(formData.resetInterval),
      compareMeasurands: formData.compareMeasurands,
      measurandColors: formData.measurandColors,
      primaryColor: formData.primaryColor,
      hideXAxis: formData.hideXAxis,
      xAxisConfig: Number(formData.xAxisConfig),
    };
    onUpdate(updatedData);
    setOpenSettings(false);
  };

  return (
    <Card
      sx={{
        height: "100%",
        width: "100%",
        background: data.backgroundColor || "#ffffff",
        border: `${data.borderWidth || 1}px solid`,
        borderRadius: `${data.borderRadius || 4}px`,
        boxShadow: (theme) =>
          `0 4px 20px ${
            theme.palette.mode === "light"
              ? "rgba(0,0,0,0.1)"
              : "rgba(0,0,0,0.3)"
          }`,
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          boxShadow: (theme) =>
            `0 8px 24px ${
              theme.palette.mode === "light"
                ? "rgba(0,0,0,0.15)"
                : "rgba(0,0,0,0.4)"
            }`,
        },
      }}
    >
      <CardContent
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          p: 2,
        }}
      >
        <Tooltip title={tooltipContent} placement="top">
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <IconButton
                size="small"
                onClick={handleOpenSettings}
                sx={{
                  mr: 1,
                  bgcolor: (theme) => `${theme.palette.primary.main}20`,
                  "&:hover": {
                    bgcolor: (theme) => `${theme.palette.primary.main}40`,
                  },
                }}
              >
                <Settings fontSize="small" />
              </IconButton>
            </motion.div>
            <CardTitle
              sx={{
                fontFamily: data.titleFontFamily || "Roboto",
                fontSize: `${data.titleFontSize || 16}px`,
                color: data.titleColor || "inherit",
                fontWeight: 600,
                textShadow: (theme) =>
                  `0 0 8px ${theme.palette.primary.light}80`,
              }}
            >
              {data.widgetName || "Graph Widget"}
            </CardTitle>
          </Box>
        </Tooltip>
        <Box
          sx={{
            flexGrow: 1,
            minHeight: 0,
            p: 1,
            mb: hideXAxis ? 1.25 : 0, // 10px bottom margin when x-axis is hidden
            borderRadius: 2,
            background: data.backgroundColor || "#ffffff",
          }}
        >
          {data.graphType === "line" ? (
            <Line data={chartData} options={chartOptions} />
          ) : data.graphType === "area" ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
        </Box>
      </CardContent>

      <Dialog
        open={openSettings}
        onClose={handleCloseSettings}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={300}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.background.paper}dd, ${theme.palette.background.default}cc)`,
            backdropFilter: "blur(12px)",
            border: (theme) =>
              `1px solid ${
                theme.palette.mode === "light"
                  ? "rgba(59, 130, 246, 0.3)"
                  : "rgba(34, 197, 94, 0.3)"
              }`,
            boxShadow: (theme) =>
              `0 8px 24px ${
                theme.palette.mode === "light"
                  ? "rgba(30, 64, 175, 0.2)"
                  : "rgba(22, 101, 52, 0.3)"
              }`,
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            sx={{
              color: (theme) => theme.palette.primary.main,
              fontWeight: 600,
            }}
          >
            Graph Settings
          </Typography>
          <IconButton onClick={handleCloseSettings} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSettingsSubmit)}>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <FormControl fullWidth error={!!errors.graphType}>
                <InputLabel>Graph Type</InputLabel>
                <Controller
                  name="graphType"
                  control={control}
                  rules={{ required: "Graph Type is required" }}
                  render={({ field }) => (
                    <Select {...field} label="Graph Type">
                      <MenuItem value="bar">Bar</MenuItem>
                      <MenuItem value="line">Line</MenuItem>
                      <MenuItem value="area">Area</MenuItem>
                    </Select>
                  )}
                />
                {errors.graphType && (
                  <Typography variant="caption" color="error">
                    {errors.graphType.message}
                  </Typography>
                )}
              </FormControl>
              <FormControl fullWidth error={!!errors.compareMeasurands}>
                <InputLabel>Compare Measurands (Max 10)</InputLabel>
                <Controller
                  name="compareMeasurands"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Compare Measurands (Max 10)"
                      multiple
                      onChange={(e) => {
                        if (e.target.value.length <= 10) {
                          field.onChange(e);
                          const newColors = { ...measurandColors };
                          e.target.value.forEach((measurand) => {
                            if (!newColors[measurand]) {
                              newColors[measurand] = generateRandomColor();
                            }
                          });
                          setValue("measurandColors", newColors);
                        }
                      }}
                    >
                      {mockData.measurands[data.terminal]?.map((measurand) => (
                        <MenuItem key={measurand} value={measurand}>
                          {measurand}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.compareMeasurands && (
                  <Typography variant="caption" color="error">
                    {errors.compareMeasurands.message}
                  </Typography>
                )}
              </FormControl>
              {compareMeasurands.map((measurand, index) => (
                <Box key={measurand} sx={{ position: "relative" }}>
                  <TextField
                    fullWidth
                    label={`${measurand} Color`}
                    {...register(`measurandColors.${measurand}`, {
                      required: `${measurand} Color is required`,
                    })}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <Box
                          sx={{
                            bgcolor: measurandColors[measurand],
                            width: 24,
                            height: 24,
                            borderRadius: 1,
                            mr: 1,
                          }}
                        />
                      ),
                    }}
                    error={!!errors.measurandColors?.[measurand]}
                    helperText={errors.measurandColors?.[measurand]?.message}
                    onClick={() => toggleColorPicker(measurand)}
                  />
                  {colorPickerField === measurand && (
                    <Box
                      ref={colorPickerRef}
                      sx={{
                        position: "absolute",
                        zIndex: 1300,
                        top: "100%",
                        right: 0,
                        mt: 1,
                        boxShadow: 3,
                        borderRadius: 1,
                      }}
                    >
                      <ChromePicker
                        color={measurandColors[measurand]}
                        onChange={(color) =>
                          handleColorChange(
                            `measurandColors.${measurand}`,
                            color
                          )
                        }
                      />
                    </Box>
                  )}
                </Box>
              ))}
              <Box>
                <Controller
                  name="hideXAxis"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Hide X-Axis"
                    />
                  )}
                />
              </Box>
              <TextField
                fullWidth
                label="X-Axis Data Points (Records)"
                type="number"
                {...register("xAxisConfig", {
                  required: "X-Axis configuration is required",
                  validate: (value) =>
                    value >= 1 || "Must be at least 1 record",
                })}
                error={!!errors.xAxisConfig}
                helperText={errors.xAxisConfig?.message}
              />
              <Box sx={{ position: "relative" }}>
                <TextField
                  fullWidth
                  label="Primary Measurand Color"
                  {...register("primaryColor", {
                    required: "Primary Color is required",
                  })}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <Box
                        sx={{
                          bgcolor: primaryColor,
                          width: 24,
                          height: 24,
                          borderRadius: 1,
                          mr: 1,
                        }}
                      />
                    ),
                  }}
                  error={!!errors.primaryColor}
                  helperText={errors.primaryColor?.message}
                  onClick={() => toggleColorPicker("primaryColor")}
                />
                {colorPickerField === "primaryColor" && (
                  <Box
                    ref={colorPickerRef}
                    sx={{
                      position: "absolute",
                      zIndex: 1300,
                      top: "100%",
                      right: 0,
                      mt: 1,
                      boxShadow: 3,
                      borderRadius: 1,
                    }}
                  >
                    <ChromePicker
                      color={primaryColor}
                      onChange={(color) =>
                        handleColorChange("primaryColor", color)
                      }
                    />
                  </Box>
                )}
              </Box>
              <TextField
                fullWidth
                label="Reset Interval (ms)"
                type="number"
                {...register("resetInterval", {
                  required: "Reset Interval is required",
                  validate: (value) =>
                    value >= 1000 || "Interval must be at least 1000ms",
                })}
                error={!!errors.resetInterval}
                helperText={errors.resetInterval?.message}
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleCloseSettings}
            sx={{
              textTransform: "none",
              color: (theme) => theme.palette.text.secondary,
            }}
          >
            Cancel
          </Button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              onClick={handleSubmit(onSettingsSubmit)}
              sx={{
                textTransform: "none",
                background: (theme) =>
                  `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.light})`,
                "&:hover": {
                  background: (theme) =>
                    `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  boxShadow: (theme) =>
                    `0 6px 16px ${theme.palette.primary.light}b3`,
                },
              }}
            >
              Save
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default GraphWidget;
