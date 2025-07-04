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
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { CardTitle } from "../Dashboard.styles";
import { useForm, Controller } from "react-hook-form";
import { ChromePicker } from "react-color";
import { getMeasurands } from '../../../services/apiService';

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  ChartTooltip,
  Legend
);

const defaultRanges = [
  { min: 0, max: 100, color: "#4caf50" },
  { min: 100, max: 200, color: "#ffeb3b" },
  { min: 200, max: 300, color: "#f44336" },
];

const RESET_INTERVAL_OPTIONS = [
  { value: 900000, label: '15 min' },
  { value: 1800000, label: '30 min' },
  { value: 2700000, label: '45 min' },
  { value: 3600000, label: '1 hr' },
  { value: 28800000, label: '8 hr' },
  { value: 86400000, label: '24 hr' },
];

const PROFILE_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'block', label: 'Block' },
  { value: 'trend', label: 'Trend' },
];

const MultiAxisGraphWidget = ({ data, onUpdate }) => {
  const ranges = data.ranges || defaultRanges;

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: data.measurand || "Value",
        data: [],
        borderColor: data.primaryColor || "#2196f3",
        backgroundColor: data.primaryColor || "#2196f3",
        yAxisID: "y0",
        fill: data.graphType === "area",
        tension:
          data.graphType === "area" || data.graphType === "line" ? 0.4 : 0,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  });
  const [timestamp, setTimestamp] = useState(new Date().toLocaleString());
  const [openSettings, setOpenSettings] = useState(false);
  const [colorPickerField, setColorPickerField] = useState(null);
  const colorPickerRef = useRef(null);
  const [measurandOptions, setMeasurandOptions] = useState([]);
  const [profile, setProfile] = useState(data.profile || 'daily');

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
      graphType: data.graphType || "line",
      resetInterval: (data.resetInterval || 5000).toString(),
      compareMeasurands: data.compareMeasurands || [],
      measurandColors: data.measurandColors || {},
      primaryColor: data.primaryColor || "#2196f3",
      hideXAxis: data.hideXAxis || false,
      xAxisConfig: (data.xAxisConfig || 10).toString(),
      thresholdPercentage: (data.thresholdPercentage || 0).toString(),
    },
  });

  const compareMeasurands = watch("compareMeasurands");
  const measurandColors = watch("measurandColors");
  const primaryColor = watch("primaryColor");
  const hideXAxis = watch("hideXAxis");
  const thresholdPercentage = parseFloat(watch("thresholdPercentage")) || 0;

  useEffect(() => {
    reset({
      graphType: data.graphType || "line",
      resetInterval: (data.resetInterval || 5000).toString(),
      compareMeasurands: data.compareMeasurands || [],
      measurandColors: data.measurandColors || {},
      primaryColor: data.primaryColor || "#2196f3",
      hideXAxis: data.hideXAxis || false,
      xAxisConfig: (data.xAxisConfig || 10).toString(),
      thresholdPercentage: (data.thresholdPercentage || 0).toString(),
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
        const min = Number(ranges[0]?.min) || 0;
        const max = Number(ranges[ranges.length - 1]?.max) || 100;
        const newValue = generateRandomData(min, max);
        const newLabels = [...prev.labels, newLabel].slice(
          -Number(watch("xAxisConfig") || 10)
        );
        const mainData = [...prev.datasets[0].data, newValue].slice(
          -Number(watch("xAxisConfig") || 10)
        );
        const datasets = [
          {
            label: data.measurand || "Value",
            data: mainData,
            borderColor: primaryColor || "#2196f3",
            backgroundColor:
              data.graphType === "area"
                ? `${primaryColor}80`
                : primaryColor || "#2196f3",
            yAxisID: "y0",
            fill: data.graphType === "area",
            tension:
              data.graphType === "area" || data.graphType === "line" ? 0.4 : 0,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ];

        compareMeasurands.forEach((measurandId, index) => {
          const measurandObj = measurandOptions.find(opt => opt.id === measurandId);
          const newCompareValue = generateRandomData(min, max);
          datasets.push({
            label: measurandObj ? measurandObj.name : measurandId,
            data: [
              ...(prev.datasets[index + 1]?.data || []),
              newCompareValue,
            ].slice(-Number(watch("xAxisConfig") || 10)),
            borderColor: measurandColors[measurandId] || generateRandomColor(),
            backgroundColor:
              data.graphType === "area"
                ? `${measurandColors[measurandId] || generateRandomColor()}80`
                : `${measurandColors[measurandId] || generateRandomColor()}`,
            yAxisID: `y${index + 1}`,
            fill: data.graphType === "area",
            tension:
              data.graphType === "area" || data.graphType === "line" ? 0.4 : 0,
            pointRadius: 4,
            pointHoverRadius: 6,
          });
        });

        if (thresholdPercentage > 0 && mainData.length > 0) {
          const upper = mainData.map((v) => v + (v * thresholdPercentage) / 100);
          const lower = mainData.map((v) => v - (v * thresholdPercentage) / 100);
          // Shaded area between thresholds
          datasets.push({
            label: "Threshold Range",
            data: upper,
            type: "line",
            borderWidth: 0,
            pointRadius: 0,
            fill: {
              target: "-1",
              above: "rgba(211,47,47,0.08)",
              below: "rgba(56,142,60,0.08)",
            },
            backgroundColor: "rgba(33,150,243,0.08)",
            order: 98,
            yAxisID: "y0",
            tension: data.graphType === "area" || data.graphType === "line" ? 0.4 : 0,
            datalabels: { display: false },
            borderDash: [],
          });
          // Upper threshold line
          datasets.push({
            label: "Upper Threshold",
            data: upper,
            type: "line",
            borderColor: "rgba(211,47,47,0.7)",
            borderDash: [6, 6],
            pointRadius: 0,
            fill: false,
            borderWidth: 2,
            yAxisID: "y0",
            order: 99,
            tension: data.graphType === "area" || data.graphType === "line" ? 0.4 : 0,
            datalabels: { display: false },
          });
          // Lower threshold line
          datasets.push({
            label: "Lower Threshold",
            data: lower,
            type: "line",
            borderColor: "rgba(56,142,60,0.7)",
            borderDash: [6, 6],
            pointRadius: 0,
            fill: false,
            borderWidth: 2,
            yAxisID: "y0",
            order: 99,
            tension: data.graphType === "area" || data.graphType === "line" ? 0.4 : 0,
            datalabels: { display: false },
          });
        }

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
      Number(data.resetInterval) || 5000
    );

    return () => clearInterval(interval);
  }, [data, compareMeasurands, measurandColors, primaryColor, watch]);

  // Fetch measurands when plant, terminal, or profile changes
  useEffect(() => {
    async function fetchMeasurands() {
      const plantId = data.plant && typeof data.plant === 'object' ? data.plant.id : data.plant;
      const terminalId = data.terminal && typeof data.terminal === 'object' ? data.terminal.id : data.terminal;
      if (plantId && terminalId && profile) {
        try {
          const res = await getMeasurands(plantId, terminalId);
          if (res.status === 'success' && Array.isArray(res.data)) {
            setMeasurandOptions(res.data.map(m => ({ id: m.id || m.MeasurandId || m.measurandId, name: m.name || m.MeasurandName || m.measurandName })));
          } else {
            setMeasurandOptions([]);
          }
        } catch {
          setMeasurandOptions([]);
        }
      } else {
        setMeasurandOptions([]);
      }
    }
    fetchMeasurands();
  }, [data.terminal, data.plant, profile]);

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0,0,0,0.8)",
        titleFont: {
          family: data.titleFontFamily || "Roboto",
          weight: "normal",
          style: "normal",
        },
        bodyFont: {
          family: data.valueFontFamily || "Roboto",
          weight: "normal",
          style: "normal",
        },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const datasetIndex = context.datasetIndex;
            const value = context.parsed.y.toFixed(1);
            const label = context.dataset.label;
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: !hideXAxis,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: data.valueFontFamily || "Roboto",
            weight: "normal",
            style: "normal",
          },
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y0: {
        type: "linear",
        display: true,
        position: "left",
        beginAtZero: true,
        min: Number(ranges[0]?.min) || 0,
        max: Number(ranges[ranges.length - 1]?.max) || 100,

        ticks: {
          font: {
            family: data.valueFontFamily || "Roboto",

            weight: "normal",
            style: "normal",
          },
        },
        title: {
          display: true,
          text: data.measurand || "Value",
          font: {
            family: data.titleFontFamily || "Roboto",
            weight: "normal",
            style: "normal",
          },
        },
      },
      ...compareMeasurands.reduce(
        (acc, measurandId, index) => ({
          ...acc,
          [`y${index + 1}`]: {
            type: "linear",
            display: true,
            position: index % 2 === 0 ? "right" : "left",
            beginAtZero: true,
            min: Number(ranges[0]?.min) || 0,
            max: Number(ranges[ranges.length - 1]?.max) || 100,
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              font: {
                family: data.valueFontFamily || "Roboto",
                size: 12,
                weight: "normal",
                style: "normal",
              },
              color: measurandColors[measurandId] || generateRandomColor(),
            },
            title: {
              display: true,
              text: measurandId,
              font: {
                family: data.titleFontFamily || "Roboto",
                size: data.titleFontSize || 12,
                weight: "normal",
                style: "normal",
              },
              color: measurandColors[measurandId] || generateRandomColor(),
            },
          },
        }),
        {}
      ),
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
      {compareMeasurands.length > 0 && (
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
      {ranges.map((range, index) => (
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
      ranges: ranges,
      thresholdPercentage: parseFloat(formData.thresholdPercentage) || 0,
      profile,
    };
    onUpdate(updatedData);
    setOpenSettings(false);
  };

  return (
    <>
      <Card
        sx={{
          height: "100%",
          width: "100%",
          background: data.backgroundColor,
          border: `${data.borderWidth || 1}px solid ${
            data.borderColor || "#e0e0e0"
          }`,
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
                  ? "rgba(0,0,0,0.2)"
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
              <div>
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
              </div>
              <CardTitle
                sx={{
                  fontFamily: data?.titleFontFamily || "Roboto",
                  fontSize: `${data?.titleFontSize || 16}px`,
                  color: data?.titleColor || "inherit",
                  fontWeight: 600,
                  textShadow: (theme) =>
                    `0 0 8px ${theme.palette.primary.light}80`,
                }}
              >
                {data.widgetName || "Multi-Axis Graph Widget"}
              </CardTitle>
            </Box>
          </Tooltip>
          <Box
            sx={{
              flexGrow: 1,
              minHeight: 0,
              p: 1,
              mb: hideXAxis ? 1.25 : 0,
              borderRadius: 2,
              background: data.backgroundColor,
            }}
          >
            <Line data={chartData} options={chartOptions} />
          </Box>
        </CardContent>
      </Card>

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
              color: (theme) => theme.palette.primary.dark,
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
              <FormControl fullWidth>
                <InputLabel>Profile</InputLabel>
                <Select
                  value={profile}
                  label="Profile"
                  onChange={e => setProfile(e.target.value)}
                >
                  {PROFILE_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
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
                      onChange={e => {
                        if (e.target.value.length <= 10) {
                          field.onChange(e);
                          const newColors = { ...measurandColors };
                          e.target.value.forEach(measurandId => {
                            if (!newColors[measurandId]) {
                              newColors[measurandId] = generateRandomColor();
                            }
                          });
                          setValue('measurandColors', newColors);
                        }
                      }}
                    >
                      {measurandOptions.map(opt => (
                        <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.compareMeasurands && (
                  <Typography variant="caption" color="error">{errors.compareMeasurands.message}</Typography>
                )}
              </FormControl>
              {compareMeasurands.map((measurandId, index) => {
                const measurandObj = measurandOptions.find(opt => opt.id === measurandId);
                return (
                  <Box key={measurandId} sx={{ position: "relative" }}>
                    <TextField
                      fullWidth
                      label={`${measurandObj ? measurandObj.name : measurandId} Color`}
                      {...register(`measurandColors.${measurandId}`, {
                        required: `${measurandObj ? measurandObj.name : measurandId} Color is required`,
                      })}
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <Box
                            sx={{
                              bgcolor: measurandColors[measurandId],
                              width: 24,
                              height: 24,
                              borderRadius: 1,
                              mr: 1,
                            }}
                          />
                        ),
                      }}
                      error={!!errors.measurandColors?.[measurandId]}
                      helperText={errors.measurandColors?.[measurandId]?.message}
                      onClick={() => toggleColorPicker(measurandId)}
                    />
                    {colorPickerField === measurandId && (
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
                          color={measurandColors[measurandId]}
                          onChange={(color) =>
                            handleColorChange(
                              `measurandColors.${measurandId}`,
                              color
                            )
                          }
                        />
                      </Box>
                    )}
                  </Box>
                );
              })}
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
              <FormControl fullWidth error={!!errors.resetInterval}>
                <InputLabel>Reset Interval</InputLabel>
                <Controller
                  name="resetInterval"
                  control={control}
                  rules={{ required: 'Reset Interval is required' }}
                  render={({ field }) => (
                    <Select {...field} label="Reset Interval">
                      {RESET_INTERVAL_OPTIONS.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.resetInterval && (
                  <Typography variant="caption" color="error">{errors.resetInterval.message}</Typography>
                )}
              </FormControl>
              <TextField
                fullWidth
                label="Threshold Percentage (%)"
                type="number"
                {...register("thresholdPercentage", {
                  min: 0,
                  max: 100,
                })}
                error={!!errors.thresholdPercentage}
                helperText={
                  errors.thresholdPercentage
                    ? "Enter a value between 0 and 100"
                    : ""
                }
                sx={{ mt: 1 }}
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
          <div>
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
          </div>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MultiAxisGraphWidget;
