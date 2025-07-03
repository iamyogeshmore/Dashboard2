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
  TextField,
  Select,
  MenuItem,
  IconButton,
  Fade,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Popover,
} from "@mui/material";
import {
  Close,
  ColorLens,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  Save,
  Update,
  Delete,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { ChromePicker } from "react-color";
import {
  createWidgetTemplate,
  getWidgetTemplates,
  updateWidgetTemplate,
  deleteWidgetTemplate,
} from '../../services/apiService';

const fontFamilies = [
  "Roboto",
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Courier New",
];

const widgetTypes = [
  "text",
  "number",
  "gauge",
  "graph",
  "datagrid",
  "image",
  "all",
];

const WidgetPropertiesDialog = ({ open, onClose, widget, onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
    watch,
  } = useForm({
    defaultValues: {
      backgroundColor: widget?.data?.backgroundColor || "#ffffff",
      borderColor: widget?.data?.borderColor || "#e0e0e0",
      borderWidth: widget?.data?.borderWidth || "1",
      borderRadius: widget?.data?.borderRadius || "4",
      titleFontFamily: widget?.data?.titleFontFamily || "Roboto",
      titleFontSize: widget?.data?.titleFontSize || "16",
      titleColor: widget?.data?.titleColor || "#000000",
      titleBold: widget?.data?.titleBold || false,
      titleItalic: widget?.data?.titleItalic || false,
      titleUnderline: widget?.data?.titleUnderline || false,
      valueFontFamily: widget?.data?.valueFontFamily || "Roboto",
      valueFontSize: widget?.data?.valueFontSize || "24",
      valueColor: widget?.data?.valueColor || "#000000",
      valueBold: widget?.data?.valueBold || false,
      valueItalic: widget?.data?.valueItalic || false,
      valueUnderline: widget?.data?.valueUnderline || false,
      applyToWidgetType: "", // New field for widget type selection
    },
  });

  const [colorPickerField, setColorPickerField] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [saveAnchorEl, setSaveAnchorEl] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const colorPickerRef = useRef(null);

  useEffect(() => {
    // Load templates from backend
    const fetchTemplates = async () => {
      try {
        const res = await getWidgetTemplates();
        if (res.status === 'success') {
          setTemplates(res.data.map(t => ({ id: t._id, name: t.name, data: t.data })));
        }
      } catch (err) {
        setTemplates([]);
      }
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (widget?.data) {
      setValue("backgroundColor", widget.data.backgroundColor || "#ffffff");
      setValue("borderColor", widget.data.borderColor || "#e0e0e0");
      setValue("borderWidth", widget.data.borderWidth || "1");
      setValue("borderRadius", widget.data.borderRadius || "4");
      setValue("titleFontFamily", widget.data.titleFontFamily || "Roboto");
      setValue("titleFontSize", widget.data.titleFontSize || "16");
      setValue("titleColor", widget.data.titleColor || "#000000");
      setValue("titleBold", widget.data.titleBold || false);
      setValue("titleItalic", widget.data.titleItalic || false);
      setValue("titleUnderline", widget.data.titleUnderline || false);
      setValue("valueFontFamily", widget.data.valueFontFamily || "Roboto");
      setValue("valueFontSize", widget.data.valueFontSize || "24");
      setValue("valueColor", widget.data.valueColor || "#000000");
      setValue("valueBold", widget.data.valueBold || false);
      setValue("valueItalic", widget.data.valueItalic || false);
      setValue("valueUnderline", widget.data.valueUnderline || false);
      setValue("applyToWidgetType", ""); // Reset widget type selection
    }
  }, [widget, setValue]);

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

  const handleColorChange = (field, color) => {
    setValue(field, color.hex, { shouldValidate: true });
  };

  const toggleColorPicker = (field) => {
    setColorPickerField(colorPickerField === field ? null : field);
  };

  const onFormSubmit = (data) => {
    const { applyToWidgetType, ...properties } = data;
    let updatedWidgets = [];

    if (applyToWidgetType === "all") {
      // Apply to all widgets
      const dashboardKeys = Object.keys(localStorage).filter((key) =>
        key.startsWith("dashboard_")
      );
      dashboardKeys.forEach((dashboardKey) => {
        const dashboardData = JSON.parse(localStorage.getItem(dashboardKey));
        if (dashboardData.widgets) {
          dashboardData.widgets = dashboardData.widgets.map((w) => ({
            ...w,
            data: { ...w.data, ...properties },
          }));
          localStorage.setItem(dashboardKey, JSON.stringify(dashboardData));
          updatedWidgets.push(...dashboardData.widgets);
        }
      });
    } else if (applyToWidgetType) {
      // Apply to widgets of the selected type
      const dashboardKeys = Object.keys(localStorage).filter((key) =>
        key.startsWith("dashboard_")
      );
      dashboardKeys.forEach((dashboardKey) => {
        const dashboardData = JSON.parse(localStorage.getItem(dashboardKey));
        if (dashboardData.widgets) {
          dashboardData.widgets = dashboardData.widgets.map((w) =>
            w.type === applyToWidgetType
              ? { ...w, data: { ...w.data, ...properties } }
              : w
          );
          localStorage.setItem(dashboardKey, JSON.stringify(dashboardData));
          updatedWidgets.push(
            ...dashboardData.widgets.filter((w) => w.type === applyToWidgetType)
          );
        }
      });
    } else {
      // Apply to the specific widget
      const updatedWidget = {
        ...widget,
        data: { ...widget.data, ...properties },
      };
      onSubmit(updatedWidget);
      // Update the specific widget in localStorage
      const dashboardKeys = Object.keys(localStorage).filter((key) =>
        key.startsWith("dashboard_")
      );
      dashboardKeys.forEach((dashboardKey) => {
        const dashboardData = JSON.parse(localStorage.getItem(dashboardKey));
        if (
          dashboardData.widgets &&
          dashboardData.widgets.some((w) => w.id === widget.id)
        ) {
          dashboardData.widgets = dashboardData.widgets.map((w) =>
            w.id === widget.id ? updatedWidget : w
          );
          localStorage.setItem(dashboardKey, JSON.stringify(dashboardData));
        }
      });
      updatedWidgets.push(updatedWidget);
    }

    // Notify parent component of all updated widgets
    updatedWidgets.forEach((updatedWidget) => {
      onSubmit(updatedWidget);
    });

    reset();
    onClose();
  };

  const handleTemplateSelect = (event) => {
    const templateId = event.target.value;
    setSelectedTemplate(templateId);
    if (templateId) {
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        Object.entries(template.data).forEach(([key, value]) => {
          setValue(key, value, { shouldValidate: true });
        });
      }
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName) return;
    const data = watch();
    try {
      const res = await createWidgetTemplate({ name: templateName, data });
      if (res.status === 'success') {
        setTemplates(prev => [...prev, { id: res.data._id, name: res.data.name, data: res.data.data }]);
        setSelectedTemplate(res.data._id);
      }
    } catch (err) {}
    setTemplateName("");
    setSaveAnchorEl(null);
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;
    const data = watch();
    try {
      const template = templates.find(t => t.id === selectedTemplate);
      const res = await updateWidgetTemplate(selectedTemplate, { name: template.name, data });
      if (res.status === 'success') {
        setTemplates(prev => prev.map(t => t.id === selectedTemplate ? { ...t, data } : t));
      }
    } catch (err) {}
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;
    try {
      await deleteWidgetTemplate(selectedTemplate);
      setTemplates(prev => prev.filter(t => t.id !== selectedTemplate));
      setSelectedTemplate("");
    } catch (err) {}
  };

  const fields = {
    general: [
      {
        name: "backgroundColor",
        label: "Background Color",
        type: "color",
        required: true,
      },
      {
        name: "borderColor",
        label: "Border Color",
        type: "color",
        required: true,
      },
      {
        name: "borderWidth",
        label: "Border Width (px)",
        type: "number",
        required: true,
      },
      {
        name: "borderRadius",
        label: "Border Radius (px)",
        type: "number",
        required: true,
      },
    ],
    title: [
      {
        name: "titleFontFamily",
        label: "Title Font Family",
        type: "select",
        options: fontFamilies,
        required: true,
      },
      {
        name: "titleFontSize",
        label: "Title Font Size (px)",
        type: "number",
        required: true,
      },
      {
        name: "titleColor",
        label: "Title Color",
        type: "color",
        required: true,
      },
      {
        name: "titleStyles",
        label: "Title Styles",
        type: "toggle",
        options: [
          {
            name: "titleBold",
            icon: <FormatBold />,
            value: watch("titleBold"),
          },
          {
            name: "titleItalic",
            icon: <FormatItalic />,
            value: watch("titleItalic"),
          },
          {
            name: "titleUnderline",
            icon: <FormatUnderlined />,
            value: watch("titleUnderline"),
          },
        ],
      },
    ],
    value: [
      {
        name: "valueFontFamily",
        label: "Value Font Family",
        type: "select",
        options: fontFamilies,
        required: true,
      },
      {
        name: "valueFontSize",
        label: "Value Font Size (px)",
        type: "number",
        required: true,
      },
      {
        name: "valueColor",
        label: "Value Color",
        type: "color",
        required: true,
      },
      {
        name: "valueStyles",
        label: "Value Styles",
        type: "toggle",
        options: [
          {
            name: "valueBold",
            icon: <FormatBold />,
            value: watch("valueBold"),
          },
          {
            name: "valueItalic",
            icon: <FormatItalic />,
            value: watch("valueItalic"),
          },
          {
            name: "valueUnderline",
            icon: <FormatUnderlined />,
            value: watch("valueUnderline"),
          },
        ],
      },
    ],
  };

  const getPreviewStyles = () => ({
    backgroundColor: watch("backgroundColor"),
    borderColor: watch("borderColor"),
    borderWidth: `${watch("borderWidth")}px`,
    borderRadius: `${watch("borderRadius")}px`,
    borderStyle: "solid",
    padding: "16px",
    textAlign: "center",
    boxShadow: (theme) =>
      `0 4px 12px ${
        theme.palette.mode === "light" ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.2)"
      }`,
    background: (theme) =>
      `linear-gradient(135deg, ${watch("backgroundColor")}ee, ${watch(
        "backgroundColor"
      )}dd)`,
    backdropFilter: "blur(8px)",
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
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
          padding: (theme) => theme.spacing(2),
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
            variant="h5"
            component="h2"
            fontWeight={600}
            sx={{
              color: (theme) => theme.palette.primary.main,
              textShadow: (theme) => `0 0 8px ${theme.palette.primary.light}80`,
            }}
          >
            Widget Properties
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Customize the appearance of your widget
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close sx={{ color: (theme) => theme.palette.text.secondary }} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ py: 3, px: 4 }}>
        <Box component="form" onSubmit={handleSubmit(onFormSubmit)}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 3,
              mb: 3,
            }}
          >
            {["general", "title", "value"].map((section, sectionIndex) => (
              <Box key={section}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: sectionIndex * 0.1 }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontWeight: 500,
                      color: (theme) => theme.palette.primary.main,
                      textShadow: (theme) =>
                        `0 0 4px ${theme.palette.primary.light}50`,
                    }}
                  >
                    {section === "general"
                      ? "General Settings"
                      : section === "title"
                      ? "Title Text Format"
                      : "Value Text Format"}
                  </Typography>
                  <Stack spacing={2}>
                    {fields[section].map((field, index) => (
                      <motion.div
                        key={field.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.3,
                          delay:
                            (sectionIndex * fields[section].length + index) *
                            0.1,
                        }}
                      >
                        {field.type === "select" ? (
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
                                <Select
                                  value={value || ""}
                                  onChange={onChange}
                                  label={field.label}
                                  sx={{
                                    borderRadius: "8px",
                                    background: (theme) =>
                                      `linear-gradient(135deg, ${theme.palette.background.paper}ee, ${theme.palette.background.default}dd)`,
                                    "&:hover": {
                                      background: (theme) =>
                                        `linear-gradient(135deg, ${theme.palette.background.paper}ff, ${theme.palette.background.default}ee)`,
                                    },
                                  }}
                                >
                                  {field.options.map((option) => (
                                    <MenuItem key={option} value={option}>
                                      {option}
                                    </MenuItem>
                                  ))}
                                </Select>
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
                            <TextField
                              fullWidth
                              label={field.label}
                              {...register(field.name, {
                                required: `${field.label} is required`,
                              })}
                              InputProps={{
                                readOnly: true,
                                startAdornment: (
                                  <ColorLens
                                    sx={{
                                      color: (theme) =>
                                        theme.palette.primary.main,
                                      mr: 1,
                                    }}
                                  />
                                ),
                                endAdornment: (
                                  <Box
                                    sx={{
                                      bgcolor: watch(field.name),
                                      width: 24,
                                      height: 24,
                                      borderRadius: 1,
                                      mr: 1,
                                      border: "1px solid",
                                      borderColor: "divider",
                                    }}
                                  />
                                ),
                              }}
                              error={!!errors[field.name]}
                              helperText={errors[field.name]?.message}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "8px",
                                  background: (theme) =>
                                    `linear-gradient(135deg, ${theme.palette.background.paper}ee, ${theme.palette.background.default}dd)`,
                                  "&:hover": {
                                    background: (theme) =>
                                      `linear-gradient(135deg, ${theme.palette.background.paper}ff, ${theme.palette.background.default}ee)`,
                                  },
                                  "&.Mui-focused": {
                                    boxShadow: (theme) =>
                                      `0 0 12px ${theme.palette.primary.light}80`,
                                  },
                                },
                              }}
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
                        ) : field.type === "toggle" ? (
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                mb: 1,
                                color: (theme) => theme.palette.text.primary,
                              }}
                            >
                              {field.label}
                            </Typography>
                            <ToggleButtonGroup
                              value={field.options
                                .filter((opt) => opt.value)
                                .map((opt) => opt.name)}
                              onChange={(e, newFormats) => {
                                field.options.forEach((opt) => {
                                  setValue(
                                    opt.name,
                                    newFormats.includes(opt.name)
                                  );
                                });
                              }}
                              sx={{
                                background: (theme) =>
                                  `linear-gradient(135deg, ${theme.palette.background.paper}ee, ${theme.palette.background.default}dd)`,
                                borderRadius: "8px",
                                "& .MuiToggleButton-root": {
                                  borderRadius: "8px",
                                  borderColor: (theme) => theme.palette.divider,
                                  "&.Mui-selected": {
                                    background: (theme) =>
                                      `linear-gradient(45deg, ${theme.palette.primary.light}33, ${theme.palette.primary.dark}33)`,
                                    color: (theme) =>
                                      theme.palette.primary.main,
                                  },
                                  "&:hover": {
                                    background: (theme) =>
                                      `linear-gradient(45deg, ${theme.palette.primary.light}20, ${theme.palette.primary.dark}20)`,
                                  },
                                },
                              }}
                            >
                              {field.options.map((opt) => (
                                <ToggleButton
                                  key={opt.name}
                                  value={opt.name}
                                  selected={opt.value}
                                  size="small"
                                >
                                  {opt.icon}
                                </ToggleButton>
                              ))}
                            </ToggleButtonGroup>
                          </Box>
                        ) : (
                          <TextField
                            fullWidth
                            label={field.label}
                            type={field.type}
                            {...register(field.name, {
                              required: field.required
                                ? `${field.label} is required`
                                : false,
                              validate:
                                field.type === "number"
                                  ? (value) =>
                                      !isNaN(value) && value >= 0
                                        ? true
                                        : `${field.label} must be a valid number`
                                  : undefined,
                            })}
                            error={!!errors[field.name]}
                            helperText={errors[field.name]?.message}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "8px",
                                background: (theme) =>
                                  `linear-gradient(135deg, ${theme.palette.background.paper}ee, ${theme.palette.background.default}dd)`,
                                "&:hover": {
                                  background: (theme) =>
                                    `linear-gradient(135deg, ${theme.palette.background.paper}ff, ${theme.palette.background.default}ee)`,
                                },
                                "&.Mui-focused": {
                                  boxShadow: (theme) =>
                                    `0 0 12px ${theme.palette.primary.light}80`,
                                },
                              },
                            }}
                          />
                        )}
                      </motion.div>
                    ))}
                  </Stack>
                </motion.div>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 3,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 500,
                  color: (theme) => theme.palette.primary.main,
                  textShadow: (theme) =>
                    `0 0 4px ${theme.palette.primary.light}50`,
                }}
              >
                Preview
              </Typography>
              <Box sx={getPreviewStyles()}>
                <Typography
                  sx={{
                    fontFamily: watch("titleFontFamily"),
                    fontSize: `${watch("titleFontSize")}px`,
                    color: watch("titleColor"),
                    fontWeight: watch("titleBold") ? "bold" : "normal",
                    fontStyle: watch("titleItalic") ? "italic" : "normal",
                    textDecoration: watch("titleUnderline")
                      ? "underline"
                      : "none",
                    mb: 1,
                  }}
                >
                  Sample Title
                </Typography>
                <Typography
                  sx={{
                    fontFamily: watch("valueFontFamily"),
                    fontSize: `${watch("valueFontSize")}px`,
                    color: watch("valueColor"),
                    fontWeight: watch("valueBold") ? "bold" : "normal",
                    fontStyle: watch("valueItalic") ? "italic" : "normal",
                    textDecoration: watch("valueUnderline")
                      ? "underline"
                      : "none",
                  }}
                >
                  Sample Value
                </Typography>
              </Box>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 500,
                  color: (theme) => theme.palette.primary.main,
                  textShadow: (theme) =>
                    `0 0 4px ${theme.palette.primary.light}50`,
                }}
              >
                Template Management
              </Typography>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Select Template</InputLabel>
                  <Select
                    value={selectedTemplate}
                    onChange={handleTemplateSelect}
                    label="Select Template"
                    sx={{
                      borderRadius: "8px",
                      background: (theme) =>
                        `linear-gradient(135deg, ${theme.palette.background.paper}ee, ${theme.palette.background.default}dd)`,
                      "&:hover": {
                        background: (theme) =>
                          `linear-gradient(135deg, ${theme.palette.background.paper}ff, ${theme.palette.background.default}ee)`,
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {templates.map((template) => (
                      <MenuItem key={template.id} value={template.id}>
                        {template.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Apply to Widget Type</InputLabel>
                  <Controller
                    name="applyToWidgetType"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Select
                        value={value || ""}
                        onChange={onChange}
                        label="Apply to Widget Type"
                        sx={{
                          borderRadius: "8px",
                          background: (theme) =>
                            `linear-gradient(135deg, ${theme.palette.background.paper}ee, ${theme.palette.background.default}dd)`,
                          "&:hover": {
                            background: (theme) =>
                              `linear-gradient(135deg, ${theme.palette.background.paper}ff, ${theme.palette.background.default}ee)`,
                          },
                        }}
                      >
                        <MenuItem value="">
                          <em>This Widget Only ({widget?.type})</em>
                        </MenuItem>
                        {widgetTypes.map((type) => (
                          <MenuItem
                            key={type}
                            value={type}
                            sx={{
                              textTransform: "capitalize",
                            }}
                          >
                            {type === "all" ? "All Widgets" : type}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={(e) => setSaveAnchorEl(e.currentTarget)}
                      sx={{
                        textTransform: "none",
                        borderRadius: "10px",
                        px: 3,
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
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="contained"
                      startIcon={<Update />}
                      onClick={handleUpdateTemplate}
                      disabled={!selectedTemplate}
                      sx={{
                        textTransform: "none",
                        borderRadius: "10px",
                        px: 3,
                        background: (theme) =>
                          `linear-gradient(45deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.light})`,
                        "&:hover": {
                          background: (theme) =>
                            `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                          boxShadow: (theme) =>
                            `0 6px 16px ${theme.palette.secondary.light}b3`,
                        },
                        "&.Mui-disabled": {
                          background: (theme) =>
                            theme.palette.action.disabledBackground,
                        },
                      }}
                    >
                      Update
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="contained"
                      startIcon={<Delete />}
                      onClick={handleDeleteTemplate}
                      disabled={!selectedTemplate}
                      sx={{
                        textTransform: "none",
                        borderRadius: "10px",
                        px: 3,
                        background: (theme) =>
                          `linear-gradient(45deg, ${theme.palette.error.dark}, ${theme.palette.error.light})`,
                        "&:hover": {
                          background: (theme) =>
                            `linear-gradient(45deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
                          boxShadow: (theme) =>
                            `0 6px 16px ${theme.palette.error.light}b3`,
                        },
                        "&.Mui-disabled": {
                          background: (theme) =>
                            theme.palette.action.disabledBackground,
                        },
                      }}
                    >
                      Delete
                    </Button>
                  </motion.div>
                </Box>
              </Stack>
            </motion.div>
          </Box>
        </Box>

        <Popover
          open={Boolean(saveAnchorEl)}
          anchorEl={saveAnchorEl}
          onClose={() => {
            setSaveAnchorEl(null);
            setTemplateName("");
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          PaperProps={{
            sx: {
              mt: 1,
              p: 2,
              borderRadius: "12px",
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
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <TextField
              fullWidth
              label="Template Name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.background.paper}ee, ${theme.palette.background.default}dd)`,
                  "&:hover": {
                    background: (theme) =>
                      `linear-gradient(135deg, ${theme.palette.background.paper}ff, ${theme.palette.background.default}ee)`,
                  },
                  "&.Mui-focused": {
                    boxShadow: (theme) =>
                      `0 0 12px ${theme.palette.primary.light}80`,
                  },
                },
              }}
            />
            <Box
              sx={{
                display: "flex",
                gap: 1,
                mt: 2,
                justifyContent: "flex-end",
              }}
            >
              <Button
                onClick={() => {
                  setSaveAnchorEl(null);
                  setTemplateName("");
                }}
                sx={{
                  textTransform: "none",
                  color: (theme) => theme.palette.text.secondary,
                  borderRadius: "10px",
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveTemplate}
                disabled={!templateName}
                sx={{
                  textTransform: "none",
                  borderRadius: "10px",
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
            </Box>
          </motion.div>
        </Popover>
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
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onClose}
            sx={{
              textTransform: "none",
              color: (theme) => theme.palette.text.secondary,
              borderRadius: "10px",
              px: 3,
              "&:hover": {
                background: (theme) => `${theme.palette.primary.main}10`,
              },
            }}
          >
            Cancel
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleSubmit(onFormSubmit)}
            variant="contained"
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
            Apply
          </Button>
        </motion.div>
      </DialogActions>
    </Dialog>
  );
};

export default WidgetPropertiesDialog;
