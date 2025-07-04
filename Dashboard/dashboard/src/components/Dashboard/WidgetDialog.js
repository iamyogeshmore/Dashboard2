import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Typography,
  Box,
  Switch,
  MenuItem,
  IconButton,
  Fade,
  Divider,
  FormControlLabel,
  Stack,
  RadioGroup,
  Radio,
} from "@mui/material";
import {
  Close,
  Add,
  Delete,
  ColorLens,
  Factory,
  Terminal,
  Speed,
  GridOn,
  Image,
  ShowChart,
  Info,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import { ChromePicker } from "react-color";
import { StyledTextField, StyledSelect } from "./Dashboard.styles";
import {
  getPlants,
  getTerminals,
  getMeasurands,
} from "../../services/apiService";

const generateRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const generateDefaultRanges = (minRange, maxRange) => {
  if (!minRange || !maxRange || isNaN(minRange) || isNaN(maxRange)) {
    return [{ min: "", max: "", color: generateRandomColor() }];
  }
  const min = Number(minRange);
  const max = Number(maxRange);
  const rangeSize = (max - min) / 3;
  return [
    { min: min, max: min + rangeSize, color: "#4caf50" },
    { min: min + rangeSize, max: min + 2 * rangeSize, color: "#ffeb3b" },
    { min: min + 2 * rangeSize, max: max, color: "#f44336" },
  ];
};

const WidgetDialog = ({ open, onClose, widgetType, onSubmit, initialData }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
    setValue,
    trigger,
  } = useForm({
    defaultValues: {
      widgetName: initialData?.widgetName || "",
      content: initialData?.content || "",
      plant: initialData?.plant || "",
      terminal: initialData?.terminal || "",
      measurand: initialData?.measurand || "",
      unit: initialData?.unit || "",
      decimalPlaces: initialData?.decimalPlaces || "2",
      graphProfile: initialData?.graphProfile || "simple",
      graphType: initialData?.graphType || "area",
      resetInterval: (initialData?.resetInterval || 900000).toString(),
      rows: initialData?.rows || "",
      columns: initialData?.columns || "",
      showTimestamp: initialData?.showTimestamp || false,
      image: initialData?.image || "",
      ranges: initialData?.ranges || [
        { min: "", max: "", color: generateRandomColor() },
      ],
      minRange: initialData?.minRange || "0",
      maxRange: initialData?.maxRange || "100",
      titleFontFamily: initialData?.titleFontFamily || "Roboto",
      titleFontSize: initialData?.titleFontSize || "16",
      titleColor: initialData?.titleColor || "#000000",
      backgroundColor: initialData?.backgroundColor || "#ffffff",
      borderWidth: initialData?.borderWidth || "1",
      borderRadius: initialData?.borderRadius || "4",
      valueFontFamily: initialData?.valueFontFamily || "Roboto",
      valueFontSize: initialData?.valueFontSize || "24",
      dataGridType: initialData?.dataGridType || "terminal",
      compareMeasurands: initialData?.compareMeasurands || [],
      measurandColors: initialData?.measurandColors || {},
      primaryColor: initialData?.primaryColor || "#2196f3",
      xAxisConfig: (initialData?.xAxisConfig || 10).toString(),
      hideXAxis: initialData?.hideXAxis || false,
      profile: initialData?.profile || "daily",
    },
  });

  const [ranges, setRanges] = useState(
    initialData?.ranges || [{ min: "", max: "", color: generateRandomColor() }]
  );
  const [imagePreview, setImagePreview] = useState(initialData?.image || null);
  const [selectedPlant, setSelectedPlant] = useState(initialData?.plant || "");
  const [selectedTerminal, setSelectedTerminal] = useState(
    initialData?.terminal || ""
  );
  const [colorPickerField, setColorPickerField] = useState(null);
  const colorPickerRef = useRef(null);

  const [plants, setPlants] = useState([]);
  const [terminals, setTerminals] = useState([]);
  const [measurands, setMeasurands] = useState([]);
  const [loadingPlants, setLoadingPlants] = useState(false);
  const [loadingTerminals, setLoadingTerminals] = useState(false);
  const [loadingMeasurands, setLoadingMeasurands] = useState(false);
  const [errorPlants, setErrorPlants] = useState(null);
  const [errorTerminals, setErrorTerminals] = useState(null);
  const [errorMeasurands, setErrorMeasurands] = useState(null);

  const minRange = watch("minRange");
  const maxRange = watch("maxRange");
  const graphProfile = watch("graphProfile");
  const compareMeasurands = watch("compareMeasurands");
  const measurandColors = watch("measurandColors");
  const profile = watch("profile");

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

  useEffect(() => {
    if (initialData) {
      setRanges(
        initialData.ranges || [
          { min: "", max: "", color: generateRandomColor() },
        ]
      );
      setImagePreview(initialData.image || null);
      setSelectedPlant(initialData.plant || "");
      setSelectedTerminal(initialData.terminal || "");
    }
  }, [initialData]);

  useEffect(() => {
    if (widgetType === "gauge" && minRange && maxRange && !initialData) {
      const defaultRanges = generateDefaultRanges(minRange, maxRange);
      setRanges(defaultRanges);
      setValue("ranges", defaultRanges);
      trigger("ranges");
    }
  }, [minRange, maxRange, widgetType, setValue, trigger, initialData]);

  // Debug invalid widgetType
  useEffect(() => {
    if (open && (!widgetType || !widgetFields[widgetType])) {
      console.warn(`Invalid widgetType: ${widgetType}`);
    }
  }, [open, widgetType]);

  useEffect(() => {
    if (open) {
      setLoadingPlants(true);
      getPlants()
        .then((res) => {
          setPlants(
            (res.data || []).map((p) => ({
              id: p.id || p.plantid || p.PlantId || p.PlantID,
              name: p.name || p.PlantName || p.plantName,
            }))
          );
          setErrorPlants(null);
        })
        .catch((err) => setErrorPlants(err.message))
        .finally(() => setLoadingPlants(false));
    }
  }, [open]);

  useEffect(() => {
    if (selectedPlant) {
      setLoadingTerminals(true);
      getTerminals(selectedPlant)
        .then((res) => {
          setTerminals(
            (res.data || []).map((t) => ({
              id: t.id || t.TerminalId || t.terminalId,
              id: t.TerminalId,
              name: t.TerminalName,
            }))
          );
          setErrorTerminals(null);
        })
        .catch((err) => setErrorTerminals(err.message))
        .finally(() => setLoadingTerminals(false));
    } else {
      setTerminals([]);
    }
  }, [selectedPlant]);

  useEffect(() => {
    if (selectedPlant && selectedTerminal) {
      setLoadingMeasurands(true);
      getMeasurands(selectedPlant, selectedTerminal)
        .then((res) => {
          setMeasurands(
            (res.data || []).map((m) => ({
              id: m.id || m.MeasurandId || m.measurandId,
              name: m.name || m.MeasurandName || m.measurandName,
            }))
          );
          setErrorMeasurands(null);
        })
        .catch((err) => setErrorMeasurands(err.message))
        .finally(() => setLoadingMeasurands(false));
    } else {
      setMeasurands([]);
    }
  }, [selectedPlant, selectedTerminal]);

  const handleAddRange = () => {
    const lastRange = ranges[ranges.length - 1];
    const newMin = lastRange.max || "";
    const newRanges = [
      ...ranges,
      { min: newMin, max: "", color: generateRandomColor() },
    ];
    setRanges(newRanges);
    setValue("ranges", newRanges);
    trigger("ranges");
  };

  const handleRangeChange = (index, field, value) => {
    const newRanges = [...ranges];
    newRanges[index][field] = value;

    if (field === "max" && index < ranges.length - 1) {
      newRanges[index + 1].min = value;
    }

    setRanges(newRanges);
    setValue("ranges", newRanges);
    trigger("ranges");
  };

  const handleRemoveRange = (index) => {
    if (ranges.length > 1) {
      const newRanges = ranges.filter((_, i) => i !== index);
      for (let i = index; i < newRanges.length; i++) {
        if (i > 0) {
          newRanges[i].min = newRanges[i - 1].max || "";
        }
      }
      setRanges(newRanges);
      setValue("ranges", newRanges);
      trigger("ranges");
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        setImagePreview(reader.result);
        setValue("image", reader.result, { shouldValidate: true });
        await trigger("image");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (field, color) => {
    if (field.startsWith("ranges[")) {
      const index = parseInt(field.match(/\[(\d+)\]/)[1]);
      const newRanges = [...ranges];
      newRanges[index].color = color.hex;
      setRanges(newRanges);
      setValue("ranges", newRanges);
    } else {
      setValue(field, color.hex, { shouldValidate: true });
      if (field.startsWith("measurandColors.")) {
        const measurand = field.split(".")[1];
        setValue("measurandColors", {
          ...measurandColors,
          [measurand]: color.hex,
        });
      }
    }
  };

  const toggleColorPicker = (field) => {
    setColorPickerField(colorPickerField === field ? null : field);
  };

  const validateRanges = (ranges) => {
    for (let i = 0; i < ranges.length; i++) {
      const { min, max } = ranges[i];

      if (min === "" || isNaN(min)) {
        return `Min value for Range ${i + 1} is required and must be a number`;
      }
      if (max === "" || isNaN(max)) {
        return `Max value for Range ${i + 1} is required and must be a number`;
      }

      if (Number(min) > Number(max)) {
        return `Min value must be less than or equal to Max value for Range ${
          i + 1
        }`;
      }

      if (i < ranges.length - 1) {
        if (Number(ranges[i].max) !== Number(ranges[i + 1].min)) {
          return `Max value of Range ${i + 1} must equal Min value of Range ${
            i + 2
          }`;
        }
      }
    }
    return true;
  };

  const widgetFields = {
    text: [
      {
        name: "widgetName",
        label: "Widget Name",
        type: "text",
        required: true,
      },
      {
        name: "content",
        label: "Text Content",
        type: "text",
        required: true,
        multiline: true,
      },
    ],
    number: [
      {
        name: "widgetName",
        label: "Widget Name",
        type: "text",
        required: true,
      },
      {
        name: "plant",
        label: "Plant",
        type: "select",
        options: plants.map((p) => ({ value: p.id, label: p.name })),
        required: true,
        icon: <Factory />,
      },
      {
        name: "terminal",
        label: "Terminal",
        type: "select",
        options: terminals.map((t) => ({ value: t.id, label: t.name })),
        required: true,
        icon: <Terminal />,
      },
      {
        name: "measurand",
        label: "Measurand",
        type: "select",
        options: measurands.map((m) => ({ value: m.id, label: m.name })),
        required: true,
        icon: <Speed />,
      },
      {
        name: "decimalPlaces",
        label: "Decimal Places",
        type: "number",
        required: true,
      },
      {
        name: "unit",
        label: "Unit (optional)",
        type: "text",
        required: false,
      },
    ],
    gauge: [
      {
        name: "widgetName",
        label: "Widget Name",
        type: "text",
        required: true,
      },
      {
        name: "plant",
        label: "Plant",
        type: "select",
        options: plants.map((p) => ({ value: p.id, label: p.name })),
        required: true,
        icon: <Factory />,
      },
      {
        name: "terminal",
        label: "Terminal",
        type: "select",
        options: terminals.map((t) => ({ value: t.id, label: t.name })),
        required: true,
        icon: <Terminal />,
      },
      {
        name: "measurand",
        label: "Measurand",
        type: "select",
        options: measurands.map((m) => ({ value: m.id, label: m.name })),
        required: true,
        icon: <Speed />,
      },
      {
        name: "minRange",
        label: "Minimum Range",
        type: "number",
        required: true,
        icon: <Speed />,
      },
      {
        name: "maxRange",
        label: "Maximum Range",
        type: "number",
        required: true,
        icon: <Speed />,
      },
      {
        name: "decimalPlaces",
        label: "Decimal Places",
        type: "number",
        required: true,
      },
      {
        name: "unit",
        label: "Unit (optional)",
        type: "text",
        required: false,
      },
    ],
    graph: [
      {
        name: "widgetName",
        label: "Widget Name",
        type: "text",
        required: true,
      },
      {
        name: "plant",
        label: "Plant",
        type: "select",
        options: plants.map((p) => ({ value: p.id, label: p.name })),
        required: true,
        icon: <Factory />,
      },
      {
        name: "terminal",
        label: "Terminal",
        type: "select",
        options: terminals.map((t) => ({ value: t.id, label: t.name })),
        required: true,
        icon: <Terminal />,
      },
      {
        name: "measurand",
        label: "Measurand",
        type: "select",
        options: measurands.map((m) => ({ value: m.id, label: m.name })),
        required: true,
        icon: <Speed />,
      },
      {
        name: "profile",
        label: "Profile",
        type: "select",
        options: [
          { value: "daily", label: "Daily" },
          { value: "block", label: "Block" },
          { value: "trend", label: "Trend" },
        ],
        required: true,
        icon: <ShowChart />,
      },
      {
        name: "graphProfile",
        label: "Graph Profile",
        type: "radio",
        options: ["simple", "multi-axis"],
        required: true,
        icon: <ShowChart />,
      },
      {
        name: "graphType",
        label: "Graph Type",
        type: "select",
        required: true,
        icon: <ShowChart />,
      },
      {
        name: "resetInterval",
        label: "Reset Interval",
        type: "select",
        required: true,
        icon: <ShowChart />,
        options: [
          { value: 900000, label: "15 min" },
          { value: 1800000, label: "30 min" },
          { value: 2700000, label: "45 min" },
          { value: 3600000, label: "1 hr" },
          { value: 28800000, label: "8 hr" },
          { value: 86400000, label: "24 hr" },
        ],
      },
      {
        name: "xAxisConfig",
        label: "X-Axis Data Points (Records)",
        type: "number",
        required: true,
        icon: <ShowChart />,
      },
      {
        name: "hideXAxis",
        label: "Hide X-Axis",
        type: "switch",
        required: false,
        icon: <ShowChart />,
      },
      {
        name: "compareMeasurands",
        label: "Compare Measurands (Max 10)",
        type: "select",
        options: measurands.map((m) => ({ value: m.id, label: m.name })),
        multiple: true,
        required: false,
        icon: <ShowChart />,
      },
      {
        name: "primaryColor",
        label: "Primary Measurand Color",
        type: "color",
        required: true,
        icon: <ColorLens />,
      },
    ],
    datagrid: [
      {
        name: "widgetName",
        label: "Widget Name",
        type: "text",
        required: false,
        icon: <GridOn />,
      },
      {
        name: "dataGridType",
        label: "Data Grid Orientation",
        type: "select",
        options: [
          { value: "terminal", label: "Terminal" },
          { value: "measurand", label: "Measurand" },
        ],
        required: true,
        icon: <GridOn />,
      },
      {
        name: "rows",
        label: "Number of Rows",
        type: "number",
        required: true,
        icon: <GridOn />,
      },
      {
        name: "columns",
        label: "Number of Columns",
        type: "number",
        required: true,
        icon: <GridOn />,
      },
      {
        name: "showTimestamp",
        label: "Show Timestamp",
        type: "switch",
        required: false,
        icon: <Info />,
      },
    ],
    image: [
      {
        name: "widgetName",
        label: "Widget Name",
        type: "text",
        required: false,
        icon: <Image />,
      },
      {
        name: "image",
        label: "Upload Image",
        type: "file",
        required: true,
        icon: <Image />,
      },
    ],
  };

  // Common styling fields to include for all widgets
  const commonFields = [
    "titleFontFamily",
    "titleFontSize",
    "titleColor",
    "backgroundColor",
    "borderWidth",
    "borderRadius",
    "valueFontFamily",
    "valueFontSize",
  ];

  const onFormSubmit = (data) => {
    // Extract only the required fields for the widget type
    const requiredFieldNames = widgetFields[widgetType].map(
      (field) => field.name
    );
    let filteredData = {};

    // Include required fields
    requiredFieldNames.forEach((fieldName) => {
      if (data[fieldName] !== undefined) {
        filteredData[fieldName] = data[fieldName];
      }
    });

    // Include common styling fields
    commonFields.forEach((fieldName) => {
      filteredData[fieldName] =
        data[fieldName] || initialData?.[fieldName] || "";
    });

    // Include ranges for number and gauge widgets
    if (widgetType === "number" || widgetType === "gauge") {
      filteredData.ranges = ranges;
    }

    // Include measurandColors for graph widget
    if (widgetType === "graph") {
      filteredData.graphType =
        data.graphType || (data.graphProfile === "multi-axis" ? "line" : "bar");
      filteredData.resetInterval = Number(data.resetInterval) || 900000;
      filteredData.xAxisConfig = Number(data.xAxisConfig) || 10;
      filteredData.measurandColors = measurandColors;
    }

    onSubmit(filteredData);
    reset();
    setRanges([{ min: "", max: "", color: generateRandomColor() }]);
    setImagePreview(null);
    setSelectedPlant("");
    setSelectedTerminal("");
    setColorPickerField(null);
    onClose();
  };

  const getWidgetTypeLabel = (type) => {
    const labels = {
      text: "Text",
      number: "Number",
      gauge: "Gauge",
      graph: "Graph",
      datagrid: "Data Grid",
      image: "Image",
    };
    return labels[type] || type;
  };

  // Add state for profile and fix graphType options
  const getGraphTypeOptions = () => {
    if (graphProfile === "multi-axis") {
      return [
        { value: "line", label: "Line" },
        { value: "area", label: "Area" },
      ];
    }
    // For simple profile, allow all three
    return [
      { value: "bar", label: "Bar" },
      { value: "line", label: "Line" },
      { value: "area", label: "Area" },
    ];
  };

  // Ensure graphType is always valid for the current options
  useEffect(() => {
    const options = getGraphTypeOptions();
    const current = watch("graphType");
    if (!options.some((opt) => opt.value === current)) {
      setValue("graphType", options[0].value);
    }
  }, [graphProfile, profile, setValue, watch]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={300}
      PaperProps={{
        sx: {
          borderRadius: "16px",
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
          padding: (theme) => theme.spacing(1),
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: (theme) =>
            `linear-gradient(90deg, ${theme.palette.primary.light}10, ${theme.palette.primary.dark}10)`,
          borderRadius: "12px 12px 0 0",
          px: 3,
          py: 2,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            component="h2"
            fontWeight={600}
            sx={{
              color: (theme) => theme.palette.primary.main,
              textShadow: (theme) => `0 0 8px ${theme.palette.primary.light}80`,
            }}
          >
            {initialData ? "Edit" : "Create"} {getWidgetTypeLabel(widgetType)}{" "}
            Widget
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            Configure your widget settings below
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close sx={{ color: (theme) => theme.palette.text.secondary }} />
        </IconButton>
      </DialogTitle>

      <Divider sx={{ mx: 3 }} />

      <DialogContent sx={{ py: 2, px: 3 }}>
        {widgetType && widgetFields[widgetType] ? (
          <Box component="form" onSubmit={handleSubmit(onFormSubmit)}>
            <Stack spacing={2}>
              {widgetFields[widgetType].map((field, index) => (
                <div
                  key={field.name}
                >
                  {field.type === "select" &&
                  field.name === "graphType" ? (
                    <FormControl fullWidth error={!!errors[field.name]}>
                      <InputLabel>{field.label}</InputLabel>
                      <Controller
                        name={field.name}
                        control={control}
                        rules={{
                          required: field.required
                            ? `${field.label} is required`
                            : false,
                        }}
                        render={({ field: { onChange, value } }) => (
                          <StyledSelect
                            value={value || ""}
                            onChange={onChange}
                            label={field.label}
                            startAdornment={
                              field.icon && (
                                <Box
                                  sx={{
                                    mr: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    color: (theme) =>
                                      theme.palette.primary.main,
                                  }}
                                >
                                  {field.icon}
                                </Box>
                              )
                            }
                          >
                            {getGraphTypeOptions().map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </StyledSelect>
                        )}
                      />
                      {errors[field.name] && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5 }}
                        >
                          {errors[field.name].message}
                        </Typography>
                      )}
                    </FormControl>
                  ) : field.type === "select" &&
                  field.name !== "compareMeasurands" ? (
                    <FormControl fullWidth error={!!errors[field.name]}>
                      <InputLabel>{field.label}</InputLabel>
                      <Controller
                        name={field.name}
                        control={control}
                        rules={{
                          required: field.required
                            ? `${field.label} is required`
                            : false,
                        }}
                        render={({ field: { onChange, value } }) => (
                          <StyledSelect
                            value={value || ""}
                            onChange={(e) => {
                              onChange(e);
                              if (field.name === "plant") {
                                setSelectedPlant(e.target.value);
                                setSelectedTerminal("");
                                setValue("terminal", "");
                                setValue("measurand", "");
                                setValue("compareMeasurands", []);
                              }
                              if (field.name === "terminal") {
                                setSelectedTerminal(e.target.value);
                                setValue("measurand", "");
                                setValue("compareMeasurands", []);
                              }
                              if (field.name === "graphProfile") {
                                setValue(
                                  "graphType",
                                  e.target.value === "multi-axis"
                                    ? "line"
                                    : "bar"
                                );
                              }
                            }}
                            label={field.label}
                            startAdornment={
                              field.icon && (
                                <Box
                                  sx={{
                                    mr: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    color: (theme) =>
                                      theme.palette.primary.main,
                                  }}
                                >
                                  {field.icon}
                                </Box>
                              )
                            }
                            disabled={
                              (field.name === "plant" && loadingPlants) ||
                              (field.name === "terminal" && loadingTerminals) ||
                              (field.name === "measurand" && loadingMeasurands)
                            }
                          >
                            {field.name === "plant" && loadingPlants ? (
                              <MenuItem value="" disabled>
                                Loading...
                              </MenuItem>
                            ) : field.name === "plant" && errorPlants ? (
                              <MenuItem value="" disabled>
                                {errorPlants}
                              </MenuItem>
                            ) : field.name === "plant" && plants.length === 0 ? (
                              <MenuItem value="" disabled>
                                No plants found
                              </MenuItem>
                            ) : field.name === "terminal" && loadingTerminals ? (
                              <MenuItem value="" disabled>
                                Loading...
                              </MenuItem>
                            ) : field.name === "terminal" && errorTerminals ? (
                              <MenuItem value="" disabled>
                                {errorTerminals}
                              </MenuItem>
                            ) : field.name === "terminal" && terminals.length === 0 ? (
                              <MenuItem value="" disabled>
                                No terminals found
                              </MenuItem>
                            ) : field.name === "measurand" && loadingMeasurands ? (
                              <MenuItem value="" disabled>
                                Loading...
                              </MenuItem>
                            ) : field.name === "measurand" && errorMeasurands ? (
                              <MenuItem value="" disabled>
                                {errorMeasurands}
                              </MenuItem>
                            ) : field.name === "measurand" && measurands.length === 0 ? (
                              <MenuItem value="" disabled>
                                No measurands found
                              </MenuItem>
                            ) : (
                              field.options.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))
                            )}
                          </StyledSelect>
                        )}
                      />
                      {errors[field.name] && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5 }}
                        >
                          {errors[field.name].message}
                        </Typography>
                      )}
                    </FormControl>
                  ) : field.type === "select" &&
                    field.name === "compareMeasurands" ? (
                    <FormControl fullWidth error={!!errors[field.name]}>
                      <InputLabel>{field.label}</InputLabel>
                      <Controller
                        name={field.name}
                        control={control}
                        rules={{
                          required: field.required
                            ? `${field.label} is required`
                            : false,
                        }}
                        render={({ field: { onChange, value } }) => (
                          <StyledSelect
                            value={value || []}
                            onChange={(e) => {
                              if (e.target.value.length <= 10) {
                                onChange(e);
                                const newColors = { ...measurandColors };
                                e.target.value.forEach((measurand) => {
                                  if (!newColors[measurand]) {
                                    newColors[measurand] =
                                      generateRandomColor();
                                  }
                                });
                                setValue("measurandColors", newColors);
                              }
                            }}
                            label={field.label}
                            multiple
                            startAdornment={
                              field.icon && (
                                <Box
                                  sx={{
                                    mr: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    color: (theme) =>
                                      theme.palette.primary.main,
                                  }}
                                >
                                  {field.icon}
                                </Box>
                              )
                            }
                          >
                            {field.options.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </StyledSelect>
                        )}
                      />
                      {errors[field.name] && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5 }}
                        >
                          {errors[field.name].message}
                        </Typography>
                      )}
                    </FormControl>
                  ) : field.type === "switch" ? (
                    <Box>
                      <Controller
                        name={field.name}
                        control={control}
                        defaultValue={false}
                        render={({ field: { onChange, value } }) => (
                          <FormControlLabel
                            control={
                              <Switch
                                checked={value}
                                onChange={onChange}
                                color="primary"
                                sx={{
                                  "& .MuiSwitch-thumb": {
                                    background: (theme) =>
                                      `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                                  },
                                  "& .MuiSwitch-track": {
                                    background: (theme) =>
                                      `linear-gradient(45deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
                                  },
                                }}
                              />
                            }
                            label={
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                {field.icon}
                                <Typography>{field.label}</Typography>
                              </Box>
                            }
                          />
                        )}
                      />
                    </Box>
                  ) : field.type === "file" ? (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: (theme) => theme.palette.primary.main,
                        }}
                      >
                        {field.icon}
                        {field.label}
                      </Typography>
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        sx={{
                          borderRadius: "10px",
                          py: 1,
                          borderColor: (theme) => theme.palette.primary.main,
                          color: (theme) => theme.palette.primary.main,
                          "&:hover": {
                            bgcolor: (theme) =>
                              `${theme.palette.primary.main}10`,
                            borderColor: (theme) => theme.palette.primary.dark,
                          },
                        }}
                        startIcon={field.icon}
                      >
                        Choose Image File
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={handleImageUpload}
                        />
                      </Button>
                      {imagePreview && (
                        <Box
                          sx={{
                            border: 1,
                            borderColor: "divider",
                            borderRadius: "10px",
                            p: 1,
                            mt: 2,
                            background: (theme) =>
                              `linear-gradient(135deg, ${theme.palette.background.paper}ee, ${theme.palette.background.default}dd)`,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              mb: 1,
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{
                                color: (theme) => theme.palette.text.primary,
                              }}
                            >
                              Preview
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setImagePreview(null);
                                setValue("image", "", { shouldValidate: true });
                              }}
                            >
                              <Delete
                                sx={{
                                  color: (theme) => theme.palette.error.main,
                                }}
                              />
                            </IconButton>
                          </Box>
                          <Box
                            component="img"
                            src={imagePreview}
                            alt="Preview"
                            sx={{
                              width: "100%",
                              maxHeight: 150,
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        </Box>
                      )}
                      {errors.image && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 1 }}
                        >
                          {errors.image.message}
                        </Typography>
                      )}
                    </Box>
                  ) : field.type === "radio" ? (
                    <FormControl
                      component="fieldset"
                      error={!!errors[field.name]}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: (theme) => theme.palette.primary.main,
                          mb: 1,
                        }}
                      >
                        {field.icon}
                        {field.label}
                      </Typography>
                      <Controller
                        name={field.name}
                        control={control}
                        rules={{
                          required: field.required
                            ? `${field.label} is required`
                            : false,
                        }}
                        render={({ field: { onChange, value } }) => (
                          <RadioGroup
                            row
                            value={value || ""}
                            onChange={onChange}
                          >
                            {field.options.map((option) => (
                              <FormControlLabel
                                key={option}
                                value={option}
                                control={<Radio />}
                                label={
                                  option === "simple"
                                    ? "Simple Graph"
                                    : "Multi-Axis Graph"
                                }
                              />
                            ))}
                          </RadioGroup>
                        )}
                      />
                      {errors[field.name] && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5 }}
                        >
                          {errors[field.name].message}
                        </Typography>
                      )}
                    </FormControl>
                  ) : field.type === "color" ? (
                    <Box sx={{ position: "relative" }}>
                      <StyledTextField
                        fullWidth
                        label={field.label}
                        {...register(field.name, {
                          required: field.required
                            ? `${field.label} is required`
                            : false,
                        })}
                        InputProps={{
                          readOnly: true,
                          startAdornment: field.icon && (
                            <Box
                              sx={{
                                mr: 1,
                                display: "flex",
                                alignItems: "center",
                                color: (theme) => theme.palette.primary.main,
                              }}
                            >
                              {field.icon}
                            </Box>
                          ),
                          endAdornment: (
                            <Box
                              sx={{
                                bgcolor: watch(field.name),
                                width: 24,
                                height: 24,
                                borderRadius: 1,
                                mr: 1,
                              }}
                            />
                          ),
                        }}
                        error={!!errors[field.name]}
                        helperText={errors[field.name]?.message}
                        onClick={() => toggleColorPicker(field.name)}
                      />
                      {colorPickerField === field.name && (
                        <Box
                          ref={colorPickerRef}
                          sx={{
                            position: "absolute",
                            zIndex: 1300,
                            top: "100%",
                            right: 0,
                            mt: 1,
                            boxShadow: 3,
                            borderRadius: "8px",
                            background: (theme) =>
                              theme.palette.background.paper,
                          }}
                        >
                          <ChromePicker
                            color={watch(field.name)}
                            onChange={(color) =>
                              handleColorChange(field.name, color)
                            }
                          />
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <StyledTextField
                      fullWidth
                      label={field.label}
                      type={field.type}
                      multiline={field.multiline}
                      rows={field.multiline ? 3 : 1}
                      {...register(field.name, {
                        required: field.required
                          ? `${field.label} is required`
                          : false,
                        validate:
                          field.type === "number" && field.required
                            ? (value) =>
                                !isNaN(value) && value >= 0
                                  ? true
                                  : `${field.label} must be a valid number`
                            : undefined,
                      })}
                      error={!!errors[field.name]}
                      helperText={errors[field.name]?.message}
                      InputProps={{
                        startAdornment: field.icon && (
                          <Box
                            sx={{
                              mr: 1,
                              display: "flex",
                              alignItems: "center",
                              color: (theme) => theme.palette.primary.main,
                            }}
                          >
                            {field.icon}
                          </Box>
                        ),
                      }}
                    />
                  )}
                </div>
              ))}

              {widgetType === "graph" &&
                compareMeasurands.map((measurand, index) => (
                  <div
                    key={`measurandColor-${measurand}`}
                  >
                    <Box sx={{ position: "relative" }}>
                      <StyledTextField
                        fullWidth
                        label={`${measurand} Color`}
                        {...register(`measurandColors.${measurand}`, {
                          required: `${measurand} Color is required`,
                        })}
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <Box
                              sx={{
                                mr: 1,
                                display: "flex",
                                alignItems: "center",
                                color: (theme) => theme.palette.primary.main,
                              }}
                            >
                              <ColorLens />
                            </Box>
                          ),
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
                        helperText={
                          errors.measurandColors?.[measurand]?.message
                        }
                        onClick={() =>
                          toggleColorPicker(`measurandColors.${measurand}`)
                        }
                      />
                      {colorPickerField === `measurandColors.${measurand}` && (
                        <Box
                          ref={colorPickerRef}
                          sx={{
                            position: "absolute",
                            zIndex: 1300,
                            top: "100%",
                            right: 0,
                            mt: 1,
                            boxShadow: 3,
                            borderRadius: "8px",
                            background: (theme) =>
                              theme.palette.background.paper,
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
                  </div>
                ))}

              {(widgetType === "number" || widgetType === "gauge") && (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                      px: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <ColorLens
                        sx={{ color: (theme) => theme.palette.primary.main }}
                      />
                      <Typography variant="subtitle1" fontWeight={500}>
                        Value Ranges
                      </Typography>
                    </Box>
                    <Button
                      startIcon={<Add />}
                      onClick={handleAddRange}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderRadius: "10px",
                        borderColor: (theme) => theme.palette.primary.main,
                        color: (theme) => theme.palette.primary.main,
                        "&:hover": {
                          bgcolor: (theme) => `${theme.palette.primary.main}10`,
                          borderColor: (theme) => theme.palette.primary.dark,
                        },
                      }}
                    >
                      Add Range
                    </Button>
                  </Box>

                  {ranges.map((range, index) => (
                    <div
                      key={index}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          mb: 2,
                          p: 1.5,
                          border: 1,
                          borderColor: "divider",
                          borderRadius: "10px",
                          background: (theme) =>
                            `linear-gradient(135deg, ${theme.palette.background.paper}ee, ${theme.palette.background.default}dd)`,
                          "&:hover": {
                            borderColor: (theme) => theme.palette.primary.main,
                            boxShadow: (theme) =>
                              `0 0 8px ${theme.palette.primary.light}80`,
                          },
                          transition: "all 0.2s ease-in-out",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flex: 1,
                          }}
                        >
                          <ColorLens sx={{ color: range.color }} />
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: (theme) => theme.palette.text.primary,
                            }}
                          >
                            Range {index + 1}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 120px",
                            gap: 1.5,
                            flex: 3,
                            alignItems: "center",
                          }}
                        >
                          <StyledTextField
                            label="Min Value"
                            type="number"
                            size="small"
                            value={range.min}
                            disabled={index > 0}
                            onChange={(e) =>
                              handleRangeChange(index, "min", e.target.value)
                            }
                            error={!!errors.ranges}
                            helperText={errors.ranges?.message}
                          />
                          <StyledTextField
                            label="Max Value"
                            type="number"
                            size="small"
                            value={range.max}
                            onChange={(e) =>
                              handleRangeChange(index, "max", e.target.value)
                            }
                            error={!!errors.ranges}
                            helperText={errors.ranges?.message}
                          />
                          <Box sx={{ position: "relative" }}>
                            <Button
                              variant="outlined"
                              onClick={() =>
                                toggleColorPicker(`range-${index}`)
                              }
                              startIcon={<ColorLens />}
                              size="small"
                              sx={{
                                textTransform: "none",
                                borderColor: range.color,
                                color: range.color,
                                bgcolor: `${range.color}20`,
                                "&:hover": {
                                  bgcolor: `${range.color}40`,
                                  borderColor: range.color,
                                },
                                borderRadius: "8px",
                              }}
                            >
                              <Box
                                sx={{
                                  ml: 1,
                                  width: 18,
                                  height: 18,
                                  bgcolor: range.color,
                                  borderRadius: "4px",
                                  border: "1px solid",
                                  borderColor: "divider",
                                }}
                              />
                            </Button>
                            {colorPickerField === `range-${index}` && (
                              <Box
                                ref={colorPickerRef}
                                sx={{
                                  position: "absolute",
                                  zIndex: 1300,
                                  top: "100%",
                                  right: 0,
                                  mt: 1,
                                  boxShadow: 3,
                                  borderRadius: "8px",
                                  background: (theme) =>
                                    theme.palette.background.paper,
                                }}
                              >
                                <ChromePicker
                                  color={range.color}
                                  onChange={(color) =>
                                    handleColorChange(
                                      `ranges[${index}].color`,
                                      color
                                    )
                                  }
                                />
                              </Box>
                            )}
                          </Box>
                        </Box>
                        <IconButton
                          onClick={() => handleRemoveRange(index)}
                          disabled={ranges.length === 1}
                          sx={{
                            color:
                              ranges.length === 1
                                ? "action.disabled"
                                : "error.main",
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </div>
                  ))}
                  {errors.ranges && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 1, px: 1 }}
                    >
                      {errors.ranges.message}
                    </Typography>
                  )}
                </Box>
              )}
            </Stack>
          </Box>
        ) : (
          <Typography color="error" align="center">
            Invalid widget type selected. Please try again.
          </Typography>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          background: (theme) =>
            `linear-gradient(90deg, ${theme.palette.primary.light}10, ${theme.palette.primary.dark}10)`,
          borderRadius: "0 0 12px 12px",
        }}
      >
        <Button
          onClick={() => {
            reset();
            setRanges([]);
            setImagePreview(null);
            setSelectedPlant("");
            setSelectedTerminal("");
            setColorPickerField(null);
            onClose();
          }}
          sx={{
            textTransform: "none",
            color: (theme) => theme.palette.textSecondary,
            borderRadius: "10px",
            px: 3,
            "&:hover": {
              background: (theme) => `${theme.palette.primary.main}10`,
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onFormSubmit)}
          sx={{
            textTransform: "none",
            borderRadius: "10px",
            px: 3,
            minWidth: 120,
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
          {initialData ? "Update" : "Create"} Widget
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WidgetDialog;
